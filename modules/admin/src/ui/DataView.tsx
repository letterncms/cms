import { locale, navigate, setQuery, t, useLocation, type RecordTimestamps } from '@letterncms/sdk'
import { useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { PagePagination } from './PagePagination'
import { DataCalendar } from './DataCalendar'
import { useOverviewSource, type OverviewSource } from './overviewSource'
import { DataCard, DataGrid } from './DataGrid'
import { NoMatches } from './EmptyState'
import { QueryError } from './QueryError'
import { Fields } from './Fields'
import { DataTable, TableToolbar, flattenTree, type DataColumn, type DataSelection, type DataTree } from './DataTable'
import { OverviewControls, nextTableSort, type OverviewView } from './ViewControls'
import { useRecordNavigation } from './recordNavigation'
import { useViewPrefs, type CalendarDate, type ViewPrefs, type ViewPrefsChange } from './viewPrefs'
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
  /** Where a row opens; nothing for a row with nowhere to go. */
  rowHref?: (item: T) => string | undefined
  onRowClick?: (item: T) => void
  selected?: (item: T) => boolean
  selection?: DataSelection<T>
  actions?: (item: T) => ReactNode
  searchText?: (item: T) => string
  searchPlaceholder?: string
  toolbar?: ReactNode
  /** Drawn at the end of the toolbar, before Display: a control of the caller's that belongs with the list's view (its saved views). */
  controls?: ReactNode
  /** Drawn above the toolbar: the caller's own row for the list's views (its saved views, as tabs). */
  header?: ReactNode
  defaultView?: 'table' | 'grid' | 'calendar'
  /** Offer a calendar: for records that happen on a day (orders, events), not for settings-like lists. */
  calendar?: boolean
  /** Pictures for the cards; without them there is no grid. */
  image?: (item: T) => ReactNode
  /** The column the pictures are in: cards show them only while it is shown. */
  imageColumn?: string
  icon?: string
  sort?: string | null
  onSort?: (key: string | null) => void
  loading?: boolean
  stale?: boolean
  error?: boolean
  onRetry?: () => void
  empty: ReactNode
  /** A list read as it is (a ranked top 8): no view, column or sort choices. */
  plain?: boolean
  /** The list has an order made by hand (a tree dragged into place): its own order is called that, not "Default". */
  manual?: boolean
  /** Records that hold others, drawn as a tree in the table; `items` is its top level. */
  tree?: DataTree<T>
  /** The calendar's records for a month, by the date it is laid out by, when they load a month at a time (and those with no date). */
  calendarSource?: (date: CalendarDate, month: string | undefined) => { dated: OverviewSource; undated?: OverviewSource }
  /** The view, sort and columns, when the caller keeps them (its loading depends on them). */
  prefs?: [ViewPrefs, (change: ViewPrefsChange) => void]
}

/** Ordinary records must provide the standard metadata; wrappers supply a typed accessor. */
type DataViewProps<T> = BaseDataViewProps<T> & ([T] extends [RecordTimestamps]
  ? { dates?: (item: T) => RecordTimestamps }
  : { dates: (item: T) => RecordTimestamps })

/** Lists up to this long are read at a glance: no search, and no display menu unless it has something to add. */
export const FEW = 8

const isDate = (iso: string | null | undefined) => !!iso && Number.isFinite(Date.parse(iso))

/** Search, display preferences and selection use the same components as Content collections. */
export function DataView<T>({ id, label, items, source, pagination, columns: ownColumns, dates = (item) => item as RecordTimestamps, dateSort, rowKey, rowHref, onRowClick, selected, selection, actions, searchText, searchPlaceholder, toolbar, controls: extra, header, defaultView = 'table', calendar: offersCalendar = false, image, imageColumn, icon, sort: serverSort, onSort, loading, stale, error, onRetry, empty, plain = false, manual = false, tree, calendarSource, prefs: kept }: DataViewProps<T>) {
  // A tree's records, each before the ones it holds: what is selected, searched and shown as cards.
  const every = flattenTree(items, tree?.children)
  // Date columns and the calendar only for dates the records have.
  const has = { published: every.some((item) => isDate(dates(item).publishedAt)), updated: every.some((item) => isDate(dates(item).updatedAt)) }
  const settled = items.length > 0 || !loading
  const columns = withRecordDateColumns(ownColumns, dates, dateSort).filter((column) => !(column.id in has) || has[column.id as keyof typeof has])
  const views: OverviewView[] = ['table', ...(image ? ['grid' as const] : []), ...(offersCalendar && (has.published || has.updated || !settled) ? ['calendar' as const] : [])]
  const scope = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const own = useViewPrefs(kept ? '' : `overview.${id}`, views.includes(defaultView) ? defaultView : 'table')
  const [prefs, setPrefs] = kept ?? own
  const view = views.includes(prefs.view) ? prefs.view : 'table'
  const calendarDates = (['published', 'updated'] as const).filter((key) => has[key])
  const calendarDate = calendarDates.includes(prefs.calendarDate) ? prefs.calendarDate : calendarDates[0] ?? 'published'
  const { query: locationQuery } = useLocation()
  // A month at a time when the records load that way, otherwise every page of the source.
  const month = calendarSource?.(calendarDate, locationQuery.month)
  const dated = useOverviewSource<T>(month?.dated ?? source, view === 'calendar')
  const undated = useOverviewSource<T>(month?.undated, view === 'calendar' && !!month?.undated)
  const calendar = { items: [...dated.items, ...undated.items], loading: dated.loading || undated.loading, stale: dated.stale || undated.stale, error: dated.error || undated.error, retry: () => { dated.retry(); undated.retry() } }
  const loaded = view === 'calendar' && (source || month)
  const records = loaded ? calendar.items : every
  const busy = loaded ? calendar.loading : loading
  const failed = loaded ? calendar.error : error
  const retry = loaded ? calendar.retry : onRetry
  const sort = onSort ? serverSort ?? null : prefs.sort
  const changeSort = (key: string | null) => { setPrefs({ sort: key }); onSort?.(key) }
  // What cards show at first adds their picture and excerpt to what the table shows.
  const defaults = columns.slice(1).filter((c) => !c.hiddenByDefault || (view === 'grid' && c.cardByDefault)).map((c) => c.id)
  const shown = new Set(prefs.columns ?? defaults)
  const visible = columns.filter((c, i) => i === 0 || shown.has(c.id))
  const sortable = columns.filter((c) => onSort ? !!c.sort : !!c.value).map((c) => ({ ...c, sort: c.sort ?? c.id }))
  // A short list shows everything at once: nothing to search, and a menu only for columns of its own to add (not the dates).
  const few = (!pagination || pagination.pages <= 1) && every.length < FEW
  const changed = view !== (views.includes(defaultView) ? defaultView : 'table') || !!sort || calendarDate !== (calendarDates[0] ?? 'published') || !!locationQuery.month
    || visible.length - 1 !== defaults.length || defaults.some((c) => !shown.has(c))
  const display = !plain && (changed || !few || columns.some((c) => c.hiddenByDefault && !(c.id in has)))
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
    const to = rowHref?.(item)
    if (to) navigate(to)
    else onRowClick?.(item)
  }
  const cursor = useRecordNavigation({ scope, resetKey: `${id}:${search}:${sort}:${rows.map(rowKey).join(',')}`, selection: selection ? { ...selection, onSelect: (ids, on) => selection.onSelect(ids, on, rows) } : undefined, onOpen: rowHref || onRowClick ? openRecord : undefined, enabled: !busy && !stale })
  const state = failed ? <QueryError onRetry={retry} /> : view !== 'calendar' && !busy && rows.length === 0 ? query ? <NoMatches onClear={() => setSearch('')} /> : empty : null
  // The tree as it is, while nothing narrows or reorders it.
  const asTree = tree && !query && !(sort && !onSort) ? tree : undefined
  const pictures = !!image && (!imageColumn || shown.has(imageColumn))
  const isSelected = (item: T) => selection?.ids.has(rowKey(item)) || selected?.(item)


  const searchable = !!searchText && (!few || !!query)
  // Nothing at all yet: its empty state alone, with nothing to search, sort or switch.
  const blank = settled && !busy && !failed && view !== 'calendar' && records.length === 0 && !query && !toolbar
  const controls = <OverviewControls isTree={manual || !!tree} view={view} views={views} display={display} all={columns.slice(1)} shown={shown} sortable={sortable} sortKey={sort} onColumns={(ids) => setPrefs({ columns: ids })} onSort={changeSort}
    onView={(view) => setPrefs({ view })} calendarDate={calendarDate} calendarDates={calendarDates} onCalendarDate={(calendarDate) => setPrefs({ calendarDate })}
    onReset={changed ? () => { setPrefs({ view: null, columns: null, sort: null, calendarDate: 'published' }); onSort?.(null); setQuery({ month: null }) } : undefined}>{extra}</OverviewControls>
  const table = <DataTable label={label} columns={visible} items={asTree ? items : rows} tree={asTree} rowKey={rowKey} rowHref={rowHref} onRowClick={onRowClick} selected={isSelected} selection={selection} actions={actions} loading={loading} stale={stale} cursor={cursor} state={state} sort={sort} onSort={(column) => changeSort(nextTableSort(column.sort ?? column.id, sort, column.descFirst))} sortable={new Set(sortable.map((c) => c.id))} />

  return <div ref={scope}>
    {header}
    {!blank && (searchable || toolbar || display || (!plain && (views.length > 1 || !!extra))) && <TableToolbar>
      {searchable && <Fields bare layout="inline" className="w-full sm:w-60" fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: searchPlaceholder ?? t('Search {items}', { items: label }) }]} values={{ search }} onChange={(_, value) => setSearch(String(value ?? ''))} />}
      {toolbar}
      {!plain && controls}
    </TableToolbar>}
    {view === 'calendar' ? state ?? <DataCalendar label={label} items={rows} month={locationQuery.month} onMonth={(month) => setQuery({ month })}
      date={(item) => dates(item)[calendarDate === 'published' ? 'publishedAt' : 'updatedAt']} title={columns[0].render} status={columns.find((c) => c.status)?.status} rowKey={rowKey} rowHref={rowHref} onRowClick={onRowClick}
      selection={selection} actions={actions} cursor={cursor} loading={busy} stale={loaded ? calendar.stale : stale} /> : view === 'grid' ? state ?? <DataGrid loading={loading} stale={stale} media={pictures}>
      {rows.map((item) => <DataCard key={rowKey(item)} title={columns[0].render(item)} href={rowHref?.(item)} onClick={onRowClick ? () => onRowClick(item) : undefined} icon={icon} image={pictures ? image?.(item) : undefined} selected={isSelected(item)} active={cursor === rowKey(item)} recordId={rowKey(item)} onSelect={selection ? (on) => selection.onSelect([rowKey(item)], on, rows) : undefined} actions={actions?.(item)}>
        {visible.slice(1).filter((c) => c.card === 'text' && c.id !== imageColumn).map((c) => <div key={c.id} className="m-0 mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted">{c.render(item)}</div>)}
        <dl className="m-0 mt-3 space-y-1 text-xs text-muted">{visible.slice(1).filter((c) => c.card !== 'text' && c.id !== imageColumn).map((c) => <div key={c.id} className="flex min-w-0 gap-2"><dt className="shrink-0 text-faint">{c.label}</dt><dd className="m-0 ml-auto min-w-0 truncate">{c.render(item)}</dd></div>)}</dl>
      </DataCard>)}
    </DataGrid> : table}

    {view !== 'calendar' && pagination && <PagePagination {...pagination} />}
  </div>
}
