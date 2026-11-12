// Behaviours that draw in the builder's canvas too. The canvas is a sandboxed frame that runs no
// scripts, so a block whose look a script draws (a WebGL field, a chart) would be blank there. A
// behaviour that says it can (`export const canvas = true`) arrives on its element as
// `data-cms-canvas='[{"src":"/_cms/site/scripts/field-….js","props":{…}}]'`, and the editor mounts it
// from here with the lifecycle it has on the site: `mount(el, props, context)`, its cleanup and
// `unmount(el)`. The canvas's own window and document are in the context, beside `canvas: true`: the
// script draws in the frame, while it runs in the admin.
//
// An edit renders the canvas again: everything mounted is undone first and mounted afresh after, so a
// behaviour never draws into markup that changed under it.
//
// A document that runs no scripts shows a <canvas> as its fallback content, never as its drawing (HTML's
// rule for canvas when scripting is disabled). So the editor shows a picture of each canvas a behaviour
// draws, an <img> in its place, taken after it mounts, as it settles and when its block changes size.
// WebGL keeps its drawing buffer for that while a behaviour mounts here (`preserveDrawingBuffer`).

export interface CanvasContext {
  token: (path: string) => string
  reducedMotion: boolean
  signal: AbortSignal
  /** Always true here: the script is in the builder's canvas, not on the site. */
  canvas: true
  /**
   * The canvas's window and document, for what a script would read from its own (size, scroll, media queries).
   * The script runs in the admin: its global `window` and `document` are the admin's page, never the canvas.
   */
  window: Window
  document: Document
}

type Cleanup = void | (() => void)

interface Behavior {
  canvas?: boolean
  mount?: (el: HTMLElement, props: Record<string, unknown>, context: CanvasContext) => Cleanup | Promise<Cleanup>
  default?: Behavior['mount']
  unmount?: (el: HTMLElement) => void
}

interface Spec {
  src: string
  props?: Record<string, unknown>
}

interface Mounted {
  el: HTMLElement
  abort: AbortController
  module?: Behavior
  cleanup?: () => void
  /** Takes the pictures down. */
  unpicture?: () => void
}

type GetContext = HTMLCanvasElement['getContext']

/** Runs `fn` with every WebGL context it makes keeping its drawing, so a picture can be taken of it later. */
function keeping<T>(win: Window & typeof globalThis, fn: () => T): T {
  const prototypes = [...new Set([HTMLCanvasElement.prototype, win.HTMLCanvasElement.prototype])]
  const originals = prototypes.map((proto) => proto.getContext)
  prototypes.forEach((proto, i) => {
    proto.getContext = function (this: HTMLCanvasElement, type: string, options?: Record<string, unknown>) {
      return (originals[i] as (...args: unknown[]) => unknown).call(this, type, type.startsWith('webgl') || type === 'experimental-webgl' ? { ...options, preserveDrawingBuffer: true } : options)
    } as GetContext
  })
  try {
    return fn()
  } finally {
    prototypes.forEach((proto, i) => { proto.getContext = originals[i] })
  }
}

/** Pictures of the canvases in `el`, in their places, retaken as it settles and when it changes size. */
function picture(el: HTMLElement, win: Window & typeof globalThis): () => void {
  const pictures = new Map<HTMLCanvasElement, HTMLImageElement>()
  const take = () => {
    for (const canvas of el.querySelectorAll('canvas')) {
      let img = pictures.get(canvas)
      if (!img) {
        img = el.ownerDocument.createElement('img')
        img.alt = ''
        img.setAttribute('aria-hidden', 'true')
        img.dataset.cmsCanvasPicture = ''
        const style = win.getComputedStyle(canvas)
        for (const name of ['position', 'inset', 'top', 'right', 'bottom', 'left', 'width', 'height', 'display', 'z-index', 'transform', 'opacity', 'border-radius', 'pointer-events']) img.style.setProperty(name, style.getPropertyValue(name))
        canvas.after(img)
        canvas.style.display = 'none'
        pictures.set(canvas, img)
      }
      try {
        if (canvas.width && canvas.height) img.src = canvas.toDataURL()
      } catch {
        // A canvas that may not be read stays as it is.
      }
    }
  }
  take()
  const frame = requestAnimationFrame(() => requestAnimationFrame(take))
  const timers = [300, 1000, 2500].map((ms) => setTimeout(take, ms))
  // After the behaviour has drawn at its new size.
  const size = new ResizeObserver(() => requestAnimationFrame(take))
  size.observe(el)
  return () => {
    cancelAnimationFrame(frame)
    timers.forEach(clearTimeout)
    size.disconnect()
    for (const [canvas, img] of pictures) {
      img.remove()
      canvas.style.display = ''
    }
  }
}

const PREFIX: Record<string, string> = { weight: 'font-weight' }

/** Where the design's scripts and libraries are published: the only files a canvas behaviour is loaded from. */
const PUBLISHED = '/_cms/site/'

/** A same-origin path under the published design, or null: never another host (`//host/x.js`) or scheme. */
function published(path: string, base = location.href): string | null {
  try {
    const url = new URL(path, base)
    return url.origin === location.origin && url.pathname.startsWith(PUBLISHED) ? url.pathname : null
  } catch {
    return null
  }
}

interface ImportMap { imports?: Record<string, string>; integrity?: Record<string, string> }

/** What a module imports: `import … from "x"`, `export … from "x"`, `import "x"` and `import("x")`. */
const IMPORTS = /\bimport\s*(?:[\w$*{}\s,]+?\s*from\s*)?["']([^"']+)["']|\bexport\s*[\w$*{}\s,]*?\s*from\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)/g

/**
 * The entries of the page's import map that a script and what it imports need, found by reading them: names
 * ("three") and paths ("./lib/state.js") that the map sends to the published files, nothing else of it.
 */
async function needs(src: string, map: ImportMap): Promise<ImportMap> {
  const imports: Record<string, string> = {}
  const integrity: Record<string, string> = {}
  const seen = new Set<string>()
  const read = async (file: string): Promise<void> => {
    if (seen.has(file) || seen.size > 200) return
    seen.add(file)
    const text = await fetch(file, { credentials: 'same-origin' }).then((r) => (r.ok ? r.text() : ''), () => '')
    const next: string[] = []
    for (const m of text.matchAll(IMPORTS)) {
      const specifier = m[1] ?? m[2] ?? m[3]
      const relative = /^(\/|\.\/|\.\.\/)/.test(specifier)
      const key = relative ? published(specifier, location.origin + file) : specifier
      const target = key ? published(map.imports?.[key] ?? (relative ? key : '')) : null
      if (!key || !target) continue
      if (map.imports?.[key]) imports[key] = target
      if (map.integrity?.[target]) integrity[target] = map.integrity[target]
      next.push(target)
    }
    await Promise.all(next.map(read))
  }
  await read(src)
  return { imports, ...(Object.keys(integrity).length ? { integrity } : {}) }
}

/**
 * The part of the page's import map a behaviour needs, lent to the admin so its imports resolve. The editor
 * marks the page's map (`data-cms-importmap`) when it turns the page's scripts off. The script element is
 * taken away again when the behaviours are; what the browser resolved through it, it keeps for the visit.
 * A browser that takes no second import map leaves the script unloaded, and the block keeps its name.
 */
async function lend(d: Document, src: string): Promise<HTMLScriptElement | null> {
  let map: ImportMap
  try {
    map = JSON.parse(d.querySelector('script[data-cms-importmap]')?.textContent ?? '{}') as ImportMap
  } catch {
    return null
  }
  const needed = await needs(src, map)
  if (!Object.keys(needed.imports ?? {}).length) return null
  const script = document.createElement('script')
  script.type = 'importmap'
  script.dataset.cmsCanvas = ''
  // The admin's scripts carry a nonce its Content-Security-Policy names: this one is the admin's too.
  script.nonce = document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce ?? ''
  script.textContent = JSON.stringify(needed)
  document.head.append(script)
  return script
}

function specs(el: HTMLElement): Spec[] {
  try {
    return (JSON.parse(el.dataset.cmsCanvas ?? '[]') as Spec[]).flatMap((spec) => {
      const src = typeof spec?.src === 'string' ? published(spec.src) : null
      return src ? [{ ...spec, src }] : []
    })
  } catch {
    return []
  }
}

const report = (src: string, error: unknown) => console.error('[cms] canvas behavior', src, error)

/** What is mounted in one canvas: mount it all, take it all down. */
export function canvasBehaviors() {
  let mounted: Mounted[] = []
  let maps: HTMLScriptElement[] = []

  async function run(entry: Mounted, spec: Spec, d: Document) {
    const win = d.defaultView
    if (!win) return
    try {
      const map = await lend(d, spec.src)
      if (map) maps.push(map)
      if (entry.abort.signal.aborted) return
      const module: Behavior = await import(/* @vite-ignore */ spec.src)
      // A script that has not said it draws in the canvas is not run there.
      if (entry.abort.signal.aborted || module.canvas !== true) return
      entry.module = module
      const style = () => win.getComputedStyle(entry.el)
      const context: CanvasContext = {
        token: (path) => {
          const at = path.indexOf('.')
          const group = path.slice(0, at)
          return style().getPropertyValue(`--${PREFIX[group] ?? group}-${path.slice(at + 1)}`).trim()
        },
        reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
        signal: entry.abort.signal,
        canvas: true,
        window: win,
        document: d,
      }
      const mount = module.mount ?? module.default
      const cleanup = await keeping(win as Window & typeof globalThis, () => mount?.(entry.el, spec.props ?? {}, context))
      if (entry.abort.signal.aborted) {
        if (typeof cleanup === 'function') cleanup()
        return
      }
      if (typeof cleanup === 'function') entry.cleanup = cleanup
      entry.unpicture = picture(entry.el, win as Window & typeof globalThis)
    } catch (error) {
      report(spec.src, error)
    }
  }

  return {
    /** Mounts every behaviour in the canvas that draws there. */
    mount(d: Document) {
      for (const el of d.querySelectorAll<HTMLElement>('[data-cms-canvas]')) {
        for (const spec of specs(el)) {
          const entry: Mounted = { el, abort: new AbortController() }
          mounted.push(entry)
          void run(entry, spec, d)
        }
      }
    },
    /** Undoes every one, last on first off: before an edit renders the canvas again, and when the editor closes. */
    unmount() {
      const entries = mounted.reverse()
      mounted = []
      for (const entry of entries) {
        entry.abort.abort()
        try {
          entry.unpicture?.()
          entry.cleanup?.()
          entry.module?.unmount?.(entry.el)
        } catch (error) {
          report(entry.module ? 'unmount' : 'mount', error)
        }
      }
      maps.forEach((map) => map.remove())
      maps = []
    },
  }
}
