import { registry, t, useManifestIfLoaded, type FieldContext, type FieldDef } from '@letterncms/sdk'
import { useSyncExternalStore } from 'react'
import { cn } from './cn'
import { Field, FieldError } from './Field'
import { fieldControlId } from './fieldIdentity'
import { Tooltip } from './Tooltip'

export interface FieldsProps {
  fields: FieldDef[]
  values: Record<string, any>
  onChange: (handle: string, value: any) => void
  errors?: Record<string, string>
  context?: FieldContext
  disabled?: boolean
  className?: string
  /** Hide labels for single inline fields. */
  bare?: boolean
  /** `stacked` (default): labels above, a 6-column grid. `inline`: compact rows with the label left — for inspectors and toolbars. */
  layout?: 'stacked' | 'inline'
}

/** Conditional fields: `if: { otherField: value | [values] }`. */
export function visible(field: FieldDef, values: Record<string, any>): boolean {
  const rule = field.if as Record<string, unknown> | undefined
  if (!rule) return true
  return Object.entries(rule).every(([handle, expected]) => (Array.isArray(expected) ? expected.includes(values[handle]) : values[handle] === expected))
}

const widths: Record<string, string> = { full: 'col-span-6', half: 'col-span-6 md:col-span-3', third: 'col-span-6 md:col-span-2', 'two-thirds': 'col-span-6 md:col-span-4' }

/** Renders a blueprint: each field with the component registered for its type. */
export function Fields({ fields, values, onChange, errors = {}, context = {}, disabled, className, bare, layout = 'stacked' }: FieldsProps) {
  useSyncExternalStore(registry.fields.subscribe, registry.fields.version)
  // Before sign-in there is no manifest: fields then render by their own type (core types are registered at start-up).
  const manifest = useManifestIfLoaded()

  // A single field without a label needs no grid around it (a checkbox in a row, a search box).
  const controlId = (field: FieldDef) => fieldControlId(field, context.path)
  const fieldError = (field: FieldDef) => errors[[...(context.path ?? []), field.handle].join('.')]
  const accessible = (field: FieldDef): FieldDef => ({ ...field, id: controlId(field), describedBy: fieldError(field) ? `${controlId(field)}-error` : field.instructions && !bare && layout !== 'inline' ? `${controlId(field)}-help` : undefined })
  const shown = fields.filter((field) => visible(field, values))
  if (bare && layout === 'stacked' && shown.length === 1) {
    const field = shown[0]
    const type = manifest?.fieldTypes.find((ft) => ft.key === field.type)
    const Component = registry.fields.get(field.component ?? type?.component ?? field.type) ?? registry.fields.get('json')
    if (!Component) return null
    return (
      <div data-field={field.handle} className={cn(className, field.className as string | undefined)}>
        <Component field={accessible(field)} value={values[field.handle] ?? field.default ?? null} onChange={(v: unknown) => onChange(field.handle, v)} error={fieldError(field)} disabled={disabled} context={{ ...context, values, errors }} />
        {fieldError(field) && <FieldError id={`${controlId(field)}-error`}>{fieldError(field)}</FieldError>}
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <div className={cn('min-w-0', className ?? 'space-y-1')}>
        {fields.filter((field) => visible(field, values)).map((field) => {
          const type = manifest?.fieldTypes.find((ft) => ft.key === field.type)
          const Component = registry.fields.get(field.component ?? type?.component ?? field.type) ?? registry.fields.get('json')
          if (!Component) return null
          // Text choices need the panel's width; an 80px label column leaves too
          // little room in nested inspector cards. Icon groups stay inline.
          const options = Object.values(field.options ?? {})
          const segmented = field.display === 'segmented' || (field.display === 'radio' && options.length <= 4)
          const stacked = !bare && field.type === 'select' && !field.component && segmented && options.length > 2 && options.some((o) => typeof o === 'string' || (o && typeof o === 'object' && 'label' in o && o.label))
          return (
            <div data-field={field.handle} key={field.handle} className={cn('flex min-w-0', stacked ? 'flex-col items-stretch gap-1 py-0.5' : 'items-center gap-2', field.className ? (field.className as string) : 'min-h-7')}>
              {!bare && field.type !== 'toggle' && <InlineLabel field={accessible(field)} stacked={stacked} />}
              <div className={cn('min-w-0', !stacked && 'flex-1')}>
                <Component field={accessible(field)} value={values[field.handle] ?? field.default ?? null} onChange={(v: unknown) => onChange(field.handle, v)} error={fieldError(field)} disabled={disabled} context={{ ...context, values, errors }} />
                {fieldError(field) && <FieldError id={`${controlId(field)}-error`} className="mt-1">{fieldError(field)}</FieldError>}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-6 gap-x-4 gap-y-4', className)}>
      {fields.filter((field) => visible(field, values)).map((field) => {
        const type = manifest?.fieldTypes.find((ft) => ft.key === field.type)
        // A field may ask for another component than its type's (a json value with its own editor).
        const Component = registry.fields.get(field.component ?? type?.component ?? field.type) ?? registry.fields.get('json')
        if (!Component) return null
        const control = (
          <Component
            field={accessible(field)}
            value={values[field.handle] ?? field.default ?? null}
            onChange={(v: unknown) => onChange(field.handle, v)}
            error={fieldError(field)}
            disabled={disabled}
            context={{ ...context, values, errors }}
          />
        )
        return (
          <div
            key={field.handle}
            data-field={field.handle}
            className={cn(
              widths[field.width ?? 'full'] ?? widths.full,
              // A switch beside a labeled control lines up with that control, not its label.
              !bare && field.type === 'toggle' && field.display !== 'checkbox' && field.width && field.width !== 'full' && 'md:pt-8',
              field.className as string | undefined,
            )}
          >
            {bare || field.type === 'toggle' ? (
              <>
                {control}
                {fieldError(field) && <FieldError id={`${controlId(field)}-error`}>{fieldError(field)}</FieldError>}
              </>
            ) : (
              // A single select always holds a value: marking it required tells nobody anything.
              <Field label={field.label} htmlFor={controlId(field)} instructions={field.instructions} error={fieldError(field)} required={field.required && !(field.type === 'select' && !field.multiple)}>
                {control}
              </Field>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * The label of an inline row, drawn like the block inspector's: an 88px column, one control high.
 * `status: 'own'` (set here) reads in ink, and with a `reset` function on the field clicking it
 * clears the value; `'inherited'` (from a breakpoint, state or component) stays muted with a small dot.
 */
function InlineLabel({ field, stacked }: { field: FieldDef; stacked?: boolean }) {
  const status = field.status as 'own' | 'inherited' | undefined
  const reset = field.reset as (() => void) | undefined
  const className = cn('flex min-h-7 min-w-0 shrink-0 items-center gap-1 text-left text-xs', stacked ? '[overflow-wrap:anywhere]' : 'h-7 w-[88px]', status === 'own' ? 'text-ink' : 'text-muted')
  const text = <span className={cn('min-w-0', !stacked && 'truncate')}>{field.label}</span>
  if (status === 'own' && reset) {
    return (
      <Tooltip content={t('Reset {label}', { label: String(field.label ?? '') })}>
        <button type="button" onClick={reset} className={cn(className, 'decoration-faint decoration-dotted underline-offset-[3px] hover:underline')}>{text}</button>
      </Tooltip>
    )
  }
  return (
    <label htmlFor={fieldControlId(field)} className={className} title={status === 'inherited' ? t('Inherited from a larger screen, another state or the component') : field.instructions}>
      {text}
      {status === 'inherited' && <span className="size-1 shrink-0 rounded-full bg-warning" aria-hidden />}
    </label>
  )
}

