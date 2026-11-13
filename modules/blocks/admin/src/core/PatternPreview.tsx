import { cn } from '@letterncms/ui'
import { useLayoutEffect, useRef, useState } from 'react'

/** The width a pattern is drawn at before it is scaled down: a desktop page. */
const PAGE = 1280

/**
 * A pattern as the site draws it, scaled to the width it is given: the site's own page of it
 * (`/__pattern/<handle>`), in its design, loaded once it is near the screen. A picture only: it takes no
 * pointer or focus, and whatever holds it says what it is.
 */
export function PatternPreview({ handle, maxHeight = 360, className }: { handle: string; maxHeight?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.2)
  const [height, setHeight] = useState(720)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setScale(el.clientWidth / PAGE || 0.2)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const loaded = (frame: HTMLIFrameElement) => {
    try {
      const page = frame.contentDocument?.documentElement
      if (page) setHeight(Math.max(120, Math.min(6000, page.scrollHeight)))
    } catch {
      // Another origin: the frame keeps the height it had.
    }
  }

  return (
    <div ref={box} aria-hidden="true" className={cn('relative w-full overflow-hidden rounded-md border border-border bg-surface', className)} style={{ height: Math.min(maxHeight, height * scale) }}>
      <iframe
        src={`/__pattern/${encodeURIComponent(handle)}`}
        title=""
        loading="lazy"
        tabIndex={-1}
        onLoad={(event) => loaded(event.currentTarget)}
        className="pointer-events-none absolute left-0 top-0 origin-top-left border-0"
        style={{ width: PAGE, height, transform: `scale(${scale})` }}
      />
    </div>
  )
}
