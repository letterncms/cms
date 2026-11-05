import { t, type FieldProps } from '@letterncms/sdk'
import { Icon, Popover, cn, fieldControlId } from '@letterncms/ui'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { useDesign } from '../../core/context'
import { EaseCurve } from '../motion/EaseCurve'
import { colorCss, groups, hint } from '../vocab'

/* `blocks-token` — a value of the design vocabulary, and nothing else. The control shows
   the name and what it is here (24–30px, 1.45, 280ms); its menu lists every name the
   property takes, in scale order, with a preview. ↑/↓ step through the scale, so do drags
   sideways, Backspace clears. Field options: property (the style property whose names it
   takes; the handle by default), prefixIcon, placeholder, negative (offer −steps). */

/** The steps a drag moves by: one per this many pixels. */
const DRAG = 14

export function TokenField({ field, value, onChange }: FieldProps) {
  const design = useDesign()
  const property = (field.property as string | undefined) ?? field.handle
  const def = design.property(property)
  const names = design.names(property)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const drag = useRef<{ x: number; index: number; moved: boolean } | null>(null)
  const current = typeof value === 'string' && value !== '' ? value : null
  const negative = !!current?.startsWith('-') && !!def?.negative
  const bare = negative ? current!.slice(1) : current
  const steps = names.filter((n) => !(def?.keywords ?? []).includes(n))
  const kind = def?.kind ?? 'keyword'
  const placeholder = (field.placeholder as string | undefined) ?? t('Inherit')

  if (!def) return <span className="text-xs text-faint">{t('Not in the design vocabulary')}</span>

  const pick = (name: string | null) => {
    onChange(name === null ? null : negative && steps.includes(name) && name !== '0' ? `-${name}` : name)
    setOpen(false)
    setFilter('')
  }

  const step = (by: number) => {
    const at = bare ? steps.indexOf(bare) : -1
    const next = steps[Math.max(0, Math.min(steps.length - 1, (at < 0 ? Math.floor(steps.length / 2) - 1 : at) + by))]
    if (next) onChange(negative && next !== '0' ? `-${next}` : next)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); step(e.shiftKey ? 3 : 1) }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); step(e.shiftKey ? -3 : -1) }
    else if ((e.key === 'Backspace' || e.key === 'Delete') && current) { e.preventDefault(); onChange(null) }
  }

  // Dragging sideways walks the scale, a step at a time: the feel of scrubbing, only ever landing on a name.
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !steps.length) return
    drag.current = { x: e.clientX, index: bare ? steps.indexOf(bare) : -1, moved: false }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    if (!d) return
    const delta = Math.trunc((e.clientX - d.x) / DRAG)
    if (delta === 0 && !d.moved) return
    if (!d.moved) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    d.moved = true
    const from = d.index < 0 ? Math.floor(steps.length / 2) - 1 : d.index
    const next = steps[Math.max(0, Math.min(steps.length - 1, from + delta))]
    if (next && next !== bare) onChange(negative && next !== '0' ? `-${next}` : next)
  }
  const onPointerUp = (e: PointerEvent) => {
    if (drag.current?.moved) {
      e.preventDefault()
      setTimeout(() => setOpen(false))
    }
    drag.current = null
  }

  const visible = filter ? names.filter((n) => n.includes(filter.toLowerCase())) : names
  const sections = groups(kind, visible, def.keywords ?? [])

  return (
    <div className="group/value flex min-w-0 flex-1 items-center gap-1">
      <Popover
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) setFilter('') }}
        className="w-64 !p-1"
        trigger={
          <button
            type="button"
            id={fieldControlId(field)}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={cn('flex h-7 min-w-0 flex-1 cursor-ew-resize items-center gap-1.5 rounded-sm bg-active/60 px-2 text-left text-xs hover:bg-active focus-visible:outline-2 focus-visible:outline-focus', !current && 'text-faint')}
            title={t('Click to pick, drag sideways or use the arrow keys to step')}
          >
            {!!field.prefixIcon && <Icon name={field.prefixIcon as string} size={12} className="shrink-0 text-faint" />}
            {current && <Preview kind={kind} name={bare!} />}
            <span className={cn('min-w-0 truncate', current && 'font-medium text-ink')}>{current ?? placeholder}</span>
            {current && <span className="ml-auto shrink-0 truncate text-2xs text-faint">{hint(kind, bare!, design.resolved)}</span>}
          </button>
        }
      >
        {names.length > 12 && (
          <input
            autoFocus
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && visible[0]) pick(visible[0]) }}
            placeholder={t('Filter')}
            className="mb-1 h-7 w-full rounded-xs bg-active/60 px-2 text-xs outline-none placeholder:text-faint"
          />
        )}
        <div className="max-h-80 overflow-y-auto" role="listbox" aria-label={field.label as string}>
          {sections.map((section) => (
            <div key={section.label}>
              {sections.length > 1 && <p className="m-0 px-2 pb-0.5 pt-1.5 text-2xs font-medium text-faint">{section.label}</p>}
              {section.names.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={bare === name}
                  onClick={() => pick(name)}
                  className={cn('flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs text-text hover:bg-hover', bare === name && 'bg-active text-ink')}
                >
                  <Preview kind={kind} name={name} />
                  <span className="min-w-0 truncate">{name}</span>
                  <span className="ml-auto max-w-[50%] shrink-0 truncate text-2xs text-faint">{hint(kind, name, design.resolved)}</span>
                  {bare === name && <Icon name="b-check" size={12} className="shrink-0 text-focus" />}
                </button>
              ))}
            </div>
          ))}
          {!visible.length && <p className="m-0 px-2 py-2 text-xs text-faint">{t('No name matches.')}</p>}
        </div>
        {current && (
          <button type="button" onClick={() => pick(null)} className="mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text">
            <Icon name="b-x" size={12} />
            {t('Clear')}
          </button>
        )}
      </Popover>
      {def.negative && (
        <button
          type="button"
          onClick={() => current && current !== '0' && onChange(negative ? bare : `-${bare}`)}
          disabled={!current || current === '0' || !steps.includes(bare!)}
          aria-pressed={negative}
          title={t('Negative')}
          className={cn('grid size-7 shrink-0 place-items-center rounded-sm text-xs text-faint hover:bg-hover hover:text-ink disabled:opacity-30', negative && 'bg-active text-ink')}
        >
          −
        </button>
      )}
    </div>
  )
}

/** A small picture of a name: a bar for space, a corner for radius, a swatch for color. */
function Preview({ kind, name }: { kind: string; name: string }) {
  const design = useDesign()
  const r = design.resolved
  if (!r) return null
  const box = 'size-3.5 shrink-0'
  if (kind === 'color') return <span className={cn(box, 'rounded-full ring-1 ring-border')} style={{ background: colorCss(name, r) }} />
  if (kind === 'radius') return <span className={cn(box, 'border-l-[1.5px] border-t-[1.5px] border-muted')} style={{ borderTopLeftRadius: r.radii[name] === '9999px' ? '7px' : r.radii[name] }} />
  if (kind === 'ease') return <EaseCurve value={name} size={16} className="shrink-0 rounded-[3px] bg-sunken text-focus" />
  if (kind === 'shadow') return <span className={cn(box, 'rounded-[3px] bg-bg')} style={{ boxShadow: name === 'none' ? undefined : SHADOW[name] }} />
  if (['space', 'inset', 'translate', 'size'].includes(kind)) {
    const f = r.space[r.spaceRoles[name] ?? name]
    if (!f) return null
    return <span className="flex w-4 shrink-0 items-center"><span className="h-1.5 rounded-full bg-muted" style={{ width: `${Math.max(2, Math.min(16, f.max / 8))}px` } as CSSProperties} /></span>
  }
  return null
}

const SHADOW: Record<string, string> = {
  xs: '0 1px 1px rgb(0 0 0/.2)', sm: '0 1px 2px rgb(0 0 0/.25)', md: '0 2px 4px rgb(0 0 0/.25)', lg: '0 3px 6px rgb(0 0 0/.3)', xl: '0 4px 8px rgb(0 0 0/.3)', '2xl': '0 6px 10px rgb(0 0 0/.35)', inner: 'inset 0 1px 2px rgb(0 0 0/.3)',
}
