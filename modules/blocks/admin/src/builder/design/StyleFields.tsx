import type { FieldDef } from '@letterncms/sdk'
import type { StyleApi, ValueStatus } from '../useStyle'
import { PanelFields } from '../controls'

/**
 * A row of the Design tab. Its handle is the CSS property it edits (a group's sub-field
 * handles are), unless `get` and `set` read and write it another way; `keys` are the
 * properties behind its status and reset (on the inline label). A row whose classes are parts
 * of a property Tailwind composes (a filter, a border's width) names what those set as `markers`.
 */
export type StyleField = FieldDef & { get?: () => unknown; set?: (v: any) => void; keys?: string[]; markers?: string[] }

/** The status of several properties as one row shows it. */
export function statusOf(s: StyleApi, keys: string[]): 'own' | 'inherited' | undefined {
  const statuses = keys.map((k) => s.status(k))
  return statuses.includes('own') ? 'own' : statuses.includes('inherited') ? 'inherited' : undefined
}

/** Style rows drawn by `<PanelFields >`, read and written at the layer being edited. Nothing can be set until the site's stylesheet is read. */
export function StyleFields({ s, fields, bare }: { s: StyleApi; fields: (StyleField | false | null | undefined)[]; bare?: boolean }) {
  const list = fields.filter(Boolean) as StyleField[]
  const values: Record<string, any> = {}
  const defs = list.map(({ get, set: _set, keys, markers, ...field }) => {
    const sub = field.fields as FieldDef[] | undefined
    const props = markers ?? keys ?? (sub ? sub.map((f) => f.handle) : [field.handle])
    values[field.handle] = get ? get() : sub ? Object.fromEntries(props.map((k) => [k, s.value(k)])) : s.value(field.handle)
    return { status: statusOf(s, props), reset: () => (markers ? s.swap(markers, null) : s.write(Object.fromEntries(props.map((k) => [k, null])))), ...field } as FieldDef
  })

  const onChange = (handle: string, v: any) => {
    const field = list.find((f) => f.handle === handle)!
    if (field.set) return field.set(v)
    if (!v || typeof v !== 'object') return s.set(handle, v)
    // A record (a group) writes the properties that changed, in one step.
    const patch = changed(values[handle] ?? {}, v)
    if (Object.keys(patch).length) s.write(patch as Record<string, string | null>)
  }

  return <PanelFields bare={bare} fields={defs} values={values} onChange={onChange} disabled={!s.engine} />
}

/** A row's status as the inline label shows it. */
export const shownStatus = (status: ValueStatus) => (status === 'none' ? undefined : status)

/** Which keys of a record changed, as a patch. */
export function changed(prev: Record<string, unknown>, next: Record<string, unknown> | null): Record<string, any> {
  return Object.fromEntries(Object.entries(next ?? {}).filter(([k, v]) => v !== prev[k]))
}
