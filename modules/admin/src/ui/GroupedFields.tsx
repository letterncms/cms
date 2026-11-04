import type { FieldDef } from '@letterncms/sdk'
import { visible as fieldVisible, Fields } from './Fields'
import { Section } from './Page'
import { Switch } from './Switch'

/** Values as a form compares them: empty is empty (null, '' or []), and objects regardless of key order. */
function same(a: unknown, b: unknown): boolean {
  const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
  if (empty(a) && empty(b)) return true
  const stable = (v: unknown): unknown => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])])) : v
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b))
}

/** Whether `values` differ from what is stored: typing something and taking it back again changes nothing. */
export function changedFrom(values: Record<string, any> | null, saved: Record<string, any> | undefined): boolean {
  if (!values) return false
  return Object.keys(values).some((key) => !same(values[key], saved?.[key]))
}

/** A plain switch: drawn as a row of a settings group, its label on the left. */
const isSwitch = (field: FieldDef) => field.type === 'toggle' && !field.component && field.display !== 'checkbox'

/**
 * A settings page's fields, in runs under the heading their `section` names: the fields
 * before the first heading need none. Plugins name a field's section to put it under one.
 * A heading whose fields are all hidden (by their `if`) goes with them. Text fields stand
 * one under another; switches sit in a group, one row each, the way settings read in a list.
 */
export function GroupedFields({ fields, values, onChange, errors, context }: { fields: FieldDef[]; values: Record<string, any>; onChange: (handle: string, value: any) => void; errors: Record<string, string>; context?: Record<string, unknown> }) {
  const runs: { title?: string; fields: FieldDef[] }[] = []
  for (const field of fields) {
    const title = typeof field.section === 'string' && field.section !== '' ? field.section : undefined
    const last = runs[runs.length - 1]
    if (last && last.title === title) last.fields.push(field)
    else runs.push({ title, fields: [field] })
  }
  return (
    <div>
      {runs.map((run, i) => {
        const shown = run.fields.filter((field) => fieldVisible(field, values))
        if (!shown.length) return null
        // Consecutive switches make one group; everything else is drawn by Fields, as it is.
        const parts: { switches: boolean; fields: FieldDef[] }[] = []
        for (const field of shown) {
          const last = parts[parts.length - 1]
          if (last && last.switches === isSwitch(field)) last.fields.push(field)
          else parts.push({ switches: isSwitch(field), fields: [field] })
        }
        const body = (
          <div className="space-y-4">
            {parts.map((part, j) => part.switches ? (
              <div key={j} className="overflow-hidden rounded-lg border border-border bg-bg">
                {part.fields.map((field) => (
                  <label key={field.handle} data-field={field.handle} className="flex min-h-14 cursor-pointer items-center gap-4 px-4 py-3 [&+&]:border-t [&+&]:border-border">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-text">{field.label}</span>
                      {field.instructions && <span className="mt-0.5 block text-xs text-muted">{field.instructions}</span>}
                      {errors[field.handle] && <span className="mt-0.5 block text-xs text-danger">{errors[field.handle]}</span>}
                    </span>
                    <Switch checked={!!(values[field.handle] ?? field.default)} onChange={(v) => onChange(field.handle, v)} aria-label={field.label} />
                  </label>
                ))}
              </div>
            ) : (
              <Fields key={j} fields={part.fields} values={values} onChange={onChange} errors={errors} context={context} />
            ))}
          </div>
        )
        return <Section key={i} title={run.title}>{body}</Section>
      })}
    </div>
  )
}
