import { t, type FieldProps } from '@letterncms/sdk'
import { Icon, cn } from '@letterncms/ui'
import { useDesign } from '../../core/context'
import { colorCss } from '../vocab'
import { RemoveButton, PanelFields } from '../controls'
import { splitList, splitValue } from '../css'
import { Control } from './controls'

/* Field components for values that need more than one control: gradients of the palette's
   colors, the alignment matrix and the origin grid. Every value is a name of the vocabulary. */

interface Stop {
  color: string
  at: string
}

type Gradient = { kind: 'linear' | 'radial'; head: string; stops: Stop[] }

const DIRECTIONS = ['to-t', 'to-tr', 'to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl']
const ARROWS: Record<string, string> = { 'to-t': '↑', 'to-tr': '↗', 'to-r': '→', 'to-br': '↘', 'to-b': '↓', 'to-bl': '↙', 'to-l': '←', 'to-tl': '↖' }
const AT = ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
const PERCENTS = ['', '0', '10', '20', '25', '30', '40', '50', '60', '70', '75', '80', '90', '100']

/** A gradient of the vocabulary: linear(to-br, primary, accent/50 60%) or radial(circle top, …). */
export function parseGradient(value: string | undefined | null): Gradient | null {
  const m = value?.match(/^(linear|radial)\((.*)\)$/)
  if (!m) return null
  const parts = splitList(m[2])
  const kind = m[1] as Gradient['kind']
  let head = kind === 'linear' ? 'to-b' : 'circle'
  if (parts[0] && (DIRECTIONS.includes(parts[0]) || /^\d+$/.test(parts[0]) || /^(circle|ellipse)/.test(parts[0]))) head = parts.shift()!
  const stops = parts.map((p) => {
    const bits = splitValue(p)
    return { color: bits[0], at: (bits[1] ?? '').replace('%', '') }
  })
  return { kind, head, stops }
}

export function formatGradient(g: Gradient): string {
  return `${g.kind}(${[g.head, ...g.stops.map((s) => `${s.color}${s.at ? ` ${s.at}%` : ''}`)].join(', ')})`
}

/** `blocks-gradient` — a linear or radial gradient of the palette's colors: direction, then color stops. */
export function GradientField({ value, onChange, context }: FieldProps<string | null>) {
  const design = useDesign()
  const gradient = parseGradient(value)
  if (!gradient) return null
  const set = (g: Gradient) => onChange(formatGradient(g))
  const preview = `linear-gradient(90deg, ${gradient.stops.map((s) => `${colorCss(s.color, design.resolved)}${s.at ? ` ${s.at}%` : ''}`).join(', ')})`
  const [shape, at] = gradient.head.split(' ')

  return (
    <div className="min-w-0 flex-1 space-y-1 rounded-md bg-active/60 p-1.5">
      <div className="h-6 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.1)]" style={{ background: preview }} />
      <PanelFields
        bare
        context={context}
        fields={[
          { handle: 'kind', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Kind'), required: true, options: [{ value: 'linear', label: t('Linear') }, { value: 'radial', label: t('Radial') }] },
          gradient.kind === 'linear'
            ? { handle: 'head', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Direction'), required: true, options: DIRECTIONS.map((d) => ({ value: d, label: ARROWS[d], title: d })) }
            : { handle: 'head', type: 'select', size: 'sm', label: t('From'), required: true, options: AT.map((p) => ({ value: p === 'center' ? 'circle' : `circle ${p}`, label: p })) },
        ]}
        values={{ kind: gradient.kind, head: gradient.kind === 'radial' ? (at ? `${shape} ${at}` : 'circle') : gradient.head }}
        onChange={(h, v) => set(h === 'kind' ? { ...gradient, kind: v, head: v === 'radial' ? 'circle' : 'to-b' } : { ...gradient, head: v })}
      />
      {gradient.stops.map((stop, i) => (
        <div key={i} className="flex items-center gap-1">
          <PanelFields
            bare
            className="min-w-0 flex-1"
            context={context}
            fields={[
              {
                handle: 'stop',
                type: 'group',
                component: 'blocks-group',
                label: t('Stop'),
                fields: [
                  { handle: 'color', type: 'color', component: 'blocks-color', label: t('Color') },
                  { handle: 'at', type: 'select', size: 'sm', label: t('Position'), options: PERCENTS.map((p) => ({ value: p, label: p ? `${p}%` : t('Auto') })), className: '!flex-none w-16' },
                ],
              },
            ]}
            values={{ stop }}
            onChange={(_, v) => set({ ...gradient, stops: gradient.stops.map((x, j) => (j === i ? { color: v.color ?? 'transparent', at: v.at ?? '' } : x)) })}
          />
          {gradient.stops.length > 2 && <RemoveButton onClick={() => set({ ...gradient, stops: gradient.stops.filter((_, j) => j !== i) })} />}
        </div>
      ))}
      <button type="button" onClick={() => set({ ...gradient, stops: [...gradient.stops, { color: 'foreground', at: '' }] })} className="flex h-7 w-full items-center justify-center gap-1.5 rounded-sm text-xs text-muted hover:bg-hover hover:text-ink">
        <Icon name="b-plus" size={14} /> {t('Add Stop')}
      </button>
    </div>
  )
}

const MAIN = ['start', 'center', 'end']
const DISTRIBUTE = () => [
  { value: 'start', label: t('Start') },
  { value: 'center', label: t('Center') },
  { value: 'end', label: t('End') },
  { value: 'between', label: t('Space Between') },
  { value: 'around', label: t('Space Around') },
  { value: 'evenly', label: t('Space Evenly') },
]

/**
 * `blocks-align` — a stack's alignment: a 3×3 matrix sets both axes at once, like Framer,
 * beside the distribution and cross-axis alignment. The value is `{ justifyContent, alignItems }`;
 * `row` tells which way the stack runs.
 */
export function AlignField({ field, value, onChange, context }: FieldProps<{ justifyContent?: string; alignItems?: string } | null>) {
  const row = field.row === true
  const justify = value?.justifyContent ?? undefined
  const align = value?.alignItems ?? undefined
  return (
    <Control>
      <div className="grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1">
        {[0, 1, 2].flatMap((y) =>
          [0, 1, 2].map((x) => {
            const main = MAIN[row ? x : y]
            const cross = MAIN[row ? y : x]
            const on = (justify ?? 'start') === main && (align ?? 'stretch').replace('stretch', 'start') === cross
            return (
              <button key={`${x}${y}`} type="button" onClick={() => onChange({ justifyContent: main, alignItems: cross })} className="grid place-items-center rounded-[2px] hover:bg-hover" title={`${main} · ${cross}`}>
                <span className={cn('rounded-full', on ? 'size-2 bg-ink' : 'size-1 bg-faint')} />
              </button>
            )
          }),
        )}
      </div>
      <PanelFields
        bare
        className="min-w-0 flex-1"
        context={context}
        fields={[
          { handle: 'justifyContent', type: 'select', size: 'sm', label: t('Distribute'), options: DISTRIBUTE(), placeholder: t('Distribute') },
          {
            handle: 'alignItems',
            type: 'select',
            display: 'segmented',
            block: true,
            size: 'sm',
            label: t('Align'),
            options: [
              { value: 'start', icon: row ? 'b-align-top' : 'b-align-left', title: t('Start') },
              { value: 'center', icon: row ? 'b-align-center-vertical' : 'b-align-center-horizontal', title: t('Center') },
              { value: 'end', icon: row ? 'b-align-bottom' : 'b-align-right', title: t('End') },
              { value: 'stretch', icon: row ? 'b-arrows-out-line-vertical' : 'b-arrows-out-line-horizontal', title: t('Stretch') },
              { value: 'baseline', icon: 'b-text-t', title: t('Baseline') },
            ],
          },
        ]}
        values={{ justifyContent: justify, alignItems: align }}
        onChange={(h, v) => onChange({ justifyContent: justify, alignItems: align, [h]: v })}
      />
    </Control>
  )
}

const SPOTS = [
  ['top left', 'top', 'top right'],
  ['left', 'center', 'right'],
  ['bottom left', 'bottom', 'bottom right'],
]
const PERCENT: Record<string, string> = { left: '0%', top: '0%', center: '50%', right: '100%', bottom: '100%' }

/** "top left", "50% 0%", "right" → the same "x y" in percentages, to match a spot. */
function spotKey(value: string | null | undefined): string {
  const parts = (value ?? 'center').trim().split(/\s+/)
  const vertical = (p: string) => p === 'top' || p === 'bottom'
  // One keyword: the other axis is centered. Keywords may come in either order ("top left").
  if (parts.length === 1) parts.push('center')
  const [x, y] = vertical(parts[0]) || (parts[1] && (parts[1] === 'left' || parts[1] === 'right')) ? [parts[1], parts[0]] : parts
  return `${PERCENT[x] ?? x} ${PERCENT[y] ?? y}`
}

/**
 * `blocks-origin` — a position (transform-origin, background-position, object-position):
 * a 3×3 grid of spots, or any value typed beside it ("30% 70%").
 */
export function OriginField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const current = spotKey(value)
  return (
    <Control>
      <div className="grid size-[60px] shrink-0 grid-cols-3 gap-px rounded-sm bg-bg p-1" role="radiogroup" aria-label={field.label}>
        {SPOTS.flat().map((spot) => {
          const on = current === spotKey(spot)
          return (
            <button key={spot} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => onChange(spot === 'center' && !field.required ? null : spot)} className="grid place-items-center rounded-[2px] hover:bg-hover" title={spot}>
              <span className={cn('rounded-full', on ? 'size-2 bg-ink' : 'size-1 bg-faint')} />
            </button>
          )
        })}
      </div>
      <span className="min-w-0 truncate text-xs text-muted">{value ?? t('Center')}</span>
    </Control>
  )
}
