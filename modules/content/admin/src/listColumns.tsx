import { locale, t, type CollectionSummary, type FieldDef } from '@letterncms/sdk'
import { Avatar, AvatarStack, Icon, StatusDot, cn, entryFieldColumns, standardEntryColumns, recordDateColumns, DateCell, shortDate, longDate } from '@letterncms/ui'
import type { ReactNode } from 'react'
import type { ListItem } from './listPrefs'
import type { CollectionDef } from './useCollection'

export interface MediaThumb {
  id: string
  thumb: string | null
  url: string
  alt?: string | null
  kind?: string
}

export interface CellContext {
  /** Media looked up for the rows on screen, by id. */
  media: Map<string, MediaThumb>
  locales: string[]
}

export interface Column {
  id: string
  label: string
  /** Track width in the table grid: pixels, or a CSS track for columns that may grow. */
  width: number | string
  /** What entries/list sorts by; absent when the column cannot be sorted. */
  sort?: string
  /** Dates and numbers are most useful newest/largest first. */
  descFirst?: boolean
  align?: 'end'
  /** The blueprint field a data column shows. */
  field?: FieldDef
  render: (item: ListItem, ctx: CellContext) => ReactNode
}

export { fieldColumnId } from '@letterncms/ui'

/** Every column a collection's table can show, in display order (the title is always first and not listed). */
export function availableColumns(summary: CollectionSummary, collection: CollectionDef | undefined, locales: string[]): Column[] {
  const columns: Column[] = []
  if (summary.routable) columns.push({ id: 'uri', label: t('URL'), width: 'minmax(120px,0.6fr)', sort: 'uri', render: (e) => e.uri && <span className="block truncate font-mono text-xs text-faint">{e.uri}</span> })
  columns.push({ id: 'status', label: t('Status'), width: 104, sort: 'status', render: (e) => <StatusDot status={e.displayStatus} /> })

  for (const column of entryFieldColumns(collection?.resolvedFields ?? collection?.fields ?? [])) {
    const field = column.field
    columns.push({
      ...column,
      render: (e, ctx) => <FieldValue field={field} value={e.values?.[field.handle]} ctx={ctx} />,
    })
  }

  if (locales.length > 1) columns.push({ id: 'translations', label: t('Languages'), width: 24 + locales.length * 26, render: (e, ctx) => <Translations item={e} locales={ctx.locales} /> })
  columns.push({ id: 'author', label: t('Author'), width: 132, sort: 'author_id', render: (e) => e.author ? <AuthorCell person={e.author} /> : <span className="text-xs text-faint">{e.authorId ? t('Unavailable person') : t('Unassigned')}</span> })
  columns.push(...recordDateColumns<ListItem>((item) => item, { published: 'published_at', updated: 'updated_at' }).map((column) => ({ ...column, width: column.width! })))
  return columns
}

/** Shared defaults, falling back to automatic columns and the legacy `listing` fields. */
export function defaultColumns(summary: CollectionSummary, collection: CollectionDef | undefined, view = 'table'): string[] {
  return collection?.default_columns ?? standardEntryColumns(summary.routable, collection?.listing, view, collection?.resolvedFields ?? collection?.fields)
}

/** Columns that hold media, for thumbnails in cells and on cards. */
export function mediaFields(collection: CollectionDef | undefined): FieldDef[] {
  return (collection?.resolvedFields ?? collection?.fields ?? []).filter((f) => f.type === 'media')
}

/** The first text-like field: a card's excerpt. */
export function excerptField(collection: CollectionDef | undefined): FieldDef | undefined {
  return (collection?.resolvedFields ?? collection?.fields ?? []).find((f) => f.type === 'textarea' || (f.type === 'text' && !['title', 'slug'].includes(f.handle)))
}

export function mediaIds(value: unknown): string[] {
  return (Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []).filter((v): v is string => typeof v === 'string' && v !== '')
}

/** The picture for a media value: a looked-up thumbnail, or the URL itself. */
export function mediaSource(id: string, ctx: CellContext): string | null {
  const item = ctx.media.get(id.toLowerCase())
  if (item) return item.thumb ?? (item.kind === 'image' ? item.url : null)
  return id.startsWith('/') || id.startsWith('http') ? id : null
}

export { shortDate, longDate }

function AuthorCell({ person }: { person: { name: string; initials: string; avatar: string | null } }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
      <Avatar name={person.name} initials={person.initials} src={person.avatar} size={18} />
      <span className="truncate">{person.name}</span>
    </span>
  )
}

function Translations({ item, locales }: { item: ListItem; locales: string[] }) {
  const present = new Set(item.translations ?? [item.locale])
  return (
    <span className="flex items-center gap-1">
      {locales.map((code) => (
        <span
          key={code}
          title={present.has(code) ? undefined : t('Not translated')}
          className={cn('inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-[10px] uppercase', present.has(code) ? 'bg-sunken text-text' : 'text-faint/70')}
        >
          {code}
        </span>
      ))}
    </span>
  )
}

function optionLabel(field: FieldDef, value: unknown): string {
  const raw = field.options as Record<string, string> | (string | { value: string; label?: string })[] | undefined
  if (raw && !Array.isArray(raw) && typeof raw === 'object') return raw[String(value)] ?? String(value)
  if (Array.isArray(raw)) {
    const match = raw.find((o) => (typeof o === 'object' ? String(o.value) : String(o)) === String(value))
    if (match && typeof match === 'object') return match.label ?? String(value)
  }
  return String(value)
}

/** A data value as a cell: compact, one line, per type. */
export function FieldValue({ field, value, ctx }: { field: FieldDef; value: any; ctx: CellContext }) {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null

  switch (field.type) {
    case 'toggle':
      return value ? <Icon name="check" size={14} className="text-text" aria-label={t('Yes')} /> : null
    case 'number':
      return <span className="block truncate text-right text-xs tabular-nums text-text">{Number(value).toLocaleString(locale())}</span>
    case 'date':
      return <DateCell iso={String(value)} />
    case 'select': {
      const labels = (Array.isArray(value) ? value : [value]).map((v) => optionLabel(field, v))
      return <span className="block truncate text-xs text-text">{labels.join(', ')}</span>
    }
    case 'tags':
      return <Chips labels={(Array.isArray(value) ? value : [value]).map(String)} />
    case 'entries':
      return <Chips labels={(value as { title: string }[]).map((e) => e.title)} />
    case 'users': {
      const people = value as { name: string; initials: string; avatar: string | null }[]
      return people.length === 1 ? <AuthorCell person={people[0]} /> : <AvatarStack people={people} size={18} max={3} />
    }
    case 'media': {
      const ids = mediaIds(value)
      const src = mediaSource(ids[0], ctx)
      return (
        <span className="flex items-center gap-1">
          <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint">
            {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : <Icon name="file" size={12} />}
          </span>
          {ids.length > 1 && <span className="text-2xs text-faint">+{ids.length - 1}</span>}
        </span>
      )
    }
    case 'color':
      return (
        <span className="flex items-center gap-1.5 text-xs">
          <span className="size-3 shrink-0 rounded-full border border-border" style={{ background: String(value) }} />
          <span className="truncate font-mono text-muted">{String(value)}</span>
        </span>
      )
    case 'slug':
    case 'url':
    case 'email':
      return <span className="block truncate font-mono text-xs text-muted">{String(value)}</span>
    default:
      return <span className={cn('block truncate text-xs', field.type === 'textarea' ? 'text-muted' : 'text-text')}>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
  }
}

/** Up to two small labels and a count of the rest. */
function Chips({ labels }: { labels: string[] }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      {labels.slice(0, 2).map((label, i) => (
        <span key={i} className="inline-flex h-5 min-w-0 shrink items-center rounded-xs bg-sunken px-1.5 text-2xs text-text">
          <span className="truncate">{label}</span>
        </span>
      ))}
      {labels.length > 2 && <span className="shrink-0 text-2xs text-faint">+{labels.length - 2}</span>}
    </span>
  )
}
