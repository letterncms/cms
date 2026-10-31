import { locale, navigate, setQuery, t, useLocation, type RecordTimestamps } from '@letterncms/sdk'
import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { PagePagination } from './PagePagination'
import { Button } from './Button'
import { DataCalendar } from './DataCalendar'
import { useOverviewSource, type OverviewSource } from './overviewSource'
import { DataCard, DataGrid } from './DataGrid'
import { EmptyState } from './EmptyState'
import { Fields } from './Fields'
import { DataTable, TableToolbar, type DataColumn, type DataSelection } from './DataTable'
import { OverviewControls, nextTableSort } from './ViewControls'
import { useRecordNavigation } from './recordNavigation'
import { useViewPrefs } from './viewPrefs'
import { withRecordDateColumns } from './recordDates'

interface BaseDataViewProps<T> {
  id: string
  label: string
  items: T[]
  /** Required for paginated lists: Calendar loads every matching page through the same cache. */
  source?: OverviewSource
  pagination?: ComponentProps<typeof PagePagination>
  columns: DataColumn<T>[]
  /** Only advertise server sorting when the endpoint supports it. */
  dateSort?: Partial<Record<'published' | 'updated', string>>
  rowKey: (item: T) => string
  rowHref?: (item: T) => string
  onRowClick?: (item: T) => void
  selected?: (item: T) => boolean
  selection?: DataSelection<T>
  actions?: (item: T) => ReactNode
  searchText?: (item: T) => string
  searchPlaceholder?: string
  toolbar?: ReactNode
  defaultView?: 'table' | 'grid' | 'calendar'
  image?: (item: T) => ReactNode
  icon?: string
  sort?: string | null
  onSort?: (key: string | null) => void
  loading?: boolean
  stale?: boolean
  error?: boolean
  onRetry?: () => void
  empty: ReactNode
}

/** Ordinary records must provide the standard metadata; wrappers supply a typed accessor. */
type DataViewProps<T> = BaseDataViewProps<T> & ([T] extends [RecordTimestamps]
  ? { dates?: (item: T) => RecordTimestamps }
  : { dates: (item: T) => RecordTimestamps })

/** Search, display preferences and selection use the same components as Content collections. */
export function DataView<T>({ id, label, items, source, pagination, columns: ownColumns, dates = (item) => item as RecordTimestamps, dateSort, rowKey, rowHref, onRowClick, selected, selection, actions, searchText, searchPlaceholder, toolbar, defaultView = 'table', image, icon, sort: serverSort, onSort, loading, stale, error, onRetry, empty }: DataViewProps<T>) {
  const columns = withRecordDateColumns(ownColumns, dates, dateSort)
  const scope = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [prefs, setPrefs] = useViewPrefs(`overview.${id}`, defaultView)
  const view = prefs.view
  const { query: locationQuery } = useLocation()
  const calendar = useOverviewSource<T>(source, view === 'calendar')
  const records = view === 'calendar' && source ? calendar.items : items
  const busy = view === 'calendar' && source ? calendar.loading : loading
  const failed = view === 'calendar' && source ? calendar.error : error
  const retry = view === 'calendar' && source ? calendar.retry : onRetry
  const sort = onSort ? serverSort ?? null : prefs.sort
  const changeSort = (key: string | null) => { setPrefs({ sort: key }); onSort?.(key) }
  const shown = new Set(prefs.columns ?? columns.slice(1).filter((c) => !c.hiddenByDefault).map((c) => c.id))
  const visible = columns.filter((c, i) => i === 0 || shown.has(c.id))
  const sortable = columns.filter((c) => onSort ? !!c.sort : !!c.value).map((c) => ({ ...c, sort: c.sort ?? c.id }))
  const query = search.trim().toLocaleLowerCase(locale())
  const filtered = searchText && query ? records.filter((item) => searchText(item).toLocaleLowerCase(locale()).includes(query)) : records
  const column = columns.find((c) => (c.sort ?? c.id) === sort?.replace(/^-/, ''))
  const rows = !onSort && column?.value ? [...filtered].sort((a, b) => {
    const x = column.value!(a), y = column.value!(b)
    if (x == null || x === '') return y == null || y === '' ? 0 : 1
    if (y == null || y === '') return -1
    const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), locale(), { numeric: true })
    return sort?.startsWith('-') ? -order : order
  }) : filtered
  const openRecord = (key: string) => {
    const item = rows.find((item) => rowKey(item) === key)
    if (!item) return
    if (rowHref) navigate(rowHref(item))
    else onRowClick?.(item)
  }
  const cursor = useRecordNavigation({ scope, resetKey: `${id}:${search}:${sort}:${rows.map(rowKey).join(',')}`, selection: selection ? { ...selection, onSelect: (ids, on) => selection.onSelect(ids, on, rows) } : undefined, onOpen: rowHref || onRowClick ? openRecord : undefined, enabled: !busy && !stale })
  const state = failed ? <EmptyState icon="warning" title={t('Could not load data')} action={retry && <Button onClick={retry}>{t('Retry')}</Button>} /> : view !== 'calendar' && !busy && rows.length === 0 ? query ? <EmptyState icon="search" title={t('No matches')} action={<Button onClick={() => setSearch('')}>{t('Clear Search')}</Button>} /> : empty : null
  const isSelected = (item: T) => selection?.ids.has(rowKey(item)) || selected?.(item)


  return <div ref={scope}>
    <TableToolbar>
      {searchText && <Fields bare layout="inline" className="w-full sm:w-64" fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: searchPlaceholder ?? t('Search…') }]} values={{ search }} onChange={(_, value) => setSearch(String(value ?? ''))} />}
      {toolbar}
      <OverviewControls view={view} all={columns.slice(1)} shown={shown} sortable={sortable} sortKey={sort} onColumns={(ids) => setPrefs({ columns: ids })} onSort={changeSort}
        onView={(view) => setPrefs({ view })} calendarDate={prefs.calendarDate} onCalendarDate={(calendarDate) => setPrefs({ calendarDate })}
        onReset={() => { setPrefs({ view: null, columns: null, sort: null, calendarDate: 'published' }); onSort?.(null); setQuery({ month: null }) }} />
    </TableToolbar>
    {view === 'calendar' ? state ?? <DataCalendar label={label} items={rows} month={locationQuery.month} onMonth={(month) => setQuery({ month })}
      date={(item) => dates(item)[prefs.calendarDate === 'published' ? 'publishedAt' : 'updatedAt']} title={columns[0].render} rowKey={rowKey} rowHref={rowHref} onRowClick={onRowClick}
      selection={selection} actions={actions} cursor={cursor} loading={busy} stale={source ? calendar.stale : stale} /> : view === 'grid' ? state ?? <DataGrid loading={loading} stale={stale} media={!!image}>
      {rows.map((item) => <DataCard key={rowKey(item)} title={columns[0].render(item)} href={rowHref?.(item)} onClick={onRowClick ? () => onRowClick(item) : undefined} icon={icon} image={image?.(item)} selected={isSelected(item)} active={cursor === rowKey(item)} recordId={rowKey(item)} onSelect={selection ? (on) => selection.onSelect([rowKey(item)], on, rows) : undefined} actions={actions?.(item)}>
        <dl className="m-0 mt-3 space-y-1 text-xs text-muted">{visible.slice(1).map((c) => <div key={c.id} className="flex min-w-0 gap-2"><dt className="shrink-0 text-faint">{c.label}</dt><dd className="m-0 ml-auto min-w-0 truncate">{c.render(item)}</dd></div>)}</dl>
      </DataCard>)}
    </DataGrid> : <DataTable label={label} columns={visible} items={rows} rowKey={rowKey} rowHref={rowHref} onRowClick={onRowClick} selected={isSelected} selection={selection} actions={actions} loading={loading} stale={stale} cursor={cursor} state={state} sort={sort} onSort={(column) => changeSort(nextTableSort(column.sort ?? column.id, sort, column.descFirst))} sortable={new Set(sortable.map((c) => c.id))} />}

    {view !== 'calendar' && pagination && <PagePagination {...pagination} />}
  </div>
}
