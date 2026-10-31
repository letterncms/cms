import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from './cn'

/** Reveal the end of an overflowing title when its `cms-sidebar-row` is hovered. */
export function Marquee({ children, className }: { children: string; className?: string }) {
  const viewport = useRef<HTMLSpanElement>(null)
  const content = useRef<HTMLSpanElement>(null)
  const [distance, setDistance] = useState(0)

  useLayoutEffect(() => {
    const outer = viewport.current, inner = content.current
    if (!outer || !inner) return
    // Leave room for the edge fade so the final characters remain fully readable.
    const measure = () => setDistance(inner.offsetWidth > outer.clientWidth + 1 ? inner.offsetWidth - outer.clientWidth + 16 : 0)
    const observer = new ResizeObserver(measure)
    observer.observe(outer)
    observer.observe(inner)
    measure()
    return () => observer.disconnect()
  }, [children])

  return (
    <span ref={viewport} className={cn('cms-marquee', className)} data-overflow={distance > 0 || undefined} style={{ '--marquee-distance': `${distance}px`, '--marquee-duration': `${Math.max(0.4, distance / 28)}s` } as CSSProperties}>
      <span className="cms-marquee-track">
        <span ref={content}>{children}</span>
      </span>
    </span>
  )
}
