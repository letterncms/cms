import { t, type FieldProps } from '@letterncms/sdk'
import { Button, Popover, cn, Pressable, Tooltip } from '@letterncms/ui'
import { useEffect, useRef, useState } from 'react'
import { SubField } from './controls'
import { SpacingChips, useTokenOf } from './tokens'

/* `blocks-spacing` — the box model, like Webflow: margin around padding around the content.
   Each side shows its value in pixels (marked as a row's label is when set; a named space of the theme as its name);
   drag a side to scrub, click it to type or pick a step of the scale. Alt changes the opposite side too,
   Shift all four. */

type Box = 'margin' | 'padding'
type Sides = (string | undefined)[]
export type SideStatus = 'own' | 'inherited' | 'none'

const NUMBER = /^(-?\d*\.?\d+)([a-z%]*)$/i

/** Which sides a change reaches: the one, it and its opposite (Alt), or all four (Shift). */
function reach(i: number, e: { altKey: boolean; shiftKey: boolean }): number[] {
  if (e.shiftKey) return [0, 1, 2, 3]
  if (e.altKey) return [i, (i + 2) % 4]
  return [i]
}

function title(box: Box, sides: number[]): string {
  if (sides.length === 4) return box === 'margin' ? t('Margin, All Sides') : t('Padding, All Sides')
  if (sides.length === 2) return sides.includes(0) ? (box === 'margin' ? t('Margin, Top and Bottom') : t('Padding, Top and Bottom')) : box === 'margin' ? t('Margin, Left and Right') : t('Padding, Left and Right')
  const side = { 0: t('top'), 1: t('right'), 2: t('bottom'), 3: t('left') }[sides[0]]
  return box === 'margin' ? t('Margin {side}', { side }) : t('Padding {side}', { side })
}

/**
 * The value is `{ margin, padding }`, four sides each (undefined when not set); a change
 * sends the box with its new sides. `sideStatus` (per box, per side) colors the values.
 */
export function SpacingField({ field, value, onChange, context }: FieldProps<Record<Box, Sides | string> | null>) {
  const current = value ?? { margin: [], padding: [] }
  const status = (field.sideStatus ?? {}) as Partial<Record<Box, SideStatus[]>>
  const sidesOf = (box: Box): Sides => (Array.isArray(current[box]) ? (current[box] as Sides) : [])
  const set = (box: Box, which: number[], v: string | null) => onChange({ ...current, [box]: [0, 1, 2, 3].map((j) => (which.includes(j) ? v ?? undefined : sidesOf(box)[j])) })

  const side = (box: Box, i: number) => <SideValue key={`${box}${i}`} box={box} index={i} value={sidesOf(box)[i]} status={status[box]?.[i] ?? 'none'} onChange={(which, v) => set(box, which, v)} context={context} />

  return (
    <div className="min-w-0 flex-1 select-none">
      <div className="relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_auto_24px] rounded-md bg-active/60">
        <span className="pointer-events-none absolute left-2 top-1 text-2xs text-faint">{t('Margin')}</span>
        <span />
        {side('margin', 0)}
        <span />
        {side('margin', 3)}
        <div className="relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg ring-1 ring-border">
          <span className="pointer-events-none absolute left-2 top-1 text-2xs text-faint">{t('Padding')}</span>
          <span />
          {side('padding', 0)}
          <span />
          {side('padding', 3)}
          <span className="my-1 rounded-xs bg-active" />
          {side('padding', 1)}
          <span />
          {side('padding', 2)}
          <span />
        </div>
        {side('margin', 1)}
        <span />
        {side('margin', 2)}
        <span />
      </div>
    </div>
  )
}

function SideValue({ box, index, value, status, onChange, context }: { box: Box; index: number; value?: string; status: SideStatus; onChange: (sides: number[], v: string | null) => void; context: FieldProps['context'] }) {
  const tokenOf = useTokenOf()
  const [open, setOpen] = useState(false)
  const [sides, setSides] = useState<number[]>([index])
  const [dragging, setDragging] = useState(false)
  const chosen = tokenOf(value)
  const parts = value?.match(NUMBER)
  const shown = chosen ? chosen.token.name : parts ? (parts[2] === 'px' || !parts[2] ? parts[1] : `${parts[1]}${parts[2]}`) : value ?? '0'

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const start = { x: e.clientX, y: e.clientY }
    const base = parts ? parseFloat(parts[1]) : 0
    const unit = parts?.[2] || 'px'
    const numeric = !value || !!parts
    let moved = false
    const move = (ev: PointerEvent) => {
      const delta = ev.clientX - start.x - (ev.clientY - start.y)
      if (!moved && Math.abs(delta) < 3) return
      if (!numeric) return
      if (!moved) setDragging(true)
      moved = true
      document.body.style.cursor = index % 2 ? 'ew-resize' : 'ns-resize'
      const n = Math.round(base + Math.round(delta / 2))
      onChange(reach(index, ev), `${box === 'padding' ? Math.max(0, n) : n}${unit}`)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
      setDragging(false)
      if (!moved) return
      // A drag is not a click: swallow the click that follows, so the editor stays shut.
      const swallow = (ev: MouseEvent) => {
        ev.stopPropagation()
        ev.preventDefault()
      }
      window.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="center"
      className="w-64 !p-3"
      trigger={
        <Tooltip content={<span>{title(box, [index])}{chosen ? ` · ${chosen.token.variable}` : ''}<br />{t('Drag to change. Alt: opposite side too, Shift: all sides.')}</span>}>
        <Pressable compact onPointerDown={down}
          onClick={(e) => setSides(reach(index, e))}
          aria-label={title(box, [index])}
          className={cn(
            'mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus',
            index % 2 ? 'cursor-ew-resize' : 'cursor-ns-resize',
            status === 'none' ? 'text-faint' : 'text-ink',
            (open || dragging) ? 'bg-active' : 'hover:bg-hover',
          )}
        >
          {/* Marked as a row's label is: the accent where it is set here, grey where it comes from elsewhere. */}
          <span className={cn('truncate', status !== 'none' && 'rounded-xs px-1 leading-4', status === 'own' ? 'bg-focus-soft' : status === 'inherited' && 'bg-active')}>{shown}</span>
        </Pressable>
        </Tooltip>
      }
    >
      <SideEditor box={box} sides={sides} value={value} onChange={(v) => onChange(sides, v)} close={() => setOpen(false)} context={context} />
    </Popover>
  )
}

/** Type a value, or pick a step of the spacing scale or one of the theme's named spaces. */
function SideEditor({ box, sides, value, onChange, close, context }: { box: Box; sides: number[]; value?: string; onChange: (v: string | null) => void; close: () => void; context: FieldProps['context'] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const input = ref.current?.querySelector('input')
    input?.focus()
  }, [])
  const pick = (v: string | null) => {
    onChange(v)
    close()
  }

  return (
    <div
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Enter') requestAnimationFrame(close)
      }}
    >
      <div className="mb-2 flex h-6 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs font-semibold text-ink">{title(box, sides)}</span>
        {value !== undefined && <Button variant="ghost" size="xs" onClick={() => pick(null)} className="shrink-0 !px-1.5 !font-normal !text-muted hover:!text-ink">{t('Reset')}</Button>}
      </div>
      <SubField
        field={{ handle: `${box}-${sides.join('')}`, type: 'text', component: 'blocks-value', label: title(box, sides), placeholder: '0', keywords: box === 'margin' ? ['auto'] : [], min: box === 'padding' ? 0 : undefined }}
        value={value ?? null}
        onChange={(v) => onChange(v as string | null)}
        context={context}
      />
      <div className="mt-3">
        <SpacingChips value={value} onPick={pick} auto={box === 'margin'} />
      </div>
    </div>
  )
}
