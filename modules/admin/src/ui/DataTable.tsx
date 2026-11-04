import { Link, t } from '@letterncms/sdk'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Skeleton } from './Spinner'
import { Checkbox } from './Switch'

/** A grid template's tracks, split where it has spaces outside parentheses. */
function tracksOf(template: string): string[] {
  const tracks: string[] = []
  let depth = 0
  let track = ''
  for (const char of template.trim()) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (/\s/.test(char) && depth === 0) {
      if (track) tracks.push(track)
      track = ''
    } else track += char
  }
  if (track) tracks.push(track)
  return tracks
}

/** The least a track takes: its fixed width, or the minimum of its `minmax()`. */
function leastOf(track: string): number {
  return Number(/^(?:minmax\(\s*)?([\d.]+)px/.exec(track)?.[1] ?? 0)
}

/** How far a flexible track (the title) gives way before a column has to go. */
const SHRINK = 0.75

/** A flexible track with its minimum brought down to what it gives way to. */
function shrunk(track: string): string {
  return track.includes('fr') ? track.replace(/^minmax\(\s*([\d.]+)px/, (_, min) => `minmax(${Math.round(Number(min) * SHRINK)}px`) : track
}

/**
 * The columns that give way, right to left, when a row doesn't fit: those after the title (the first
 * flexible track), but not a narrow last one (the row's actions).
 */
function yielding(tracks: string[]): number[] {
  const title = tracks.findIndex((track) => track.includes('fr'))
  if (title < 0) return []
  const last = tracks.length - 1
  const actions = /^[\d.]+px$/.test(tracks[last]) && leastOf(tracks[last]) <= 64 ? last : -1
  const order: number[] = []
  for (let i = last; i > title; i--) if (i !== actions) order.push(i)
  return order
}

const GAP = 20
const PADDING = 24

/** How the tracks fit `room`: the title giving way first, then as many columns as need to go. */
function fitting(tracks: string[], room: number): { shrink: boolean; dropped: number } {
  const order = yielding(tracks)
  const need = (list: string[], kept: number[]) => PADDING + kept.reduce((sum, i) => sum + leastOf(list[i]), 0) + GAP * (kept.length - 1)
  const all = tracks.map((_, i) => i)
  if (need(tracks, all) <= room) return { shrink: false, dropped: 0 }
  const small = tracks.map(shrunk)
  let kept = all
  let dropped = 0
  while (dropped < order.length && need(small, kept) > room) {
    const next = order[dropped++]
    kept = kept.filter((i) => i !== next)
  }
  return { shrink: true, dropped }
}

/** Each cell's column, counted through wrappers that lay their cells out in the row (`TableMeta`). */
function markColumns(table: HTMLElement, hidden: Set<number>) {
  for (const row of table.querySelectorAll<HTMLElement>('[role="row"]')) {
    let column = 0
    for (const child of row.children) {
      const cells = child.getAttribute('role') === 'none' ? [...child.children] : [child]
      for (const cell of cells) {
        if (hidden.has(column++)) cell.setAttribute('data-column-hidden', '')
        else cell.removeAttribute('data-column-hidden')
      }
    }
  }
}

/**
 * Shared table geometry, also used by collection entries and their tree rows. On a phone a row is
 * its title with the other cells on one line under it (`TableMeta`), so nothing scrolls sideways.
 * Wider, the table fits the sheet between its gutters: when the columns don't fit (a chat docked
 * beside it), the title gives way a little, then the columns right of it go one by one, from the
 * right; the row's actions stay.
 */
export function TableFrame({ template, label, busy, children }: { template: string; label?: string; busy?: boolean; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const table = useRef<HTMLDivElement>(null)
  const tracks = useMemo(() => tracksOf(template), [template])
  const [{ shrink, dropped }, setFit] = useState({ shrink: false, dropped: 0 })
  useLayoutEffect(() => {
    const element = frame.current
    if (!element) return
    const wide = window.matchMedia('(min-width: 640px)')
    const fit = () => {
      const style = getComputedStyle(element)
      const room = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const next = wide.matches ? fitting(tracks, room) : { shrink: false, dropped: 0 }
      setFit((current) => current.shrink === next.shrink && current.dropped === next.dropped ? current : next)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [tracks])
  const hidden = useMemo(() => new Set(yielding(tracks).slice(0, dropped)), [tracks, dropped])
  // Rows come and go without this frame drawing again (a tree opening): each one is marked as it arrives.
  useLayoutEffect(() => {
    const element = table.current
    if (!element) return
    markColumns(element, hidden)
    if (hidden.size === 0) return
    const observer = new MutationObserver(() => markColumns(element, hidden))
    observer.observe(element, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [hidden])
  const columns = shrink ? tracks.map(shrunk).filter((_, i) => !hidden.has(i)).join(' ') : template
  // `cms-table` (app.css): row checkboxes show on hover or focus, and all of them once one is ticked.
  // Every row draws its hairline below; the frame tucks the last one away (rows may be nested, as in a tree, so `:last-child` can't tell).
  return <div ref={frame} data-table-frame className="-mx-4 overflow-x-auto overflow-y-hidden px-4 md:-mx-6 md:px-6 [scrollbar-width:thin]">
    <div ref={table} role="table" aria-label={label} aria-busy={busy} className="cms-table -mb-px sm:min-w-fit" style={{ '--cols': columns } as CSSProperties}>{children}</div>
  </div>
}

/** A 40px row on hairlines (two lines on a phone). `active`: the keyboard cursor is on it. */
export function TableRow({ children, header, selected, active, className, recordId }: { children: ReactNode; header?: boolean; selected?: boolean; active?: boolean; className?: string; recordId?: string }) {
  return <div role="row" data-entry={recordId} className={cn(
    'grid items-center gap-x-5 border-b border-border px-3 [grid-template-columns:var(--cols)]',
    header ? 'h-8 text-xs font-medium text-faint max-sm:hidden' : 'group relative min-h-10 text-sm transition-colors duration-120 hover:bg-hover max-sm:flex max-sm:min-h-[52px] max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-0.5 max-sm:py-2',
    selected && 'bg-focus-soft hover:bg-[color-mix(in_srgb,var(--cms-focus)_14%,transparent)]',
    active && !selected && 'bg-hover',
    active && 'shadow-[inset_2px_0_0_var(--cms-focus)]',
    className,
  )}>{children}</div>
}

/** The cells after the title: columns of the row on a wide screen, one line under the title on a phone (the first one gives way). */
export function TableMeta({ children }: { children: ReactNode }) {
  return <div role="none" data-row-meta="" className={cn('contents max-sm:order-last max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:items-center max-sm:gap-x-3 max-sm:overflow-hidden max-sm:text-xs max-sm:text-muted max-sm:[&>[role=cell]]:shrink-0 max-sm:[&>[role=cell]:first-child]:min-w-0 max-sm:[&>[role=cell]:first-child]:shrink max-sm:[&>[role=cell]]:justify-start max-sm:[&>[role=cell]]:py-0 max-sm:[&>[role=cell]:has(>:empty)]:hidden max-sm:[&>[role=cell]:empty]:hidden')}>{children}</div>
}

/** Row actions: on a screen with a pointer they show on hover or focus, so the list stays quiet. */
export const rowActionsClass = 'relative z-10 flex min-w-0 items-center justify-end gap-0.5 transition-opacity duration-120 [&>*]:shrink-0 [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 has-[[data-popup-open]]:opacity-100'

export function TableHeader({ label, align, direction, onSort, hiddenLabel }: { label: string; align?: 'end'; direction?: 'ascending' | 'descending'; onSort?: () => void; hiddenLabel?: boolean }) {
  return <div role="columnheader" data-align={align} aria-sort={onSort ? direction ?? 'none' : undefined} className={cn('flex min-w-0 items-center', align === 'end' && 'justify-end')}>
    {/* A sortable header shows its caret on hover, and keeps it while it sorts the list. Right-aligned, the caret goes before
        the label, so the label lines up with the numbers under it. */}
    {onSort ? <button type="button" onClick={onSort} title={t('Sort by {column}', { column: label })} className={cn('group/sort -mx-1.5 flex h-6 min-w-0 items-center gap-1 rounded-xs px-1.5 transition-colors duration-120 hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-focus', align === 'end' && 'flex-row-reverse', direction && 'text-text')}>
      <span className="truncate">{label}</span>
      <Icon name={direction === 'ascending' ? 'chevron-up' : 'chevron-down'} size={12} className={cn('shrink-0 transition-opacity duration-120', direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100')} />
    </button> : <span className={hiddenLabel ? 'sr-only' : 'truncate'}>{label}</span>}
  </div>
}

export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return <div role="rowgroup" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <TableRow key={i} className="max-sm:[&>*:not(:first-child)]:hidden">
    {Array.from({ length: columns }, (_, j) => <div key={j} className="py-3 max-sm:flex-1 max-sm:py-1"><Skeleton className={cn('h-3', j === 0 ? 'w-3/5' : 'w-2/5')} /></div>)}
  </TableRow>)}</div>
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2">{children}</div>
}


export interface DataColumn<T> {
  id: string
  label: string
  width?: string
  /** Available in Display, but initially hidden in tables and cards. */
  hiddenByDefault?: boolean
  align?: 'end'
  render: (item: T) => ReactNode
  /** Client sorting; omit on server-paginated data. */
  value?: (item: T) => string | number | null | undefined
  /** Server sort field, handled by onSort. */
  sort?: string
  descFirst?: boolean
}

export interface DataSelection<T = unknown> {
  ids: Set<string>
  onSelect: (ids: string[], on: boolean, records?: T[]) => void
}


interface DataTableProps<T> {
  label: string
  items: T[]
  columns: DataColumn<T>[]
  rowKey: (item: T) => string
  /** Where a row opens; nothing for a row with nowhere to go. */
  rowHref?: (item: T) => string | undefined
  onRowClick?: (item: T) => void
  selected?: (item: T) => boolean | undefined
  selection?: DataSelection<T>
  actions?: (item: T) => ReactNode
  loading?: boolean
  stale?: boolean
  state?: ReactNode
  sort?: string | null
  sortable?: Set<string>
  onSort?: (column: DataColumn<T>) => void
  cursor?: string | null
}

/** A controlled table: collection entries and DataView use the exact same rendering. */
export function DataTable<T>({ label, items, columns, rowKey, rowHref, onRowClick, selected, selection, actions, loading, stale, state, sort, sortable, onSort, cursor }: DataTableProps<T>) {
  const rowIds = items.map(rowKey)
  const chosen = rowIds.filter((key) => selection?.ids.has(key)).length
  // Content must never decide a row's tracks: identical fractional/fixed tracks
  // keep headers, short rows, long rows and skeletons aligned.
  const template = [...(selection ? ['16px'] : []), ...columns.map((c, i) => c.width ?? (i === 0 ? 'minmax(240px,2fr)' : 'minmax(160px,1fr)')), ...(actions ? ['52px'] : [])].join(' ')
  const count = columns.length + (actions ? 1 : 0) + (selection ? 1 : 0)
  const linkClass = 'min-w-0 flex-1 truncate text-left text-inherit no-underline after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus'
  // An empty or failed list is its message alone, without headers above it.
  if (!loading && state) return <div>{state}</div>
  return <TableFrame template={template} label={label} busy={loading || stale}>
    <TableRow header>
      {selection && <div role="columnheader"><Checkbox checked={rowIds.length > 0 && chosen === rowIds.length} indeterminate={chosen > 0 && chosen < rowIds.length} disabled={loading || items.length === 0} label={<span className="sr-only">{t('Select All')}</span>} onChange={(on) => selection.onSelect(rowIds, on, items)} /></div>}
      {columns.map((c) => <TableHeader key={c.id} label={c.label} align={c.align} direction={sort?.replace(/^-/, '') === (c.sort ?? c.id) ? sort.startsWith('-') ? 'descending' : 'ascending' : undefined} onSort={onSort && (sortable ? sortable.has(c.id) : c.sort) ? () => onSort(c) : undefined} />)}
      {actions && <TableHeader label={t('Actions')} hiddenLabel />}
    </TableRow>
    {loading ? <TableSkeleton columns={count} /> : <div role="rowgroup" className={cn(stale && 'opacity-60')}>
      {items.map((item) => {
        const [first, ...rest] = columns
        const cell = (c: DataColumn<T>) => <div key={c.id} role="cell" data-align={c.align} className={cn('flex min-w-0 items-center py-2 text-muted', c.align === 'end' && 'justify-end tabular-nums')}>
          <div className={cn('w-full min-w-0 truncate', c.align === 'end' && 'text-right max-sm:text-left')}>{c.render(item)}</div>
        </div>
        return <TableRow key={rowKey(item)} recordId={rowKey(item)} selected={selected?.(item) || selection?.ids.has(rowKey(item))} active={cursor === rowKey(item)}>
          {selection && <div role="cell" data-row-check="" className="relative z-10 flex items-center max-sm:w-4 max-sm:shrink-0"><Checkbox checked={selection.ids.has(rowKey(item))} disabled={loading} label={<span className="sr-only">{t('Select Item')}</span>} onChange={(on) => selection.onSelect([rowKey(item)], on, items)} /></div>}
          <div role="cell" className="flex min-w-0 items-center py-2 font-medium text-ink max-sm:flex-1 max-sm:py-0">
            {rowHref?.(item) ? <Link to={rowHref(item)!} className={linkClass}>{first.render(item)}</Link> : onRowClick ? <button type="button" onClick={() => onRowClick(item)} className={linkClass}>{first.render(item)}</button> : <div className="w-full min-w-0 truncate">{first.render(item)}</div>}
          </div>
          <TableMeta>{rest.map(cell)}</TableMeta>
          {actions && <div role="cell" data-table-actions className={rowActionsClass}>{actions(item)}</div>}
        </TableRow>
      })}
    </div>}
  </TableFrame>
}
