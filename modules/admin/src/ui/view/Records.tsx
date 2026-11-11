import { batch, locale, queryClient, setQuery, t, useAbility, useLocation, type RecordTimestamps, type ViewAction } from '@letterncms/sdk'
import { useEffect, useMemo, useState } from 'react'
import { Button, IconButton } from '../Button'
import { Icon } from '../Icon'
import type { Tone } from '../Badge'
import { calendarRange } from '../calendar'
import { flattenTree, type DataColumn, type DataTree } from '../DataTable'
import { DataView } from '../DataView'
import { confirm } from '../Dialog'
import { EmptyState, NoMatches } from '../EmptyState'
import { Fields } from '../Fields'
import { Menu } from '../Menu'
import { Notice } from '../Notice'
import { Select } from '../Select'
import { SelectionBar } from '../SelectionBar'
import { Switch } from '../Switch'
import { Tooltip } from '../Tooltip'
import { toast } from '../toast'
import { readViewPrefs, useViewPrefs } from '../viewPrefs'
import { ActionButton, place, shown } from './actions'
import { useView } from './context'
import { formatValue, mediaIds, plainValue, type MediaThumb } from './formats'
import { at, fill, holds, input, safeUrl, type Scope } from './scope'

interface Column {
  key: string
  label: string
  format?: string
  width?: string
  /** Its width from the longest value, written in the type addresses are (`address`): it grows before the title gives way. */
  fit?: boolean
  align?: 'start' | 'end'
  hidden?: boolean
  tones?: Record<string, Tone>
  labels?: Record<string, string>
  /** A second value, quieter, after the first: a change and what it was about. */
  muted?: string
  /** `true`: sorted among what is loaded; a name: what the ability sorts by (`sort.param`). */
  sort?: boolean | string
  currency?: string
  /** With `format: switch`: why a row's switch stays as it is (a key of the row), said on hover of a lock before it. */
  reason?: string
  /** With `format: switch`: what turning it runs, with `{row}` and the new `{value}`. */
  action?: ViewAction
  /** Pictures for the cards: a column of images offers the grid. */
  image?: boolean
  /** On a card, a few lines under the title (an excerpt) instead of a labeled value. */
  excerpt?: boolean
  /** Shown on cards from the start, though hidden in the table. */
  card?: boolean
  /** The row's own icon (a key of the row), before the value. */
  icon?: string
  /** What an empty value reads as: "Never signed in". */
  empty?: string
  /** A key of the row holding its problem, in words: drawn instead of the quieter value, as a warning. */
  warning?: string
  /** With `format: switch`: its name for each row (`{row.label} on`), and a key of the row that locks it. */
  ariaLabel?: string
  disabled?: string
  /** With `format: field`: the blueprint field (`type`, `options`). */
  field?: { type: string; options?: unknown }
  /** With `format: languages`: every language there is. */
  locales?: string[]
}

interface Filter {
  param: string
  label: string
  all?: string
  options?: { value: string | number | boolean; label: string; title?: string }[]
  /** Options from the response: where they are, and which keys hold their value and words. */
  at?: string
  value?: string
  text?: string
  /** `segmented`: every choice in view, one of them always on (`default` stands for none). */
  display?: 'segmented'
  default?: string
}

type Source = { ability: string; input?: Record<string, unknown> }
type Counted = string | { one: string; other: string }
type BulkAction = Omit<ViewAction, 'success' | 'confirm'> & { each?: boolean; some?: string; success?: Counted; confirm?: Omit<NonNullable<ViewAction['confirm']>, 'title'> & { title: Counted } }
type RowAction = ViewAction & { inline?: boolean }

export interface RecordsProps {
  id?: string
  label: string
  /** Where the records load from; or literal `rows`, what a command or search found. */
  source?: Source
  rows?: Row[]
  /** Where the records are in the response (`0.pages`); without it, the response when it is a list, otherwise its `items`. */
  at?: string
  key?: string
  /** `key`, as the renderer hands it on. */
  rowKey?: string
  columns: Column[]
  /** By the ability with a `param`, among what is loaded without one, or `false` for no search. */
  search?: { param?: string; placeholder?: string } | false
  filters?: Filter[]
  paged?: { perPage?: number }
  /** Sorted by the ability: the input it takes the sort in (a column's `sort` name, `-` first for descending), and its own order while none is chosen. */
  sort?: { param: string; default?: string }
  /** The records as a tree while nothing narrows or sorts them: where it loads from, and what reorders siblings (with `{ids}`, `{parent}`, `{versions}`). */
  tree?: { source: Source; at?: string; children?: string; version?: string; reorder?: ViewAction }
  open?: ViewAction
  actions?: RowAction[]
  /** What can be done with the rows selected: each gets `{ids}` (and `{rows}`), or, with `each`, runs once per row with `{row}`. Offering any makes rows selectable. */
  bulk?: BulkAction[]
  empty?: { icon?: string; title?: string; text?: string; action?: ViewAction; size?: 'sm' }
  /** Offers a calendar; with `dated` (and `undated`), it loads a month at a time, filled with `{field}`, `{start}` and `{end}`. */
  calendar?: boolean | { dated: Record<string, unknown>; undated?: Record<string, unknown> }
  /** What the ability sorts the dates by, which makes them sortable and names the calendar's `{field}`. */
  dates?: { published?: string; updated?: string }
  defaultView?: 'table' | 'grid' | 'calendar'
  /** The list's search, filters and page are in the address (by their params), so it can be linked to and comes back on Back. */
  address?: boolean
  /** `false`: read as it is, a ranked list: no Display menu, no sorting by its headers. */
  display?: boolean
}

type Row = Record<string, unknown>

/**
 * What a list loads, from where it is and how the person keeps it: the ability and its input, the
 * tree's while nothing narrows or sorts it. The place's loader asks for the same, so it opens whole.
 */
export function recordsQuery(p: Pick<RecordsProps, 'source' | 'tree' | 'search' | 'filters' | 'paged' | 'sort'>, scope: Scope, state: { text: string; page: number; chosen: Record<string, string>; sortKey: string | null; view: string }): { tree: boolean; ability: string; input: Record<string, unknown> } {
  const filters = p.filters ?? []
  const chosen = Object.fromEntries(Object.entries(state.chosen).filter(([, v]) => v !== ''))
  const narrowing = Object.entries(chosen).some(([param, v]) => v !== filters.find((f) => f.param === param)?.default)
  const server = !!(p.search && p.search.param)
  const filtered = !!state.text || narrowing
  const sortKey = p.sort ? state.sortKey : null
  if (p.tree && !filtered && !sortKey && state.view !== 'calendar') return { tree: true, ability: p.tree.source.ability, input: { ...input(p.tree.source.input, scope), ...chosen } }
  return { tree: false, ability: p.source?.ability ?? 'abilities/list', input: {
    ...input(p.source?.input, scope),
    ...(server && state.text ? { [(p.search as { param: string }).param]: state.text } : {}),
    ...chosen,
    ...(p.paged ? { page: state.page, perPage: p.paged.perPage ?? 100 } : {}),
    ...(p.sort && (sortKey ?? p.sort.default) ? { [p.sort.param]: sortKey ?? p.sort.default } : {}),
  } }
}

/** The same, for a list whose search, filters and page are in the address: what its place loads first. */
export function recordsLoad(p: RecordsProps, scope: Scope, query: Record<string, string>): [string, Record<string, unknown>] | null {
  if (!p.source || p.rows) return null
  const prefs = readViewPrefs(`overview.${p.id ?? p.source.ability ?? p.label}`, p.defaultView ?? 'table')
  const param = p.search && p.search.param ? p.search.param : 'q'
  const state = p.address
    ? { text: query[param] ?? '', page: Number(query.page ?? 1) || 1, chosen: Object.fromEntries((p.filters ?? []).map((f) => [f.param, query[f.param] ?? ''])), sortKey: prefs.sort, view: prefs.view }
    : { text: '', page: 1, chosen: {}, sortKey: prefs.sort, view: prefs.view }
  const { ability, input: given } = recordsQuery(p, scope, state)
  return [ability, given]
}

const sql = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ')
const counted = (words: Counted | undefined, count: number) => words === undefined ? undefined : typeof words === 'string' ? words : new Intl.PluralRules(locale()).select(count) === 'one' ? words.one : words.other
/** Width of the longest value in monospace text. */
const fitTrack = (values: unknown[]) => `minmax(120px,${Math.min(360, Math.max(120, Math.ceil(Math.max(0, ...values.map((v) => String(v ?? '').length)) * 7.3) + 8))}px)`

/**
 * Records an ability lists, as the admin's table: search (by the ability when it takes a
 * `search.param`, otherwise among what is loaded), filters, sorting, pages, a tree, a row
 * that opens and the actions of each row. The same component as every overview, so every
 * list looks and works alike.
 */
export function Records({ id, label, source, rows, at: path, rowKey: key = 'id', columns, search, filters = [], paged, sort: sorting, tree, open, actions, bulk, empty, calendar, dates: dateKeys, defaultView, address, display = true }: RecordsProps) {
  const { scope, act } = useView()
  const { query: location } = useLocation()
  const [ownText, setOwnText] = useState('')
  const [ownPage, setOwnPage] = useState(1)
  const [ownChosen, setOwnChosen] = useState<Record<string, string>>({})
  const listId = id ?? source?.ability ?? label
  const prefs = useViewPrefs(`overview.${listId}`, defaultView ?? 'table')
  const searchParam = search && search.param ? search.param : 'q'
  // In the address, or the list's own while it is on view.
  const text = address ? location[searchParam] ?? '' : ownText
  const page = address ? Number(location.page ?? 1) || 1 : ownPage
  const chosen = address ? Object.fromEntries(filters.map((f) => [f.param, location[f.param] ?? ''])) : ownChosen
  const setText = (v: string) => address ? setQuery({ [searchParam]: v || null, page: null }) : setOwnText(v)
  const setPage = (v: number) => address ? setQuery({ page: v > 1 ? String(v) : null }) : setOwnPage(v)
  const setChosen = (v: Record<string, string>) => address ? setQuery({ ...Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x || null])), page: null }) : setOwnChosen(v)
  const perPage = paged?.perPage ?? 100
  const server = !!(search && search.param)
  const base = input(source?.input, scope)
  const sortKey = sorting ? prefs[0].sort : null
  const view = prefs[0].view
  const loading = recordsQuery({ source, tree, search, filters, paged, sort: sorting }, scope, { text, page, chosen, sortKey, view })
  // A filter left on its default narrows nothing.
  const filtered = !!text || Object.entries(chosen).some(([param, v]) => v !== '' && v !== filters.find((f) => f.param === param)?.default)
  // The tree while nothing narrows or sorts it, and not as a calendar.
  const asTree = loading.tree
  // The list and the tree each keep their own data while the other is on view.
  const listing = asTree ? recordsQuery({ source, search, filters, paged, sort: sorting }, scope, { text, page, chosen, sortKey, view }) : loading
  const data = useAbility<unknown>(listing.ability, listing.input, { placeholderData: (p: unknown) => p, enabled: !!source && !rows && !asTree })
  const treeData = useAbility<unknown>(tree?.source.ability ?? 'abilities/list', asTree ? loading.input : {}, { placeholderData: (p: unknown) => p, enabled: !!source && !rows && asTree })
  const loaded = asTree ? treeData : data
  const response = rows ?? (asTree ? treeData.data : data.data)
  const children = tree?.children ?? 'children'
  const items = useMemo(() => {
    // Where the rows are, when the answer says; otherwise the answer itself or its `items`.
    const where = asTree ? tree?.at : path
    const list = where ? at(response, where) : Array.isArray(response) ? response : at(response, 'items')
    return Array.isArray(list) ? (list as Row[]) : []
  }, [response, path, asTree, tree?.at])
  const every = asTree ? flattenTree(items, (row) => (at(row, children) as Row[] | undefined) ?? []) : items
  const total = typeof at(response, 'total') === 'number' ? at(response, 'total') as number : undefined
  const pages = typeof at(response, 'pages') === 'number' ? at(response, 'pages') as number : total !== undefined ? Math.max(1, Math.ceil(total / perPage)) : 1
  const rowScope = (row: Row): Scope => ({ ...scope, row })
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [failures, setFailures] = useState<{ id: string; title: string; message: string }[]>([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const selection = bulk?.length ? { ids: picked, onSelect: (ids: string[], on: boolean) => setPicked((now) => { const next = new Set(now); ids.forEach((i) => on ? next.add(i) : next.delete(i)); return next }) } : undefined
  const pickedRows = every.filter((row) => picked.has(String(at(row, key))))
  const imageColumn = columns.find((c) => c.image)
  // Another set of rows starts without a selection.
  const selectionKey = JSON.stringify([listId, page, text, chosen, sortKey])
  useEffect(() => { setPicked(new Set()); setFailures([]) }, [selectionKey])

  // Thumbnails for the media on view, in one lookup.
  const mediaKeys = columns.filter((c) => c.format === 'media' || (c.format === 'field' && c.field?.type === 'media')).map((c) => c.key)
  const ids = [...new Set(every.flatMap((row) => mediaKeys.flatMap((k) => mediaIds(at(row, k)))))].filter((id) => /^[0-9a-z]{26}$/i.test(id))
  const lookup = useAbility<{ items: MediaThumb[] }>('media/get-many', { ids }, { enabled: ids.length > 0, staleTime: 300_000, placeholderData: (p) => p })
  const media = useMemo(() => new Map((lookup.data?.items ?? []).map((m) => [m.id.toLowerCase(), m])), [lookup.data])

  // Columns that fit their longest value.
  const fits = Object.fromEntries(columns.filter((c) => c.fit).map((c) => [c.key, fitTrack(every.map((row) => at(row, c.key)))]))

  const segmented = filters.filter((f) => f.display === 'segmented')
  const toolbar = (server || filters.length > 0) && (
    <span className="flex min-w-0 flex-wrap items-center gap-2 max-sm:contents">
      {(server || segmented.length > 0) && <Fields bare layout="inline" className="flex min-w-0 flex-wrap items-center gap-2 max-sm:contents" fields={[
        ...(server ? [{ handle: '__search', type: 'text', label: t('Search'), icon: 'search', size: 'sm' as const, placeholder: (search && search.placeholder) || t('Search…'), className: 'w-full sm:w-60' }] : []),
        ...segmented.map((f) => ({ handle: f.param, type: 'select', label: f.label, display: 'segmented', required: true, className: 'shrink-0', options: (f.options ?? []).map((o) => ({ value: String(o.value), label: o.label, title: o.title })) })),
      ]} values={{ __search: text, ...Object.fromEntries(segmented.map((f) => [f.param, chosen[f.param] || f.default || ''])) }} onChange={(h, v) => {
        if (h === '__search') { setText(String(v ?? '')); if (!address) setPage(1); return }
        const f = segmented.find((x) => x.param === h)
        setChosen({ ...chosen, [h]: v === f?.default ? '' : String(v ?? '') })
        if (!address) setPage(1)
      }} />}
      {filters.filter((f) => f.display !== 'segmented').map((f) => {
        const options = f.options ?? (Array.isArray(at(response, f.at)) ? (at(response, f.at) as Row[]).map((o) => ({ value: String(at(o, f.value ?? 'value')), label: String(at(o, f.text ?? 'label')) })) : [])
        return (
          <span key={f.param} className="w-48 max-w-full">
            <Select size="sm" aria-label={f.label} value={chosen[f.param] ?? ''} onChange={(v) => { setChosen({ ...chosen, [f.param]: v ?? '' }); if (!address) setPage(1) }}
              options={[{ value: '', label: f.all ?? t('All') }, ...options.map((o) => ({ value: String(o.value), label: o.label }))]} />
          </span>
        )
      })}
    </span>
  )

  // A row opens where `to` leads, when its `when` holds and the address came out as one.
  const hrefFor = (action: ViewAction | undefined) => action?.to && !action.ability && !action.dialog && !action.component && !action.confirm ? (row: Row) => {
    if (!holds(action.when, rowScope(row)) || (action.unless !== undefined && holds(action.unless, rowScope(row)))) return undefined
    const to = fill(action.to!, rowScope(row))
    return typeof to === 'string' && to !== '' ? place(to) : undefined
  } : undefined
  const href = hrefFor(open)

  const rowMenu = (list: ViewAction[] | undefined, row: Row) => {
    const all = shown(list, rowScope(row)) as RowAction[]
    const inline = all.filter((a) => a.inline && a.icon)
    const menu = all.filter((a) => !(a.inline && a.icon))
    const name = plainValue(at(row, columns[0].key), columns[0].labels)
    // A row with nothing to do keeps the room a menu takes, so every row's cells line up.
    if (all.length === 0) return <span aria-hidden className="inline-block size-7" />
    return <>
      {inline.map((a, i) => <IconButton key={i} icon={a.icon!} size="xs" label={a.label} onClick={() => void act(a, { row }).catch(() => {})} />)}
      {/* Beside a button of its own, both are small, to fit the row's room for actions. */}
      {menu.length > 0 && <Menu trigger={<IconButton icon="more" size={inline.length || tree?.reorder ? 'xs' : 'sm'} label={name ? t('Actions for {name}', { name: String(name) }) : t('Actions')} />} items={menu.map((a) => ({ label: a.label, icon: a.icon, danger: a.variant === 'danger', disabled: a.disabled !== undefined && holds(a.disabled, rowScope(row)), onSelect: () => void act(a, { row }).catch(() => {}) }))} />}
    </>
  }

  const toColumns = (list: Column[]): DataColumn<Row>[] => list.map((own) => {
    return {
      id: own.key,
      label: own.label,
      width: own.fit ? fits[own.key] : own.width,
      align: own.align === 'end' ? 'end' : undefined,
      hiddenByDefault: own.hidden,
      card: own.excerpt ? 'text' : undefined,
      cardByDefault: own.card,
      sort: typeof own.sort === 'string' ? own.sort : undefined,
      value: paged || sorting || own.sort === false || !display ? undefined : (row: Row) => plainValue(at(row, own.key), own.labels),
      // Days are read newest first.
      descFirst: ['date', 'datetime', 'ago'].includes(own.format ?? '') || (own.format === 'field' && ['date', 'number'].includes(own.field?.type ?? '')),
      render: (row: Row) => <Cell row={row} column={own} media={media} />,
    }
  })

  const reorder = tree?.reorder
  const dataTree: DataTree<Row> | undefined = asTree ? {
    children: (row) => (at(row, children) as Row[] | undefined) ?? [],
    reorder: reorder && every.every((row) => holds(reorder.when, rowScope(row))) ? async (siblings, parent) => {
      const versions = Object.fromEntries(siblings.map((row) => [String(at(row, key)), at(row, tree!.version ?? 'version')]))
      await act({ ...reorder, when: undefined }, { ids: siblings.map((row) => at(row, key)), parent: parent ? at(parent, key) : null, versions, rows: siblings })
    } : undefined,
  } : undefined

  const runBulk = async (action: BulkAction) => {
    const chosenRows = pickedRows
    const count = chosenRows.length
    if (!count || bulkBusy) return
    if (!action.each) {
      await act({ ...action, success: counted(action.success, count), confirm: action.confirm && { ...action.confirm, title: counted(action.confirm.title, count)! } } as ViewAction, { ids: [...picked], rows: chosenRows, count })
      setPicked(new Set())
      return
    }
    // Once per row, each with its own version: what failed stays selected, with why.
    if (action.confirm) {
      const c = fill({ ...action.confirm, title: counted(action.confirm.title, count)! }, { ...scope, count })
      if (!(await confirm({ title: c.title, description: c.text, confirm: c.confirm ?? action.label, danger: c.danger ?? action.variant === 'danger' }))) return
    }
    setBulkBusy(true)
    setFailures([])
    try {
      const results = await batch(chosenRows.map((row) => ({ ability: action.ability!, input: input(action.input, rowScope(row)) })), false)
      const failed = results.flatMap((result, i) => 'error' in result ? [{ id: String(at(chosenRows[i], key)), title: String(plainValue(at(chosenRows[i], columns[0].key)) ?? ''), message: result.error.message }] : [])
      if (failed.length) toast.error(t('{failed} of {total} failed.', { failed: failed.length, total: count }))
      else if (action.success) toast.success(fill(counted(action.success, count)!, { ...scope, count }))
      setFailures(failed)
      setPicked(new Set(failed.map((f) => f.id)))
      void queryClient.invalidateQueries()
    } catch (e) { toast.error(e) } finally { setBulkBusy(false) }
  }

  const calendarSource = calendar && typeof calendar === 'object' && source ? (date: 'published' | 'updated', month: string | undefined) => {
    const range = calendarRange(month)
    const fill_ = { field: dateKeys?.[date] ?? `${date}_at`, start: sql(range.start), end: sql(range.end) }
    const filters_ = Object.fromEntries(Object.entries(chosen).filter(([, v]) => v !== ''))
    const textQ = server && text ? { [(search as { param: string }).param]: text } : {}
    return {
      dated: { ability: source.ability, input: { ...base, ...filters_, ...textQ, ...fill(calendar.dated, fill_) }, perPage: 200 },
      undated: calendar.undated ? { ability: source.ability, input: { ...base, ...filters_, ...textQ, ...fill(calendar.undated, fill_) }, perPage: 200 } : undefined,
    }
  } : undefined

  return (
    <>
    {failures.length > 0 && (
      <Notice tone="warning" className="mb-3" title={t('Failed items remain selected. Retry the action for these items.')}>
        <ul className="m-0 space-y-1 pl-4">{failures.map((f) => <li key={f.id}><span className="font-medium text-text">{f.title}</span>: {f.message}</li>)}</ul>
      </Notice>
    )}
    <DataView<Row>
      id={listId}
      label={label}
      items={items}
      prefs={prefs}
      tree={dataTree}
      defaultView={defaultView}
      source={source ? { ability: source.ability, input: { ...base, ...chosen }, perPage } : undefined}
      calendarSource={calendarSource}
      rowKey={(row) => String(at(row, key))}
      dates={(row) => ({ publishedAt: (at(row, 'publishedAt') as string) ?? null, updatedAt: (at(row, 'updatedAt') as string) ?? null }) as RecordTimestamps}
      dateSort={dateKeys}
      calendar={!!calendar}
      plain={!display}
      selection={selection}
      image={imageColumn ? (row) => <CardImage row={row} column={imageColumn} media={media} /> : undefined}
      imageColumn={imageColumn?.key}
      rowHref={href}
      onRowClick={open && !href ? (row) => { if (holds(open.when, rowScope(row))) void act(open, { row }).catch(() => {}) } : undefined}
      actions={actions?.length ? (row) => rowMenu(actions, row) : undefined}
      // Among what is loaded only when that is everything: a page of many is searched by the ability, or not at all.
      searchText={server || paged || search === false ? undefined : (row) => columns.map((c) => plainValue(at(row, c.key), c.labels) ?? '').join(' ')}
      searchPlaceholder={search ? search.placeholder : undefined}
      toolbar={toolbar || undefined}
      sort={sorting ? sortKey : undefined}
      onSort={sorting ? () => { if (address) setQuery({ page: null }); else setOwnPage(1) } : undefined}
      pagination={paged && response && !asTree ? { page, pages, total, perPage, onPage: setPage } : undefined}
      loading={!rows && loaded.isLoading}
      stale={!rows && loaded.isPlaceholderData}
      error={!rows && loaded.isError}
      onRetry={() => void loaded.refetch()}
      columns={toColumns(columns)}
      empty={filtered
        ? <NoMatches onClear={() => { if (address) setQuery({ [searchParam]: null, page: null, ...Object.fromEntries(filters.map((f) => [f.param, null])) }); else { setOwnText(''); setOwnChosen({}); setOwnPage(1) } }} />
        : empty?.size === 'sm' ? <p className="m-0 py-3 text-sm text-muted">{empty.title ?? t('Nothing here yet')}</p>
          : <EmptyState icon={empty?.icon ?? 'inbox'} title={empty?.title ?? t('Nothing here yet')} description={empty?.text} action={empty?.action && <ActionButton action={empty.action} />} />}
    />
    {selection && (
      <SelectionBar count={picked.size} onClear={() => setPicked(new Set())}>
        {(bulk ?? []).filter((a) => shown([a as ViewAction], { ...scope, ids: [...picked], rows: pickedRows }).length > 0 && (a.some === undefined || pickedRows.some((row) => holds(a.some, rowScope(row))))).map((a, i) =>
          <Button key={i} size="sm" icon={a.icon} variant={a.variant === 'danger' ? 'ghost' : a.variant === 'default' || !a.variant ? 'ghost' : a.variant} disabled={bulkBusy || (!rows && loaded.isPlaceholderData)} onClick={() => void runBulk(a)}>{a.label}</Button>)}
      </SelectionBar>
    )}
    </>
  )
}

/** One cell: the value as its format writes it, with the row's icon, a quieter second value or its problem. */
function Cell({ row, column: c, media }: { row: Row; column: Column; media: Map<string, MediaThumb> }) {
  if (c.format === 'switch') return <SwitchCell row={row} column={c} />
  const raw = at(row, c.key)
  const value = c.empty && (raw === null || raw === undefined || raw === '') ? <span className="text-muted">{c.empty}</span> : formatValue(raw, { format: c.format, tones: c.tones, labels: c.labels, currency: c.currency ? String(at(row, c.currency) ?? c.currency) : undefined, field: c.field, locales: c.locales, media })
  const icon = c.icon ? at(row, c.icon) : undefined
  const problem = c.warning ? at(row, c.warning) : undefined
  const second = problem || (c.muted ? at(row, c.muted) : undefined)
  if (!second && !icon) return <>{value}</>
  // The value itself never gives way: what follows it is cut short first.
  return (
    <span className="flex min-w-0 items-baseline gap-2">
      {icon ? <Icon name={String(icon)} size={14} className="shrink-0 self-center text-muted" /> : null}
      <span className="max-w-full shrink-0 truncate">{value}</span>
      {problem
        ? <span className="flex min-w-0 items-center gap-1 font-normal text-warning"><Icon name="warning" size={12} className="shrink-0" /><span className="truncate">{String(problem)}</span></span>
        : second ? <span className="min-w-0 truncate font-normal text-muted">{String(second)}</span> : null}
    </span>
  )
}

/** Why a switch stays as it is: a lock that says so on hover, focus or a press (touch has no hover), above the row's own link. */
function Reason({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false)
  // A press keeps it open until a press elsewhere or Escape.
  const [pinned, setPinned] = useState(false)
  return (
    <Tooltip content={text} open={hovered || pinned} onOpenChange={setHovered}>
      <button type="button" aria-label={text} onClick={() => setPinned((p) => !p)} onBlur={() => setPinned(false)} onKeyDown={(e) => { if (e.key === 'Escape') setPinned(false) }}
        className="relative z-10 grid size-5 shrink-0 cursor-help place-items-center rounded-xs text-muted transition-colors duration-120 hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[popup-open]:bg-hover data-[popup-open]:text-text">
        <Icon name="lock" size={14} />
      </button>
    </Tooltip>
  )
}

/** A card's picture: the address in the column, or the first file of a media value, looked up. */
function CardImage({ row, column, media }: { row: Row; column: Column; media: Map<string, MediaThumb> }) {
  const raw = at(row, column.key)
  const isMedia = column.format === 'media' || column.field?.type === 'media'
  const first = isMedia ? mediaIds(raw)[0] : undefined
  const thumb = first ? media.get(first.toLowerCase()) : undefined
  const src = isMedia ? (thumb ? thumb.thumb ?? (thumb.kind === 'image' ? thumb.url : null) : first && (first.startsWith('/') || first.startsWith('http')) ? safeUrl(first) : null) : safeUrl(raw)
  return src ? <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="grid size-full place-items-center text-faint"><Icon name="image" size={20} /></div>
}

/** A switch in a row: turning it runs the column's action with the row and the new value; the row shows it once stored. */
function SwitchCell({ row, column }: { row: Row; column: Column }) {
  const { act, disabled, scope } = useView()
  const [busy, setBusy] = useState(false)
  const on = !!at(row, column.key)
  const locked = column.disabled ? !!at(row, column.disabled) : false
  const reason = column.reason ? plainValue(at(row, column.reason))?.toString() : undefined
  return (
    <span onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-2">
      {/* Every row keeps the lock's place, so the switches line up. */}
      {column.reason ? reason ? <Reason text={reason} /> : <span aria-hidden className="size-5 shrink-0" /> : null}
      <Switch checked={on} disabled={disabled || busy || locked || !column.action} aria-label={column.ariaLabel ? fill(column.ariaLabel, { ...scope, row }) : column.label} onChange={(value) => {
        if (!column.action) return
        setBusy(true)
        void act(column.action, { row, value }).catch(() => {}).finally(() => setBusy(false))
      }} />
    </span>
  )
}
