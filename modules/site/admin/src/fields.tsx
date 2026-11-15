import { t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Fields, Icon, IconButton, Popover, Tooltip, cn } from '@letterncms/ui'
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
    <Button ref={ref} variant="ghost" aria-label={label} {...props} className={cn('cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus', className)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Icon name="chevrons-up-down" size={11} className="shrink-0 text-faint" />
    </Button>
  )
})

const shadows = (text: boolean): { label: string; value: string }[] => [
  { label: t('None'), value: 'none' },
  ...(text ? [
    { label: t('Small'), value: '0 1px 1px rgb(0 0 0 / 0.08)' },
    { label: t('Medium'), value: '0 2px 4px rgb(0 0 0 / 0.12)' },
    { label: t('Large'), value: '0 8px 16px rgb(0 0 0 / 0.16)' },
  ] : [
    { label: t('Small'), value: '0 1px 2px rgb(0 0 0 / 0.06)' },
    { label: t('Medium'), value: '0 4px 16px -4px rgb(0 0 0 / 0.12)' },
    { label: t('Large'), value: '0 24px 48px -16px rgb(0 0 0 / 0.2)' },
  ]),
]

const ShadowSample = ({ value, text }: { value: string | null; text: boolean }) => (text
  ? <span className="grid size-3.5 shrink-0 place-items-center text-xs font-semibold text-ink" style={{ textShadow: value ?? undefined }}>A</span>
  : <span className="size-3.5 shrink-0 rounded-xs border border-border bg-bg" style={{ boxShadow: value ?? undefined }} />)

/**
 * A shadow of the theme: a named preset, or a custom one made in the canvas's shadow editor (offsets, blur,
 * spread, colour, inside). `kind: 'text'` is a shadow without spread or inside: a text shadow, a drop shadow.
 */
export function ShadowField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const text = field.kind === 'text'
  const preset = shadows(text).find((p) => p.value === value?.replace(/\s+/g, ' ').trim())
  const editor: FieldProps['field'] = { handle: 'shadow', type: 'text', component: 'blocks-shadows', label: t('Shadow'), ...(text ? { kind: 'text' } : {}) }
  const fresh = text ? '0 2px 4px rgb(0 0 0 / 12%)' : '0 4px 16px 0 rgb(0 0 0 / 12%)'
  return (
    <Popover
      align="start"
      className="w-72 p-1"
      trigger={
        <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
          {/* A shadow of its own reads as what it is: its offsets and blur, layer by layer. */}
          {preset?.label ?? <span className="font-mono text-xs">{(value ?? '').replace(/\s+/g, ' ').trim() || t('None')}</span>}
        </PickerButton>
      }
    >
      <div className="space-y-px">
        {shadows(text).map((option) => (
          <Button key={option.value} variant="ghost" onClick={() => onChange(option.value)} data-active={option.value === preset?.value || undefined} className="w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal">
            <ShadowSample value={option.value} text={text} />
            <span className="flex-1">{option.label}</span>
            {option.value === preset?.value && <Icon name="check" size={12} className="text-muted" />}
          </Button>
        ))}
      </div>
      <div className="mt-1 border-t border-border px-1 pb-1 pt-2">
        <p className="m-0 mb-1 text-2xs font-medium text-muted">{t('Custom||shadow')}</p>
        <Fields bare fields={[editor]} values={{ shadow: value && value !== 'none' ? value : fresh }} onChange={(_, v) => onChange(v ?? 'none')} />
        <Button variant="ghost" size="xs" onClick={() => onChange(`${value && value !== 'none' ? `${value}, ` : ''}${text ? '0 1px 2px rgb(0 0 0 / 10%)' : '0 2px 8px 0 rgb(0 0 0 / 10%)'}`)} className="mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text">
          <Icon name="plus" size={11} />
          {t('Add Layer')}
        </Button>
      </div>
    </Popover>
  )
}

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
  return { min, max, from: round((min - intercept) / slope, 1), to: round((max - intercept) / slope, 1), unit: /px\s*$/.test(m[1]) ? 'px' : 'rem' }
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
 * A size of the theme: a length, or a fluid one that grows with the screen (a clamp(), as Tailwind themes write
 * them). Fixed, it is the inspector's length control with a button that makes it fluid; fluid, it reads
 * "16 → 20px" and opens on the smallest and largest size and the screens between which it grows.
 */
export function SizeField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const text = String(value ?? '')
  const fluid = parseFluid(text)
  const fixedPx = toPx(text)
  const [open, setOpen] = useState(false)
  const units = (field.units as string[] | undefined) ?? ['rem', 'px', 'em', '%', 'vw']
  const length: FieldDef = { handle: field.handle, type: 'text', component: 'blocks-value', label: field.label, unit: 'rem', units, step: 0.125, size: 'sm' } as FieldDef
  const set = (next: Partial<Fluid>) => fluid && onChange(formatFluid({ ...fluid, ...next }))
  // A width typed in the popover: pixels, or a length the theme writes in rem.
  const px = (v: unknown) => toPx(String(v ?? '')) ?? null
  // The same switch in both: fluid or not, the control keeps its width.
  const toggle = !disabled && (fluid || fixedPx !== null) && (
    <Tooltip content={t('Fluid Size')}>
      <IconButton
        icon="width"
        size="xs"
        label={t('Fluid Size')}
        title={undefined}
        aria-pressed={!!fluid}
        active={!!fluid}
        onClick={() => onChange(fluid ? asLength(fluid.max, fluid.unit) : formatFluid({ min: Math.max((fixedPx ?? 16) * 0.75, 1), max: fixedPx ?? 16, from: 360, to: 1280, unit: /px$/.test(text) ? 'px' : 'rem' }))}
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
        className="w-64 !p-3"
        trigger={
          <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
            <span className="font-mono tabular-nums">{short(fluid.min)} → {short(fluid.max)}px</span>
          </PickerButton>
        }
      >
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Fields bare fields={[{ handle: 'min', type: 'text', component: 'blocks-value', label: t('Smallest'), unit: 'px', units: ['px', 'rem'], step: 1, min: 0, size: 'sm' } as FieldDef]} values={{ min: `${short(fluid.min)}px` }} onChange={(_, v) => { const n = px(v); if (n !== null) set({ min: n }) }} />
            <Fields bare fields={[{ handle: 'max', type: 'text', component: 'blocks-value', label: t('Largest'), unit: 'px', units: ['px', 'rem'], step: 1, min: 0, size: 'sm' } as FieldDef]} values={{ max: `${short(fluid.max)}px` }} onChange={(_, v) => { const n = px(v); if (n !== null) set({ max: n }) }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Fields bare fields={[{ handle: 'from', type: 'text', component: 'blocks-value', label: t('From Screen'), unit: 'px', units: ['px'], step: 10, min: 0, size: 'sm' } as FieldDef]} values={{ from: `${Math.round(fluid.from)}px` }} onChange={(_, v) => { const n = px(v); if (n !== null && n < fluid.to) set({ from: n }) }} />
            <Fields bare fields={[{ handle: 'to', type: 'text', component: 'blocks-value', label: t('To Screen'), unit: 'px', units: ['px'], step: 10, min: 0, size: 'sm' } as FieldDef]} values={{ to: `${Math.round(fluid.to)}px` }} onChange={(_, v) => { const n = px(v); if (n !== null && n > fluid.from) set({ to: n }) }} />
          </div>
        </div>
      </Popover>
      {toggle}
    </div>
  )
}
