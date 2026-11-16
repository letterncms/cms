import { t } from '@letterncms/sdk'
import type { KeyboardEvent, PointerEvent } from 'react'
import { cn } from './cn'

/**
 * The edge of a panel that drags it wider or narrower: the sidebar's right edge, the dock's left one, the top of a
 * panel under an editor. `grows` is the way a drag makes it larger. A double click puts it back; the arrow keys
 * move it a step.
 */
export function ResizeHandle({ value, min, max, grows, onResize, onReset, onResizing, label = t('Resize Panel'), className }: {
  value: number
  min: number
  max: number
  grows: 'left' | 'right' | 'up' | 'down'
  onResize: (width: number) => void
  onReset: () => void
  onResizing?: (resizing: boolean) => void
  label?: string
  className?: string
}) {
  const sign = grows === 'right' || grows === 'down' ? 1 : -1
  const vertical = grows === 'up' || grows === 'down'
  const drag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    const at = (event: { clientX: number; clientY: number }) => (vertical ? event.clientY : event.clientX)
    const start = { at: at(e), size: value }
    handle.setPointerCapture(e.pointerId)
    onResizing?.(true)
    const move = (event: globalThis.PointerEvent) => onResize(start.size + sign * (at(event) - start.at))
    const stop = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', stop)
      handle.removeEventListener('pointercancel', stop)
      onResizing?.(false)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', stop)
    handle.addEventListener('pointercancel', stop)
  }
  const nudge = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = (vertical ? { ArrowUp: -24, ArrowDown: 24 } : { ArrowLeft: -24, ArrowRight: 24 } as Record<string, number>)[e.key]
    if (!step) return
    e.preventDefault()
    onResize(value + sign * step)
  }
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={vertical ? 'horizontal' : 'vertical'}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      data-grows={grows}
      onPointerDown={drag}
      onDoubleClick={onReset}
      onKeyDown={nudge}
      className={cn('cms-resize-handle', className)}
    />
  )
}
