import { getManifest, prefetchAbility, type Manifest, batch, invalidate, navigate, plural, setQuery, t, useAbility, useLocation, useManifest, type Page as PageData, type SurfaceComponentProps } from '@letterncms/sdk'
import { Button, EmptyState, NoMatches, NotFoundState, QueryError, Fields, entryActionAvailability, Icon, IconButton, PagePagination, OverviewControls, SelectionBar, nextTableSort, confirm, toast, useRecordNavigation, useShortcut, loadOverviewSource } from '@letterncms/ui'
import { useEffect, useMemo, useState } from 'react'
import { BuiltinPages, type BuiltinGroup } from './BuiltinPages'
import { calendarQueries, EntriesCalendar } from './EntriesCalendar'
import { EntriesGrid } from './EntriesGrid'
import { EntriesTable, flatten, hasChildren, type TableSort } from './EntriesTable'
import { availableColumns, defaultColumns, excerptField, mediaFields, mediaIds, type CellContext, type Column, type MediaThumb } from './listColumns'
import { readListPrefs, useListPrefs, type ListPrefs, type ListItem, type ListView } from './listPrefs'
import { useCollection, type CollectionDef } from './useCollection'

/** "Deutsch" for "de", in the language itself. */
export function languageName(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1)
  } catch {
    return code
  }
}

/** The screen and its navigation loader share the exact view, columns and query input. */
function listState(manifest: Manifest, handle: string, collection: CollectionDef | undefined, prefs: ListPrefs, query: Record<string, string>) {
  const summary = manifest.collections.find((c) => c.handle === handle)
  const locales = manifest.site.locales
  const locale = locales.includes(query.locale ?? '') ? query.locale! : manifest.site.defaultLocale
  const search = query.q ?? ''
  const status = query.status ?? 'any'
  const page = Number(query.page ?? 1)
  const isTree = summary?.structure === 'tree'
  const dated = summary?.structure === 'dated'
  // Grid for collections with pictures, Calendar for ones that happen on a day.
  const views: ListView[] = ['table', ...(mediaFields(collection).length > 0 || summary?.defaultView === 'grid' ? ['grid' as const] : []), ...(dated || summary?.defaultView === 'calendar' ? ['calendar' as const] : [])]
  const view = views.includes(prefs.view) ? prefs.view : 'table'

  // Columns: everything the collection offers, the ones this person shows, in a fixed order.
  const all = summary ? availableColumns(summary, collection, locales) : []
  const shown = new Set(prefs.columns ?? (summary ? defaultColumns(summary, collection, view) : []))
  const columns = all.filter((c) => shown.has(c.id))
  const sortable = [titleColumn(), ...all.filter((c) => c.sort)]

  // Sort: the person's pick, or the collection's own order (the tree, for pages).
  const sortKey = prefs.sort && sortable.some((c) => c.sort === prefs.sort!.replace(/^-/, '')) ? prefs.sort : null
  const ownSort = isTree ? null : (collection?.sort ?? (dated ? '-published_at' : 'title'))
  const filtered = !!search || status !== 'any'
  const showTree = isTree && !sortKey && !filtered && view !== 'calendar'

  const fields = [...new Set(columns.filter((c) => c.field).map((c) => c.field!.handle))].sort()

  return { all, shown, columns, sortable, sortKey, ownSort, isTree, view, views, showTree, filtered, fields, locale,
    input: { collection: handle, locale, search: search || undefined, status, page, perPage: (manifest.config?.content?.perPage as number | undefined) ?? 50, sort: sortKey ?? undefined, fields },
  }
}

export async function loadEntriesList(handle: string, query: Record<string, string>) {
  const manifest = getManifest()
  if (!manifest.collections.some((c) => c.handle === handle)) return
  const collection = await prefetchAbility<CollectionDef>('collections/get', { handle })
  const state = listState(manifest, handle, collection, readListPrefs(handle), query)
  if (state.view === 'calendar') {
    const { dated, undated } = calendarQueries(handle, { locale: state.locale, status: query.status ?? 'any', search: query.q || undefined }, query.month, readListPrefs(handle).calendarDate)
    await Promise.all([loadOverviewSource({ ability: 'entries/list', input: dated, perPage: 200 }), loadOverviewSource({ ability: 'entries/list', input: undated, perPage: 200 })])
  } else {
    await prefetchAbility(state.showTree ? 'entries/tree' : 'entries/list', state.showTree ? { collection: handle, locale: state.locale, fields: state.fields } : state.input)
  }
}

/**
 * A collection's entries, as the view `content` draws them inside its page (ContentModule::view): search,
 * status and language, the tree or a sort, table, grid or calendar, built-in pages, and bulk publishing.
 */
export default function EntriesList({ props }: SurfaceComponentProps<{ collection: string }>) {
  const handle = props.collection
  const manifest = useManifest()
  const { summary, collection, error: collectionError, isLoading: collectionLoading } = useCollection(handle)
  const { query } = useLocation()
  const [search, setSearch] = useState(query.q ?? '')
  const status = query.status ?? 'any'
  const page = Number(query.page ?? 1)
  const locales = manifest.site.locales
  const locale = locales.includes(query.locale ?? '') ? query.locale! : manifest.site.defaultLocale
  const actions = entryActionAvailability(summary?.can)
  const newPath = `/content/${handle}/new${locale !== manifest.site.defaultLocale ? `?locale=${locale}` : ''}`
  const [prefs, setPrefs] = useListPrefs(handle)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkPending, setBulkPending] = useState(false)
  const [bulkFailures, setBulkFailures] = useState<{ id: string; title: string; message: string }[]>([])
  const [calendarItems, setCalendarItems] = useState<ListItem[]>([])

  const { all: allColumns, shown, columns: shownColumns, sortable, sortKey, ownSort, isTree, view, views, showTree, filtered, fields, input } = useMemo(() => listState(manifest, handle, collection, prefs, { ...query, q: search }), [manifest, handle, collection, prefs, query, search])
  const tableSort: TableSort | null = sortKey ? { field: sortKey.replace(/^-/, ''), desc: sortKey.startsWith('-') } : ownSort ? { field: ownSort.replace(/^-/, ''), desc: ownSort.startsWith('-'), implicit: true } : null
  const media = mediaFields(collection)[0]

  const excerpt = excerptField(collection)

  const list = useAbility<PageData<ListItem>>(
    'entries/list',
    input,
    { enabled: !!summary && !showTree && view !== 'calendar', placeholderData: (prev) => prev },
  )
  const builtin = useAbility<BuiltinGroup[]>('pages/builtin', {}, { enabled: handle === 'pages' })
  const tree = useAbility<ListItem[]>('entries/tree', { collection: handle, locale, fields }, { enabled: !!summary && showTree, placeholderData: (prev) => prev })

  const items = showTree ? (tree.data ?? []) : (list.data?.items ?? [])
  const rows = showTree ? flatten(items) : items
  const loading = showTree ? tree.isLoading : list.isLoading
  const stale = showTree ? tree.isPlaceholderData : list.isPlaceholderData
  const loadError = collectionError ?? (showTree ? tree.error : list.error)
  const retry = () => { if (collectionError) invalidate('collections/get'); void (showTree ? tree.refetch() : list.refetch()) }
  // Dates only for records that have them: templates and the like are never published on a day.
  const dated = { published: rows.some((e) => !!e.publishedAt), updated: rows.some((e) => !!e.updatedAt) }
  const withDates = (column: Column) => loading || !(column.id in dated) || dated[column.id as keyof typeof dated]
  const all = allColumns.filter(withDates)
  const columns = shownColumns.filter(withDates)

  // Thumbnails for media columns and cards, in one lookup per page.
  const mediaHandles = [...columns.filter((c) => c.field?.type === 'media').map((c) => c.field!.handle), ...(view === 'grid' && media ? [media.handle] : [])]
  const ids = [...new Set(rows.flatMap((e) => mediaHandles.flatMap((h) => mediaIds(e.values?.[h]))))].filter((id) => /^[0-9a-z]{26}$/i.test(id))
  const lookup = useAbility<{ items: MediaThumb[] }>('media/lookup', { ids }, { enabled: ids.length > 0 && manifest.fieldTypes.some((f) => f.key === 'media'), staleTime: 300_000, placeholderData: (prev) => prev })
  const ctx: CellContext = useMemo(() => ({ media: new Map((lookup.data?.items ?? []).map((m) => [m.id.toLowerCase(), m])), locales }), [lookup.data, locales])

  // Another collection starts with its own search (the URL's).
  useEffect(() => setSearch(query.q ?? ''), [handle])

  // A new set of rows starts without a selection.
  useEffect(() => {
    setSelected(new Set())
    setBulkFailures([])
  }, [handle, page, status, search, locale, sortKey])

  const select = (ids: string[], on: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      for (const id of ids) on ? next.add(id) : next.delete(id)
      return next
    })

  useShortcut('c', () => actions.create && navigate(newPath))
  const cursor = useRecordNavigation({ resetKey: `${handle}:${page}:${status}:${search}:${locale}:${sortKey}`, selection: { ids: selected, onSelect: select }, onOpen: (id) => navigate(`/content/${handle}/${id}`) })

  if (!summary) return <NotFoundState icon="collection" action={<Button onClick={() => navigate('/')}>{t('Go Home')}</Button>} />

  const setSort = (next: string | null) => {
    setPrefs({ sort: next })
    setQuery({ page: null })
  }

  // Header clicks: the column's natural direction, then the other one, then back to the collection's order.
  const onSort = (column: Column) => setSort(nextTableSort(column.sort!, sortKey, column.descFirst, ownSort))

  const bulk = async (ability: 'entries/publish' | 'entries/unpublish' | 'entries/delete') => {
    if (bulkPending || stale || !selected.size || (ability === 'entries/delete' ? !actions.delete : !actions.publish)) return
    const ids = [...selected]
    const currentItems = view === 'calendar' ? calendarItems : rows
    if (ids.some((id) => !currentItems.some((item) => item.id === id))) { toast.error(t('The selection changed. Refresh and select the entries again.')); return }
    const count = ids.length
    if (ability === 'entries/delete' && !(await confirm({ title: plural(count, 'Delete {count} entry?', 'Delete {count} entries?'), description: t('This cannot be undone.'), confirm: t('Delete'), danger: true }))) return
    if (bulkPending) return
    setBulkPending(true)
    setBulkFailures([])
    try {
      const results = await batch(ids.map((id) => ({ ability, input: { id, expectedVersion: currentItems.find((row) => row.id === id)!.version } })), false)
      const failures = results.flatMap((result, index) => 'error' in result ? [{ id: ids[index], title: currentItems.find((row) => row.id === ids[index])!.title, message: result.error.message }] : [])
      if (failures.length) toast.error(t('{failed} of {total} failed.', { failed: failures.length, total: count }))
      else if (ability === 'entries/publish') toast.success(plural(count, 'Published {count} entry', 'Published {count} entries'))
      else if (ability === 'entries/unpublish') toast.success(plural(count, 'Unpublished {count} entry', 'Unpublished {count} entries'))
      else toast.success(plural(count, 'Deleted {count} entry', 'Deleted {count} entries'))
      setBulkFailures(failures)
      setSelected(new Set(failures.map((failure) => failure.id)))
      invalidate('entries/', 'content/')
    } catch (error) { toast.error(error) } finally { setBulkPending(false) }
  }

  const clearFilters = () => {
    setSearch('')
    setQuery({ q: null, status: null, page: null })
  }

  const sortColumn = sortKey ? sortable.find((c) => c.sort === sortKey.replace(/^-/, '')) : undefined
  const defaults = defaultColumns(summary, collection, view)
  const changed = view !== (summary.defaultView ?? 'table') || !!sortKey || prefs.calendarDate !== 'published' || !!query.month
    || all.some((c) => shown.has(c.id) !== defaults.includes(c.id))
  // Bulk actions that would change something for at least one selected entry.
  const chosen = (view === 'calendar' ? calendarItems : rows).filter((item) => selected.has(item.id))
  const publishable = chosen.some((item) => item.displayStatus === 'draft' || item.displayStatus === 'changed')
  const unpublishable = chosen.some((item) => item.displayStatus !== 'draft')
  const builtinGroups = handle === 'pages' && view !== 'calendar' && !filtered ? (builtin.data ?? []).filter((group) => group.pages.length > 0) : []
  const empty = !loading && !collectionLoading && !loadError && rows.length === 0
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-2">
        <Fields
          bare
          layout="inline"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2 max-sm:contents"
          fields={[
            { handle: 'q', type: 'text', label: t('Search'), icon: 'search', size: 'sm', className: 'w-full sm:w-60', placeholder: t('Search {items}…', { items: summary.title.toLowerCase() }) },
            { handle: 'status', type: 'select', label: t('Status'), display: 'segmented', required: true, className: 'shrink-0', options: { any: t('All'), published: t('Published'), draft: t('Drafts') } },
            ...(locales.length > 1 ? [{ handle: 'locale', type: 'select', label: t('Language'), display: 'segmented', required: true, className: 'shrink-0', options: locales.map((code) => ({ value: code, label: code.toUpperCase(), title: languageName(code) })) }] : []),
          ]}
          values={{ q: search, status, locale }}
          onChange={(h, v) => {
            if (h === 'q') {
              setSearch(v ?? '')
              setQuery({ q: v, page: null })
            } else if (h === 'status') setQuery({ status: v === 'any' ? null : v, page: null })
            else setQuery({ locale: v === manifest.site.defaultLocale ? null : v, page: null })
          }}
        />

        <OverviewControls view={view} views={views} all={all} shown={shown} sortable={sortable} sortKey={sortKey} implicitSort={ownSort} isTree={isTree} onColumns={(columns) => setPrefs({ columns })} onSort={setSort}
          onView={(view) => setPrefs({ view })} calendarDate={prefs.calendarDate} onCalendarDate={(calendarDate) => setPrefs({ calendarDate })}
          onReset={changed ? () => { setPrefs({ view: null, sort: null, columns: null, calendarDate: 'published' }); setQuery({ page: null, month: null }) } : undefined}>
          {sortColumn && view !== 'calendar' && (
            <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-sunken pl-2 pr-0.5 text-xs text-muted" title={t('Sorted by {column}', { column: sortColumn.label })}>
              <Icon name={sortKey!.startsWith('-') ? 'arrow-down' : 'arrow-up'} size={11} />
              <span className="max-w-32 truncate">{sortColumn.label}</span>
              {isTree ? (
                <Button size="xs" variant="ghost" icon="list-tree" className="ml-1 h-5 px-1.5" onClick={() => setSort(null)}>{t('Show Tree')}</Button>
              ) : (
                <IconButton icon="close" label={t('Reset Sort')} size="xs" className="size-5" onClick={() => setSort(null)} />
              )}
            </span>
          )}
        </OverviewControls>
      </div>

      {loadError && view !== 'calendar' && <QueryError message={`${t('Couldn’t load entries.')} ${loadError.message}`} onRetry={retry} />}
      {bulkFailures.length > 0 && (
        <div role="alert" className="border-y border-warning/30 px-3 py-3 text-sm text-muted">
          <p className="m-0">{t('Failed entries remain selected. Retry the action for these entries.')}</p>
          <ul className="mb-0 mt-2 space-y-1 pl-4">{bulkFailures.map((failure) => <li key={failure.id}><span className="font-medium text-text">{failure.title}</span>: {failure.message}</li>)}</ul>
        </div>
      )}
      {view === 'calendar' ? (
        <EntriesCalendar onItems={setCalendarItems} handle={handle} filters={{ locale, status, search: search || undefined }} dateField={prefs.calendarDate} selection={{ ids: selected, onSelect: select }} cursor={cursor} />
      ) : empty ? (
        filtered ? <NoMatches onClear={clearFilters} /> : <EmptyState icon={summary.icon} title={t('No {items} yet', { items: summary.title.toLowerCase() })} />
      ) : view === 'grid' ? (
        <EntriesGrid handle={handle} items={rows} ctx={ctx} media={media && shown.has(`field:${media.handle}`) ? media : undefined} excerpt={excerpt && shown.has(`field:${excerpt.handle}`) ? excerpt : undefined} columns={columns} visible={shown} icon={summary.icon} loading={loading || collectionLoading} stale={stale} selected={selected} onSelect={select} cursor={cursor} />
      ) : (
        <EntriesTable handle={handle} columns={columns} ctx={ctx} items={items} urls={builtinGroups.flatMap((group) => group.pages.map((page) => page.path ?? ''))} tree={showTree} loading={loading || collectionLoading} stale={stale} selected={selected} onSelect={select} sort={tableSort} onSort={onSort} cursor={cursor} />
      )}

      {builtinGroups.length > 0 && view === 'table' && <BuiltinPages groups={builtinGroups} columns={columns} nested={showTree && hasChildren(items)} tree={showTree} urls={[...flatten(items).map((e) => e.uri ?? ''), ...builtinGroups.flatMap((group) => group.pages.map((page) => page.path ?? ''))]} />}

      {!showTree && view !== 'calendar' && list.data && <PagePagination page={list.data.page} pages={list.data.pages} total={list.data.total} perPage={list.data.perPage ?? 50} onPage={(next) => setQuery({ page: next > 1 ? next : null })} />}

      <SelectionBar count={selected.size} onClear={() => setSelected(new Set())}>
        {actions.publish && publishable && <Button size="sm" variant="ghost" disabled={bulkPending || stale} onClick={() => bulk('entries/publish')}>{t('Publish')}</Button>}
        {actions.publish && unpublishable && <Button size="sm" variant="ghost" disabled={bulkPending || stale} onClick={() => bulk('entries/unpublish')}>{t('Unpublish')}</Button>}
        {actions.delete && <Button size="sm" variant="ghost" disabled={bulkPending || stale} onClick={() => bulk('entries/delete')}>{t('Delete')}</Button>}
      </SelectionBar>
    </>
  )
}

function titleColumn(): Column {
  return { id: 'title', label: t('Title'), width: 0, sort: 'title', render: () => null }
}
