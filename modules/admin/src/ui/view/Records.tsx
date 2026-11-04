import { setQuery, t, useAbility, useLocation, type RecordTimestamps, type ViewAction } from '@letterncms/sdk'
import { useMemo, useState } from 'react'
import { IconButton } from '../Button'
import { Icon } from '../Icon'
import type { Tone } from '../Badge'
import { DataView } from '../DataView'
import { EmptyState, NoMatches } from '../EmptyState'
import { Fields } from '../Fields'
import { Menu } from '../Menu'
import { Select } from '../Select'
import { SelectionBar } from '../SelectionBar'
import { Switch } from '../Switch'
import { ActionButton, place, shown } from './actions'
import { useView } from './context'
import { formatValue, plainValue } from './formats'
import { at, fill, holds, input, safeUrl, type Scope } from './scope'

interface Column {
  key: string
  label: string
  format?: string
  width?: string
  align?: 'start' | 'end'
  hidden?: boolean
  tones?: Record<string, Tone>
  labels?: Record<string, string>
  /** A second value, quieter, after the first: a change and what it was about. */
  muted?: string
  sort?: boolean
  currency?: string
  /** With `format: switch`: what turning it runs, with `{row}` and the new `{value}`. */
  action?: ViewAction
  /** Pictures for the cards: a column of images offers the grid. */
  image?: boolean
  /** The row's own icon (a key of the row), before the value. */
  icon?: string
  /** What an empty value reads as: "Never signed in". */
  empty?: string
  /** A key of the row holding its problem, in words: drawn instead of the quieter value, as a warning. */
  warning?: string
  /** With `format: switch`: its name for each row (`{row.label} on`), and a key of the row that locks it. */
  ariaLabel?: string
  disabled?: string
}

interface Filter {
  param: string
  label: string
  all?: string
  options?: { value: string | number | boolean; label: string }[]
  /** Options from the response: where they are, and which keys hold their value and words. */
  at?: string
  value?: string
  text?: string
}

export interface RecordsProps {
  id?: string
  label: string
  /** Where the records load from; or literal `rows`, what a command or search found. */
  source?: { ability: string; input?: Record<string, unknown> }
  rows?: Row[]
  /** Where the records are in the response (`items` unless it is a list itself). */
  at?: string
  key?: string
  columns: Column[]
  /** By the ability with a `param`, among what is loaded without one, or `false` for no search. */
  search?: { param?: string; placeholder?: string } | false
  filters?: Filter[]
  paged?: { perPage?: number }
  open?: ViewAction
  actions?: ViewAction[]
  /** What can be done with the rows selected: each gets `{ids}` (and `{rows}`). Offering any makes rows selectable. */
  bulk?: ViewAction[]
  empty?: { icon?: string; title?: string; text?: string; action?: ViewAction; size?: 'sm' }
  calendar?: boolean
  /** The list's search, filters and page are in the address (by their params), so it can be linked to and comes back on Back. */
  address?: boolean
  /** `false`: read as it is, a ranked list: no Display menu, no sorting by its headers. */
  display?: boolean
}

type Row = Record<string, unknown>

/**
 * Records an ability lists, as the admin's table: search (by the ability when it takes a
 * `search.param`, otherwise among what is loaded), filters, pages, a row that opens and
 * the actions of each row. The same component as every overview, so it looks and works alike.
 */
export function Records({ id, label, source, rows, at: path, key = 'id', columns, search, filters = [], paged, open, actions, bulk, empty, calendar, address, display = true }: RecordsProps) {
  const { scope, act } = useView()
  const { query: location } = useLocation()
  const [ownText, setOwnText] = useState('')
  const [ownPage, setOwnPage] = useState(1)
  const [ownChosen, setOwnChosen] = useState<Record<string, string>>({})
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
  const query = { ...base, ...(server && text ? { [(search as { param: string }).param]: text } : {}), ...Object.fromEntries(Object.entries(chosen).filter(([, v]) => v !== '')), ...(paged ? { page, perPage } : {}) }
  const data = useAbility<unknown>(source?.ability ?? 'abilities/list', query, { placeholderData: (p: unknown) => p, enabled: !!source && !rows })
  const response = rows ?? data.data
  const items = useMemo(() => {
    const list = Array.isArray(response) ? response : at(response, path ?? 'items')
    return Array.isArray(list) ? (list as Row[]) : []
  }, [response, path])
  const total = typeof at(response, 'total') === 'number' ? at(response, 'total') as number : undefined
  const pages = typeof at(response, 'pages') === 'number' ? at(response, 'pages') as number : total !== undefined ? Math.max(1, Math.ceil(total / perPage)) : 1
  const filtered = !!text || Object.values(chosen).some((v) => v !== '')
  const rowScope = (row: Row): Scope => ({ ...scope, row })
  const rowActions = (row: Row) => shown(actions, rowScope(row))
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const selection = bulk?.length ? { ids: picked, onSelect: (ids: string[], on: boolean) => setPicked((now) => { const next = new Set(now); ids.forEach((i) => on ? next.add(i) : next.delete(i)); return next }) } : undefined
  const pickedRows = items.filter((row) => picked.has(String(at(row, key))))
  const imageColumn = columns.find((c) => c.image)

  const toolbar = (server || filters.length > 0) && (
    <span className="flex flex-wrap items-center gap-2">
      {server && <Fields bare layout="inline" fields={[{ handle: 'search', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: (search && search.placeholder) || t('Search…'), className: 'w-64 max-w-full' }]} values={{ search: text }} onChange={(_, v) => { setText(String(v ?? '')); if (!address) setPage(1) }} />}
      {filters.map((f) => {
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
  const href = open?.to && !open.ability && !open.dialog && !open.component && !open.confirm ? (row: Row) => {
    if (!holds(open.when, rowScope(row)) || (open.unless !== undefined && holds(open.unless, rowScope(row)))) return undefined
    const to = fill(open.to!, rowScope(row))
    return typeof to === 'string' && to !== '' ? place(to) : undefined
  } : undefined

  return (
    <>
    <DataView<Row>
      id={id ?? source?.ability ?? label}
      label={label}
      items={items}
      source={source ? { ability: source.ability, input: { ...base, ...chosen }, perPage } : undefined}
      rowKey={(row) => String(at(row, key))}
      dates={(row) => ({ publishedAt: (at(row, 'publishedAt') as string) ?? null, updatedAt: (at(row, 'updatedAt') as string) ?? null }) as RecordTimestamps}
      calendar={calendar}
      plain={!display}
      selection={selection}
      image={imageColumn ? (row) => { const src = safeUrl(at(row, imageColumn.key)); return src ? <img src={src} alt="" className="size-full object-cover" /> : null } : undefined}
      rowHref={href}
      onRowClick={open && !href ? (row) => { if (holds(open.when, rowScope(row))) void act(open, { row }).catch(() => {}) } : undefined}
      actions={actions?.length ? (row) => {
        const list = rowActions(row)
        const name = plainValue(at(row, columns[0].key), columns[0].labels)
        // A row with nothing to do keeps the room a menu takes, so every row's cells line up.
        if (list.length === 0) return <span aria-hidden className="inline-block size-7" />
        return (
          <Menu trigger={<IconButton icon="more" size="sm" label={name ? t('Actions for {name}', { name: String(name) }) : t('Actions')} />} items={list.map((a) => ({ label: a.label, icon: a.icon, danger: a.variant === 'danger', disabled: a.disabled !== undefined && holds(a.disabled, rowScope(row)), onSelect: () => void act(a, { row }).catch(() => {}) }))} />
        )
      } : undefined}
      // Among what is loaded only when that is everything: a page of many is searched by the ability, or not at all.
      searchText={server || paged || search === false ? undefined : (row) => columns.map((c) => plainValue(at(row, c.key), c.labels) ?? '').join(' ')}
      searchPlaceholder={search ? search.placeholder : undefined}
      toolbar={toolbar || undefined}
      pagination={paged && response ? { page, pages, total, perPage, onPage: setPage } : undefined}
      loading={!rows && data.isLoading}
      stale={!rows && data.isPlaceholderData}
      error={!rows && data.isError}
      onRetry={() => void data.refetch()}
      columns={columns.map((c) => ({
        id: c.key,
        label: c.label,
        width: c.width,
        align: c.align === 'end' ? 'end' : undefined,
        hiddenByDefault: c.hidden,
        value: paged || c.sort === false || !display ? undefined : (row: Row) => plainValue(at(row, c.key), c.labels),
        // Days are read newest first.
        descFirst: ['date', 'datetime', 'ago'].includes(c.format ?? ''),
        render: (row: Row) => {
          if (c.format === 'switch') return <SwitchCell row={row} column={c} />
          const raw = at(row, c.key)
          const value = c.empty && (raw === null || raw === undefined || raw === '') ? <span className="text-muted">{c.empty}</span> : formatValue(raw, { format: c.format, tones: c.tones, labels: c.labels, currency: c.currency ? String(at(row, c.currency) ?? c.currency) : undefined })
          const icon = c.icon ? at(row, c.icon) : undefined
          const problem = c.warning ? at(row, c.warning) : undefined
          const second = problem || (c.muted ? at(row, c.muted) : undefined)
          if (!second && !icon) return value
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
        },
      }))}
      empty={filtered
        ? <NoMatches onClear={() => { if (address) setQuery({ [searchParam]: null, page: null, ...Object.fromEntries(filters.map((f) => [f.param, null])) }); else { setOwnText(''); setOwnChosen({}); setOwnPage(1) } }} />
        : empty?.size === 'sm' ? <p className="m-0 py-3 text-sm text-muted">{empty.title ?? t('Nothing here yet')}</p>
          : <EmptyState icon={empty?.icon ?? 'inbox'} title={empty?.title ?? t('Nothing here yet')} description={empty?.text} action={empty?.action && <ActionButton action={empty.action} />} />}
    />
    {selection && (
      <SelectionBar count={picked.size} onClear={() => setPicked(new Set())}>
        {shown(bulk, { ...scope, ids: [...picked], rows: pickedRows }).map((a, i) => <ActionButton key={i} action={a} size="sm" variant={a.variant ?? 'ghost'} scope={{ ids: [...picked], rows: pickedRows }} after={() => setPicked(new Set())} />)}
      </SelectionBar>
    )}
    </>
  )
}

/** A switch in a row: turning it runs the column's action with the row and the new value; the row shows it once stored. */
function SwitchCell({ row, column }: { row: Row; column: Column }) {
  const { act, disabled, scope } = useView()
  const [busy, setBusy] = useState(false)
  const on = !!at(row, column.key)
  const locked = column.disabled ? !!at(row, column.disabled) : false
  return (
    <span onClick={(e) => e.stopPropagation()} className="inline-flex">
      <Switch checked={on} disabled={disabled || busy || locked || !column.action} aria-label={column.ariaLabel ? fill(column.ariaLabel, { ...scope, row }) : column.label} onChange={(value) => {
        if (!column.action) return
        setBusy(true)
        void act(column.action, { row, value }).catch(() => {}).finally(() => setBusy(false))
      }} />
    </span>
  )
}
