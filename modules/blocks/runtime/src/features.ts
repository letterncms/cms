// The runtime's features, each its own chunk, loaded the first time a page asks for one. A page that
// arrives without a page load (client-side navigation) asks again: what is loaded looks at the new
// markup, what isn't yet is loaded now. Every `start` may be called more than once.

const loaders: Record<string, () => Promise<{ start: () => void }>> = {
  motion: () => import('./motion'),
  lines: () => import('./lines'),
  logic: () => import('./alpine'),
  ajax: () => import('./alpine'),
  code: () => import('./code'),
  search: () => import('./search'),
  tabs: () => import('./tabs'),
  filter: () => import('./filter'),
  fields: () => import('./fields'),
  behavior: () => import('./behavior'),
  navigate: () => import('./navigate'),
  // Scroll animations are CSS where the browser can; the script is for where it can't, for those that trail the scroll, and for those that tell how far along they are.
  scroll: () => (CSS.supports('animation-timeline: view()') && !document.querySelector('[data-cms-scroll*=\'"scrub"\'], [data-cms-scroll*=\'"p":1\']') ? Promise.resolve({ start() {} }) : import('./scroll')),
}

const loaded = new Map<() => Promise<{ start: () => void }>, Promise<void>>()

/**
 * Lines CSS animates wait for their count (`data-cms-lines`, see lines.ts). Never for long: when the count is late
 * or its chunk fails, the words are let go uncounted ("0"), and play word by word as without a script.
 */
const WAIT = 1500
function release(): void {
  for (const block of document.querySelectorAll('[data-cms-lines=""]')) block.setAttribute('data-cms-lines', '0')
}

export function boot(features: Iterable<string>): Promise<unknown> {
  const tasks = new Set<Promise<void>>()
  for (const feature of features) {
    if (feature === 'lines') setTimeout(release, WAIT)
    const loader = loaders[feature]
    if (!loader) continue
    const before = loaded.get(loader)
    const task = before ? before.then(() => loader()).then((m) => m.start()) : loader().then((m) => m.start())
    if (feature === 'lines') void task.catch(release)
    loaded.set(loader, task.catch(() => {}))
    tasks.add(task)
  }
  return Promise.all(tasks).catch((error) => console.error('[cms]', error))
}

/** The features a document's runtime script names. */
export function featuresOf(doc: Document): string[] {
  return (doc.querySelector<HTMLScriptElement>('script[data-features]')?.dataset.features ?? '').split(/\s+/).filter(Boolean)
}
