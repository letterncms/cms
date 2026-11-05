import { t, type FieldDef } from '@letterncms/sdk'
import { recordDateColumnIds } from './recordDates'

/** Shared by collection settings and entry displays so the choices stay in sync. */
const widths: Record<string, number | string> = {
  text: 180, textarea: 'minmax(160px,0.8fr)', select: 132, toggle: 80, date: 112, number: 96, entries: 180, users: 132,
  tags: 180, media: 64, url: 180, email: 180, slug: 160, color: 112,
}
const sortable = new Set(['text', 'select', 'toggle', 'date', 'number', 'url', 'email', 'slug', 'color'])
const fieldColumnId = (handle: string) => `field:${handle}`

export function entryFieldColumns(fields: FieldDef[]) {
  return fields.filter((f) => widths[f.type] && !['title', 'slug'].includes(f.handle) && f.component !== 'title' && f.component !== 'uri').map((field) => ({
    id: fieldColumnId(field.handle), label: field.label || field.handle, width: widths[field.type], field,
    sort: sortable.has(field.type) ? field.handle : undefined,
    descFirst: field.type === 'date' || field.type === 'number',
    align: field.type === 'number' ? 'end' as const : undefined,
  }))
}

export function entrySystemColumns(routable: boolean, locales: string[]) {
  return [
    ...(routable ? [{ id: 'uri', label: t('URL') }] : []),
    { id: 'status', label: t('Status') },
    ...(locales.length > 1 ? [{ id: 'translations', label: t('Languages') }] : []),
    { id: 'author', label: t('Author') }, { id: 'published', label: t('Published') }, { id: 'updated', label: t('Updated') },
  ]
}

/** The columns a collection shows until someone picks theirs: its address, status and dates, and on cards a picture and an excerpt. */
export function standardEntryColumns(routable: boolean, view = 'table', fields: FieldDef[] = []): string[] {
  const preview = view === 'grid' ? [fields.find((f) => f.type === 'media'), fields.find((f) => f.type === 'textarea' || (f.type === 'text' && !['title', 'slug'].includes(f.handle)))] : []
  return [...new Set([...(routable ? ['uri'] : []), 'status', ...recordDateColumnIds, ...preview.filter((f): f is FieldDef => !!f).map((f) => fieldColumnId(f.handle))])]
}
