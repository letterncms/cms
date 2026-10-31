import type { EntryCapabilities, EntrySummary } from '@letterncms/sdk'

/** The editor, row menus, bulk bar and shortcuts share one capability policy. null means a new entry. */
export function entryActionAvailability(can: EntryCapabilities | undefined, entry?: Pick<EntrySummary, 'status'> | null) {
  const existing = entry !== null
  return {
    create: !!can?.create,
    edit: !!(existing ? can?.edit : can?.create),
    duplicate: existing && !!can?.create,
    delete: existing && !!can?.delete,
    publish: !!can?.publish && (existing || !!can?.create),
    unpublish: existing && !!can?.publish && (!entry || entry.status === 'published'),
    restore: existing && !!can?.edit,
    discard: existing && !!can?.edit,
    move: existing && !!can?.edit && (!entry || entry.status !== 'published' || !!can?.publish),
  }
}
