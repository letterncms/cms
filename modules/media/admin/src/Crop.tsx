import { run, t } from '@letterncms/sdk'
import { Dialog, Segmented, toast } from '@letterncms/ui'
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { MediaItem } from './upload'

interface Box { x: number; y: number; w: number; h: number }
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
/** The least a side can be, in percent of the picture. */
const MIN = 4

type Shape = 'free' | 'original' | '1:1' | '4:3' | '16:9'

/**
 * Cut a picture to a rectangle: drag a corner or an edge, drag the rectangle, or move a handle with the arrow
 * keys (Shift for bigger steps). A shape (Original, 1:1, 4:3, 16:9) holds the rectangle to it; Free lets every
 * side go its own way. The rectangle is kept in percent of the picture and sent in its pixels, as the picture
 * stands: a photo its metadata turns upright is measured upright.
 */
export function CropDialog({ item, src, onClose }: { item: MediaItem; src: string; onClose: (cropped?: MediaItem) => void }) {
  const [box, setBox] = useState<Box>({ x: 0, y: 0, w: 100, h: 100 })
  const [busy, setBusy] = useState(false)
  const [shape, setShape] = useState<Shape>('free')
  // The picture's size as it stands: the browser shows a photo upright, whatever way it lies in the file.
  const [turned, setTurned] = useState(false)
  const [W, H] = turned ? [item.height ?? 1, item.width ?? 1] : [item.width ?? 1, item.height ?? 1]
  // Width over height of the rectangle in percent, for a shape in pixels: null lets the sides go free.
  const ratio = shape === 'free' ? null : (shape === 'original' ? 1 : shape === '1:1' ? H / W : shape === '4:3' ? (4 / 3) * (H / W) : (16 / 9) * (H / W))
  // The largest rectangle of a shape, in the middle of the picture.
  const choose = (next: Shape) => {
    setShape(next)
    const r = next === 'free' ? null : (next === 'original' ? 1 : next === '1:1' ? H / W : next === '4:3' ? (4 / 3) * (H / W) : (16 / 9) * (H / W))
    if (r === null) return
    const w = Math.min(100, 100 * r)
    const h = w / r
    setBox({ x: (100 - w) / 2, y: (100 - h) / 2, w, h })
  }
  const frame = useRef<HTMLDivElement>(null)
  const grip = useRef({ x: 0, y: 0 })
  const corners = [
    { id: 'tl', label: t('Top Left Corner'), left: true, top: true },
    { id: 'tr', label: t('Top Right Corner'), left: false, top: true },
    { id: 'bl', label: t('Bottom Left Corner'), left: true, top: false },
    { id: 'br', label: t('Bottom Right Corner'), left: false, top: false },
  ]
  // An edge moves one side; a shape holds both sides together, so edges are for Free.
  const edges = [
    { id: 't', label: t('Top Edge'), side: 'top' as const },
    { id: 'r', label: t('Right Edge'), side: 'right' as const },
    { id: 'b', label: t('Bottom Edge'), side: 'bottom' as const },
    { id: 'l', label: t('Left Edge'), side: 'left' as const },
  ]
  const moveEdge = (side: 'top' | 'right' | 'bottom' | 'left', to: (from: number) => number) => setBox((b) => {
    let [x1, y1, x2, y2] = [b.x, b.y, b.x + b.w, b.y + b.h]
    if (side === 'left') x1 = clamp(to(x1), 0, x2 - MIN)
    if (side === 'right') x2 = clamp(to(x2), x1 + MIN, 100)
    if (side === 'top') y1 = clamp(to(y1), 0, y2 - MIN)
    if (side === 'bottom') y2 = clamp(to(y2), y1 + MIN, 100)
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
  })
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
    if (ratio === null) return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
    // Held to a shape: the width leads, the height follows, and both give way where the picture ends. The corner across stays put.
    const room = { w: corner.left ? b.x + b.w : 100 - b.x, h: corner.top ? b.y + b.h : 100 - b.y }
    const w = Math.max(MIN, Math.min(x2 - x1, room.w, room.h * ratio))
    const h = w / ratio
    return { x: corner.left ? b.x + b.w - w : b.x, y: corner.top ? b.y + b.h - h : b.y, w, h }
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
    const [w, h] = [W, H]
    setBusy(true)
    try {
      onClose(await run<MediaItem>('media/transform', { id: item.id, crop: { x: Math.round((box.x / 100) * w), y: Math.round((box.y / 100) * h), width: Math.max(1, Math.round((box.w / 100) * w)), height: Math.max(1, Math.round((box.h / 100) * h)) } }))
    } catch (error) {
      toast.error(error)
      setBusy(false)
    }
  }

  const shade = 'pointer-events-none absolute bg-black/55'
  // Plain to see on any picture: a white square with a dark edge.
  const handle = "absolute size-3 -translate-x-1/2 -translate-y-1/2 border border-black/80 bg-white after:absolute after:-inset-4 after:content-['']"
  return (
    <Dialog open onOpenChange={(next) => !next && onClose()} title={t('Crop Image')} onSubmit={() => void crop()} submitLabel={t('Crop')} submitDisabled={box.w > 99.9 && box.h > 99.9} busy={busy}>
      <Segmented className="mb-3 max-sm:w-full" block value={shape} onChange={choose} aria-label={t('Shape')} options={[{ value: 'free', label: t('Freeform') }, { value: 'original', label: t('Original') }, { value: '1:1', label: '1:1' }, { value: '4:3', label: '4:3' }, { value: '16:9', label: '16:9' }]} />
      {/* Not clipped: a handle on the picture's edge shows whole. */}
      <div ref={frame} className="relative mx-auto my-2 w-fit max-w-full touch-none select-none bg-sunken">
        <img src={src} alt="" draggable={false} className="block max-h-[44vh] max-w-full" onLoad={(e) => setTurned(!!item.width && !!item.height && item.width !== item.height && (e.currentTarget.naturalWidth > e.currentTarget.naturalHeight) !== (item.width > item.height))} />
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
              className={handle}
              style={{ left: corner.left ? 0 : '100%', top: corner.top ? 0 : '100%', cursor: corner.left === corner.top ? 'nwse-resize' : 'nesw-resize' }}
            />
          ))}
          {ratio === null && edges.map((edge) => {
            const across = edge.side === 'left' || edge.side === 'right'
            const now = Math.round(edge.side === 'left' ? box.x : edge.side === 'right' ? box.x + box.w : edge.side === 'top' ? box.y : box.y + box.h)
            return (
              <span
                key={edge.id}
                role="slider"
                tabIndex={0}
                aria-label={edge.label}
                aria-orientation={across ? 'horizontal' : 'vertical'}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={now}
                onKeyDown={(e) => {
                  const step = (e.shiftKey ? 10 : 1) * ((across ? e.key === 'ArrowRight' : e.key === 'ArrowDown') ? 1 : (across ? e.key === 'ArrowLeft' : e.key === 'ArrowUp') ? -1 : 0)
                  if (step === 0) return
                  e.preventDefault()
                  moveEdge(edge.side, (from) => from + step)
                }}
                onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId) }}
                onPointerMove={(e) => { if (held(e)) { e.stopPropagation(); const to = point(e); moveEdge(edge.side, () => (across ? to.x : to.y)) } }}
                className={handle}
                style={{ left: edge.side === 'left' ? 0 : edge.side === 'right' ? '100%' : '50%', top: edge.side === 'top' ? 0 : edge.side === 'bottom' ? '100%' : '50%', cursor: across ? 'ew-resize' : 'ns-resize' }}
              />
            )
          })}
        </div>
      </div>
    </Dialog>
  )
}
