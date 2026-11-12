import { PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { DndContext } from './dnd'
import { Pressable } from './Pressable'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Link, t } from '@letterncms/sdk'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Skeleton } from './Spinner'
import { Checkbox } from './Switch'
import { toast } from './toast'

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
 * flexible track), but not a narrow last one (the row's actions, with a tree's drag handle).
 */
function yielding(tracks: string[]): number[] {
  const title = tracks.findIndex((track) => track.includes('fr'))
  if (title < 0) return []
  const last = tracks.length - 1
  const actions = /^[\d.]+px$/.test(tracks[last]) && leastOf(tracks[last]) <= 76 ? last : -1
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
      // A tree's spacer is a track of its own; only the row's meta lays out cells of its own.
      const cells = child.hasAttribute('data-row-meta') ? [...child.children] : [child]
      for (const cell of cells) {
        // A row's checkbox lies in the gutter, outside the tracks.
        if (cell.hasAttribute('data-row-check')) continue
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
export function TableFrame({ template, label, busy, fitColumns = true, children }: { template: string; label?: string; busy?: boolean; fitColumns?: boolean; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null)
  const table = useRef<HTMLDivElement>(null)
  const tracks = useMemo(() => tracksOf(template), [template])
  const [{ shrink, dropped }, setFit] = useState({ shrink: false, dropped: 0 })
  useLayoutEffect(() => {
    const element = frame.current
    if (!element || !fitColumns) return
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
  }, [tracks, fitColumns])
  const hidden = useMemo(() => new Set(fitColumns ? yielding(tracks).slice(0, dropped) : []), [tracks, dropped, fitColumns])
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
  const columns = fitColumns && shrink ? tracks.map(shrunk).filter((_, i) => !hidden.has(i)).join(' ') : template
  // `cms-table` (app.css): row checkboxes show on hover or focus, and all of them once one is ticked.
  return <div ref={frame} data-table-frame className="-mx-4 overflow-x-auto overflow-y-hidden px-4 md:-mx-6 md:px-6 [scrollbar-width:thin]">
    <div ref={table} role="table" aria-label={label} aria-busy={busy} className="cms-table sm:min-w-fit" style={{ '--cols': columns } as CSSProperties}>{children}</div>
  </div>
}

/** A 40px row on hairlines (two lines on a phone). `active`: the keyboard cursor is on it. */
export function TableRow({ children, header, selected, active, className, recordId }: { children: ReactNode; header?: boolean; selected?: boolean; active?: boolean; className?: string; recordId?: string }) {
  return <div role="row" data-entry={recordId} data-table-row={header ? undefined : ''} data-selected={selected || undefined} data-cursor={active || undefined} className={cn(
    'grid items-center gap-x-5 px-3 [grid-template-columns:var(--cols)]',
    header ? 'h-9 text-xs font-medium text-muted max-sm:hidden' : 'group cms-reveal-row relative min-h-10 text-sm max-sm:has-[[data-table-actions]]:pr-14 max-sm:flex max-sm:min-h-[52px] max-sm:flex-wrap max-sm:gap-x-3 max-sm:gap-y-0.5 max-sm:py-2',
    className,
  )}>{children}</div>
}

/** The cells after the title: columns of the row on a wide screen, one line under the title on a phone (the first one gives way; a note before it is said whole). */
export function TableMeta({ children }: { children: ReactNode }) {
  return <div role="none" data-row-meta="" className={cn('contents max-sm:order-last max-sm:flex max-sm:min-w-0 max-sm:basis-full max-sm:flex-wrap max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-0.5 max-sm:overflow-hidden max-sm:text-xs max-sm:text-muted max-sm:[&>[role=cell]]:shrink-0 max-sm:[&>[role=cell]:first-child]:min-w-0 max-sm:[&>[role=cell]:first-child]:shrink max-sm:[&>[data-row-note]+[role=cell]]:min-w-0 max-sm:[&>[data-row-note]+[role=cell]]:shrink max-sm:[&>[role=cell]]:justify-start max-sm:[&>[role=cell]]:py-0 max-sm:[&>[role=cell]:has(>:empty)]:hidden max-sm:[&>[role=cell]:empty]:hidden')}>{children}</div>
}

/** Row actions: on a screen with a pointer they show on hover or focus, so the list stays quiet. */
// On a phone the row is two lines and its menu stands in the middle of them, at the end.
export const rowActionsClass = 'cms-reveal relative z-raised flex min-w-0 items-center justify-end gap-0.5 max-sm:absolute max-sm:right-4 max-sm:top-1/2 max-sm:-translate-y-1/2 [&>*]:shrink-0'

export function TableHeader({ label, align, direction, onSort, hiddenLabel }: { label: string; align?: 'end'; direction?: 'ascending' | 'descending'; onSort?: () => void; hiddenLabel?: boolean }) {
  return <div role="columnheader" data-align={align} aria-sort={onSort ? direction ?? 'none' : undefined} className={cn('flex min-w-0 items-center', align === 'end' && 'justify-end')}>
    {/* A sortable header shows its caret on hover, and keeps it while it sorts the list. Right-aligned, the caret goes before
        the label, so the label lines up with the numbers under it. */}
    {onSort ? <Pressable compact onClick={onSort} title={t('Sort by {column}', { column: label })} className={cn('group/sort -mx-1.5 flex h-6 min-w-0 items-center gap-1 rounded-xs px-1.5 transition-colors duration-base hover:bg-hover hover:text-text focus-visible:outline-2 focus-visible:outline-focus', align === 'end' && 'flex-row-reverse', direction && 'text-text')}>
      <span className="truncate">{label}</span>
      <Icon name={direction === 'ascending' ? 'chevron-up' : 'chevron-down'} size={12} className={cn('shrink-0 transition-opacity duration-base', direction ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100')} />
    </Pressable> : <span className={hiddenLabel ? 'sr-only' : 'truncate'}>{label}</span>}
  </div>
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return <div role="rowgroup" aria-hidden="true">{Array.from({ length: rows }, (_, i) => <TableRow key={i} className="max-sm:[&>*:not(:first-child)]:hidden">
    {Array.from({ length: columns }, (_, j) => <div key={j} className="py-3 max-sm:flex-1 max-sm:py-1"><Skeleton className={cn('h-3', j === 0 ? 'w-3/5' : 'w-2/5')} /></div>)}
  </TableRow>)}</div>
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2">{children}</div>
}


/** How a record stands: content's own state (`published`, `draft`…), or a tone and the words for it. */
export type RecordStatus = string | { tone: string; label: string }

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
  /** On a card: `text` is a few lines under the title (an excerpt), not a labeled value. */
  card?: 'text'
  /** Hidden in the table at first, but shown on cards (a picture, an excerpt). */
  cardByDefault?: boolean
  /** Its value says what it is (a status, an address, a person): on a phone, where a row has no headings, it stands without its label. Every other value there is led by its column's name. */
  bare?: boolean
  /** A control (a switch): centred on the row's line, and on a phone at the end of the line under the title, so the rows' controls stand in one column. */
  control?: boolean
  /** The record's status (`published`, `draft`…, or a tone with the words it is shown in), when this column shows one: a calendar marks each record with its dot. */
  status?: (item: T) => RecordStatus | null | undefined
  /** Of the first column: what is said beside the title, quieter. On a phone it starts the line under the title, so a long title cannot push it out. */
  note?: (item: T) => ReactNode
}

export interface DataSelection<T = unknown> {
  ids: Set<string>
  onSelect: (ids: string[], on: boolean, records?: T[]) => void
}

/** Records that hold others (pages under pages): drawn nested, opened and closed, and put in order among their siblings by dragging. */
export interface DataTree<T> {
  children: (item: T) => T[]
  /** Siblings in their new order under their parent (`null`: the top level). Without it, nothing can be dragged. */
  reorder?: (siblings: T[], parent: T | null) => Promise<void>
}

/** A row's checkbox: in the sheet's gutter, left of the row, on a wide screen, so titles line up with the search above; before the title on a phone. */
export const GUTTER = 'relative z-raised flex items-center max-sm:w-4 max-sm:shrink-0 sm:absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 md:mr-1 [&_label]:gap-0'

/** Every record of a tree, each before the ones it holds. */
export function flattenTree<T>(items: T[], children?: (item: T) => T[]): T[] {
  return children ? items.flatMap((item) => [item, ...flattenTree(children(item) ?? [], children)]) : items
}

/**
 * One table's tracks: the title and the columns, then the row's actions (a tree's drag handle
 * stands at the row's start, in its padding). A tree with anything nested has a track of no width
 * before the title, whose gap holds the toggles. Two tables built alike line up exactly.
 */
export function tableTemplate<T>(columns: DataColumn<T>[], { actions, nested }: { actions?: boolean; nested?: boolean } = {}): string {
  return [...(nested ? ['0px'] : []), ...columns.map((c, i) => c.width ?? (i === 0 ? 'minmax(240px,2fr)' : 'minmax(160px,1fr)')), ...(actions ? ['52px'] : [])].join(' ')
}

interface DataTableProps<T> {
  label: string
  /** The rows; in a tree, its top level. */
  items: T[]
  columns: DataColumn<T>[]
  rowKey: (item: T) => string
  /** Where a row opens; nothing for a row with nowhere to go. */
  rowHref?: (item: T) => string | undefined
  onRowClick?: (item: T) => void
  selected?: (item: T) => boolean | undefined
  selection?: DataSelection<T>
  actions?: (item: T) => ReactNode
  tree?: DataTree<T>
  loading?: boolean
  stale?: boolean
  state?: ReactNode
  sort?: string | null
  sortable?: Set<string>
  onSort?: (column: DataColumn<T>) => void
  cursor?: string | null
}

const INDENT = 20
const LINK = 'min-w-0 flex-1 truncate text-left text-inherit no-underline outline-none after:absolute after:inset-0 after:content-[\'\'] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus'

/** The admin's one table: every list, flat or a tree, is drawn by it, so they look and work alike. */
export function DataTable<T>({ label, items, columns, rowKey, rowHref, onRowClick, selected, selection, actions, tree, loading, stale, state, sort, sortable, onSort, cursor }: DataTableProps<T>) {
  const all = flattenTree(items, tree?.children)
  const rowIds = all.map(rowKey)
  const chosen = rowIds.filter((key) => selection?.ids.has(key)).length
  // Room for the toggles only when something in the tree holds something.
  const nested = !!tree && items.some((item) => tree.children(item)?.length > 0)
  // Content must never decide a row's tracks: identical tracks keep headers, rows and skeletons aligned.
  const template = tableTemplate(columns, { actions: !!actions, nested })
  const hasActions = !!actions
  const count = columns.length + (hasActions ? 1 : 0)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  // An empty or failed list is its message alone, without headers above it.
  if (!loading && state) return <div>{state}</div>

  const row = (item: T, depth = 0, extra?: { expander?: ReactNode; handle?: ReactNode }) => {
    const [first, ...rest] = columns
    const key = rowKey(item)
    const href = rowHref?.(item)
    return <TableRow key={key} recordId={key} selected={selected?.(item) || selection?.ids.has(key)} active={cursor === key}>
      {selection && <div role="cell" data-row-check="" className={GUTTER}><Checkbox checked={selection.ids.has(key)} disabled={loading} label={<span className="sr-only">{t('Select Item')}</span>} onChange={(on) => selection.onSelect([key], on, all)} /></div>}
      {nested && <span role="none" className="max-sm:hidden" />}
      <div role="cell" className="flex min-w-0 items-center py-2 font-medium text-ink max-sm:flex-1 max-sm:py-0" style={depth ? { paddingLeft: depth * INDENT } : undefined}>
        {extra?.expander}
        {href ? <Link to={href} className={LINK}>{first.render(item)}</Link> : onRowClick ? <Pressable compact onClick={() => onRowClick(item)} className={LINK}>{first.render(item)}</Pressable> : <div className="w-full min-w-0 truncate">{first.render(item)}</div>}
      </div>
      {/* What moves the row is at its start, where a list is taken hold of, in the room before its title. */}
      {extra?.handle && <span data-row-handle="" className="cms-reveal absolute -left-1 top-1/2 z-raised -translate-y-1/2 max-sm:hidden">{extra.handle}</span>}
      <TableMeta>{first.note?.(item) ? <div data-row-note="" className="max-w-full shrink-0 truncate sm:hidden">{first.note(item)}</div> : null}{rest.map((c) => <div key={c.id} role="cell" data-align={c.align} className={cn('flex min-w-0 items-center py-2 text-muted', c.align === 'end' && 'justify-end tabular-nums', c.control && 'max-sm:ml-auto')}>
        {/* On a phone the headings are gone: a value is led by its column's name (app.css, `data-label`), unless it says what it is. */}
        <div data-label={c.bare ? undefined : c.label} className={cn('w-full min-w-0', c.control ? 'flex items-center justify-end' : 'truncate', c.align === 'end' && !c.control && 'text-right max-sm:text-left')}>{c.render(item)}</div>
      </div>)}</TableMeta>
      {hasActions && <div role="cell" data-table-actions className={rowActionsClass}>{actions?.(item)}</div>}
    </TableRow>
  }

  return <TableFrame template={template} label={label} busy={loading || stale}>
    <TableRow header className="relative">
      {selection && <div role="columnheader" data-row-check="" className={GUTTER}><Checkbox checked={rowIds.length > 0 && chosen === rowIds.length} indeterminate={chosen > 0 && chosen < rowIds.length} disabled={loading || all.length === 0} label={<span className="sr-only">{t('Select All')}</span>} onChange={(on) => selection.onSelect(rowIds, on, all)} /></div>}
      {nested && <span role="none" />}
      {columns.map((c) => <TableHeader key={c.id} label={c.label} align={c.align} direction={sort?.replace(/^-/, '') === (c.sort ?? c.id) ? sort.startsWith('-') ? 'descending' : 'ascending' : undefined} onSort={onSort && (sortable ? sortable.has(c.id) : c.sort) ? () => onSort(c) : undefined} />)}
      {hasActions && <TableHeader label={t('Actions')} hiddenLabel />}
    </TableRow>
    {loading ? <TableSkeleton columns={count} /> : <div role="rowgroup" className={cn('transition-opacity duration-move', stale && 'opacity-60')}>
      {tree ? <TreeLevel nodes={items} parent={null} depth={0} tree={tree} rowKey={rowKey} row={row} collapsed={collapsed} setCollapsed={setCollapsed} /> : items.map((item) => row(item))}
    </div>}
  </TableFrame>
}

interface LevelProps<T> {
  nodes: T[]
  parent: T | null
  depth: number
  tree: DataTree<T>
  rowKey: (item: T) => string
  row: (item: T, depth: number, extra: { expander?: ReactNode; handle?: ReactNode }) => ReactNode
  collapsed: Record<string, boolean>
  setCollapsed: (change: (current: Record<string, boolean>) => Record<string, boolean>) => void
}

/** One level of a tree: siblings reorder by dragging; those that hold others open and close. */
function TreeLevel<T>({ nodes, parent, depth, tree, rowKey, row, collapsed, setCollapsed }: LevelProps<T>) {
  const [order, setOrder] = useState<T[] | null>(null)
  const list = order ?? nodes
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const ids = list.map(rowKey)

  const onDragEnd = async (e: DragEndEvent) => {
    if (!tree.reorder || !e.over || e.active.id === e.over.id) return
    const next = arrayMove(list, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)))
    setOrder(next)
    try {
      await tree.reorder(next, parent)
    } catch (error) {
      toast.error(error)
    } finally {
      setOrder(null)
    }
  }

  // What a drag announces goes to the end of the page: a live region among the rows is not a row, and breaks the table for a screen reader.
  return <DndContext sensors={sensors} collisionDetection={closestCenter} accessibility={{ container: document.body }} onDragEnd={(e) => void onDragEnd(e)}>
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      {list.map((node) => {
        const key = rowKey(node)
        const children = tree.children(node) ?? []
        const open = !collapsed[key]
        // Sits in the room left of the title, so titles line up whatever they hold.
        const expander = children.length > 0 && <Pressable compact onClick={() => setCollapsed((c) => ({ ...c, [key]: open }))} aria-expanded={open} aria-label={open ? t('Collapse') : t('Expand')}
          className="relative z-raised -ml-5 mr-0 grid size-5 shrink-0 -translate-x-0.5 place-items-center rounded-xs text-faint transition-colors duration-base hover:bg-hover hover:text-text">
          <Icon name="chevron-right" size={12} className={cn('transition-transform duration-base', open && 'rotate-90')} />
        </Pressable>
        return <SortableRow key={key} id={key} disabled={!tree.reorder}>
          {(handle) => <>
            {row(node, depth, { expander, handle })}
            {children.length > 0 && open && <TreeLevel nodes={children} parent={node} depth={depth + 1} tree={tree} rowKey={rowKey} row={row} collapsed={collapsed} setCollapsed={setCollapsed} />}
          </>}
        </SortableRow>
      })}
    </SortableContext>
  </DndContext>
}

function SortableRow({ id, disabled, children }: { id: string; disabled?: boolean; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const handle = <Pressable compact {...attributes} {...listeners} aria-label={t('Drag to Reorder')}
    className="grid h-6 w-3 cursor-grab place-items-center rounded-xs text-faint transition-colors duration-base hover:bg-hover hover:text-text active:cursor-grabbing max-sm:hidden">
    <Icon name="drag" size={14} />
  </Pressable>
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'relative z-drag bg-bg shadow-pop')}>
    {children(disabled ? null : handle)}
  </div>
}
