import { t } from '@letterncms/sdk'
import type { KeyboardEvent, PointerEvent } from 'react'
import { cn } from './cn'

/**
 * The edge of a panel that drags it wider or narrower: the sidebar's right edge, the dock's left one.
 * `grows` is the way a drag makes it wider. A double click puts it back; the arrow keys move it a step.
 */
export function ResizeHandle({ value, min, max, grows, onResize, onReset, onResizing, label = t('Resize Panel'), className }: {
  value: number
  min: number
  max: number
  grows: 'left' | 'right'
  onResize: (width: number) => void
  onReset: () => void
  onResizing?: (resizing: boolean) => void
  label?: string
  className?: string
}) {
  const sign = grows === 'right' ? 1 : -1
  const drag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    const start = { x: e.clientX, width: value }
    handle.setPointerCapture(e.pointerId)
    onResizing?.(true)
    const move = (event: globalThis.PointerEvent) => onResize(start.width + sign * (event.clientX - start.x))
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
    const step = { ArrowLeft: -24, ArrowRight: 24 }[e.key]
    if (!step) return
    e.preventDefault()
    onResize(value + sign * step)
  }
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
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
