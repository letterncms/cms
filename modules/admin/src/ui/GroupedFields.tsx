import type { FieldDef } from '@letterncms/sdk'
import { visible as fieldVisible, Fields } from './Fields'
import { Section } from './Page'

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

/** Fields in runs under the heading their `section` names. Hidden runs leave no panel or heading. */
export function GroupedFields({ fields, values, onChange, errors, context, settings }: { fields: FieldDef[]; values: Record<string, any>; onChange: (handle: string, value: any) => void; errors: Record<string, string>; context?: Record<string, unknown>; settings: boolean }) {
  const runs: { title?: string; fields: FieldDef[] }[] = []
  for (const field of fields) {
    const title = typeof field.section === 'string' && field.section !== '' ? field.section : undefined
    const last = runs[runs.length - 1]
    if (last && last.title === title) last.fields.push(field)
    else runs.push({ title, fields: [field] })
  }
  return (
    <div>
      {runs.map((run) => {
        const shown = run.fields.filter((field) => fieldVisible(field, values))
        if (!shown.length) return null
        return (
          <Section key={run.fields[0].handle} title={run.title}>
            <Fields layout={settings ? 'settings' : 'stacked'} fields={shown} values={values} onChange={onChange} errors={errors} context={context} />
          </Section>
        )
      })}
    </div>
  )
}
