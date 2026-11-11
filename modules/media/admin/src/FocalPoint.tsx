import { t } from '@letterncms/sdk'
import { cn } from '@letterncms/ui'
import { useRef, type KeyboardEvent, type PointerEvent } from 'react'

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

/**
 * The point of a picture that crops keep in view: click or tap the picture, drag the marker, or move it with
 * the arrow keys (Shift for bigger steps). The marker is the control: it takes the focus and says where it is.
 */
export function FocalPoint({ src, value, onChange, disabled }: { src: string; value: { x: number; y: number }; onChange: (focal: { x: number; y: number }) => void; disabled?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const at = (e: { clientX: number; clientY: number }) => {
    const r = box.current!.getBoundingClientRect()
    onChange({ x: clamp(((e.clientX - r.left) / r.width) * 100), y: clamp(((e.clientY - r.top) / r.height) * 100) })
  }
  const keys = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    const by: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (e.key === 'Home') onChange({ x: 50, y: 50 })
    else if (by[e.key]) onChange({ x: clamp(value.x + by[e.key][0]), y: clamp(value.y + by[e.key][1]) })
    else return
    e.preventDefault()
  }
  const drag = (e: PointerEvent<HTMLSpanElement>) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) at(e) }
  return (
    <div ref={box} className={cn('relative mx-auto w-fit max-w-full select-none overflow-hidden rounded-md bg-sunken', !disabled && 'cursor-crosshair')} onClick={(e) => !disabled && at(e)}>
      <img src={src} alt="" draggable={false} className="block max-h-[44vh] max-w-full" />
      <span
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={t('Focal Point')}
        aria-disabled={disabled || undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value.x}
        aria-valuetext={t('{x}% from the left, {y}% from the top', { x: value.x, y: value.y })}
        onKeyDown={disabled ? undefined : keys}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => { if (!disabled) e.currentTarget.setPointerCapture(e.pointerId) }}
        onPointerMove={drag}
        // Over any picture, light or dark: a dark ring with a white ring inside it, and the focus line when the keys have it.
        className={cn('absolute size-7 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-black/80 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-white before:content-[\'\'] after:absolute after:-inset-2 after:content-[\'\']', !disabled && 'cursor-grab active:cursor-grabbing')}
        style={{ left: `${value.x}%`, top: `${value.y}%` }}
      />
    </div>
  )
}
