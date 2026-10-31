import type { FieldDef, PanelDef } from '@letterncms/sdk'

/** Every field has one owner. Inactive panels cannot hide fields. */
export function resolveEntryFields(fields: FieldDef[], body: string | undefined, panels: Pick<PanelDef, 'id' | 'fieldHandles'>[]) {
  const claimed = new Map<string, string>()
  let error: string | null = null
  for (const panel of panels) for (const handle of panel.fieldHandles ?? []) {
    if (claimed.has(handle)) error = `Field “${handle}” is claimed by both “${claimed.get(handle)}” and “${panel.id}”.`
    claimed.set(handle, panel.id)
  }
  const own = fields.filter((field) => field.handle !== body && !claimed.has(field.handle))
  return { error, document: own.filter((field) => (field.section ?? 'main') === 'main'), sidebar: own.filter((field) => (field.section ?? 'main') !== 'main'), claimed }
}
