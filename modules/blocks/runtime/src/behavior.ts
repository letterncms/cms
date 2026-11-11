// Block behaviours: an element names a script of the design, and that script's `mount` runs when the
// element is in the document and its `unmount` when it leaves, however it got there or went: the first
// load, a script that adds markup, a page transition that swaps the page.
//   <div data-cms-behavior="/_cms/site/scripts/tilt-1a2b3c4d5e.js" data-cms-props='{"max":8}' data-cms-when="visible">
// A block with several carries them as one list, each mounted and unmounted by itself, in order:
//   <div data-cms-behavior='[{"src":"/_cms/site/scripts/tilt-….js","props":{"max":8}},{"src":"/…/cue-….js","when":"idle"}]'>
//
//   export function mount(el, props, { token, reducedMotion, signal }) { …; return () => { /* undo */ } }
//   export function unmount(el) { … }                                      // optional, after the returned function
//
// Props are what an editor typed into the block, not what the script's author wrote: a script never
// treats them as markup, code or an address to load.

export interface BehaviorContext {
  /** A design token's value where the element is: token('color.primary'), token('duration.fast'). '' when there is none. */
  token: (path: string) => string
  /**
   * The visitor asked for less motion: in their system's settings, or with the page's Motion Toggle.
   * When that changes, the behaviour is unmounted and mounted again.
   */
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

/** One behaviour of an element: its script, what it is handed and when it starts. */
interface Spec {
  src: string
  props?: Record<string, unknown>
  when?: string
}

interface Mounted {
  spec: Spec
  abort: AbortController
  module?: Behavior
  cleanup?: () => void
  /** Stops waiting for the element to come near the screen, or for the browser to be idle. */
  cancel?: () => void
}

const SELECTOR = '[data-cms-behavior]'
const mounted = new Map<HTMLElement, Mounted[]>()
const reduced = matchMedia('(prefers-reduced-motion: reduce)')

/** Less motion: the system's setting, or the page's Motion Toggle (motion.ts), also before that script has started. */
function calm(): boolean {
  if (reduced.matches || document.documentElement.dataset.cmsMotion === 'paused') return true
  try {
    return !!document.querySelector('[data-cms-motion-toggle]') && localStorage.getItem('cms-motion-paused') === '1'
  } catch {
    return false
  }
}

/** Token groups whose CSS variable isn't named after them (DesignJson::GROUPS). */
const PREFIX: Record<string, string> = { weight: 'font-weight' }

function token(el: HTMLElement, path: string): string {
  const at = path.indexOf('.')
  const group = path.slice(0, at)
  return getComputedStyle(el).getPropertyValue(`--${PREFIX[group] ?? group}-${path.slice(at + 1)}`).trim()
}

/** What an element asks for: one behaviour in three attributes, or a list in one. */
function specs(el: HTMLElement): Spec[] {
  const value = el.dataset.cmsBehavior ?? ''
  try {
    if (value.startsWith('[')) return (JSON.parse(value) as Spec[]).filter((spec) => typeof spec?.src === 'string')
    return value ? [{ src: value, props: JSON.parse(el.dataset.cmsProps ?? '{}'), when: el.dataset.cmsWhen }] : []
  } catch {
    return []
  }
}

const report = (spec: Spec, error: unknown) => console.error('[cms] behavior', spec.src, error)

async function run(el: HTMLElement, entry: Mounted, spec: Spec) {
  entry.cancel = undefined
  try {
    const module: Behavior = await import(/* @vite-ignore */ spec.src)
    if (entry.abort.signal.aborted) return
    entry.module = module
    const cleanup = await (module.mount ?? module.default)?.(el, spec.props ?? {}, { token: (path) => token(el, path), reducedMotion: calm(), signal: entry.abort.signal })
    if (typeof cleanup !== 'function') return
    // It left while its mount was still at work: undo what that did.
    if (entry.abort.signal.aborted) cleanup()
    else entry.cleanup = cleanup
  } catch (error) {
    report(spec, error)
  }
}

function begin(el: HTMLElement, spec: Spec): Mounted {
  const entry: Mounted = { abort: new AbortController(), spec }
  const when = spec.when
  if (when === 'visible' && 'IntersectionObserver' in window) {
    // A screen ahead, so it is there by the time it is seen.
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && (io.disconnect(), run(el, entry, spec)), { rootMargin: '100% 0px' })
    io.observe(el)
    entry.cancel = () => io.disconnect()
  } else if (when === 'idle') {
    const idle = window.requestIdleCallback ? requestIdleCallback(() => run(el, entry, spec), { timeout: 2000 }) : window.setTimeout(() => run(el, entry, spec), 200)
    entry.cancel = () => (window.cancelIdleCallback ? cancelIdleCallback(idle) : clearTimeout(idle))
  } else if (when === 'loaded') {
    // Once the page has loaded and its fonts are in: what measures text or the layout measures the final one.
    let waiting = true
    entry.cancel = () => (waiting = false)
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((resolve) => addEventListener('load', resolve, { once: true }))
    void Promise.all([loaded, document.fonts?.ready]).then(() => waiting && run(el, entry, spec))
  } else void run(el, entry, spec)
  return entry
}

export function mount(el: HTMLElement) {
  if (mounted.has(el)) return
  const list = specs(el)
  if (list.length) mounted.set(el, list.map((spec) => begin(el, spec)))
}

export function unmount(el: HTMLElement) {
  const entries = mounted.get(el)
  if (!entries) return
  mounted.delete(el)
  // Last on, first off.
  for (const entry of [...entries].reverse()) {
    entry.cancel?.()
    entry.abort.abort()
    try {
      entry.cleanup?.()
      entry.module?.unmount?.(el)
    } catch (error) {
      report(entry.spec, error)
    }
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

  // One way in: when less motion starts or stops being asked for, every behaviour is mounted afresh with the new answer.
  let was = calm()
  const again = () => {
    if (was === calm()) return
    was = calm()
    for (const el of [...mounted.keys()]) {
      unmount(el)
      mount(el)
    }
  }
  reduced.addEventListener('change', again)
  document.addEventListener('cms:motion', again)
}
