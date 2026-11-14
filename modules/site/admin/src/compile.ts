import { can, isActive, queryClient, run } from '@letterncms/sdk'
import type { StylingSource } from '@letterncms/blocks'

/* A server without Node can't compile the site's stylesheet: the admin does it for it, in the browser, with
   the same Tailwind. Whenever the published CSS may be behind (the admin opens, the styling was saved,
   content was saved and may use a class the CSS has not yet), this asks whether it is, compiles and hands the
   CSS back. Nobody sees it: nothing is drawn, and what goes wrong goes to the console. */

let running = false
let wanted = false

async function compile(): Promise<void> {
  // styling/get says it for everyone who may open the admin; the abilities below ask for no more.
  if (!isActive('letterncms/site') || !can('admin.access')) return
  const { current } = await run<{ current: boolean }>('styling/get')
  if (current) return
  const { compileStyling } = await import('@letterncms/blocks')
  // Once more when the stylesheet or the content changed while it compiled; after that the next save asks again.
  for (let attempt = 0; attempt < 2; attempt++) {
    const source = await run<StylingSource>('styling/source')
    const css = await compileStyling(source)
    const { stored } = await run<{ stored: boolean }>('styling/compiled', { signature: source.signature, css })
    if (stored) return
  }
}

/** Compile the site's CSS if the server could not. Never two at once: a call during one runs it once more after. */
export function keepCompiled(): void {
  if (running) {
    wanted = true
    return
  }
  running = true
  void compile()
    .catch((error) => console.error('[cms] The site’s stylesheet could not be compiled in the browser.', error))
    .finally(() => {
      running = false
      if (wanted) {
        wanted = false
        keepCompiled()
      }
    })
}

/** What a save makes stale: entries and their content (a block may carry a new class), and the styling itself. */
const CHANGED = ['entries/', 'content/', 'styling/']

let timer: ReturnType<typeof setTimeout> | undefined

/** Start watching, for as long as the admin is open: once when it loads, then after every save of content or styling. */
export function watchStyling(): void {
  keepCompiled()
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || event.action.type !== 'invalidate') return
    const key = event.query.queryKey[0]
    if (typeof key !== 'string' || !CHANGED.some((prefix) => key.startsWith(prefix))) return
    // One save invalidates many queries: one look, once they have settled.
    clearTimeout(timer)
    timer = setTimeout(keepCompiled, 2000)
  })
}
