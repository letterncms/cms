import { events, t } from '@letterncms/sdk'
import { useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { cn } from './cn'
import { WorkspaceContext } from './Slideover'

export interface DockState {
  open: boolean
  full: boolean
}

let current: DockState = { open: false, full: false }

/** For the shell, which learns of it after the dock first draws: a dock that opens with the admin takes its place before anything is painted. */
export const dockState = () => current

/** Make way: something else is to have the right edge. The dock's own state decides what's kept. */
export const closeDock = () => events.emit('shell.dock.close')

/** Whether a panel is docked at the right edge, for what shares it with the dock. */
export function useDock(): DockState {
  return useContext(WorkspaceContext)?.dock ?? current
}

const KEY = 'cms.dock.width'
const MIN = 320
const MAX = 640
const DEFAULT = 380
const clamp = (width: number) => Math.min(MAX, Math.max(MIN, Math.round(width)))

/**
 * A column at the right edge of the window, for a `shell.dock` panel: the page
 * stays open and live next to it. It has that edge to itself: an inspector makes way
 * for it and comes back after it. It can be dragged wider. `full` grows it over the
 * workspace, which stays as it is underneath; in a small window it opens over the
 * page. It keeps its children mounted while closed.
 */
export function Dock({ open, full, label, onClose, className, children }: { open: boolean; full: boolean; label: string; onClose: () => void; className?: string; children: ReactNode }) {
  const [width, setWidth] = useState(() => {
    try { return clamp(Number(localStorage.getItem(KEY)) || DEFAULT) } catch { return DEFAULT }
  })
  const [resizing, setResizing] = useState(false)
  const element = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    current = { open, full }
    events.emit<DockState>('shell.dock', current)
    return () => {
      current = { open: false, full: false }
      events.emit<DockState>('shell.dock', current)
    }
  }, [open, full])

  useEffect(() => events.on('shell.dock.close', onClose), [onClose])

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
      data-resizing={resizing || undefined}
      style={{ '--cms-dock-width': `${width}px` } as CSSProperties}
      className={cn('cms-dock', className)}
    >
      <div className="cms-dock-panel">
        {open && !full && (
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
