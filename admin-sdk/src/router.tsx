import { createContext, createElement, useContext, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore, type AnchorHTMLAttributes, type FocusEvent, type MouseEvent, type ReactNode } from 'react'
import { boot } from './api'

type Listener = () => void
const listeners = new Set<Listener>()
let blockers: (() => string | null)[] = []

/** Where the admin is. `action` says how it got there: a link (push), a redirect (replace) or back/forward (pop). */
export interface Location {
  path: string
  search: string
  query: Record<string, string>
  action: 'push' | 'replace' | 'pop'
}

interface Snapshot {
  path: string
  search: string
  action: Location['action']
}

function currentPath(): string {
  const path = window.location.pathname.startsWith(boot.base) ? window.location.pathname.slice(boot.base.length) : window.location.pathname
  return path === '' ? '/' : path
}

let snapshot: Snapshot = { path: currentPath(), search: window.location.search, action: 'pop' }

function update(action: Snapshot['action']) {
  snapshot = { path: currentPath(), search: window.location.search, action }
  listeners.forEach((l) => l())
}

/**
 * Each entry the admin adds to the history knows its place (`cmsIndex`), so going
 * back or forward past unsaved changes can be undone by as many steps as it took.
 */
let index = typeof window.history.state?.cmsIndex === 'number' ? window.history.state.cmsIndex : 0
const entry = (at: number) => ({ ...(window.history.state ?? {}), cmsIndex: at })
if (window.history.state?.cmsIndex !== index) window.history.replaceState(entry(index), '')

function pushEntry(url: string) {
  window.history.pushState({ cmsIndex: ++index }, '', url)
}

function replaceEntry(url: string) {
  window.history.replaceState({ cmsIndex: index }, '', url)
}

/** Back or forward the admin itself is doing, which isn't a navigation of its own. */
let undoing: 'stay' | 'leave' | null = null
/** Putting the screen's entry back is asynchronous: leaving waits until it is done, or it would be taken for the leaving. */
let restored: Promise<void> = Promise.resolve()
let settle: (() => void) | null = null

window.addEventListener('popstate', (event) => {
  const to = typeof event.state?.cmsIndex === 'number' ? (event.state.cmsIndex as number) : null
  const steps = to === null ? null : index - to
  if (to !== null) index = to
  if (undoing) {
    const leaving = undoing === 'leave'
    undoing = null
    if (leaving) update('pop')
    else { settle?.(); settle = null }
    return
  }
  const message = asking ? null : blockMessage()
  if (!message && !asking) return update('pop')
  // The screen with the changes is still on view: put its entry back, then ask (once).
  if (steps) {
    undoing = 'stay'
    // A browser that never answers the step must not keep the person on the page.
    restored = Promise.race([new Promise<void>((resolve) => { settle = resolve }), new Promise<void>((resolve) => setTimeout(resolve, 1000))])
    window.history.go(steps)
  } else {
    pushEntry(boot.base + (snapshot.path === '/' ? '' : snapshot.path) + snapshot.search)
  }
  if (!message) return
  void ask(message).then(async (leave) => {
    if (!leave) return
    await restored
    undoing = 'leave'
    if (steps) window.history.go(-steps)
    else window.history.back()
  })
})

const subscribe = (l: Listener) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const useSnapshot = () => useSyncExternalStore(subscribe, () => snapshot)

/** The location screens see: the one they were drawn for, while the next screen gets ready. */
const ScreenContext = createContext<Location | null>(null)

/** Register a guard (e.g. unsaved changes). Return a message to block navigation. */
export function blockNavigation(check: () => string | null): () => void {
  blockers.push(check)
  if (blockers.length === 1) window.addEventListener('beforeunload', beforeUnload)
  return () => {
    blockers = blockers.filter((b) => b !== check)
    if (blockers.length === 0) window.removeEventListener('beforeunload', beforeUnload)
  }
}

function blockMessage(): string | null {
  for (const check of blockers) {
    const message = check()
    if (message) return message
  }
  return null
}

/** Closing the tab, reloading or leaving the admin with changes unsaved: the browser asks, in its own words. */
function beforeUnload(event: BeforeUnloadEvent) {
  if (left || !blockMessage()) return
  event.preventDefault()
  event.returnValue = ''
}

let confirmer: (message: string) => Promise<boolean> = (message) => Promise.resolve(window.confirm(message))
let asking = false
/** Someone just chose to leave their changes: the browser needn't ask again. */
let left = false

/** For the admin: how to ask whether to leave unsaved changes behind (the admin's own dialog). Resolve true to leave. */
export function confirmLeaving(handler: (message: string) => Promise<boolean>) {
  confirmer = handler
}

async function ask(message: string): Promise<boolean> {
  asking = true
  try {
    return await confirmer(message)
  } finally {
    asking = false
  }
}

/** `overlay`: to or from a route drawn over the screen on view. Nothing is being left, so nothing needs to ask. */
export function navigate(to: string, options: { replace?: boolean; overlay?: boolean } = {}) {
  if (asking) return
  const message = options.overlay ? null : blockMessage()
  if (!message) return go(to, options)
  void ask(message).then((leave) => {
    if (!leave) return
    left = true
    go(to, options)
    setTimeout(() => { left = false }, 1000)
  })
}

function go(to: string, options: { replace?: boolean }) {
  if (/^https?:\/\//.test(to)) {
    window.location.href = to
    return
  }
  const url = boot.base + (to === '/' ? '' : to)
  if (options.replace) replaceEntry(url)
  else pushEntry(url)
  update(options.replace ? 'replace' : 'push')
}

function toLocation(s: Snapshot): Location {
  return { path: s.path, search: s.search, query: Object.fromEntries(new URLSearchParams(s.search)), action: s.action }
}

export function useLocation(): Location {
  const screen = useContext(ScreenContext)
  const live = useSnapshot()
  const location = useMemo(() => toLocation(live), [live])
  return screen ?? location
}

/**
 * For the admin: the location to draw the screen for. Going to another path
 * keeps the current screen on view until the next one is ready (code and data),
 * so navigating never flashes a loading state; changes to the query apply at once.
 * Wrap the screen in `<ScreenLocation>` with it, so the screen reads it too.
 */
export function useScreenLocation(prepare?: (location: Location) => Promise<unknown>): { location: Location; pending: boolean } {
  const live = useSnapshot()
  const [ready, setReady] = useState(live)
  useEffect(() => {
    if (!prepare) return
    if (live.path === ready.path) {
      setReady(live)
      return
    }
    let canceled = false
    // A later navigation wins, even if an earlier request finishes last. Failures
    // still open the destination so its normal error/retry UI can handle them.
    void Promise.resolve().then(() => prepare(toLocation(live))).catch(() => {}).then(() => {
      if (!canceled) setReady(live)
    })
    return () => { canceled = true }
  }, [live, ready.path, prepare])
  const target = !prepare || live.path === ready.path ? live : ready
  const deferred = useDeferredValue(target)
  const s = deferred.path === live.path ? live : deferred
  const location = useMemo(() => toLocation(s), [s])
  return { location, pending: s !== live }
}

export function ScreenLocation({ location, children }: { location: Location; children: ReactNode }) {
  return createElement(ScreenContext.Provider, { value: location }, children)
}

let prefetcher: ((path: string) => void) | null = null

/** For the admin: called when a link is about to be followed (hovered or focused), to get its screen ready. */
export function onLinkIntent(handler: (path: string) => void) {
  prefetcher = handler
}

/** Get a screen's code and required data ready, e.g. when a menu item is highlighted. */
export function prefetch(path: string) {
  if (!/^https?:\/\//.test(path)) prefetcher?.(path)
}

/** Match "/collections/:handle/*" against a path. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean)
  const s = path.split('/').filter(Boolean)
  const params: Record<string, string> = {}

  for (let i = 0; i < p.length; i++) {
    const part = p[i]
    if (part === '*') {
      params['*'] = s.slice(i).map(decodeURIComponent).join('/')
      return params
    }
    if (i >= s.length) return null
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(s[i])
    else if (part !== s[i]) return null
  }

  return s.length === p.length ? params : null
}

export function setQuery(values: Record<string, string | number | null | undefined>, replace = true) {
  const params = new URLSearchParams(window.location.search)
  for (const [k, v] of Object.entries(values)) {
    if (v === null || v === undefined || v === '') params.delete(k)
    else params.set(k, String(v))
  }
  const qs = params.toString()
  const url = window.location.pathname + (qs ? `?${qs}` : '')
  replace ? replaceEntry(url) : pushEntry(url)
  update(replace ? 'replace' : 'push')
}

/**
 * A tab kept in the URL (`?tab=…`), so a refresh or a shared link opens the same
 * tab. The first value is the default and stays out of the URL.
 *
 *   const [tab, setTab] = useTab(['fields', 'settings', 'submissions'])
 */
export function useTab<T extends string>(values: readonly T[], key = 'tab'): [T, (value: T) => void] {
  const { query } = useLocation()
  const current = values.includes(query[key] as T) ? (query[key] as T) : values[0]
  return [current, (value: T) => setQuery({ [key]: value === values[0] ? null : value })]
}

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
}

export function Link({ to, onClick, onMouseEnter, onFocus, ...props }: LinkProps) {
  const external = /^https?:\/\//.test(to)
  return createElement('a', {
    ...props,
    href: external ? to : boot.base + (to === '/' ? '' : to),
    onMouseEnter: (event: MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(event)
      prefetch(to)
    },
    onFocus: (event: FocusEvent<HTMLAnchorElement>) => {
      onFocus?.(event)
      prefetch(to)
    },
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event)
      if (event.defaultPrevented || external || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0 || props.target === '_blank') return
      event.preventDefault()
      navigate(to)
    },
  })
}
