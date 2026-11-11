// Block behaviours: an element names a script of the design, and that script's `mount` runs when the
// element is in the document and its `unmount` when it leaves, however it got there or went: the first
// load, a script that adds markup, a page transition that swaps the page.
//   <div data-cms-behavior="/_cms/site/scripts/tilt-1a2b3c4d5e.js" data-cms-props='{"max":8}' data-cms-when="visible">
//
//   export function mount(el, props, { token, reducedMotion, signal }) { …; return () => { /* undo */ } }
//   export function unmount(el) { … }                                      // optional, after the returned function
//
// Props are what an editor typed into the block, not what the script's author wrote: a script never
// treats them as markup, code or an address to load.

export interface BehaviorContext {
  /** A design token's value where the element is: token('color.primary'), token('duration.fast'). '' when there is none. */
  token: (path: string) => string
  /** The visitor asked for less motion. When that changes, the behaviour is unmounted and mounted again. */
  reducedMotion: boolean
  /** Aborted when the element leaves: pass it to addEventListener and fetch, and nothing is left to undo. */
  signal: AbortSignal
}

type Cleanup = void | (() => void)

interface Behavior {
  mount?: (el: HTMLElement, props: Record<string, unknown>, context: BehaviorContext) => Cleanup | Promise<Cleanup>
  default?: Behavior['mount']
  unmount?: (el: HTMLElement) => void
}

interface Mounted {
  abort: AbortController
  module?: Behavior
  cleanup?: () => void
  /** Stops waiting for the element to come near the screen, or for the browser to be idle. */
  cancel?: () => void
}

const SELECTOR = '[data-cms-behavior]'
const mounted = new Map<HTMLElement, Mounted>()
const reduced = matchMedia('(prefers-reduced-motion: reduce)')

/** Token groups whose CSS variable isn't named after them (DesignJson::GROUPS). */
const PREFIX: Record<string, string> = { weight: 'font-weight' }

function token(el: HTMLElement, path: string): string {
  const at = path.indexOf('.')
  const group = path.slice(0, at)
  return getComputedStyle(el).getPropertyValue(`--${PREFIX[group] ?? group}-${path.slice(at + 1)}`).trim()
}

function props(el: HTMLElement): Record<string, unknown> {
  try {
    return JSON.parse(el.dataset.cmsProps ?? '{}')
  } catch {
    return {}
  }
}

const report = (el: HTMLElement, error: unknown) => console.error('[cms] behavior', el.dataset.cmsBehavior, error)

async function run(el: HTMLElement, entry: Mounted) {
  entry.cancel = undefined
  try {
    const module: Behavior = await import(/* @vite-ignore */ el.dataset.cmsBehavior!)
    if (entry.abort.signal.aborted) return
    entry.module = module
    const cleanup = await (module.mount ?? module.default)?.(el, props(el), { token: (path) => token(el, path), reducedMotion: reduced.matches, signal: entry.abort.signal })
    if (typeof cleanup !== 'function') return
    // It left while its mount was still at work: undo what that did.
    if (entry.abort.signal.aborted) cleanup()
    else entry.cleanup = cleanup
  } catch (error) {
    report(el, error)
  }
}

export function mount(el: HTMLElement) {
  if (mounted.has(el) || !el.dataset.cmsBehavior) return
  const entry: Mounted = { abort: new AbortController() }
  mounted.set(el, entry)
  const when = el.dataset.cmsWhen
  if (when === 'visible' && 'IntersectionObserver' in window) {
    // A screen ahead, so it is there by the time it is seen.
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && (io.disconnect(), run(el, entry)), { rootMargin: '100% 0px' })
    io.observe(el)
    entry.cancel = () => io.disconnect()
  } else if (when === 'idle') {
    const idle = window.requestIdleCallback ? requestIdleCallback(() => run(el, entry), { timeout: 2000 }) : window.setTimeout(() => run(el, entry), 200)
    entry.cancel = () => (window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle))
  } else void run(el, entry)
}

export function unmount(el: HTMLElement) {
  const entry = mounted.get(el)
  if (!entry) return
  mounted.delete(el)
  entry.cancel?.()
  entry.abort.abort()
  try {
    entry.cleanup?.()
    entry.module?.unmount?.(el)
  } catch (error) {
    report(el, error)
  }
}

const within = (node: Node): HTMLElement[] => (node instanceof HTMLElement ? [...(node.matches(SELECTOR) ? [node] : []), ...node.querySelectorAll<HTMLElement>(SELECTOR)] : [])

export function start() {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(mount)

  new MutationObserver((records) => {
    for (const record of records) {
      // An element moved within the page (kept across a page transition) is still in it: it stays mounted.
      for (const node of record.removedNodes) for (const el of within(node)) el.isConnected || unmount(el)
      for (const node of record.addedNodes) for (const el of within(node)) el.isConnected && mount(el)
    }
  }).observe(document.documentElement, { childList: true, subtree: true })

  reduced.addEventListener('change', () => {
    for (const el of [...mounted.keys()]) {
      unmount(el)
      mount(el)
    }
  })
}
