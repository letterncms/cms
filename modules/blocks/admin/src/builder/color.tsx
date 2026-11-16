import { t, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Icon, Popover, Pressable, Segmented, cn, NEW_COLOR } from '@letterncms/ui'
import { useEffect, useMemo, useState } from 'react'
import type { ThemeToken } from '../../../tailwind/engine'
import { useThemeTokens } from '../core/styling'
import { Swatch, inputClass } from './controls'
import { Control, useInvalid } from './fields/controls'
import { TokenChip, useTokenOf } from './fields/tokens'
import { PaletteGrid } from './palette'
import { colorGroups, lightDark } from './styleApi'

/* Colour values: a colour of the theme (`var(--color-primary)`, or mixed with an opacity as Tailwind writes
   bg-primary/50), hex, rgb() or any CSS colour. */

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export function parseColor(input: string | undefined): Rgba | null {
  if (!input) return null
  const v = input.trim()
  let m = v.match(/^#([0-9a-f]{3,8})$/i)
  if (m) {
    let h = m[1]
    if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('')
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 }
  }
  m = v.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i)
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? (m[4].endsWith('%') ? parseFloat(m[4]) / 100 : +m[4]) : 1 }
  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  if (v === 'white') return { r: 255, g: 255, b: 255, a: 1 }
  if (v === 'black') return { r: 0, g: 0, b: 0, a: 1 }
  return drawn(v)
}

let canvas: CanvasRenderingContext2D | null | undefined
/** Any other colour the browser can draw (oklch(), a name, hsl()): drawn on one pixel and read back. */
function drawn(value: string): Rgba | null {
  if (typeof document === 'undefined' || typeof CSS === 'undefined' || !CSS.supports('color', value) || /var\(|light-dark\(/.test(value)) return null
  canvas ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!canvas) return null
  canvas.clearRect(0, 0, 1, 1)
  canvas.fillStyle = 'black'
  canvas.fillStyle = value
  canvas.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data
  return { r, g, b, a: Math.round((a / 255) * 100) / 100 }
}

export function formatColor({ r, g, b, a }: Rgba): string {
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return a >= 1 ? `#${hex(r)}${hex(g)}${hex(b)}` : `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${Math.round(a * 100)}%)`
}

function toHsv({ r, g, b }: Rgba) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max }
}

function fromHsv(h: number, s: number, v: number, a: number): Rgba {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255
  }
  return { r: f(5), g: f(3), b: f(1), a }
}

/** A theme colour at an opacity, as Tailwind mixes it: what `bg-primary/50` declares. */
export function withAlpha(variable: string, percent: number): string {
  return percent >= 100 ? `var(${variable})` : `color-mix(in oklab, var(${variable}) ${Math.round(percent)}%, transparent)`
}

/** Whether the browser can draw this colour (a theme colour is one: the stylesheet defines it). */
export function validColor(value: string): boolean {
  return typeof CSS !== 'undefined' && CSS.supports('color', value)
}

/** What a colour value looks like, the theme's variables worked out (the canvas has them, the admin doesn't). */
export function useColorPreview() {
  const tokens = useThemeTokens()
  return (value: string | undefined): string => (value ? tokens.resolve(value) : 'transparent')
}


/**
 * `blocks-color` — a colour value with a picker (the theme's colours, Tailwind's palette, or any colour).
 * Core color has neither the theme nor alpha. Empty, it shows `placeholder` beside a `swatch` (CSS) of what applies.
 */
export function ColorField({ field, value: raw, onChange, disabled }: FieldProps<string | null>) {
  const [open, setOpen] = useState(false)
  const preview = useColorPreview()
  const tokenOf = useTokenOf()
  const value = raw ?? undefined
  const chosen = tokenOf(value)

  return (
    <Control>
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="end"
        className="!p-0"
        trigger={
          <Pressable compact id={fieldControlId(field)} disabled={disabled} className={cn(inputClass, 'flex items-center gap-1.5 pl-1 text-left')}>
            <Swatch color={value === undefined && typeof field.swatch === 'string' ? field.swatch : preview(value)} className="!size-4" />
            {chosen ? (
              <TokenChip token={chosen.token} alpha={chosen.alpha} />
            ) : (
              <span className={cn('truncate font-mono', !value && 'font-sans text-faint')}>{value ?? field.placeholder ?? t('None')}</span>
            )}
          </Pressable>
        }
      >
        <ColorPicker label={field.label || t('Color')} value={value} onChange={onChange} />
      </Popover>
    </Control>
  )
}

type Tab = 'theme' | 'palette' | 'custom'

/** A handle on a slider or the colour area: a white ring that reads on any colour. */
const knob = 'pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-pop ring-1 ring-black/20'

/**
 * A colour: one of the site's (by name), a shade of Tailwind's palette, or any colour (area, hue, opacity, a value
 * typed). It opens where the value is. A colour of the theme keeps its name at an opacity (bg-primary/60).
 */
export function ColorPicker({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | null) => void }) {
  const tokens = useThemeTokens()
  const colors = tokens.of('color')
  const groups = useMemo(() => colorGroups(colors), [colors])
  const chosen = tokens.find(value)
  const current = chosen?.token.variable ?? null
  const shade = !!current && groups.families.some((family) => family.shades.some((token) => token.variable === current))
  const themeAlpha = chosen ? (chosen.alpha === undefined ? 1 : Number(chosen.alpha) / 100) : 1
  const parsed = parseColor(chosen ? lightDark(tokens.resolve(chosen.token.ref)).light : value) ?? { r: 0, g: 0, b: 0, a: 1 }
  const [hsv, setHsv] = useState(() => ({ ...toHsv(parsed), a: chosen ? themeAlpha : parsed.a }))
  const [text, setText] = useState(value ?? '')
  const invalid = useInvalid(text, (v) => !v.trim() || validColor(v.trim()))
  const tabs: { value: Tab; label: string }[] = [
    ...(groups.own.length ? [{ value: 'theme' as const, label: t('Theme') }] : []),
    ...(groups.families.length ? [{ value: 'palette' as const, label: t('Palette') }] : []),
    { value: 'custom', label: t('Custom') },
  ]
  const [tab, setTab] = useState<Tab>(() => (value && !chosen ? 'custom' : shade ? 'palette' : tabs[0].value))
  // The shade under the pointer, named under the grid: a grid of colours says nothing by itself.
  const [pointed, setPointed] = useState<ThemeToken | null>(null)

  useEffect(() => setText(value ?? ''), [value])

  const emit = (h: number, s: number, v: number, a: number) => {
    setHsv({ h, s, v, a })
    onChange(formatColor(fromHsv(h, s, v, a)))
  }

  const drag = (e: React.PointerEvent, kind: 'area' | 'hue' | 'alpha') => {
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const apply = (ev: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width))
      const y = Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height))
      if (kind === 'area') emit(hsv.h, x, 1 - y, hsv.a)
      else if (kind === 'hue') emit(x * 360, hsv.s, hsv.v, hsv.a)
      else if (current) onChange(withAlpha(current, x < 0.995 ? Math.round(x * 100) : 100))
      else emit(hsv.h, hsv.s, hsv.v, Math.round(x * 100) / 100)
    }
    apply(e)
    const move = (ev: PointerEvent) => apply(ev)
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
  }

  const alpha = current ? themeAlpha : hsv.a
  const solid = current ? lightDark(tokens.resolve(`var(${current})`)).light : formatColor({ ...fromHsv(hsv.h, hsv.s, hsv.v, 1) })
  const alphaBar = (
    <div onPointerDown={(e) => drag(e, 'alpha')} className="relative h-3 min-w-0 flex-1 cursor-ew-resize rounded-full cms-checkerboard [--checker:6px]">
      <span className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(to right, transparent, ${solid})` }} />
      <span className={cn(knob, 'top-1/2')} style={{ left: `${alpha * 100}%` }} />
    </div>
  )
  const named = pointed ?? (shade ? chosen?.token ?? null : null)

  return (
    <div className="w-72">
      <div className="flex h-10 items-center gap-2 border-b border-border pl-3 pr-1.5">
        <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{label}</span>
        {tabs.length > 1 && <Segmented size="xs" aria-label={t('Colors')} value={tab} onChange={setTab} options={tabs} />}
      </div>
      {tab === 'theme' && (
        <div role="listbox" aria-label={t('Theme Colors')} className="h-72 overflow-y-auto overscroll-contain p-1">
          {groups.own.map((token) => {
            const on = current === token.variable
            const { light, dark } = lightDark(token.value)
            return (
              <Pressable compact key={token.variable} role="option" aria-selected={on} onClick={() => onChange(token.ref)} className={cn('flex h-8 w-full items-center gap-2.5 rounded-sm px-2 text-left hover:bg-hover', on && 'bg-active')}>
                <Swatch color={light} dark={dark} className="!size-4" />
                <span className="min-w-0 flex-1 truncate text-xs text-ink">{token.name}</span>
                {on ? <Icon name="check" size={12} className="shrink-0 text-ink" /> : <span className="max-w-24 shrink-0 truncate font-mono text-2xs text-faint">{lightDark(tokens.resolve(token.ref)).light}</span>}
              </Pressable>
            )
          })}
        </div>
      )}
      {tab === 'palette' && (
        <>
          <div role="listbox" aria-label={t('Palette')} className="h-64 overflow-y-auto overscroll-contain p-3" onPointerLeave={() => setPointed(null)}>
            <PaletteGrid
              families={groups.families}
              cell={(token) => {
                const on = current === token.variable
                return (
                  <Pressable
                    compact
                    key={token.variable}
                    role="option"
                    aria-selected={on}
                    aria-label={token.name}
                    onClick={() => onChange(token.ref)}
                    onPointerEnter={() => setPointed(token)}
                    onFocus={() => setPointed(token)}
                    className={cn('relative h-5 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float', on && 'z-raised ring-2 ring-focus')}
                    style={{ background: lightDark(token.value).light }}
                  >
                    <span className="cms-swatch-edge" />
                  </Pressable>
                )
              }}
            />
          </div>
          <div className="flex h-8 items-center gap-2 border-t border-border px-3 text-xs">
            {named && (
              <>
                <span className="min-w-0 flex-1 truncate text-ink">{named.name}</span>
                <span className="max-w-32 shrink-0 truncate font-mono text-2xs text-faint">{lightDark(tokens.resolve(named.ref)).light}</span>
              </>
            )}
          </div>
        </>
      )}
      {tab === 'custom' && (
        <div className="h-72 space-y-3 p-3">
          <div onPointerDown={(e) => drag(e, 'area')} className="relative h-44 cursor-crosshair overflow-hidden rounded-sm" style={{ background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hsv.h} 100% 50%))` }}>
            <span className={knob} style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
          </div>
          <div onPointerDown={(e) => drag(e, 'hue')} className="relative h-3 cursor-ew-resize rounded-full" style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}>
            <span className={cn(knob, 'top-1/2')} style={{ left: `${(hsv.h / 360) * 100}%` }} />
          </div>
          <div className="flex items-center">{alphaBar}</div>
          <div className="flex items-center gap-2">
            <Swatch color={value ? tokens.resolve(value) : 'transparent'} className="!size-7 !rounded-sm" />
            <input
              value={text}
              spellCheck={false}
              aria-label={t('Color Value')}
              aria-invalid={invalid.shown || undefined}
              onChange={(e) => setText(e.target.value)}
              // Only a colour the browser can draw is kept; anything else goes back to the last one.
              onBlur={() => {
                const next = text.trim()
                if (next && !validColor(next)) return setText(value ?? '')
                if (next !== (value ?? '')) onChange(next || null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setText(value ?? '')
                if (e.key !== 'Enter') return
                if (text.trim() && !validColor(text.trim())) invalid.show()
                else (e.target as HTMLElement).blur()
              }}
              className={cn(inputClass, 'font-mono')}
              placeholder={NEW_COLOR}
            />
          </div>
        </div>
      )}
      <div className="flex h-10 items-center gap-2 border-t border-border pl-3 pr-1.5">
        {current && tab !== 'custom' ? (
          <>
            <span className="shrink-0 text-xs text-muted">{t('Opacity')}</span>
            {alphaBar}
            <span className="w-9 shrink-0 text-right text-2xs tabular-nums text-muted">{Math.round(alpha * 100)}%</span>
          </>
        ) : (
          <span className="flex-1" />
        )}
        <Button variant="ghost" size="xs" disabled={!value} onClick={() => onChange(null)} className="shrink-0 !font-normal !text-muted hover:!text-ink">{t('Clear')}</Button>
      </div>
    </div>
  )
}
