import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from './cn'
import { Skeleton } from './Spinner'

/** The width a page is drawn at before it is scaled down: a desktop window. */
const PAGE = 1280

/** The widths a part is tried at: a desktop window, a laptop's, a tablet's, a column's. */
const WIDTHS = [PAGE, 960, 640, 400]

/** A part keeps some room around it, as on a sheet: what of the frame is left for it. */
const MARGIN = 12
const inside = (frame: { width: number; height: number }) => ({ width: Math.max(1, frame.width - 2 * MARGIN), height: Math.max(1, frame.height - 2 * MARGIN) })

/** How far something drawn `width` by `height` scales to fit the room, never above its own size. */
function fit(room: { width: number; height: number }, width: number, height: number): number {
  return Math.min(room.width / width, room.height / height, 1)
}

/** Where each element ends on the page. A wrapper that draws no box of its own (`display: contents`, as a component's) ends where its children do. */
function bottoms(elements: HTMLCollection, win: Window): number[] {
  return [...elements].filter((el) => el.tagName !== 'SCRIPT').flatMap((el) =>
    win.getComputedStyle(el).display === 'contents' ? bottoms(el.children, win) : [el.getBoundingClientRect().bottom + win.scrollY])
}

/**
 * A page of the site as a picture, scaled to the width it is given: the site's own drawing of it (`src`, an
 * address of the site such as a pattern's or a template's preview), in its design, loaded once it is near
 * the screen. It takes no pointer or focus: whatever holds it says what it is.
 *
 * In a frame of its own shape (`fill`, the card's picture) it shows the page's top, as a desktop window
 * would, and a page shorter than the frame (a header, a button) sits in its middle. Without, it is as tall
 * as the page, up to `maxHeight`.
 *
 * `whole` is for a part rather than a page (a component: a card, a row of a list, a header): all of it shows,
 * drawn at the width where it reads largest in the frame and never larger than it is, in the frame's middle.
 * A card made for a column is drawn as wide as a column, not stretched across a desktop window.
 */
export function PagePreview({ src, fill, whole, maxHeight = 360, className }: { src: string; fill?: boolean; whole?: boolean; maxHeight?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [width, setWidth] = useState(PAGE)
  const [height, setHeight] = useState(720)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // As tall as what the page draws, not the window it fills: a header alone is a header's height.
  const loaded = (frame: HTMLIFrameElement) => {
    try {
      const body = frame.contentDocument?.body
      if (!body) return
      const drawn = () => Math.max(80, Math.min(6000, Math.ceil(Math.max(0, ...bottoms(body.children, frame.contentWindow!)))))
      if (!whole) {
        setHeight(drawn())
      } else {
        // Each width is laid out in turn (reading the frame's width lays it out), and the one it reads largest at wins;
        // a wider one when it reads almost as large, so a header keeps its desktop look where it can.
        const room = inside({ width: box.current?.clientWidth ?? 0, height: (fill ? box.current?.clientHeight : maxHeight) ?? 0 })
        const tries = WIDTHS.map((w) => {
          frame.style.width = `${w}px`
          void frame.offsetWidth
          const h = drawn()
          return { width: w, height: h, scale: fit(room, w, h) }
        })
        const best = Math.max(...tries.map((d) => d.scale))
        const chosen = tries.find((d) => d.scale >= best * 0.9)!
        setWidth(chosen.width)
        setHeight(chosen.height)
      }
    } catch {
      // Another origin: the frame keeps the height it had.
    }
    setReady(true)
  }

  const scale = whole ? fit(inside({ width: size.width, height: fill ? size.height : maxHeight }), width, height) || 0.2 : size.width / PAGE || 0.2
  const top = fill ? Math.max(0, (size.height - height * scale) / 2) : whole ? MARGIN : 0
  const left = whole ? Math.max(0, (size.width - width * scale) / 2) : 0

  return (
    <div ref={box} aria-hidden="true" className={cn('relative w-full overflow-hidden bg-bg', fill ? 'h-full' : 'rounded-md border border-border', className)} style={fill ? undefined : { height: Math.min(maxHeight, height * scale + (whole ? 2 * MARGIN : 0)) }}>
      {/* The shape of what is coming while the site draws it, then the page, faded in. */}
      {!ready && <Skeleton className="absolute inset-0 rounded-none" />}
      <iframe
        src={src}
        title=""
        loading="lazy"
        tabIndex={-1}
        onLoad={(event) => loaded(event.currentTarget)}
        className={cn('pointer-events-none absolute origin-top-left border-0 transition-opacity duration-slow', ready ? 'opacity-100' : 'opacity-0')}
        style={{ top, left, width, height, transform: `scale(${scale})` }}
      />
    </div>
  )
}
