import type { FieldDef } from '@letterncms/sdk'

/** Form identity follows the value path, so nested names never collide with record fields. */
export function fieldControlId(field: Pick<FieldDef, 'handle' | 'id'>, path: string[] = []): string {
  return field.id ?? `f-${[...path, field.handle].map(encodeURIComponent).join('.')}`
}
