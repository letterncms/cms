import { run, t } from '@letterncms/sdk'
import { Dialog, toast } from '@letterncms/ui'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { MediaItem } from './upload'

interface Box { x: number; y: number; w: number; h: number }
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
/** The least a side can be, in percent of the picture. */
const MIN = 4

/**
 * Cut a picture to a rectangle: drag a corner, drag the rectangle, or move a corner with the arrow keys
 * (Shift for bigger steps). The rectangle is kept in percent of the picture and sent in its pixels.
 */
export function CropDialog({ item, src, onClose }: { item: MediaItem; src: string; onClose: (cropped?: MediaItem) => void }) {
  const [box, setBox] = useState<Box>({ x: 0, y: 0, w: 100, h: 100 })
  const [busy, setBusy] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const grip = useRef({ x: 0, y: 0 })
  const corners = [
    { id: 'tl', label: t('Top Left Corner'), left: true, top: true },
    { id: 'tr', label: t('Top Right Corner'), left: false, top: true },
    { id: 'bl', label: t('Bottom Left Corner'), left: true, top: false },
    { id: 'br', label: t('Bottom Right Corner'), left: false, top: false },
  ]
  const point = (e: { clientX: number; clientY: number }) => {
    const r = frame.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
  }
  const at = (corner: { left: boolean; top: boolean }, b = box) => ({ x: corner.left ? b.x : b.x + b.w, y: corner.top ? b.y : b.y + b.h })
  // Where a corner goes is worked out from the rectangle as it is then, so quick keys add up.
  const moveCorner = (corner: { left: boolean; top: boolean }, to: (from: { x: number; y: number }) => { x: number; y: number }) => setBox((b) => {
    const goal = to(at(corner, b))
    let [x1, y1, x2, y2] = [b.x, b.y, b.x + b.w, b.y + b.h]
    if (corner.left) x1 = clamp(goal.x, 0, x2 - MIN); else x2 = clamp(goal.x, x1 + MIN, 100)
    if (corner.top) y1 = clamp(goal.y, 0, y2 - MIN); else y2 = clamp(goal.y, y1 + MIN, 100)
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
  })
  const keys = (corner: { left: boolean; top: boolean }) => (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    const by: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const [dx, dy] = by[e.key] ?? []
    if (dx === undefined) return
    e.preventDefault()
    moveCorner(corner, (from) => ({ x: from.x + dx, y: from.y + dy }))
  }
  const held = (e: PointerEvent<HTMLElement>) => e.currentTarget.hasPointerCapture(e.pointerId)

  const crop = async () => {
    const [w, h] = [item.width ?? 0, item.height ?? 0]
    setBusy(true)
    try {
      onClose(await run<MediaItem>('media/transform', { id: item.id, crop: { x: Math.round((box.x / 100) * w), y: Math.round((box.y / 100) * h), width: Math.max(1, Math.round((box.w / 100) * w)), height: Math.max(1, Math.round((box.h / 100) * h)) } }))
    } catch (error) {
      toast.error(error)
      setBusy(false)
    }
  }

  const shade = 'pointer-events-none absolute bg-black/55'
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()} size="lg" title={t('Crop Image')} onSubmit={() => void crop()} submitLabel={t('Crop')} submitDisabled={box.w === 100 && box.h === 100} busy={busy}>
      {/* Not clipped: a corner on the picture's edge shows whole. */}
      <div ref={frame} className="relative mx-auto my-2 w-fit max-w-full touch-none select-none bg-sunken">
        <img src={src} alt="" draggable={false} className="block max-h-[52vh] max-w-full" />
        {/* What is cut away, dimmed: above, below, left and right of the rectangle. */}
        <div className={`${shade} inset-x-0 top-0`} style={{ height: `${box.y}%` }} />
        <div className={`${shade} inset-x-0 bottom-0`} style={{ top: `${box.y + box.h}%` }} />
        <div className={`${shade} left-0`} style={{ top: `${box.y}%`, height: `${box.h}%`, width: `${box.x}%` }} />
        <div className={`${shade} right-0`} style={{ top: `${box.y}%`, height: `${box.h}%`, left: `${box.x + box.w}%` }} />
        <div
          className="absolute cursor-move border border-white ring-1 ring-black/50"
          style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
          onPointerDown={(e) => { const p = point(e); grip.current = { x: p.x - box.x, y: p.y - box.y }; e.currentTarget.setPointerCapture(e.pointerId) }}
          onPointerMove={(e) => { if (!held(e)) return; const p = point(e); setBox((b) => ({ ...b, x: clamp(p.x - grip.current.x, 0, 100 - b.w), y: clamp(p.y - grip.current.y, 0, 100 - b.h) })) }}
        >
          {corners.map((corner) => (
            <span
              key={corner.id}
              role="slider"
              tabIndex={0}
              aria-label={corner.label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(at(corner).x)}
              aria-valuetext={t('{x}% from the left, {y}% from the top', { x: Math.round(at(corner).x), y: Math.round(at(corner).y) })}
              onKeyDown={keys(corner)}
              onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId) }}
              onPointerMove={(e) => { if (held(e)) { e.stopPropagation(); const to = point(e); moveCorner(corner, () => to) } }}
              className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/25 ring-1 ring-black/50 after:absolute after:-inset-3.5 after:content-['']"
              style={{ left: corner.left ? 0 : '100%', top: corner.top ? 0 : '100%', cursor: corner.left === corner.top ? 'nwse-resize' : 'nesw-resize' }}
            />
          ))}
        </div>
      </div>
    </Dialog>
  )
}
