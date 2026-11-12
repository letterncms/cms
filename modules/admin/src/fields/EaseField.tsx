import { t, type FieldProps } from '@letterncms/sdk'
import { Pressable } from '../ui/Pressable'
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '../ui/cn'
import { fieldControlId } from '../ui/fieldIdentity'
import { Icon } from '../ui/Icon'
import { Popover } from '../ui/Popover'
import { fieldOptions } from './basic'

type Bezier = [number, number, number, number]

/** The curves of named eases: CSS keywords, and the GSAP eases animations use (approximated, for drawing). */
const NAMED: Record<string, Bezier> = {
  linear: [0, 0, 1, 1], none: [0, 0, 1, 1], ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1],
  'power1.out': [0.25, 0.46, 0.45, 0.94], 'power2.out': [0.215, 0.61, 0.355, 1], 'power3.out': [0.165, 0.84, 0.44, 1], 'power4.out': [0.23, 1, 0.32, 1],
  'power1.in': [0.55, 0.085, 0.68, 0.53], 'power2.in': [0.55, 0.055, 0.675, 0.19], 'power3.in': [0.895, 0.03, 0.685, 0.22], 'power4.in': [0.755, 0.05, 0.855, 0.06],
  'power1.inOut': [0.455, 0.03, 0.515, 0.955], 'power2.inOut': [0.645, 0.045, 0.355, 1], 'power3.inOut': [0.77, 0, 0.175, 1], 'power4.inOut': [0.86, 0, 0.07, 1],
  'expo.out': [0.19, 1, 0.22, 1], 'expo.in': [0.95, 0.05, 0.795, 0.035], 'expo.inOut': [1, 0, 0, 1], 'circ.out': [0.075, 0.82, 0.165, 1], 'circ.inOut': [0.785, 0.135, 0.15, 0.86],
  'sine.out': [0.39, 0.575, 0.565, 1], 'sine.inOut': [0.445, 0.05, 0.55, 0.95], 'back.out': [0.175, 0.885, 0.32, 1.275], 'back.inOut': [0.68, -0.55, 0.265, 1.55], 'back.in': [0.6, -0.28, 0.735, 0.045],
  'elastic.out': [0.2, 1.6, 0.4, 0.9], 'bounce.out': [0.3, 1.3, 0.5, 1],
}

/** The curve of an easing value: `cubic-bezier(…)`, a CSS keyword or a GSAP ease (`back.out(1.7)` draws as `back.out`); null when it is none of those. */
function bezier(value: string | null | undefined): Bezier | null {
  const v = String(value ?? '').trim()
  const m = v.match(/^cubic-bezier\(([^)]+)\)$/)
  const n = m?.[1].split(',').map(Number)
  if (n) return n.length === 4 && n.every((x) => !Number.isNaN(x)) ? (n as Bezier) : null
  return NAMED[v.replace(/\(.*\)$/, '')] ?? null
}

const round = (n: number) => Math.round(n * 100) / 100
const format = ([x1, y1, x2, y2]: Bezier) => `cubic-bezier(${round(x1)}, ${round(y1)}, ${round(x2)}, ${round(y2)})`
const same = (a: string | null | undefined, b: string) => String(a ?? '').replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim()

/** The curve of an easing value, drawn in a box `size` wide (overshoot stays visible). */
function EaseCurve({ curve, size, className }: { curve: Bezier; size: number; className?: string }) {
  const [x1, y1, x2, y2] = curve
  const pad = size / 8
  const p = (x: number, y: number) => `${pad + x * (size - 2 * pad)},${size - pad - y * (size - 2 * pad)}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn('shrink-0 overflow-visible rounded-xs bg-sunken', className)} aria-hidden>
      <path d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  )
}

const cssEases = (): { value: string; label: string }[] => [
  { value: 'cubic-bezier(0.2, 0.8, 0.2, 1)', label: t('Ease Out') },
  { value: 'cubic-bezier(0.65, 0, 0.35, 1)', label: t('Ease In-Out') },
  { value: 'cubic-bezier(0.55, 0, 1, 0.45)', label: t('Ease In') },
  { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: t('Overshoot') },
  { value: 'linear', label: t('Linear') },
]

/**
 * `ease` — an easing curve: named curves to pick from (`options`, as a select takes them; an
 * option's `curve` draws a value that is not a curve itself, such as a design token), each drawn,
 * and a curve editor for a custom cubic-bezier (drag the two handles). Without options it offers
 * CSS curves. While nothing is chosen, `placeholder` names what applies, drawn as the first option.
 */
export function EaseField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const [open, setOpen] = useState(false)
  const listed: { value: string; label: string; curve?: string }[] = field.options ? (fieldOptions(field) as { value: string; label: string; curve?: string }[]) : cssEases()
  const curveOf = (v: string | null | undefined) => bezier(listed.find((o) => same(v, o.value))?.curve ?? v)
  const current = value || null
  const named = current ? listed.find((o) => same(current, o.value)) : undefined
  const shown = curveOf(current ?? listed[0]?.value) ?? NAMED.ease
  const label = named?.label ?? (current ? t('Custom') : (field.placeholder as string | undefined) ?? t('Default'))

  return (
    <Popover
      open={open}
      onOpenChange={(o) => !disabled && setOpen(o)}
      align="end"
      className="w-[248px] !p-0"
      trigger={
        <Pressable
          id={fieldControlId(field)}
          disabled={disabled}
          aria-label={field.label}
          aria-describedby={field.describedBy}
          className="cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-0.5 pr-2 text-left text-xs disabled:opacity-50"
        >
          <EaseCurve curve={shown} size={20} className="text-focus" />
          <span className={cn('min-w-0 flex-1 truncate', !current && 'text-muted')}>{label}</span>
          <Icon name="chevron-down" size={12} className="shrink-0 text-faint" />
        </Pressable>
      }
    >
      <div className="grid grid-cols-3 gap-1 p-1.5">
        {listed.map((option) => {
          const chosen = same(current, option.value)
          return (
            <Pressable
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn('flex flex-col items-center gap-1 rounded-xs px-1 pb-1 pt-1.5 text-2xs leading-tight hover:bg-hover', chosen ? 'bg-focus-soft text-ink' : 'text-muted')}
            >
              <EaseCurve curve={curveOf(option.value) ?? NAMED.ease} size={36} className={chosen ? 'text-focus' : 'text-text'} />
              <span className="w-full truncate text-center">{option.label}</span>
            </Pressable>
          )
        })}
      </div>
      <div className="border-t border-border p-2">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-muted">{t('Custom Curve')}</span>
          <span className="font-mono text-2xs text-faint">{format(shown).replace('cubic-bezier', '')}</span>
        </div>
        <CurveEditor curve={shown} onChange={onChange} />
      </div>
    </Popover>
  )
}

/** A cubic-bezier with two draggable handles; overshoot (y outside 0–1) is allowed. It changes the value when a handle is let go. */
function CurveEditor({ curve, onChange }: { curve: Bezier; onChange: (value: string) => void }) {
  const [points, setPoints] = useState<Bezier | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null)
  const [x1, y1, x2, y2] = points ?? curve
  const W = 232
  const H = 140
  const pad = 26
  const px = (x: number) => 8 + x * (W - 16)
  const py = (y: number) => H - pad - y * (H - pad * 2)

  const move = (e: ReactPointerEvent) => {
    if (drag.current === null || !svg.current) return
    const r = svg.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - r.left - 8) / (W - 16)))
    const y = Math.min(1.6, Math.max(-0.6, (H - pad - (e.clientY - r.top)) / (H - pad * 2)))
    const next: Bezier = [x1, y1, x2, y2]
    next[drag.current * 2] = round(x)
    next[drag.current * 2 + 1] = round(y)
    setPoints(next)
  }
  const end = () => {
    if (drag.current !== null && points) onChange(format(points))
    drag.current = null
    setPoints(null)
  }
  const handle = (i: 0 | 1, x: number, y: number) => (
    <g>
      <line x1={px(i)} y1={py(i)} x2={px(x)} y2={py(y)} stroke="currentColor" className="text-faint" strokeWidth="1" />
      <circle
        cx={px(x)}
        cy={py(y)}
        r={5}
        className="cursor-grab fill-bg stroke-focus active:cursor-grabbing"
        strokeWidth="1.5"
        onPointerDown={(e) => {
          drag.current = i
          ;(e.target as Element).setPointerCapture(e.pointerId)
        }}
      />
    </g>
  )

  return (
    <svg ref={svg} width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block touch-none select-none rounded-xs bg-sunken" onPointerMove={move} onPointerUp={end} onPointerCancel={end} role="img" aria-label={t('Custom Curve')}>
      <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} className="stroke-border-strong" strokeWidth="1" />
      <line x1={px(0)} y1={py(1)} x2={px(1)} y2={py(1)} className="stroke-border-strong" strokeWidth="1" strokeDasharray="2 3" />
      <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} className="stroke-border" strokeWidth="1" />
      <path d={`M${px(0)},${py(0)} C${px(x1)},${py(y1)} ${px(x2)},${py(y2)} ${px(1)},${py(1)}`} fill="none" className="stroke-text" strokeWidth="2" strokeLinecap="round" />
      {handle(0, x1, y1)}
      {handle(1, x2, y2)}
    </svg>
  )
}
