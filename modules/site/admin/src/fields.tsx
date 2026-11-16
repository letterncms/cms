import { t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Fields, Icon, IconButton, Popover, Segmented, Tooltip, cn } from '@letterncms/ui'
import { PanelFields, formatShadows, parseShadows, type Shadow } from '@letterncms/blocks'
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

/* Field components of the Styling page: the controls core fields can't express, a font stack and a
   shadow. Compact like the canvas inspector, whose shadow editor the second one opens. */

/** What a font family falls back to: the system's own fonts of its kind. */
export const FALLBACKS = { sans: ['ui-sans-serif', 'system-ui', 'sans-serif'], serif: ['ui-serif', 'Georgia', 'serif'], mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'] } as const
export type Fallback = keyof typeof FALLBACKS
const SYSTEM_FONTS = new Set<string>([...Object.values(FALLBACKS).flat(), '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times New Roman', 'Times', 'Courier New', 'Consolas', 'Monaco', 'cursive', 'fantasy'])

export function fallbackOf(stack: string[]): Fallback {
  if (stack.includes('monospace')) return 'mono'
  return stack.includes('serif') ? 'serif' : 'sans'
}

/** A font stack as a list: `Inter, "Inter Fallback", sans-serif` → ["Inter", "Inter Fallback", "sans-serif"]. */
export function fontStack(value: unknown): string[] {
  return String(value ?? '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}

/** A list of families as CSS writes it: a name that is not one plain word stands in quotes. */
export function stackCss(stack: string[]): string {
  return stack.map((name) => (/^[a-zA-Z][\w-]*$/.test(name) ? name : `"${name.replace(/"/g, '')}"`)).join(', ')
}

/** The font a stack uses, when it is one the site serves or names: not a system font, not a fallback face. */
export function familyOf(stack: string[]): string {
  return stack[0] && !SYSTEM_FONTS.has(stack[0]) && !stack[0].endsWith(' Fallback') ? stack[0] : ''
}

/**
 * A stack for a family and a kind of fallback. A family with a fallback face (the local font drawn at its
 * size until it arrives) names it right after itself, as "<Family> Fallback".
 */
export function stackFor(family: string, kind: Fallback, fallbackFace: boolean): string {
  return stackCss([...(family ? [family, ...(fallbackFace ? [`${family} Fallback`] : [])] : []), ...FALLBACKS[kind]])
}

/** A font the site serves, as the picker lists it: its weights (400–600 · Italic), whether it has a fallback face and whether a font of the theme uses it. */
export interface SiteFont {
  family: string
  styles: string
  fallback: boolean
  used: boolean
}

/**
 * A font of the theme (`Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif`): the font it uses,
 * picked from the fonts on the site (each shown in itself) or the system's, or added right here from
 * Google Fonts or a .woff2 file. Its kind of fallback stays as it is (the row's menu changes it).
 * `fonts` are the site's fonts; `onAdd(kind)` adds one and resolves to it; `onRemove(family)` deletes a
 * font no font of the theme uses.
 */
export function FontStackField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const [open, setOpen] = useState(false)
  const stack = fontStack(value)
  const first = familyOf(stack)
  const fallback = fallbackOf(stack)
  const fonts = (field.fonts as SiteFont[] | undefined) ?? []
  const use = (family: string, fallbackFace: boolean) => onChange(stackFor(family, fallback, fallbackFace))
  const add = async (kind: 'google' | 'upload') => {
    setOpen(false)
    const font = await (field.onAdd as ((kind: string) => Promise<{ family: string; fallback: boolean } | null>) | undefined)?.(kind)
    if (font) use(font.family, font.fallback)
  }
  const option = (family: string, label: string, aside: string, fallbackFace: boolean, extra?: ReactNode) => (
    <div key={family || 'system'} className="cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover">
      <Button variant="ghost" onClick={() => { use(family, fallbackFace); setOpen(false) }} className="!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal">
        <span className="min-w-0 flex-1 truncate text-base leading-tight text-ink" style={family ? { fontFamily: `"${family}"` } : undefined}>{label}</span>
        {aside && <span className="shrink-0 text-2xs tabular-nums text-faint">{aside}</span>}
      </Button>
      <span className="grid w-6 shrink-0 place-items-center">{family === first ? <Icon name="check" size={14} className="text-ink" /> : extra}</span>
    </div>
  )
  const action = (icon: string, label: string, onClick: () => void) => (
    <Button variant="ghost" size="md" onClick={onClick} className="w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal">
      <Icon name={icon} size={14} className="shrink-0 text-faint" />
      {label}
    </Button>
  )
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-72 !p-1.5"
      trigger={
        <Button variant="ghost" id={fieldControlId(field)} disabled={disabled} className="cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal">
          <span className="min-w-0 flex-1 truncate" style={first ? { fontFamily: `"${first}"` } : undefined}>{first || t('System Font')}</span>
          <Icon name="chevrons-up-down" size={14} className="shrink-0 text-faint" />
        </Button>
      }
    >
      <div className="max-h-72 overflow-y-auto">
        {option('', t('System Font'), '', false)}
        {/* A font the theme names without serving it (a font of the visitor's own) is still what is chosen. */}
        {first && !fonts.some((font) => font.family === first) && option(first, first, '', stack.includes(`${first} Fallback`))}
        {fonts.map((font) => option(font.family, font.family, font.styles, font.fallback, !font.used && field.onRemove ? (
          <IconButton icon="trash" label={t('Remove {family}', { family: font.family })} size="xs" className="cms-reveal" onClick={() => (field.onRemove as (family: string) => void)(font.family)} />
        ) : undefined))}
      </div>
      {!!field.onAdd && (
        <div className="mt-1 border-t border-border pt-1">
          {action('search', t('Add a Google Font…'), () => void add('google'))}
          {action('upload', t('Upload a .woff2 File…'), () => void add('upload'))}
        </div>
      )}
    </Popover>
  )
}

/** A trigger that looks like the inspector's inputs: what is chosen, a chevron. (A popover's trigger: it takes the props and ref it is given.) */
const PickerButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(function PickerButton({ label, children, className, ...props }, ref) {
  return (
    <Button ref={ref} variant="ghost" aria-label={label} {...props} className={cn('cms-input w-full min-w-0 flex-1 !shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus', className)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Icon name="chevrons-up-down" size={11} className="shrink-0 text-faint" />
    </Button>
  )
})

const NEW_LAYER = { box: { inset: false, x: '0px', y: '4px', blur: '12px', spread: '-2px', color: 'rgb(0 0 0 / 12%)' }, text: { inset: false, x: '0px', y: '1px', blur: '2px', spread: '0', color: 'rgb(0 0 0 / 25%)' } }

/** A shadow drawn as it falls: on a card, or under a letter for a text shadow and a drop shadow. */
function ShadowSample({ value, kind, large }: { value: string | null; kind: string; large?: boolean }) {
  const shadow = value && value !== 'none' ? value : undefined
  if (kind === 'text') return <span className={cn('grid shrink-0 place-items-center font-semibold text-ink', large ? 'text-5xl' : 'size-5 text-base')} style={{ textShadow: shadow }}>A</span>
  if (kind === 'drop') return <span className={cn('shrink-0 rounded-sm bg-float', large ? 'size-16' : 'size-5')} style={{ filter: shadow ? shadow.split(/,(?![^(]*\))/).map((part) => `drop-shadow(${part.trim()})`).join(' ') : undefined }} />
  return <span className={cn('shrink-0 rounded-sm border border-border bg-float', large ? 'size-16' : 'size-5')} style={{ boxShadow: shadow }} />
}

/**
 * A shadow of the theme, made of layers as designers make shadows: each with its offsets, blur, spread and
 * colour (and Inside for a box shadow), drawn large above them as it falls. `kind` is `box` (the default),
 * `text` or `drop`: those two have no spread and no inside.
 */
/** One layer in words: where it falls and how soft it is ("Y 6 · Blur 20"), inside the box when it is. */
const brief = (layer: Shadow) => [layer.inset ? t('Inside') : null, `Y ${layer.y.replace(/px$/, '')}`, `${t('Blur')} ${layer.blur.replace(/px$/, '')}`].filter(Boolean).join(' · ')

export function ShadowField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const kind = (field.kind as string | undefined) ?? 'box'
  const flat = kind !== 'box'
  const layers: Shadow[] = parseShadows(value) ?? []
  const write = (next: Shadow[]) => onChange(formatShadows(next, flat) ?? 'none')
  const set = (i: number, patch: Partial<Shadow>) => write(layers.map((layer, j) => (j === i ? { ...layer, ...patch } : layer)))
  return (
    <Popover
      align="start"
      className="flex max-h-[min(36rem,80vh)] w-72 flex-col !p-0"
      trigger={
        <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
          {layers.length === 0 ? <span className="text-faint">{t('Add Shadow')}</span> : <span className="truncate">{layers.length === 1 ? brief(layers[0]) : t('{n} Layers', { n: layers.length })}</span>}
        </PickerButton>
      }
    >
      <div className="grid h-28 shrink-0 place-items-center border-b border-border bg-sunken">
        <ShadowSample value={value} kind={kind} large />
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {layers.map((layer, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex h-6 items-center justify-between">
              <span className="text-xs font-medium text-text">{layers.length > 1 ? t('Layer {n}', { n: i + 1 }) : t('Shadow')}</span>
              <IconButton icon="minus" size="xs" label={t('Remove Layer')} onClick={() => write(layers.filter((_, j) => j !== i))} />
            </div>
            {!flat && <Segmented size="xs" block aria-label={t('Position')} value={layer.inset ? 'inside' : 'outside'} onChange={(where) => set(i, { inset: where === 'inside' })} options={[{ value: 'outside', label: t('Outside') }, { value: 'inside', label: t('Inside') }]} />}
            <PanelFields
              className="grid grid-cols-2 gap-1"
              bare
              fields={[
                { handle: 'x', type: 'text', component: 'blocks-value', label: t('X Offset'), prefix: 'X', placeholder: '0' },
                { handle: 'y', type: 'text', component: 'blocks-value', label: t('Y Offset'), prefix: 'Y', placeholder: '0' },
                { handle: 'blur', type: 'text', component: 'blocks-value', label: t('Blur'), min: 0, prefixIcon: 'shadow', placeholder: '0' },
                ...(flat ? [] : [{ handle: 'spread', type: 'text', component: 'blocks-value', label: t('Spread'), prefixIcon: 'arrows-out-simple', placeholder: '0' }]),
              ] as FieldDef[]}
              values={layer}
              onChange={(handle, next) => set(i, { [handle]: next === null || next === undefined || next === '' ? '0' : String(next) })}
            />
            <PanelFields bare fields={[{ handle: 'color', type: 'color', component: 'blocks-color', label: t('Color') } as FieldDef]} values={layer} onChange={(_, next) => set(i, { color: String(next ?? 'transparent') })} />
          </div>
        ))}
        <Button variant="ghost" size="xs" icon="plus" onClick={() => write([...layers, kind === 'box' ? NEW_LAYER.box : NEW_LAYER.text])} className="-ml-1.5 !px-1.5 !font-normal !text-muted hover:!text-ink">{layers.length ? t('Add Layer') : t('Add Shadow')}</Button>
      </div>
    </Popover>
  )
}

export { ShadowSample }

/** A length in CSS pixels: "1.5rem" is 24, "24px" is 24. Null for anything else. */
function toPx(value: string): number | null {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(value.trim())
  return m ? Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1) : null
}

const round = (n: number, places = 4) => +n.toFixed(places)

/** A length as the theme writes it: rem, unless it was given in pixels. */
const asLength = (px: number, unit: 'rem' | 'px') => (unit === 'px' ? `${round(px, 2)}px` : `${round(px / 16)}rem`)

/** A fluid size: from `min` at the `from` screen width to `max` at `to`, in CSS pixels, and the unit it is written in. */
export interface Fluid {
  min: number
  max: number
  from: number
  to: number
  unit: 'rem' | 'px'
}

/** clamp(1rem, 0.9755rem + 0.1087vw, 1.0625rem) as the sizes and screens it grows between. Null for any other value. */
export function parseFluid(value: string): Fluid | null {
  const m = /^clamp\(\s*([^,]+?)\s*,\s*(?:(-?[\d.]+)(rem|px)\s*([+-])\s*)?([\d.]+)vw\s*,\s*([^,]+?)\s*\)$/.exec(value.trim())
  if (!m) return null
  const min = toPx(m[1])
  const max = toPx(m[6])
  const slope = Number(m[5]) / 100
  const intercept = m[2] === undefined ? 0 : Number(m[2]) * (m[3] === 'rem' ? 16 : 1) * (m[4] === '-' ? -1 : 1)
  if (min === null || max === null || !slope) return null
  return { min, max, from: Math.round((min - intercept) / slope), to: Math.round((max - intercept) / slope), unit: /px\s*$/.test(m[1]) ? 'px' : 'rem' }
}

/** A fluid size as CSS: the size grows in a straight line between the two screens, and stays put beyond them. */
export function formatFluid({ min, max, from, to, unit }: Fluid): string {
  if (to === from) return asLength(max, unit)
  const slope = (max - min) / (to - from)
  const intercept = min - slope * from
  const sum = `${asLength(Math.abs(intercept), unit)} ${intercept < 0 ? '-' : '+'} ${round(slope * 100)}vw`
  return `clamp(${asLength(Math.min(min, max), unit)}, ${intercept === 0 ? `${round(slope * 100)}vw` : sum}, ${asLength(Math.max(min, max), unit)})`
}

/** Pixels, short: 16, 17.5. */
const short = (px: number) => String(round(px, 1))

/**
 * How a fluid size grows, drawn: flat at its smallest up to the screen it starts growing at, a straight line to
 * its largest, flat again after. The widths are drawn to scale against a 1600px screen.
 */
function FluidGraph({ fluid }: { fluid: Fluid }) {
  const W = 248
  const H = 64
  const span = Math.max(1600, fluid.to + 160)
  const x = (screen: number) => 8 + (Math.max(0, Math.min(span, screen)) / span) * (W - 16)
  const low = Math.min(fluid.min, fluid.max)
  const high = Math.max(fluid.min, fluid.max, low + 1)
  const y = (size: number) => H - 14 - ((size - low) / (high - low)) * (H - 28)
  const line = `M${x(0)},${y(fluid.min)} L${x(fluid.from)},${y(fluid.min)} L${x(fluid.to)},${y(fluid.max)} L${x(span)},${y(fluid.max)}`
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block w-full overflow-visible rounded-sm bg-sunken text-ink" aria-hidden>
      <line x1={x(fluid.from)} y1={4} x2={x(fluid.from)} y2={H - 4} className="stroke-border-strong" strokeDasharray="2 3" />
      <line x1={x(fluid.to)} y1={4} x2={x(fluid.to)} y2={H - 4} className="stroke-border-strong" strokeDasharray="2 3" />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(fluid.from)} cy={y(fluid.min)} r={3} fill="currentColor" />
      <circle cx={x(fluid.to)} cy={y(fluid.max)} r={3} fill="currentColor" />
    </svg>
  )
}

/** A number of pixels in its own field, with a label above it and an icon in it. */
function PixelField({ handle, label, icon, value, min = 0, step = 1, onChange }: { handle: string; label: string; icon?: string; value: number; min?: number; step?: number; onChange: (px: number) => void }) {
  return (
    <Fields
      className="min-w-0"
      fields={[{ handle, type: 'text', component: 'blocks-value', label, unit: 'px', units: ['px'], step, min, size: 'sm', ...(icon ? { prefixIcon: icon } : {}) } as FieldDef]}
      values={{ [handle]: `${short(value)}px` }}
      onChange={(_, next) => {
        const px = toPx(String(next ?? ''))
        if (px !== null) onChange(px)
      }}
    />
  )
}

/**
 * A size of the theme: a length, or a fluid one that grows with the screen (a clamp(), as Tailwind themes write
 * them). Fixed, it is the inspector's length control; the switch beside it makes it fluid. Fluid, it reads
 * "16 → 20px" and opens on what it is on a phone and on a desktop, the screens it grows between, and a drawing of it.
 */
export function SizeField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const text = String(value ?? '')
  const fluid = parseFluid(text)
  const fixedPx = toPx(text)
  const [open, setOpen] = useState(false)
  const units = (field.units as string[] | undefined) ?? ['rem', 'px', 'em', '%', 'vw']
  const length: FieldDef = { handle: field.handle, type: 'text', component: 'blocks-value', label: field.label, unit: 'rem', units, step: 0.125, size: 'sm' } as FieldDef
  const set = (next: Partial<Fluid>) => fluid && onChange(formatFluid({ ...fluid, ...next }))
  // The same switch in both, or its room where there is none: fluid or not, every size control is one width.
  const toggle = disabled || (!fluid && fixedPx === null) ? <span className="size-6 shrink-0" /> : (
    <Tooltip content={t('Grow with the Screen')}>
      <IconButton
        icon="width"
        size="xs"
        label={t('Grow with the Screen')}
        title={undefined}
        aria-pressed={!!fluid}
        active={!!fluid}
        onClick={() => onChange(fluid ? asLength(fluid.max, fluid.unit) : formatFluid({ min: Math.max(round((fixedPx ?? 16) * 0.75, 0), 1), max: fixedPx ?? 16, from: 390, to: 1280, unit: /px$/.test(text) ? 'px' : 'rem' }))}
      />
    </Tooltip>
  )
  if (!fluid) {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {/* Not a length and not a fluid size (a calc(), a var()): it is shown and typed as written. */}
        {fixedPx === null && text !== '' ? (
          <Fields bare className="flex min-w-0 flex-1" disabled={disabled} fields={[{ handle: field.handle, type: 'text', label: field.label, size: 'sm', mono: true } as FieldDef]} values={{ [field.handle]: text }} onChange={(_, next) => next && onChange(String(next))} />
        ) : (
          <Fields bare className="flex min-w-0 flex-1" disabled={disabled} fields={[length]} values={{ [field.handle]: text || null }} onChange={(_, next) => next && onChange(String(next))} />
        )}
        {toggle}
      </div>
    )
  }
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <Popover
        open={open}
        onOpenChange={setOpen}
        align="start"
        className="w-72 !p-3"
        trigger={
          <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Icon name="phone" size={12} className="text-faint" />{short(fluid.min)}
              <span className="text-faint">→</span>
              <Icon name="monitor" size={12} className="text-faint" />{short(fluid.max)}px
            </span>
          </PickerButton>
        }
      >
        <div className="space-y-3">
          <FluidGraph fluid={fluid} />
          <div className="grid grid-cols-2 gap-2">
            <PixelField handle="min" label={t('On a Phone')} icon="phone" value={fluid.min} onChange={(min) => set({ min })} />
            <PixelField handle="max" label={t('On a Desktop')} icon="monitor" value={fluid.max} onChange={(max) => set({ max })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PixelField handle="from" label={t('Screen From')} icon="width" value={fluid.from} step={10} onChange={(from) => from < fluid.to && set({ from })} />
            <PixelField handle="to" label={t('Screen To')} icon="width" value={fluid.to} step={10} onChange={(to) => to > fluid.from && set({ to })} />
          </div>
        </div>
      </Popover>
      {toggle}
    </div>
  )
}

/** An animation as its parts: `spin 1s linear infinite`. */
export interface Animation {
  name: string
  duration: string
  easing: string
  delay: string
  forever: boolean
  alternate: boolean
}

const TIME = /^-?[\d.]+m?s$/
const EASING = /^(linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|(cubic-bezier|steps|linear)\(.*\))$/

/** The parts of an animation value, or null for one with more than one animation. */
export function parseAnimation(value: string): Animation | null {
  if (/,(?![^(]*\))/.test(value)) return null
  const parts = value.trim().match(/[\w-]+\([^)]*\)|\S+/g) ?? []
  const out: Animation = { name: '', duration: '', easing: '', delay: '', forever: false, alternate: false }
  for (const part of parts) {
    if (TIME.test(part)) out.duration ? (out.delay = part) : (out.duration = part)
    else if (EASING.test(part)) out.easing = part
    else if (part === 'infinite') out.forever = true
    else if (/^(alternate|alternate-reverse)$/.test(part)) out.alternate = true
    else if (/^(normal|reverse|forwards|backwards|both|none|running|paused|\d+)$/.test(part)) continue
    else if (!out.name) out.name = part
  }
  return out
}

export function formatAnimation(animation: Animation): string {
  return [animation.name, animation.duration || '1s', animation.easing, animation.delay, animation.forever ? 'infinite' : '', animation.alternate ? 'alternate' : ''].filter(Boolean).join(' ')
}

/** The @keyframes of stylesheets by name, as CSS: Tailwind's own and the site's. */
export function keyframesOf(...sheets: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const css of sheets) {
    const at = /@keyframes\s+([\w-]+)\s*\{/g
    let m: RegExpExecArray | null
    while ((m = at.exec(css))) {
      let depth = 1
      let i = at.lastIndex
      for (; i < css.length && depth > 0; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0
      out[m[1]] = css.slice(m.index, i)
    }
  }
  return out
}

/** A small square running an animation, its keyframes beside it under a name of their own so nothing else uses them. */
export function AnimationSample({ value, keyframes, large }: { value: string; keyframes: Record<string, string>; large?: boolean }) {
  const animation = parseAnimation(value)
  const id = animation?.name && keyframes[animation.name] ? `cms-sample-${animation.name}` : null
  const css = id && animation ? keyframes[animation.name].replace(/@keyframes\s+[\w-]+/, `@keyframes ${id}`) : ''
  return (
    <span className={cn('grid shrink-0 place-items-center', large ? 'size-16' : 'size-5')} aria-hidden>
      {css && <style>{css}</style>}
      <span className={cn('rounded-xs bg-ink', large ? 'size-6' : 'size-2.5')} style={id && animation ? { animation: formatAnimation({ ...animation, name: id }) } : undefined} />
    </span>
  )
}

/**
 * An animation of the theme, made as it reads: which keyframes, how long, with what easing, once or forever, and
 * back and forth or not, drawn running above. `keyframes` are the ones the stylesheet and Tailwind have.
 */
export function AnimationField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const keyframes = (field.keyframes as Record<string, string> | undefined) ?? {}
  const text = String(value ?? '')
  const animation = parseAnimation(text)
  const set = (patch: Partial<Animation>) => animation && onChange(formatAnimation({ ...animation, ...patch }))
  if (!animation) {
    return <Fields bare className="flex min-w-0 flex-1" disabled={disabled} fields={[{ handle: field.handle, type: 'text', label: field.label, size: 'sm', mono: true } as FieldDef]} values={{ [field.handle]: text }} onChange={(_, next) => next && onChange(String(next))} />
  }
  const names = [...new Set([...Object.keys(keyframes), ...(animation.name ? [animation.name] : [])])]
  return (
    <Popover
      align="start"
      className="w-72 !p-0"
      trigger={
        <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
          <span className="truncate">{[animation.name, animation.duration, animation.forever ? t('Forever') : t('Once')].filter(Boolean).join(' · ')}</span>
        </PickerButton>
      }
    >
      <div className="grid h-24 place-items-center border-b border-border bg-sunken">
        <AnimationSample value={text} keyframes={keyframes} large />
      </div>
      <div className="space-y-2 p-3">
        <Fields
          fields={[
            { handle: 'name', type: 'select', size: 'sm', label: t('Keyframes'), required: true, options: Object.fromEntries(names.map((name) => [name, name])) },
            { handle: 'duration', type: 'text', component: 'blocks-value', size: 'sm', label: t('Duration'), unit: 'ms', units: ['ms', 's'], step: 50, min: 0 },
            { handle: 'easing', type: 'text', component: 'ease', size: 'sm', label: t('Easing'), placeholder: t('Ease') },
            { handle: 'repeat', type: 'select', display: 'segmented', block: true, size: 'sm', required: true, label: t('Repeat'), options: [{ value: 'once', label: t('Once') }, { value: 'forever', label: t('Forever') }] },
            { handle: 'alternate', type: 'toggle', label: t('Back and Forth') },
          ] as FieldDef[]}
          values={{ name: animation.name, duration: animation.duration || null, easing: animation.easing || null, repeat: animation.forever ? 'forever' : 'once', alternate: animation.alternate }}
          onChange={(handle, next) => {
            if (handle === 'repeat') set({ forever: next === 'forever' })
            else if (handle === 'alternate') set({ alternate: !!next })
            else set({ [handle]: next === null || next === undefined ? '' : String(next) })
          }}
        />
      </div>
    </Popover>
  )
}
