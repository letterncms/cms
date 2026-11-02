import { events, t } from '@letterncms/sdk'
import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { cn } from './cn'

export interface DockState {
  open: boolean
  full: boolean
}

let current: DockState = { open: false, full: false }

/** For the shell, which learns of it after the dock first draws: a dock that opens with the admin takes its place before anything is painted. */
export const dockState = () => current

const KEY = 'cms.dock.width'
const PLACE = 'cms.dock.place'
const MIN = 320
const MAX = 640
const DEFAULT = 380
const clamp = (width: number) => Math.min(MAX, Math.max(MIN, Math.round(width)))

/**
 * A panel on every screen, for a `shell.dock` slot: a column at the right edge with
 * the page open and live next to it, or `floating`, a card over the page that an
 * element with `data-dock-drag` moves around. It can be dragged wider. `full` grows it
 * over the workspace, which stays as it is underneath; in a small window it opens
 * over the page. It keeps its children mounted while closed.
 */
export function Dock({ open, full, floating, label, className, children }: { open: boolean; full: boolean; floating: boolean; label: string; className?: string; children: ReactNode }) {
  const [width, setWidth] = useState(() => {
    try { return clamp(Number(localStorage.getItem(KEY)) || DEFAULT) } catch { return DEFAULT }
  })
  const [resizing, setResizing] = useState(false)
  const element = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  // Where it was dragged to, from where it starts.
  const [place, setPlace] = useState(() => {
    try { return { x: 0, y: 0, ...JSON.parse(localStorage.getItem(PLACE) ?? '{}') } as { x: number; y: number } } catch { return { x: 0, y: 0 } }
  })
  const [dragging, setDragging] = useState(false)
  const floats = floating && !full

  useLayoutEffect(() => {
    current = { open, full }
    events.emit<DockState>('shell.dock', current)
    return () => {
      current = { open: false, full: false }
      events.emit<DockState>('shell.dock', current)
    }
  }, [open, full])

  // A smaller window than it was last placed in: back where it starts.
  useLayoutEffect(() => {
    const box = panel.current?.getBoundingClientRect()
    if (floats && open && box && (box.left < 0 || box.top < 0 || box.right > window.innerWidth || box.bottom > window.innerHeight)) setPlace({ x: 0, y: 0 })
  }, [floats, open])

  const resize = (next: number) => {
    const value = clamp(next)
    setWidth(value)
    try { localStorage.setItem(KEY, String(value)) } catch { /* Optional preference. */ }
  }
  const drag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    const pointer = e.pointerId
    const right = element.current?.getBoundingClientRect().right ?? window.innerWidth
    handle.setPointerCapture(pointer)
    setResizing(true)
    const move = (event: globalThis.PointerEvent) => resize(right - event.clientX)
    const stop = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
      handle.removeEventListener('pointercancel', stop)
      setResizing(false)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
    handle.addEventListener('pointercancel', stop)
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (!floats || e.button !== 0 || !target.closest('[data-dock-drag]') || target.closest('button, a, input')) return
    const box = e.currentTarget.getBoundingClientRect()
    const start = { pointerX: e.clientX, pointerY: e.clientY, ...place }
    const handle = e.currentTarget
    const pointer = e.pointerId
    handle.setPointerCapture(pointer)
    setDragging(true)
    let next = place
    const follow = (event: globalThis.PointerEvent) => {
      // It can go anywhere its whole self is still in the window.
      const dx = Math.min(window.innerWidth - box.right, Math.max(-box.left, event.clientX - start.pointerX))
      const dy = Math.min(window.innerHeight - box.bottom, Math.max(-box.top, event.clientY - start.pointerY))
      next = { x: start.x + dx, y: start.y + dy }
      setPlace(next)
    }
    const stop = () => {
      handle.removeEventListener('pointermove', follow)
      handle.removeEventListener('pointerup', stop)
      handle.removeEventListener('pointercancel', stop)
      setDragging(false)
      try { localStorage.setItem(PLACE, JSON.stringify(next)) } catch { /* Optional preference. */ }
    }
    handle.addEventListener('pointermove', follow)
    handle.addEventListener('pointerup', stop)
    handle.addEventListener('pointercancel', stop)
  }
  const nudge = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: 24, ArrowRight: -24 }[e.key]
    if (!step) return
    e.preventDefault()
    resize(width + step)
  }

  return (
    <aside
      ref={element}
      aria-label={label}
      inert={!open}
      data-open={open || undefined}
      data-full={(open && full) || undefined}
      data-floating={floats || undefined}
      data-dragging={dragging || undefined}
      data-resizing={resizing || undefined}
      style={{ '--cms-dock-width': `${width}px`, '--cms-dock-x': `${place.x}px`, '--cms-dock-y': `${place.y}px` } as CSSProperties}
      className={cn('cms-dock', className)}
    >
      <div ref={panel} className="cms-dock-panel" onPointerDown={move}>
        {open && !full && !floats && (
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-label={t('Resize Panel')}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={width}
            onPointerDown={drag}
            onDoubleClick={() => resize(DEFAULT)}
            onKeyDown={nudge}
            className="cms-dock-handle"
          />
        )}
        <div className="cms-dock-inner">{children}</div>
      </div>
    </aside>
  )
}
