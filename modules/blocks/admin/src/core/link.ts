import type { FieldDef } from '@letterncms/sdk'

/** A URL field drawn with the link picker (pages, entries, anchors). */
export function linkField(def: Partial<FieldDef> & { handle: string; label: string }): FieldDef {
  return { ...def, type: 'url', component: 'link' } as FieldDef
}
