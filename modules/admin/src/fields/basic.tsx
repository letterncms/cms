import { fieldControlId } from '../ui/fieldIdentity'
import { t, type FieldProps } from '@letterncms/sdk'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Checkbox, IconButton, Input, Segmented, Select, Switch, Textarea, cn } from '../ui'
import { slugify } from '../ui/slugify'
import { formatDateTimeInZone, parseDateTimeInZone } from '../ui/dateTime'

/** Options every text-like field understands, for any form (sign-in, search, settings…). */
function inputProps(field: FieldProps['field']) {
  return {
    id: fieldControlId(field),
    placeholder: (field.placeholder as string) ?? '',
    icon: field.icon as string | undefined,
    size: field.size as 'xs' | 'sm' | 'md' | 'lg' | undefined,
    autoFocus: field.autofocus === true,
    autoComplete: field.autocomplete as string | undefined,
    inputMode: field.inputmode as 'numeric' | 'text' | undefined,
    className: cn(!!field.mono && 'font-mono'),
    // Named for assistive tech even when drawn without a visible label (bare).
    'aria-label': field.label || undefined,
    'aria-describedby': field.describedBy as string | undefined,
  }
}

export function TextField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  // Secrets (API keys, passwords) never show on screen and are not offered to the browser's autofill.
  const secret = field.secret === true
  const props = inputProps(field)
  // `commit: 'blur'` keeps typing local and saves on blur or Enter (Escape restores) — for values each keystroke would re-render, like a canvas.
  const onBlur = field.commit === 'blur'
  const [draft, setDraft] = useState(value ?? '')
  useEffect(() => setDraft(value ?? ''), [value])
  const commit = () => draft !== (value ?? '') && onChange(draft)
  return (
    <Input
      {...props}
      type={secret ? 'password' : 'text'}
      autoComplete={props.autoComplete ?? (secret ? 'new-password' : undefined)}
      spellCheck={secret || field.mono ? false : undefined}
      list={field.list as string | undefined}
      value={onBlur ? draft : (value ?? '')}
      onChange={(e) => (onBlur ? setDraft(e.target.value) : onChange(e.target.value))}
      onBlur={onBlur ? commit : undefined}
      onKeyDown={
        onBlur
          ? (e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              if (e.key === 'Escape') setDraft(value ?? '')
            }
          : undefined
      }
      maxLength={(field.max as number) ?? 500}
      invalid={!!error}
      disabled={disabled}
    />
  )
}

export function TextareaField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  return <Textarea id={fieldControlId(field)} value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={(field.rows as number) ?? 3} placeholder={(field.placeholder as string) ?? ''} autoFocus={field.autofocus === true} invalid={!!error} disabled={disabled} className={cn(!!field.mono && 'font-mono text-xs')} />
}

export function CodeField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  return <Textarea id={fieldControlId(field)} value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={(field.rows as number) ?? 8} placeholder={(field.placeholder as string) ?? ''} spellCheck={false} invalid={!!error} disabled={disabled} className="font-mono text-xs leading-5" />
}

export function MarkdownField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  return (
    <Textarea
      id={fieldControlId(field)}
      aria-describedby={field.describedBy as string | undefined}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      rows={10}
      invalid={!!error}
      disabled={disabled}
      placeholder={t('Write in Markdown…')}
      className="font-mono text-[13px] leading-[22px]"
    />
  )
}

export function NumberField({ field, value, onChange, error, disabled }: FieldProps<number | null>) {
  if (field.display === 'slider') return <SliderField field={field} value={value} onChange={onChange} error={error} disabled={disabled} context={{}} />
  return (
    <Input
      {...inputProps(field)}
      type="number"
      inputMode={field.decimals ? 'decimal' : 'numeric'}
      step={field.step as number | undefined ?? (field.decimals ? 'any' : 1)}
      min={field.min as number | undefined}
      max={field.max as number | undefined}
      suffix={field.suffix as string | undefined}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      invalid={!!error}
      disabled={disabled}
      className={cn(!field.size && 'max-w-48', !!field.mono && 'font-mono')}
    />
  )
}

/**
 * `display: 'slider'` — a number on a track: min, max, step; `neutral` is the value that
 * means "not set" (choosing it clears the field); `input: false`
 * hides the number box beside it (when the owner draws its own).
 */
function SliderField({ field, value, onChange, disabled }: FieldProps<number | null>) {
  const min = (field.min as number | undefined) ?? 0
  const max = (field.max as number | undefined) ?? 100
  const step = (field.step as number | undefined) ?? 1
  const neutral = field.neutral as number | undefined
  const current = value ?? neutral ?? min
  const pct = (n: number) => (Math.min(max, Math.max(min, n)) - min) / (max - min || 1) * 100
  // The fill grows from the neutral value when it sits inside the range (0 on -1…1), else from the start.
  const from = neutral !== undefined && neutral > min && neutral < max ? pct(neutral) : 0
  const to = pct(current)
  const set = (n: number) => onChange(neutral !== undefined && n === neutral ? null : n)
  return (
    <div className={cn('flex min-w-0 flex-1 items-center gap-2', field.size === 'xs' ? 'h-6' : 'h-8')}>
      <input
        type="range"
        id={field.input === false ? fieldControlId(field) : undefined}
        aria-label={field.label || undefined}
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(e) => set(Number(e.target.value))}
        className="cms-range min-w-0 flex-1"
        style={{ '--cms-range-from': `${Math.min(from, to)}%`, '--cms-range-to': `${Math.max(from, to)}%` } as CSSProperties}
      />
      {field.input !== false && (
        <Input
          {...inputProps(field)}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value ?? ''}
          placeholder={neutral !== undefined ? String(neutral) : ''}
          onChange={(e) => (e.target.value === '' ? onChange(null) : set(Number(e.target.value)))}
          disabled={disabled}
          className="w-14 shrink-0 tabular-nums"
        />
      )}
    </div>
  )
}

/** A yes/no value: a switch with its label, or `display: checkbox` for lists of choices and selection. */
export function ToggleField({ field, value, onChange, disabled }: FieldProps<boolean>) {
  if (field.display === 'checkbox') {
    return <Checkbox checked={!!value} indeterminate={field.indeterminate === true} onChange={onChange} disabled={disabled} label={field.label ? <span>{field.label}{field.instructions ? <span className="text-xs text-faint"> {field.instructions as string}</span> : null}</span> : undefined} />
  }
  return (
    <div className="flex items-start gap-3">
      <Switch checked={!!value} onChange={onChange} disabled={disabled} size={field.size === 'sm' || field.size === 'xs' ? 'sm' : 'md'} />
      <div className="-mt-px">
        <ToggleLabel field={field} />
        {field.instructions && <div className="text-xs text-faint">{field.instructions}</div>}
      </div>
    </div>
  )
}

/** Options as `{value: label}`, a list of values, or a list of `{value, label, icon, title}`. */
/** A toggle's label carries `status` and `reset` like an inline row's label does. */
function ToggleLabel({ field }: { field: FieldProps['field'] }) {
  const status = field.status as 'own' | 'inherited' | undefined
  const className = cn('font-medium', field.size === 'xs' ? 'text-2xs' : 'text-sm', status === 'own' && 'text-focus', status === 'inherited' && 'text-warning')
  const reset = field.reset as (() => void) | undefined
  if (status === 'own' && reset) return <button type="button" onClick={reset} className={cn(className, 'text-left hover:underline')} title={t('Reset {label}', { label: field.label })}>{field.label}</button>
  return <div className={className}>{field.label}</div>
}

function options(field: FieldProps['field']): { value: string; label: string; icon?: string; title?: string }[] {
  const raw = (field.options ?? {}) as Record<string, string> | (string | { value: string; label?: string; icon?: string; title?: string })[]
  if (!Array.isArray(raw)) return Object.entries(raw).map(([value, label]) => ({ value, label: String(label) }))
  return raw.map((o) => (typeof o === 'object' ? { ...o, value: String(o.value), label: o.label ?? '' } : { value: String(o), label: String(o) }))
}

export function SelectField({ field, value, onChange, error, disabled }: FieldProps<any>) {
  const listed = options(field)
  // A stored value that is no longer offered stays visible (and selectable) rather than vanishing.
  const opts = !field.multiple && value !== null && value !== undefined && value !== '' && !listed.some((o) => o.value === String(value)) ? [{ value: String(value), label: String(value) }, ...listed] : listed

  if (field.multiple) {
    const selected: string[] = Array.isArray(value) ? value : []
    return (
      <div className="flex flex-wrap gap-1.5">
        {opts.map((o) => {
          const on = selected.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(on ? selected.filter((v) => v !== o.value) : [...selected, o.value])}
              className={cn('h-7 rounded-sm border px-2.5 text-sm transition-colors', on ? 'border-ink bg-ink text-ink-contrast' : 'border-border-strong bg-bg hover:bg-hover')}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (field.display === 'segmented' || (field.display === 'radio' && opts.length <= 4)) {
    // Clicking the chosen segment again clears it, unless a value is required.
    return <Segmented id={fieldControlId(field)} aria-label={field.label} disabled={disabled} value={(value ?? '') as string} onChange={(v) => onChange(v === value && !field.required ? null : v)} options={opts} size={field.size === 'xs' ? 'xs' : 'sm'} block={field.block === true} placeholder={typeof field.placeholder === 'string' ? field.placeholder : undefined} />
  }

  // Numbers stay numbers (an HTTP status, a level): `numeric: true` on the field.
  const numeric = field.numeric === true
  return (
    <Select
      id={fieldControlId(field)}
      aria-label={field.label}
      aria-describedby={field.describedBy as string | undefined}
      value={value === null || value === undefined ? null : String(value)}
      onChange={(v) => onChange(numeric && v !== null ? Number(v) : v)}
      options={opts}
      placeholder={field.placeholder as string | undefined}
      size={field.size === 'xs' ? 'xs' : field.size === 'sm' ? 'sm' : 'md'}
      invalid={!!error}
      disabled={disabled}
      clearable={!field.required}
    />
  )
}

const ICONS = ['page', 'article', 'collection', 'file-text', 'newspaper', 'image', 'users', 'building', 'tag', 'calendar', 'star', 'box', 'map-pin', 'megaphone', 'chat', 'globe', 'layout', 'code', 'phone', 'share']

/** An icon name, picked from `options` or a common set. */
export function IconField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const choices = Array.isArray(field.options) ? (field.options as string[]) : ICONS
  const icons = value && !choices.includes(value) ? [value, ...choices] : choices
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={field.label}>
      {icons.map((i) => (
        <IconButton key={i} icon={i} label={i} size="sm" role="radio" aria-checked={value === i} variant={value === i ? 'secondary' : 'ghost'} active={value === i} disabled={disabled} onClick={() => onChange(i)} />
      ))}
    </div>
  )
}

export function DateField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const withTime = !!field.time
  const timeZone = typeof field.timezone === 'string' ? field.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone
  const format = (instant: string | null) => instant ? withTime ? formatDateTimeInZone(instant, timeZone) : instant.slice(0, 10) : ''
  const [local, setLocal] = useState(() => format(value))
  const [localError, setLocalError] = useState<string | null>(null)
  const emitted = useRef(value)
  const previousZone = useRef(timeZone)
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (value === emitted.current && previousZone.current === timeZone) return
    emitted.current = value
    previousZone.current = timeZone
    setLocal(format(value))
    setLocalError(null)
  }, [value, timeZone, withTime])
  useEffect(() => { input.current?.setCustomValidity(localError ?? '') }, [localError])
  return (
    <div className="max-w-60">
    <Input
      ref={input}
      id={fieldControlId(field)}
      aria-label={field.label || undefined}
      aria-describedby={localError ? `${fieldControlId(field)}-local-error` : error ? `${fieldControlId(field)}-error` : undefined}
      type={withTime ? 'datetime-local' : 'date'}
      value={local}
      onChange={(e) => {
        const next = e.target.value
        setLocal(next)
        const parsed: ReturnType<typeof parseDateTimeInZone> = next && withTime ? parseDateTimeInZone(next, timeZone) : { value: next || null }
        setLocalError(parsed.error === 'nonexistent' ? t('This time does not exist in {timezone} because the clocks change. Choose another time.', { timezone: timeZone }) : parsed.error === 'ambiguous' ? t('This time occurs twice in {timezone} because the clocks change. Choose another time.', { timezone: timeZone }) : parsed.error ? t('Enter a valid date and time.') : null)
        emitted.current = parsed.value
        onChange(parsed.value)
      }}
      invalid={!!error || !!localError}
      disabled={disabled}
      required={!!field.required}
    />
    {withTime && typeof field.timezone === 'string' && <p className="m-0 mt-1 text-xs text-faint">{timeZone}</p>}
    {localError && <p id={`${fieldControlId(field)}-local-error`} role="alert" className="m-0 mt-1 text-xs text-danger">{localError}</p>}
    </div>
  )
}

export function SlugField({ field, value, onChange, error, disabled, context }: FieldProps<string | null>) {
  const title = (context.values?.title as string) ?? context.entry?.title ?? ''
  return (
    <Input
      id={fieldControlId(field)}
      aria-describedby={field.describedBy as string | undefined}
      value={value ?? ''}
      onChange={(e) => onChange(slugify(e.target.value, true))}
      onBlur={(e) => onChange(slugify(e.target.value))}
      invalid={!!error}
      disabled={disabled}
      className="font-mono"
      suffix={
        title && (
          <button type="button" className="rounded-xs px-1.5 py-0.5 hover:bg-hover hover:text-text" onClick={() => onChange(slugify(title))}>
            {t('From Title')}
          </button>
        )
      }
    />
  )
}

export function UrlField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const props = inputProps(field)
  return <Input {...props} type="text" inputMode="url" icon={props.icon ?? 'link'} placeholder={props.placeholder || t('https://… or /page')} value={value ?? ''} onChange={(e) => onChange(e.target.value)} invalid={!!error} disabled={disabled} />
}

export function EmailField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const props = inputProps(field)
  return <Input {...props} type="email" icon={props.icon ?? 'mail'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} invalid={!!error} disabled={disabled} />
}

export function ColorField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const hex = value && value.startsWith('#') ? value : '#000000'
  // Any CSS color shows as itself; token references and empty values show a checkerboard.
  const swatch = value && typeof CSS !== 'undefined' && CSS.supports('color', value) ? value : 'repeating-conic-gradient(var(--cms-sunken) 0 25%, var(--cms-bg) 0 50%) 0 0/8px 8px'
  const small = field.size === 'sm' || field.size === 'xs'
  return (
    <div className={cn('flex items-center gap-2', !small && 'max-w-60')}>
      <label className={cn('relative shrink-0 overflow-hidden rounded-sm border border-border-strong', small ? 'size-7' : 'size-8')} style={{ background: swatch }}>
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('Pick a Color')} />
      </label>
      <Input {...inputProps(field)} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder={(field.placeholder as string) || '#ff5a1f'} invalid={!!error} disabled={disabled} className="font-mono" />
    </div>
  )
}

export function JsonField({ field, value, onChange, error, disabled }: FieldProps<unknown>) {
  return (
    <Textarea
      id={fieldControlId(field)}
      defaultValue={value === null || value === undefined ? '' : JSON.stringify(value, null, 2)}
      onBlur={(e) => {
        try {
          onChange(e.target.value.trim() === '' ? null : JSON.parse(e.target.value))
        } catch {
          /* keep invalid text until fixed */
        }
      }}
      rows={6}
      spellCheck={false}
      invalid={!!error}
      disabled={disabled}
      className="font-mono text-xs"
    />
  )
}
