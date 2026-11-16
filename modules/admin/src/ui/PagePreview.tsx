import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from './cn'
import { Skeleton } from './Spinner'

/** The width a page is drawn at before it is scaled down: a desktop window. */
const PAGE = 1280

/**
 * A page of the site as a picture, scaled to the width it is given: the site's own drawing of it (`src`, an
 * address of the site such as a pattern's or a template's preview), in its design, loaded once it is near
 * the screen. It takes no pointer or focus: whatever holds it says what it is.
 *
 * In a frame of its own shape (`fill`, the card's picture) it shows the page's top, as a desktop window
 * would, and a page shorter than the frame (a header, a button) sits in its middle. Without, it is as tall
 * as the page, up to `maxHeight`.
 */
export function PagePreview({ src, fill, maxHeight = 360, className }: { src: string; fill?: boolean; maxHeight?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
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
      const drawn = Math.max(0, ...[...body.children].filter((el) => el.tagName !== 'SCRIPT').map((el) => el.getBoundingClientRect().bottom + frame.contentWindow!.scrollY))
      setHeight(Math.max(80, Math.min(6000, Math.ceil(drawn))))
    } catch {
      // Another origin: the frame keeps the height it had.
    }
    setReady(true)
  }

  const scale = size.width / PAGE || 0.2
  const top = fill ? Math.max(0, (size.height - height * scale) / 2) : 0

  return (
    <div ref={box} aria-hidden="true" className={cn('relative w-full overflow-hidden bg-bg', fill ? 'h-full' : 'rounded-md border border-border', className)} style={fill ? undefined : { height: Math.min(maxHeight, height * scale) }}>
      {/* The shape of what is coming while the site draws it, then the page, faded in. */}
      {!ready && <Skeleton className="absolute inset-0 rounded-none" />}
      <iframe
        src={src}
        title=""
        loading="lazy"
        tabIndex={-1}
        onLoad={(event) => loaded(event.currentTarget)}
        className={cn('pointer-events-none absolute left-0 origin-top-left border-0 transition-opacity duration-slow', ready ? 'opacity-100' : 'opacity-0')}
        style={{ top, width: PAGE, height, transform: `scale(${scale})` }}
      />
    </div>
  )
}
