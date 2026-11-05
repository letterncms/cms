import { setQuery, t, useLocation } from '@letterncms/sdk'
import { DataCalendar, StatusDot, calendarRange, useOverviewSource, type CalendarDate, type DataSelection } from '@letterncms/ui'
import { useEffect } from 'react'
import type { ListItem } from './listPrefs'

const sql = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ')

/** Source-specific filters only; geometry, paging and rendering are shared with all overviews. */
function calendarQueries(handle: string, filters: { locale: string; status: string; search?: string }, monthValue?: string, dateField: CalendarDate = 'published') {
  const range = calendarRange(monthValue)
  const field = dateField === 'published' ? 'published_at' : 'updated_at'
  return { ...range,
    dated: { collection: handle, ...filters, sort: field, perPage: 200, filters: [{ field, operator: '>=', value: sql(range.start) }, { field, operator: '<', value: sql(range.end) }] },
    undated: { collection: handle, ...filters, sort: '-updated_at', perPage: 200, filters: [{ field, operator: 'null' }] },
  }
}

export function EntriesCalendar({ handle, filters, dateField, selection, cursor, onItems }: { onItems?: (items: ListItem[]) => void; handle: string; filters: { locale: string; status: string; search?: string }; dateField: CalendarDate; selection: DataSelection<ListItem>; cursor: string | null }) {
  const { query } = useLocation()
  const { dated: datedInput, undated: undatedInput } = calendarQueries(handle, filters, query.month, dateField)
  const dated = useOverviewSource<ListItem>({ ability: 'entries/list', input: datedInput, perPage: 200 }, true)
  const undated = useOverviewSource<ListItem>({ ability: 'entries/list', input: undatedInput, perPage: 200 }, true)
  const items = [...dated.items, ...undated.items]
  const itemVersions = items.map((item) => `${item.id}:${item.version}`).join(',')
  useEffect(() => { onItems?.(items) }, [itemVersions, onItems])
  return <DataCalendar label={t('Entries')} items={items} month={query.month} onMonth={(month) => setQuery({ month })}
    date={(item) => dateField === 'published' ? item.publishedAt : item.updatedAt} rowKey={(item) => item.id} rowHref={(item) => `/content/${handle}/${item.id}`}
    title={(item) => <span className="flex min-w-0 items-center gap-1.5"><StatusDot status={item.displayStatus} label="" /><span className="truncate">{item.title || t('Untitled')}</span></span>}
    loading={dated.loading || undated.loading} stale={dated.stale || undated.stale} error={dated.error || undated.error} onRetry={() => { dated.retry(); undated.retry() }} selection={selection} cursor={cursor} />
}
