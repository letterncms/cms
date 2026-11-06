import { registry, t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { fieldControlId, Fields, Icon, IconButton, Input, Popover, Tooltip, cn } from '@letterncms/ui'
import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

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

type Declarations = Record<string, string | number>
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
      <button type="button" onClick={() => { use(family); setOpen(false) }} className="flex min-h-9 min-w-0 flex-1 items-center gap-2 pl-2 text-left">
        <span className="min-w-0 flex-1 truncate text-[15px] leading-tight text-ink" style={family ? { fontFamily: `"${family}"` } : undefined}>{label}</span>
        {aside && <span className="shrink-0 text-2xs tabular-nums text-faint">{aside}</span>}
      </button>
      <span className="grid w-5 shrink-0 place-items-center">{family === first ? <Icon name="check" size={14} className="text-ink" /> : extra}</span>
    </div>
  )
  const action = (icon: string, label: string, onClick: () => void) => (
    <button type="button" onClick={onClick} className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-xs text-text hover:bg-hover hover:text-ink">
      <Icon name={icon} size={14} className="shrink-0 text-faint" />
      {label}
    </button>
  )
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-72 !p-1.5"
      trigger={
        <button type="button" id={fieldControlId(field)} disabled={disabled} className="cms-input flex h-7 w-full min-w-0 items-center gap-2 rounded-sm pl-2 pr-1.5 text-left text-sm">
          <span className="min-w-0 flex-1 truncate" style={first ? { fontFamily: `"${first}"` } : undefined}>{first || t('System Font')}</span>
          <Icon name="chevrons-up-down" size={14} className="shrink-0 text-faint" />
        </button>
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

/** Common properties offered while typing one (any camelCase CSS property works). */
const PROPERTIES = [
  'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing', 'textTransform', 'textDecoration', 'textUnderlineOffset', 'textWrap',
  'marginBlock', 'marginBlockStart', 'marginBlockEnd', 'padding', 'paddingInline', 'paddingBlock', 'border', 'borderColor', 'borderWidth', 'borderRadius', 'boxShadow', 'opacity', 'transition',
]

/**
 * CSS declarations of one element or state: property/value rows. `tokens` (token
 * references) are offered for values; `removable` adds a Remove action that clears it (null).
 */
export function DeclarationsField({ field, value, onChange, disabled }: FieldProps<Declarations | null>) {
  const decl = value ?? {}
  const [adding, setAdding] = useState(false)
  const list = `site-decl-${field.handle.replace(/[^a-z0-9-]/gi, '-')}`
  const tokens = (field.tokens as string[] | undefined) ?? []
  const rename = (prop: string, next: string) => {
    if (!next || next === prop || next in decl) return
    onChange(Object.fromEntries(Object.entries(decl).map(([k, v]) => (k === prop ? [next, v] : [k, v]))))
  }
  return (
    <div className="cms-declarations group/decl py-2">
      <div className="flex h-6 items-center gap-1">
        <span className={cn('min-w-0 flex-1 truncate text-xs font-medium text-ink', field.mono !== false && 'font-mono')}>{field.label}</span>
        <IconButton icon="plus" label={t('Add Property')} size="xs" disabled={disabled} onClick={() => setAdding(true)} />
        {field.removable === true && <IconButton icon="trash" label={t('Remove')} size="xs" disabled={disabled} className="opacity-0 group-hover/decl:opacity-100 focus-visible:opacity-100" onClick={() => onChange(null)} />}
      </div>
      <datalist id={`${list}-props`}>{PROPERTIES.filter((p) => !(p in decl)).map((p) => <option key={p} value={p} />)}</datalist>
      <datalist id={`${list}-values`}>{tokens.map((v) => <option key={v} value={v} />)}</datalist>
      <div className="mt-1 space-y-1">
        {Object.entries(decl).map(([prop, v]) => (
          <div key={prop} className="group/row grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1">
            <PropertyInput value={prop} list={`${list}-props`} disabled={disabled} onCommit={(next) => rename(prop, next)} />
            <Input size="xs" className="font-mono" spellCheck={false} list={`${list}-values`} aria-label={t('{property} value', { property: prop })} value={String(v)} disabled={disabled} onChange={(e) => onChange({ ...decl, [prop]: e.target.value })} />
            <button type="button" disabled={disabled} onClick={() => onChange(Object.fromEntries(Object.entries(decl).filter(([k]) => k !== prop)))} className="grid size-5 place-items-center rounded-xs text-faint opacity-0 hover:bg-hover hover:text-text group-hover/row:opacity-100 focus-visible:opacity-100" aria-label={t('Remove {property}', { property: prop })}>
              <Icon name="close" size={10} />
            </button>
          </div>
        ))}
        {adding && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_20px] items-center gap-1">
            <PropertyInput value="" autoFocus list={`${list}-props`} disabled={disabled} onCommit={(next) => { setAdding(false); if (next && !(next in decl)) onChange({ ...decl, [next]: '' }) }} />
          </div>
        )}
      </div>
    </div>
  )
}

/** A property name, committed on blur or Enter (renaming a key on every keystroke would reorder rows). */
function PropertyInput({ value, list, disabled, autoFocus, onCommit }: { value: string; list: string; disabled?: boolean; autoFocus?: boolean; onCommit: (next: string) => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <Input
      size="xs"
      className="font-mono"
      spellCheck={false}
      autoFocus={autoFocus}
      list={list}
      placeholder={t('property')}
      aria-label={t('Property')}
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onCommit(draft.trim())}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        if (e.key === 'Escape') {
          setDraft(value)
          if (!value) onCommit('')
        }
      }}
    />
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
    <button ref={ref} type="button" aria-label={label} {...props} className={cn('cms-input flex h-7 w-full min-w-0 items-center gap-1.5 rounded-sm pl-2 pr-1.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-120 hover:bg-hover data-[popup-open]:border-focus disabled:opacity-50', className)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Icon name="chevrons-up-down" size={11} className="shrink-0 text-faint" />
    </button>
  )
})

const SHADOW: FieldProps['field'] = { handle: 'shadow', type: 'text', component: 'blocks-shadows', label: 'Shadow' }

const shadows = (): { label: string; value: string }[] => [
  { label: t('None'), value: 'none' },
  { label: t('Small'), value: '0 1px 2px rgb(0 0 0 / 0.06)' },
  { label: t('Medium'), value: '0 4px 16px -4px rgb(0 0 0 / 0.12)' },
  { label: t('Large'), value: '0 24px 48px -16px rgb(0 0 0 / 0.2)' },
]

const ShadowSample = ({ value }: { value: string | null }) => <span className="size-3.5 shrink-0 rounded-[3px] border border-border bg-bg" style={{ boxShadow: value ?? undefined }} />

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
          <button key={option.value} type="button" onClick={() => onChange(option.value)} className={cn('flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs transition-colors', option.value === preset?.value ? 'bg-active text-ink' : 'text-text hover:bg-hover')}>
            <ShadowSample value={option.value} />
            <span className="flex-1">{option.label}</span>
            {option.value === preset?.value && <Icon name="check" size={12} className="text-muted" />}
          </button>
        ))}
      </div>
      <div className="mt-1 border-t border-border px-1 pb-1 pt-2">
        <p className="m-0 mb-1 text-2xs font-medium text-muted">{t('Custom')}</p>
        <Fields bare fields={[SHADOW]} values={{ shadow: value && value !== 'none' ? value : '0 4px 16px 0 rgb(0 0 0 / 12%)' }} onChange={(_, v) => onChange(v ?? 'none')} />
        <button type="button" onClick={() => onChange(`${value && value !== 'none' ? `${value}, ` : ''}0 2px 8px 0 rgb(0 0 0 / 10%)`)} className="mt-1.5 flex h-6 w-full items-center justify-center gap-1 rounded-xs text-2xs text-muted hover:bg-hover hover:text-text">
          <Icon name="plus" size={11} />
          {t('Add Layer')}
        </button>
      </div>
    </Popover>
  )
}
