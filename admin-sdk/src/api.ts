import { t } from './i18n'
import type { Boot } from './types'

declare global {
  interface Window {
    __CMS__: Boot
  }
}

export const boot: Boot = (typeof window !== 'undefined' && window.__CMS__) || {
  base: '/admin',
  api: '/api/admin',
  version: 'dev',
  brand: { name: '', domain: '', product_url: '', docs_url: '', github_url: '', support_email: '', mark: '', wordmark: '' },
  site: { name: '', url: '' },
}

/** Error thrown for any failed request; mirrors the server's AbilityException. */
export class CmsError extends Error {
  constructor(
    message: string,
    public readonly type: string = 'failed',
    public readonly status: number = 500,
    public readonly details: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'CmsError'
  }
}

/** The token to send with a request that changes something. The cookie's name is the site's own, as cookies don't tell ports apart. */
export function xsrfToken(): string | null {
  const name = boot.xsrfCookie ?? 'XSRF-TOKEN'
  const cookie = document.cookie.split(/;\s*/).find((part) => part.startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null
}

let unauthorizedHandler: (() => void) | null = null

/** Called whenever the session expires (401) so the theme can show the sign-in screen. */
export function onUnauthorized(handler: () => void) {
  unauthorizedHandler = handler
}

function headers(accept: string, json: boolean): Record<string, string> {
  const h: Record<string, string> = { Accept: accept, 'X-Requested-With': 'XMLHttpRequest' }
  const token = xsrfToken()
  if (token) h['X-XSRF-TOKEN'] = token
  if (json) h['Content-Type'] = 'application/json'
  // The language this page was opened in (it may differ from the account's: `?lang=nl`).
  if (boot.locale) h['X-Cms-Locale'] = boot.locale
  return h
}

function failure(response: Response, json: any): CmsError {
  if (response.status === 401 && unauthorizedHandler) unauthorizedHandler()
  const error = json?.error
  const laravelErrors = json?.errors ? Object.fromEntries(Object.entries(json.errors).map(([k, v]) => [k, (v as string[])[0]])) : {}
  return new CmsError(
    error?.message ?? json?.message ?? (response.status === 419 ? t('Your session expired. Reload the page.') : t('Request failed ({status})', { status: response.status })),
    error?.type ?? (response.status === 422 ? 'invalid_input' : 'failed'),
    response.status,
    error?.details ?? laravelErrors,
  )
}

const apiUrl = (path: string) => (path.startsWith('/') ? path : `${boot.api}/${path}`)

export async function request<T = unknown>(method: string, path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method,
    credentials: 'same-origin',
    headers: { ...headers('application/json', body !== undefined && !(body instanceof FormData)), ...(init.headers as Record<string, string> | undefined) },
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    ...init,
  })

  const text = await response.text()
  const json = text ? safeJson(text) : null

  if (!response.ok) throw failure(response, json)

  return json as T
}

/**
 * POST that answers with server-sent events. Calls onEvent for every event as
 * it arrives and resolves when the stream ends; abort with the signal.
 */
export async function eventStream(path: string, body: unknown, onEvent: (event: string, data: any) => void, signal?: AbortSignal): Promise<void> {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    credentials: 'same-origin',
    headers: headers('text/event-stream', true),
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok || !response.body || !(response.headers.get('Content-Type') ?? '').startsWith('text/event-stream')) {
    const text = await response.text()
    throw failure(response.ok ? new Response(null, { status: 500 }) : response, text ? safeJson(text) : null)
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value.replace(/\r\n/g, '\n')

    let end: number
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, end)
      buffer = buffer.slice(end + 2)
      let event = 'message'
      const data: string[] = []
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''))
      }
      if (data.length) onEvent(event, safeJson(data.join('\n')))
    }
  }
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Run an ability as the signed-in user. Resolves with the ability's result. */
export async function run<T = any>(ability: string, input: Record<string, unknown> = {}): Promise<T> {
  const res = await request<{ data: T }>('POST', `abilities/${ability}`, input)
  return res.data
}

export interface BatchCall {
  ability: string
  input?: Record<string, unknown>
}

export async function batch(calls: BatchCall[], stopOnError = true): Promise<({ data: any } | { error: { type: string; message: string } })[]> {
  const res = await request<{ data: any[] }>('POST', 'batch', { calls, stopOnError })
  return res.data
}

/** Absolute admin URL for a path inside the admin. */
export function adminUrl(path = '/'): string {
  return boot.base + (path === '/' ? '' : path.startsWith('/') ? path : `/${path}`)
}
