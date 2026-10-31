import { Link, t } from '@letterncms/sdk'
import { type CSSProperties, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Skeleton } from './Spinner'
import { Checkbox } from './Switch'

/** Shared table geometry, also used by collection entries and their tree rows. */
export function TableFrame({ template, label, busy, children }: { template: string; label?: string; busy?: boolean; children: ReactNode }) {
  return <div className="-mx-4 overflow-x-auto px-4 md:-mx-6 md:px-6 [scrollbar-width:thin]">
    <div role="table" aria-label={label} aria-busy={busy} className="min-w-fit border-y border-border" style={{ '--cols': template } as CSSProperties}>{children}</div>
  </div>
}

export function TableRow({ children, header, selected, className, recordId }: { children: ReactNode; header?: boolean; selected?: boolean; className?: string; recordId?: string }) {
  return <div role="row" data-entry={recordId} className={cn('grid items-center gap-x-3 border-b border-border px-2 last:border-b-0 [grid-template-columns:var(--cols)]', header ? 'h-8 text-xs text-faint' : 'group relative min-h-9 text-sm transition-colors duration-120 hover:bg-surface', selected && 'bg-focus/5 hover:bg-focus/8', className)}>{children}</div>
}

export function TableHeader({ label, align, direction, onSort, hiddenLabel }: { label: string; align?: 'end'; direction?: 'ascending' | 'descending'; onSort?: () => void; hiddenLabel?: boolean }) {
  return <div role="columnheader" data-align={align} aria-sort={onSort ? direction ?? 'none' : undefined} className={cn('flex min-w-0 items-center', align === 'end' && 'justify-end')}>
    {onSort ? <button type="button" onClick={onSort} title={t('Sort by {column}', { column: label })} className="-mx-1 flex h-6 min-w-0 items-center gap-1 rounded-xs px-1 hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-focus">
      <span className="truncate">{label}</span>{direction && <Icon name={direction === 'descending' ? 'arrow-down' : 'arrow-up'} size={11} className="shrink-0" />}
    </button> : <span className={hiddenLabel ? 'sr-only' : 'truncate'}>{label}</span>}
  </div>
}

export function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return <div role="rowgroup" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <TableRow key={i}>
    {Array.from({ length: columns }, (_, j) => <div key={j} className="py-3"><Skeleton className={cn('h-3', j === 0 ? 'w-3/5' : 'w-2/5')} /></div>)}
  </TableRow>)}</div>
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>
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
  rowHref?: (item: T) => string
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
  return <TableFrame template={template} label={label} busy={loading || stale}>
    <TableRow header>
      {selection && <div role="columnheader"><Checkbox checked={rowIds.length > 0 && chosen === rowIds.length} indeterminate={chosen > 0 && chosen < rowIds.length} disabled={loading || items.length === 0} label={<span className="sr-only">{t('Select All')}</span>} onChange={(on) => selection.onSelect(rowIds, on, items)} /></div>}
      {columns.map((c) => <TableHeader key={c.id} label={c.label} align={c.align} direction={sort?.replace(/^-/, '') === (c.sort ?? c.id) ? sort.startsWith('-') ? 'descending' : 'ascending' : undefined} onSort={onSort && (sortable ? sortable.has(c.id) : c.sort) ? () => onSort(c) : undefined} />)}
      {actions && <TableHeader label={t('Actions')} hiddenLabel />}
    </TableRow>
    {loading ? <TableSkeleton columns={count} /> : state ? <div role="row"><div role="cell" aria-colspan={count}>{state}</div></div> : <div role="rowgroup" className={cn(stale && 'opacity-60')}>
      {items.map((item) => <TableRow key={rowKey(item)} recordId={rowKey(item)} selected={selected?.(item) || selection?.ids.has(rowKey(item))} className={cn(cursor === rowKey(item) && 'bg-hover')}>
        {selection && <div role="cell" className="relative z-10"><Checkbox checked={selection.ids.has(rowKey(item))} disabled={loading} label={<span className="sr-only">{t('Select Item')}</span>} onChange={(on) => selection.onSelect([rowKey(item)], on, items)} /></div>}
        {columns.map((c, i) => <div key={c.id} role="cell" data-align={c.align} className={cn('flex min-w-0 items-center py-2 text-muted', c.align === 'end' && 'justify-end tabular-nums', i === 0 && 'font-medium text-text')}>
          {i === 0 && rowHref ? <Link to={rowHref(item)} className={linkClass}>{c.render(item)}</Link> : i === 0 && onRowClick ? <button type="button" onClick={() => onRowClick(item)} className={linkClass}>{c.render(item)}</button> : <div className={cn('w-full min-w-0 truncate', c.align === 'end' && 'text-right')}>{c.render(item)}</div>}
        </div>)}
        {actions && <div role="cell" data-table-actions className="relative z-10 flex min-w-0 items-center justify-end gap-0.5 [&>*]:shrink-0">{actions(item)}</div>}
      </TableRow>)}
    </div>}
  </TableFrame>
}
