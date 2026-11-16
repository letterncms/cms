import { t } from '@letterncms/sdk'
import { Notice, deviceWidths } from '@letterncms/ui'
import { loadCompiler, loadEngine, type StylingSource } from '@letterncms/blocks'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'

/* The site beside the controls: a real page of it in a frame, with the draft's CSS in place of the published
   one. Tailwind compiles the draft here, in the browser, for the classes that page and the content use. */

export const WIDTHS = { desktop: '100%', tablet: `${deviceWidths.tablet}px`, phone: `${deviceWidths.phone}px` } as const
export type Viewport = keyof typeof WIDTHS

type Compiler = { build: (candidates: string[]) => string }

export interface DraftCompile {
  /** The last draft Tailwind could read, as a source: what the controls' pickers and the preview show. */
  source: StylingSource | undefined
  compiler: Compiler | null
  /** Tailwind's own words about the draft as it is now, when it refuses it. */
  problem: string | null
}

/**
 * The draft stylesheet, compiled a moment after it last changed. One at a time, and the newest last: each
 * stylesheet is a whole design system, and only the one on screen and the one before it are kept. A draft
 * Tailwind refuses leaves the last good one in place and says why.
 */
export function useDraftCompile(base: StylingSource | undefined, css: string | undefined): DraftCompile {
  const [state, setState] = useState<DraftCompile>({ source: undefined, compiler: null, problem: null })
  const latest = useRef({ base, css })
  latest.current = { base, css }
  const wanted = useRef(false)
  const done = useRef<{ base?: StylingSource; css?: string }>({})
  const running = useRef(false)
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])
  const started = !!state.source

  useEffect(() => {
    if (!base || css === undefined) return
    const pump = async () => {
      wanted.current = true
      if (running.current) return
      running.current = true
      try {
        while (wanted.current && alive.current) {
          wanted.current = false
          const now = latest.current
          if (!now.base || now.css === undefined) break
          // What is on screen already is not compiled again.
          if (done.current.base === now.base && done.current.css === now.css) continue
          done.current = now
          const sheet = { css: now.css, files: now.base.files }
          try {
            const compiler = await loadCompiler(sheet)
            // A class the stylesheet applies and Tailwind doesn't know is only found when it builds.
            compiler.build(now.base.candidates)
            if (!(await loadEngine(sheet))) throw new Error(t('Tailwind could not read the stylesheet.'))
            if (alive.current) setState({ source: { ...now.base, css: now.css }, compiler, problem: null })
          } catch (error) {
            if (alive.current) setState((before) => ({ ...before, problem: error instanceof Error ? error.message : String(error) }))
          }
        }
      } finally {
        running.current = false
      }
    }
    // The first one at once; after that a pause in the typing or dragging.
    const timer = setTimeout(() => void pump(), started ? 150 : 0)
    return () => clearTimeout(timer)
  }, [base, css, started])

  return state
}

/**
 * The site at the chosen screen's width. Desktop takes the room there is, but never less
 * than the site's desktop width: with less room it is scaled down, so it keeps its desktop
 * layout. Tablet and phone draw at their width (scaled down only when the room is smaller).
 */
function Scaled({ viewport, desktop, children }: { viewport: Viewport; desktop: number; children: (style: CSSProperties) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setRoom({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const width = viewport === 'desktop' ? Math.max(room.width, desktop) : parseFloat(WIDTHS[viewport])
  const scale = room.width ? Math.min(1, room.width / width) : 1
  return (
    <div ref={box} className="relative min-h-0 flex-1">
      {room.width > 0 && children({ position: 'absolute', top: 0, left: Math.max(0, (room.width - width * scale) / 2), width, height: room.height / scale, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' })}
    </div>
  )
}

const STYLE = 'cms-styling-draft'

/**
 * The draft's CSS on a page of the site: a stylesheet of ours in place of the published one, which is turned
 * off so a rule the draft no longer has does not linger. Light or dark is the page's `data-theme` (what `dark:`
 * follows) and its colour scheme (what light-dark() follows).
 */
function apply(doc: Document | null | undefined, compile: DraftCompile, published: string, mode: 'light' | 'dark' | null) {
  if (!doc?.head) return
  const root = doc.documentElement
  if (mode) {
    if (root.dataset.theme !== mode) root.dataset.theme = mode
    root.style.colorScheme = mode
  } else if (root.style.colorScheme) {
    delete root.dataset.theme
    root.style.colorScheme = ''
  }
  if (!compile.compiler || !compile.source) return
  // Every version of the site's stylesheet is published under one name with a hash: styles-<hash>.css.
  const prefix = published.replace(/[^/-]*$/, '')
  const links = [...doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].filter((link) => prefix !== '' && (link.getAttribute('href') ?? '').startsWith(prefix))
  const names = new Set(compile.source.candidates)
  for (const element of doc.querySelectorAll('[class]')) for (const name of element.classList) names.add(name)
  let css: string
  try {
    css = compile.source.faces + compile.compiler.build([...names])
  } catch (error) {
    // A class on the page Tailwind can't build is not the draft's fault: the last CSS stays.
    console.error(error)
    return
  }
  let style = doc.getElementById(STYLE) as HTMLStyleElement | null
  if (!style) {
    style = doc.createElement('style')
    style.id = STYLE
    // Where the published stylesheet stood, so what comes after it (a block's own styles) still comes after.
    links[0] ? links[0].after(style) : doc.head.appendChild(style)
  }
  if (style.textContent !== css) style.textContent = css
  for (const link of links) link.disabled = true
}

/** The site in its frame on the desk, as the design's own screen shows it: a page lifted off the desk, the whole width on a phone. */
export const SITE_FRAME = 'border-0 bg-bg md:rounded-md md:shadow-sheet'

export function SitePreview({ frame, compile, published, viewport, desktop, mode }: { frame: RefObject<HTMLIFrameElement | null>; compile: DraftCompile; published: string; viewport: Viewport; desktop: number; mode: 'light' | 'dark' | null }) {
  // Counts the pages the frame has loaded: a new page gets the draft too.
  const [loaded, setLoaded] = useState(0)
  useEffect(() => apply(frame.current?.contentDocument, compile, published, mode), [frame, compile, published, mode, loaded])
  return (
    <div className="relative flex min-h-0 flex-1 flex-col md:p-4">
      <Scaled viewport={viewport} desktop={desktop}>
        {(style) => <iframe ref={frame} src="/" title={t('Site Preview')} className={SITE_FRAME} style={style} onLoad={() => setLoaded((n) => n + 1)} />}
      </Scaled>
      {compile.problem && (
        // Quiet, over the page: the preview keeps the last CSS Tailwind could make.
        <div className="absolute inset-x-3 top-3 rounded-lg bg-bg shadow-raise">
          <Notice tone="warning" title={t('Tailwind can’t read the stylesheet')}>{compile.problem}</Notice>
        </div>
      )}
    </div>
  )
}
