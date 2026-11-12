import { locale, t, timeAgo, type RecordTimestamps } from '@letterncms/sdk'
import { cn } from './cn'
import { Icon } from './Icon'
import type { DataColumn } from './DataTable'

/** The same date formatting and metadata columns in every overview. */
export const recordDateColumnIds = ['published', 'updated'] as const

export function shortDate(iso: string): string {
  const date = new Date(iso)
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric', year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }).format(date)
}

export function longDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
}

/**
 * A date in a list. `wide`: it is worth a column, not a place in a phone's row (`data-wide`), where the status
 * beside it already says "Published"; a date still to come stays, since it is what the status is about.
 * No date at all leaves a phone's row too: a dash under a heading is a gap, a dash after a name is noise.
 */
export function DateCell({ iso, relative = false, wide = false }: { iso: string | null | undefined; relative?: boolean; wide?: boolean }) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return <span data-wide="" className="text-faint">—</span>
  const future = Date.parse(iso) > Date.now()
  return <time dateTime={iso} data-wide={wide && !future ? '' : undefined} className={cn('inline-flex items-center gap-1 truncate text-xs tabular-nums', future ? 'text-info' : 'text-muted')} title={longDate(iso)}>
    {future && <Icon name="clock" size={12} />}
    {relative ? timeAgo(iso) : shortDate(iso)}
  </time>
}

export function recordDateColumns<T>(dates: (item: T) => Partial<RecordTimestamps>, sort: Partial<Record<'published' | 'updated', string>> = {}): DataColumn<T>[] {
  return recordDateColumnIds.map((id) => {
    const key = id === 'published' ? 'publishedAt' : 'updatedAt'
    return {
      id, label: id === 'published' ? t('Published') : t('Updated'), width: id === 'published' ? '112px' : '96px',
      sort: sort[id], descFirst: true, hiddenByDefault: true,
      value: (item) => { const iso = dates(item)[key]; return iso && Number.isFinite(Date.parse(iso)) ? Date.parse(iso) : null },
      render: (item) => <DateCell iso={dates(item)[key]} relative={id === 'updated'} wide={id === 'published'} />,
    }
  })
}

/** Called by DataView so new screens inherit the metadata without per-screen columns. */
export function withRecordDateColumns<T>(columns: DataColumn<T>[], dates: (item: T) => Partial<RecordTimestamps>, sort?: Partial<Record<'published' | 'updated', string>>): DataColumn<T>[] {
  // A list may name the dates itself, to show them from the start.
  const own = new Map(columns.map((column) => [column.id, column]))
  return [...columns.filter((column) => !recordDateColumnIds.some((id) => column.id === id)), ...recordDateColumns(dates, sort).map((column) => own.has(column.id) ? { ...column, hiddenByDefault: own.get(column.id)!.hiddenByDefault ?? false } : column)]
}
