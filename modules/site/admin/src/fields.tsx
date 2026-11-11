import { registry, t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Fields, Icon, IconButton, Input, Popover, Tooltip, cn } from '@letterncms/ui'
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

/* Field components of the design system editor — the controls core fields can't
   express: fluid sizes, font stacks, CSS declarations, easing curves, shadows and
   font files. Compact (xs) like the canvas inspector, whose value control (a number
   with its unit, scrubbed or typed) they use when Blocks has drawn it. */

/** The canvas inspector's value control (`blocks-value`), or a plain input without it. */
export function ValueInput({ field, value, onChange, disabled }: { field: FieldDef; value: string | number | null; onChange: (value: string | null) => void; disabled?: boolean }) {
  const Value = registry.fields.get('blocks-value')
  if (Value) return <Value field={{ ...field, component: 'blocks-value' }} value={value} onChange={(v: string | number | null) => onChange(v === null || v === undefined ? null : String(v))} disabled={disabled} context={{}} />
  return <Input id={fieldControlId(field)} size="sm" className="min-w-0 flex-1 font-mono" aria-label={field.label} placeholder={field.placeholder as string | undefined} value={String(value ?? '')} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
}

type Size = string | { min: string; max: string }

/** A size token: one value, or fluid `{min, max}` between phone and desktop. */
export function SizeField({ field, value, onChange, disabled }: FieldProps<Size | null>) {
  const fluid = !!value && typeof value === 'object' && 'min' in value
  const unitOf = (v: string) => v.match(/[a-z%]+$/i)?.[0] ?? ''
  // Phone and desktop in one unit name it once, after the second: the numbers get the room.
  const shared = fluid && unitOf(String(value.min)) === unitOf(String(value.max))
  const sub = (handle: string, label: string): FieldDef => ({ ...field, handle: `${field.handle}-${handle}`, label, unit: 'rem', units: handle === 'min' && shared ? [] : ['rem', 'px', 'em', '%', 'vw'], step: 0.125 })
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      {fluid ? (
        <>
          <div className="min-w-0 flex-1" title={t('Phone')}><ValueInput field={sub('min', t('Phone'))} value={value.min} disabled={disabled} onChange={(v) => onChange({ ...value, min: v ?? '0' })} /></div>
          <Icon name="arrow-right" size={10} className="shrink-0 text-faint" />
          <div className="min-w-0 flex-1" title={t('Desktop')}><ValueInput field={sub('max', t('Desktop'))} value={value.max} disabled={disabled} onChange={(v) => onChange({ ...value, max: v ?? '0' })} /></div>
        </>
      ) : (
        <div className="min-w-0 flex-1"><ValueInput field={{ ...field, unit: 'rem', units: ['rem', 'px', 'em', '%', 'vw'], step: 0.125 }} value={value ?? null} disabled={disabled} onChange={(v) => onChange(v ?? '0')} /></div>
      )}
      <Tooltip content={fluid ? t('Use One Size') : t('Scale from Phone to Desktop')}>
        <IconButton icon="width" label={t('Fluid')} size="sm" active={fluid} disabled={disabled} onClick={() => onChange(fluid ? value.max : { min: String(value ?? ''), max: String(value ?? '') })} />
      </Tooltip>
    </div>
  )
}

/** What a font family falls back to: the system's own fonts of its kind. */
export const FALLBACKS = { sans: ['ui-sans-serif', 'system-ui', 'sans-serif'], serif: ['ui-serif', 'Georgia', 'serif'], mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'] } as const
export type Fallback = keyof typeof FALLBACKS
const SYSTEM_FONTS = new Set<string>([...Object.values(FALLBACKS).flat(), '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times New Roman', 'Times', 'Courier New', 'Consolas', 'Monaco', 'cursive', 'fantasy'])

export function fallbackOf(stack: string[]): Fallback {
  if (stack.includes('monospace')) return 'mono'
  return stack.includes('serif') ? 'serif' : 'sans'
}

/** A font token's value as a list: `["Inter", "ui-sans-serif", …]`, from an array or a CSS font stack. */
export function fontStack(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : String(value ?? '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}

/** A font token with another fallback kind (sans, serif, mono), keeping its font. */
export function withFallback(value: unknown, kind: Fallback): string[] {
  const stack = fontStack(value)
  return [...(stack[0] && !SYSTEM_FONTS.has(stack[0]) ? [stack[0]] : []), ...FALLBACKS[kind]]
}

/** A font the site serves, as the picker lists it: its weights (400–600 · Italic) and whether a font token uses it. */
export interface SiteFont {
  family: string
  styles: string
  used: boolean
}

/**
 * A font token (`["Inter", "ui-sans-serif", "system-ui", "sans-serif"]`): the font it uses, picked
 * from the fonts on the site (each shown in itself) or the system's, or added right here from
 * Google Fonts or a .woff2 file. Its fallback stays as it is (the row's menu changes it).
 * `fonts` are the site's fonts; `onAdd(kind)` adds one and resolves to its family name;
 * `onRemove(family)` deletes a font no token uses.
 */
export function FontStackField({ field, value, onChange, disabled }: FieldProps<string[] | string | null>) {
  const [open, setOpen] = useState(false)
  const stack = fontStack(value)
  const first = stack[0] && !SYSTEM_FONTS.has(stack[0]) ? stack[0] : ''
  const fallback = fallbackOf(stack)
  const fonts = (field.fonts as SiteFont[] | undefined) ?? []
  const use = (family: string) => onChange([...(family ? [family] : []), ...FALLBACKS[fallback]])
  const add = async (kind: 'google' | 'upload') => {
    setOpen(false)
    const family = await (field.onAdd as ((kind: string) => Promise<string | null>) | undefined)?.(kind)
    if (family) use(family)
  }
  const option = (family: string, label: string, aside: string, extra?: ReactNode) => (
    <div key={family || 'system'} className="group/font flex items-center gap-1 rounded-sm pr-1 hover:bg-hover">
      <Button variant="ghost" onClick={() => { use(family); setOpen(false) }} className="!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal">
        <span className="min-w-0 flex-1 truncate text-base leading-tight text-ink" style={family ? { fontFamily: `"${family}"` } : undefined}>{label}</span>
        {aside && <span className="shrink-0 text-2xs tabular-nums text-faint">{aside}</span>}
      </Button>
      <span className="grid w-5 shrink-0 place-items-center">{family === first ? <Icon name="check" size={14} className="text-ink" /> : extra}</span>
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
        {option('', t('System Font'), '')}
        {fonts.map((font) => option(font.family, font.family, font.styles, !font.used && (
          <IconButton icon="trash" label={t('Remove {family}', { family: font.family })} size="xs" className="opacity-0 focus-visible:opacity-100 group-hover/font:opacity-100" onClick={() => (field.onRemove as ((family: string) => void) | undefined)?.(font.family)} />
        )))}
      </div>
      <div className="mt-1 border-t border-border pt-1">
        {action('search', t('Add a Google Font…'), () => void add('google'))}
        {action('upload', t('Upload a .woff2 File…'), () => void add('upload'))}
      </div>
    </Popover>
  )
}

/** Picks a local file (`accept`, `placeholder`) and hands it to onChange; nothing is stored. Files can be dropped on it. */
export function FileField({ field, onChange, disabled }: FieldProps<File | null>) {
  const [over, setOver] = useState(false)
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const file = e.dataTransfer.files?.[0]; if (file && !disabled) onChange(file) }}
      className={cn('flex h-14 cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed text-xs text-muted transition-colors hover:bg-hover hover:text-text', over ? 'border-focus bg-hover' : 'border-border-strong')}
    >
      <Icon name="upload" size={14} />
      {(field.placeholder as string | undefined) ?? t('Choose a File')}
      <input id={fieldControlId(field)} type="file" accept={field.accept as string | undefined} disabled={disabled} className="hidden" onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0]); e.target.value = '' }} />
    </label>
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

const SHADOW: FieldProps['field'] = { handle: 'shadow', type: 'text', component: 'blocks-shadows', label: 'Shadow' }

const shadows = (): { label: string; value: string }[] => [
  { label: t('None'), value: 'none' },
  { label: t('Small'), value: '0 1px 2px rgb(0 0 0 / 0.06)' },
  { label: t('Medium'), value: '0 4px 16px -4px rgb(0 0 0 / 0.12)' },
  { label: t('Large'), value: '0 24px 48px -16px rgb(0 0 0 / 0.2)' },
]

const ShadowSample = ({ value }: { value: string | null }) => <span className="size-3.5 shrink-0 rounded-xs border border-border bg-bg" style={{ boxShadow: value ?? undefined }} />

/** A box-shadow: a named preset, or a custom one made in the canvas's shadow editor (offsets, blur, spread, color). */
export function ShadowField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const preset = shadows().find((p) => p.value === value?.replace(/\s+/g, ' ').trim())
  return (
    <Popover
      align="start"
      className="w-72 p-1"
      trigger={
        <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
          {preset?.label ?? t('Custom')}
        </PickerButton>
      }
    >
      <div className="space-y-px">
        {shadows().map((option) => (
          <Button key={option.value} variant="ghost" onClick={() => onChange(option.value)} data-active={option.value === preset?.value || undefined} className="w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal">
            <ShadowSample value={option.value} />
            <span className="flex-1">{option.label}</span>
            {option.value === preset?.value && <Icon name="check" size={12} className="text-muted" />}
          </Button>
        ))}
      </div>
      <div className="mt-1 border-t border-border px-1 pb-1 pt-2">
        <p className="m-0 mb-1 text-2xs font-medium text-muted">{t('Custom')}</p>
        <Fields bare fields={[SHADOW]} values={{ shadow: value && value !== 'none' ? value : '0 4px 16px 0 rgb(0 0 0 / 12%)' }} onChange={(_, v) => onChange(v ?? 'none')} />
        <Button variant="ghost" size="xs" onClick={() => onChange(`${value && value !== 'none' ? `${value}, ` : ''}0 2px 8px 0 rgb(0 0 0 / 10%)`)} className="mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text">
          <Icon name="plus" size={11} />
          {t('Add Layer')}
        </Button>
      </div>
    </Popover>
  )
}
