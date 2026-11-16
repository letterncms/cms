/* A page of the site, run in a frame for the console: its HTML as the site serves it, with a few lines first that hand
   what it logs, what fails and what it returns to the console, and links that open the next page here. Its scripts
   are the saved ones; after a save it runs again. */

export type Level = 'log' | 'info' | 'warn' | 'error' | 'debug'

export interface Source {
  /** The address of the script, as the page loaded it. */
  url: string
  line?: number
  column?: number
}

export interface Message {
  level: Level | 'input' | 'result' | 'page'
  text: string
  /** More to show when it is opened: an error's stack. */
  detail?: string
  source?: Source
}

export interface PageRun {
  /** Run code on the page: an expression's value is shown, as are statements' errors. */
  evaluate: (code: string) => void
  destroy: () => void
}

interface Sink {
  message: (message: Message) => void
  /** A link on the page was followed: the page to run next. */
  navigate: (path: string) => void
}

const kind = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)
const isError = (value: unknown): value is { name: string; message: string; stack?: string } =>
  !!value && typeof value === 'object' && (kind(value) === 'Error' || (typeof (value as { message?: unknown }).message === 'string' && typeof (value as { stack?: unknown }).stack === 'string'))

/**
 * A value as the console shows it, as browsers' consoles do: a string as it is at the top and quoted inside, an
 * element by its tag, an object by its keys, two levels deep. Values come from the page, another window, so what
 * they are is read from their tag, not their class.
 */
export function describe(value: unknown, nested = false, depth = 0, seen: Set<unknown> = new Set()): string {
  if (typeof value === 'string') return nested ? JSON.stringify(value) : value
  if (typeof value === 'bigint') return `${value}n`
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`
    return String(value)
  }
  if (seen.has(value)) return '[Circular]'
  if (isError(value)) return `${value.name}: ${value.message}`
  const tag = kind(value)
  if (tag === 'Date') return Number.isNaN((value as Date).getTime()) ? 'Invalid Date' : (value as Date).toISOString()
  if (tag === 'RegExp') return String(value)
  if (tag === 'Promise') return 'Promise'
  if (tag === 'Window') return 'Window'
  const node = value as { nodeType?: number; nodeName?: string; id?: string; classList?: ArrayLike<string>; textContent?: string }
  if (typeof node.nodeType === 'number' && typeof node.nodeName === 'string') {
    if (node.nodeType === 1) return `<${node.nodeName.toLowerCase()}${node.id ? `#${node.id}` : ''}${Array.from(node.classList ?? []).map((name) => `.${name}`).join('')}>`
    if (node.nodeType === 3) return `#text ${JSON.stringify((node.textContent ?? '').slice(0, 60))}`
    return node.nodeName.toLowerCase()
  }
  const inner = new Set(seen).add(value)
  const show = (item: unknown) => describe(item, true, depth + 1, inner)
  const more = (count: number, shown: number) => (count > shown ? `, …${count - shown} more` : '')
  if (Array.isArray(value)) {
    if (depth >= 2) return `Array(${value.length})`
    return `[${value.slice(0, 20).map(show).join(', ')}${more(value.length, 20)}]`
  }
  if (tag === 'Map' || tag === 'Set') {
    const entries = [...(value as Map<unknown, unknown> | Set<unknown>).entries()]
    if (depth >= 2) return `${tag}(${entries.length})`
    const items = entries.slice(0, 20).map(([key, item]) => (tag === 'Map' ? `${show(key)} => ${show(item)}` : show(item)))
    return `${tag}(${entries.length}) {${items.join(', ')}${more(entries.length, 20)}}`
  }
  const keys = Object.keys(value)
  const name = (value as { constructor?: { name?: string } }).constructor?.name
  const prefix = name && name !== 'Object' ? `${name} ` : ''
  if (depth >= 2) return `${prefix}{…}`
  return `${prefix}{${keys.slice(0, 20).map((key) => `${/^[$\w]+$/.test(key) ? key : JSON.stringify(key)}: ${show((value as Record<string, unknown>)[key])}`).join(', ')}${more(keys.length, 20)}}`
}

/** What console.log('%s is %d', …) writes: its placeholders filled, then the rest after it. */
export function substitute(args: unknown[]): string {
  if (typeof args[0] !== 'string' || !/%[sdifoOc]/.test(args[0])) return args.map((arg) => describe(arg)).join(' ')
  const rest = args.slice(1)
  const text = args[0].replace(/%([sdifoOc%])/g, (match, letter: string) => {
    if (letter === '%') return '%'
    if (rest.length === 0) return match
    const value = rest.shift()
    if (letter === 'c') return ''
    if (letter === 'd' || letter === 'i') return String(Number.parseInt(String(value), 10))
    if (letter === 'f') return String(Number(value))
    return describe(value, letter !== 's')
  })
  return [text, ...rest.map((arg) => describe(arg))].join(' ')
}

/**
 * The document a script or stylesheet a page loaded was published from, by its address: the site's JavaScript is
 * `custom-<hash>.js`, a file `scripts/<path>-<hash>.js`. Null for anything else (a library, the CMS's own).
 */
export function docAt(address: string): string | null {
  let path: string
  try {
    path = new URL(address, 'http://site.invalid').pathname
  } catch {
    return null
  }
  if (/^\/_cms\/site\/custom-[0-9a-f]+\.js$/.test(path)) return 'js'
  const file = path.match(/^\/_cms\/site\/(scripts|styles)\/(.+?)(?:-[0-9a-f]{10})?\.(js|css)$/)
  return file ? `${file[1]}/${file[2]}.${file[3]}` : null
}

/** This file's own address: where a stack reaches it, what was typed in the console began, not the page. */
const OWN = import.meta.url.split(/[?#]/)[0]

/** Where a stack says it was: its first frame in a script of the site (the page's own lines have no address). */
export function sourceOf(stack: string | undefined): Source | undefined {
  for (const line of (stack ?? '').split('\n')) {
    const frame = line.match(/(https?:\/\/[^\s()]+?):(\d+):(\d+)/)
    if (!frame) continue
    if (frame[1].split(/[?#]/)[0] === OWN) return undefined
    return { url: frame[1], line: Number(frame[2]), column: Number(frame[3]) }
  }
  return undefined
}

/** The lines the page runs first. `TOKEN` names the console it reports to, in the window around it. */
const BRIDGE = `(() => {
  const sink = window.parent && window.parent[TOKEN]
  if (!sink) return
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const own = console[level].bind(console)
    console[level] = (...args) => { sink.log(level, args, new Error().stack); own(...args) }
  }
  const assert = console.assert.bind(console)
  console.assert = (ok, ...args) => { if (!ok) sink.log('error', ['Assertion failed:', ...args], new Error().stack); assert(ok, ...args) }
  const table = console.table.bind(console)
  console.table = (data, columns) => { sink.log('log', [data], new Error().stack); table(data, columns) }
  const dir = console.dir.bind(console)
  console.dir = (value, options) => { sink.log('log', [value], new Error().stack); dir(value, options) }
  const trace = console.trace.bind(console)
  console.trace = (...args) => { sink.log('log', ['Trace', ...args], new Error().stack, true); trace(...args) }
  addEventListener('error', (event) => {
    const target = event.target
    if (target && target !== window && target.tagName) sink.missing(target.tagName, target.currentSrc || target.src || target.href || '')
    else sink.error(event.message, event.error, event.filename, event.lineno, event.colno)
  }, true)
  addEventListener('unhandledrejection', (event) => sink.rejected(event.reason))
  addEventListener('securitypolicyviolation', (event) => sink.refused(event.violatedDirective, event.blockedURI))
  addEventListener('click', (event) => {
    const link = event.target && event.target.closest && event.target.closest('a[href]')
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
    const url = new URL(link.getAttribute('href'), document.baseURI)
    if (url.origin !== window.parent.location.origin || (link.target && link.target !== '_self')) return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (url.pathname.startsWith('/admin')) return
    sink.navigate(url.pathname + url.search + url.hash)
  }, true)
  // What is typed runs here, on the page, so what it logs says where on the page it came from, never the admin.
  window.__cmsConsoleRun = (code) => {
    let value
    try { value = code() } catch (error) { sink.ran(undefined, error, true); return }
    sink.ran(value)
  }
})()`

let runs = 0

/**
 * Runs a page of the site in `frame` and reports to `sink`. The frame shares the admin's address, so its scripts
 * run under the admin's policy, with its nonce, as the content preview's do.
 */
export function runPage(frame: HTMLIFrameElement, path: string, sink: Sink): PageRun {
  const token = `__cmsConsole${++runs}_${Math.random().toString(36).slice(2)}`
  const nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce ?? ''
  const host = window as unknown as Record<string, unknown>
  let gone = false
  /** While an expression is tried first: a syntax error then only means the code is statements. */
  let trying = false
  let failedToParse = false
  let ran = false

  const report = (message: Message) => { if (!gone) sink.message(message) }
  const errorOf = (error: unknown, fallback: string) => (isError(error) ? { text: describe(error), detail: error.stack, source: sourceOf(error.stack) } : { text: fallback })

  host[token] = {
    log: (level: Level, args: unknown[], stack?: string, trace = false) => report({ level, text: substitute(args), source: sourceOf(stack), detail: trace ? (stack ?? '').split('\n').slice(2).join('\n') : undefined }),
    error: (message: string, error: unknown, url?: string, line?: number, column?: number) => {
      if (trying && /SyntaxError|Unexpected|Invalid|missing/i.test(message)) { failedToParse = true; return }
      const found = errorOf(error, message)
      report({ level: 'error', text: `Uncaught ${found.text}`, detail: found.detail, source: url ? { url, line, column } : found.source })
    },
    rejected: (reason: unknown) => {
      const found = errorOf(reason, describe(reason, true))
      report({ level: 'error', text: `Uncaught (in promise) ${found.text}`, detail: found.detail, source: found.source })
    },
    missing: (tag: string, url: string) => report({ level: 'error', text: `Failed to load ${tag.toLowerCase()} ${url}` }),
    refused: (directive: string, url: string) => report({ level: 'error', text: `Refused by the content security policy (${directive}): ${url || 'inline'}` }),
    navigate: (to: string) => { if (!gone) sink.navigate(to) },
    ran: (value: unknown, error?: unknown, threw = false) => {
      ran = true
      if (threw) {
        const found = errorOf(error, describe(error, true))
        return report({ level: 'error', text: `Uncaught ${found.text}`, detail: found.detail })
      }
      if (value && typeof (value as { then?: unknown }).then === 'function') {
        ;(value as Promise<unknown>).then(
          (resolved) => report({ level: 'result', text: `Promise ${describe(resolved, true)}` }),
          (failure) => { const found = errorOf(failure, describe(failure, true)); report({ level: 'error', text: `Uncaught (in promise) ${found.text}`, detail: found.detail }) },
        )
      } else report({ level: 'result', text: describe(value, true) })
    },
  }

  const controller = new AbortController()
  const address = new URL(path, window.location.origin)
  void fetch(address, { credentials: 'same-origin', headers: { accept: 'text/html' }, signal: controller.signal })
    .then(async (response) => {
      const html = await response.text()
      if (gone) return
      if (!response.ok) report({ level: 'error', text: `${response.status} ${response.statusText || ''} ${address.pathname}`.trim() })
      const signed = nonce ? html.replace(/<script\b(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`) : html
      const first = `<base href="${address.href.replace(/"/g, '&quot;')}"><script nonce="${nonce}">${BRIDGE.replace('TOKEN', JSON.stringify(token))}</script>`
      frame.srcdoc = /<head\b[^>]*>/i.test(signed) ? signed.replace(/<head\b[^>]*>/i, (head) => head + first) : first + signed
    })
    .catch((error) => { if (!gone && !controller.signal.aborted) report({ level: 'error', text: `Couldn’t load ${address.pathname}: ${error instanceof Error ? error.message : String(error)}` }) })

  return {
    evaluate: (code) => {
      const doc = frame.contentDocument
      if (!doc?.head) return
      const attempt = (body: string) => {
        ran = false
        const script = doc.createElement('script')
        script.nonce = nonce
        script.textContent = `window.__cmsConsoleRun(${body})`
        doc.head.append(script)
        script.remove()
      }
      report({ level: 'input', text: code })
      // An expression first, so its value shows; what isn't one runs as statements.
      trying = true
      failedToParse = false
      attempt(`() => (\n${code}\n)`)
      trying = false
      if (!ran && failedToParse) attempt(`() => {\n${code}\n}`)
    },
    destroy: () => {
      gone = true
      controller.abort()
      delete host[token]
    },
  }
}
