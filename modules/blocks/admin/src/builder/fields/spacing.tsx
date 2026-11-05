import { t, type FieldProps } from '@letterncms/sdk'
import { Popover, cn } from '@letterncms/ui'
import { useState } from 'react'
import { useDesign } from '../../core/context'

/* `blocks-spacing` — the box model, like Webflow: margin around padding around the content.
   Each side shows its space step; drag a side to walk the scale, click it to pick a step or a
   role (section, gutter). Alt changes the opposite side too, Shift all four. */

type Box = 'margin' | 'padding'
type Sides = (string | undefined)[]
export type SideStatus = 'own' | 'inherited' | 'none'

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
        <div className="relative grid grid-cols-[44px_1fr_44px] grid-rows-[24px_20px_24px] rounded-sm bg-bg shadow-[0_0_0_1px_var(--cms-border)]">
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

function SideValue({ box, index, value, status, onChange }: { box: Box; index: number; value?: string; status: SideStatus; onChange: (sides: number[], v: string | null) => void; context: FieldProps['context'] }) {
  const design = useDesign()
  const [open, setOpen] = useState(false)
  const [sides, setSides] = useState<number[]>([index])
  const [dragging, setDragging] = useState(false)
  const steps = design.names(box === 'margin' ? 'marginTop' : 'paddingTop').filter((n) => n !== 'auto' && !/^v[wh]-/.test(n) && !Object.keys(design.resolved?.spaceRoles ?? {}).includes(n))

  // A drag walks the space scale a step at a time; margins go below zero into negative steps.
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const start = { x: e.clientX, y: e.clientY }
    const ladder = box === 'margin' ? [...steps.slice(1).reverse().map((s) => `-${s}`), ...steps] : steps
    const at = Math.max(0, ladder.indexOf(value ?? '0'))
    let moved = false
    const move = (ev: PointerEvent) => {
      const delta = Math.trunc((ev.clientX - start.x - (ev.clientY - start.y)) / 12)
      if (!moved && delta === 0) return
      if (!moved) setDragging(true)
      moved = true
      document.body.style.cursor = index % 2 ? 'ew-resize' : 'ns-resize'
      onChange(reach(index, ev), ladder[Math.max(0, Math.min(ladder.length - 1, at + delta))])
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
      className="w-64 !p-2"
      trigger={
        <button
          type="button"
          onPointerDown={down}
          onClick={(e) => setSides(reach(index, e))}
          aria-label={title(box, [index])}
          title={`${title(box, [index])}\n${t('Drag to step through the space scale. Alt: opposite side too, Shift: all sides.')}`}
          className={cn(
            'mx-auto flex h-full min-w-0 max-w-full items-center justify-center rounded-xs px-1 text-xs tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus',
            index % 2 ? 'cursor-ew-resize' : 'cursor-ns-resize',
            status === 'own' ? 'font-medium text-ink' : status === 'inherited' ? 'text-text' : 'text-faint',
            (open || dragging) ? 'bg-active' : 'hover:bg-hover',
          )}
        >
          <span className="truncate">{value ?? '0'}</span>
        </button>
      }
    >
      <SideEditor box={box} sides={sides} value={value} onChange={(v) => onChange(sides, v)} close={() => setOpen(false)} />
    </Popover>
  )
}

/** The space scale, the roles (section, gutter) and, for margins, auto and negative steps. */
function SideEditor({ box, sides, value, onChange, close }: { box: Box; sides: number[]; value?: string; onChange: (v: string | null) => void; close: () => void }) {
  const design = useDesign()
  const r = design.resolved
  const roles = Object.keys(r?.spaceRoles ?? {})
  const names = design.names(box === 'margin' ? 'marginTop' : 'paddingTop').filter((n) => n !== 'auto' && !/^v[wh]-/.test(n))
  const steps = names.filter((n) => !roles.includes(n))
  const negative = value?.startsWith('-') ?? false
  const pick = (v: string | null) => {
    onChange(v)
    close()
  }
  const range = (n: string) => {
    const f = r?.space[r.spaceRoles[n] ?? n]
    return f ? (Math.round(f.min) === Math.round(f.max) ? `${Math.round(f.max)}px` : `${Math.round(f.min)}–${Math.round(f.max)}px`) : ''
  }
  const button = (n: string, label = n) => {
    const v = negative && n !== '0' && !roles.includes(n) ? `-${n}` : n
    return (
      <button key={n} type="button" title={range(n)} onClick={() => pick(v)} className={cn('h-6 min-w-8 rounded-xs px-1.5 text-2xs tabular-nums', value === v ? 'bg-focus text-white' : 'bg-sunken text-text hover:bg-hover')}>
        {label}
      </button>
    )
  }

  return (
    <div>
      <p className="m-0 mb-1.5 flex items-center justify-between text-xs font-semibold text-ink">
        {title(box, sides)}
        {value !== undefined && (
          <button type="button" onClick={() => pick(null)} className="rounded-xs px-1 text-2xs font-normal text-muted hover:bg-hover hover:text-text">
            {t('Reset')}
          </button>
        )}
      </p>
      <div className="flex flex-wrap gap-1">{steps.map((n) => button(n))}</div>
      <p className="cms-label m-0 mb-1 mt-2.5 !text-2xs">{t('Roles')}</p>
      <div className="flex flex-wrap gap-1">{roles.map((n) => button(n))}</div>
      {box === 'margin' && (
        <div className="mt-2 flex gap-1 border-t border-border pt-2">
          <button type="button" onClick={() => pick('auto')} className={cn('h-6 rounded-xs px-1.5 text-2xs', value === 'auto' ? 'bg-focus text-white' : 'bg-sunken text-text hover:bg-hover')}>
            {t('Auto')}
          </button>
          <button type="button" disabled={!value || value === 'auto' || value === '0' || roles.includes(value)} onClick={() => value && pick(negative ? value.slice(1) : `-${value}`)} aria-pressed={negative} className={cn('h-6 rounded-xs px-1.5 text-2xs disabled:opacity-40', negative ? 'bg-focus text-white' : 'bg-sunken text-text hover:bg-hover')}>
            {t('Negative')}
          </button>
        </div>
      )}
    </div>
  )
}
