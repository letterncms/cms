import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { invalidate, Link, run, t, useManifest } from '@letterncms/sdk'
import { Checkbox, Icon, Skeleton, TableFrame, TableHeader, TableMeta, TableRow, cn, rowActionsClass, toast, entryActionAvailability } from '@letterncms/ui'
import { useState, type ReactNode } from 'react'
import { EntryActions } from './EntryActions'
import type { CellContext, Column } from './listColumns'
import type { ListItem } from './listPrefs'

export interface TableSort {
  field: string
  desc: boolean
  /** The collection's own order, not one the user picked. */
  implicit?: boolean
}

export interface TableProps {
  handle: string
  columns: Column[]
  ctx: CellContext
  /** Flat rows, or the tree's top level with `children`. */
  items: ListItem[]
  tree?: boolean
  loading?: boolean
  /** A refetch after a sort or filter change: rows stay, dimmed. */
  stale?: boolean
  selected: Set<string>
  onSelect: (ids: string[], on: boolean) => void
  sort: TableSort | null
  onSort: (column: Column) => void
  /** The keyboard cursor (j/k). */
  cursor: string | null
}

const INDENT = 20

/**
 * The entries table, flat or a tree: one grid template for the header, the rows and the skeleton,
 * so every column lines up and sorting a tree never moves a column. In a tree only children are
 * indented; the expand toggle sits left of the title and the drag handle in the gutter.
 */
export function EntriesTable({ handle, columns, ctx, items, tree, loading, stale, selected, onSelect, sort, onSort, cursor, urls = [] }: TableProps & { urls?: string[] }) {
  // Room for the expand toggles only when something in the tree has children.
  const nested = !!tree && hasChildren(items)
  const template = gridTemplate(columns, [...flatten(items).map((e) => e.uri ?? ''), ...urls], nested, !!tree)
  const titleColumn: Column = { id: 'title', label: t('Title'), width: 0, sort: 'title', render: () => null }
  const ids = flatten(items).map((e) => e.id)
  const chosen = ids.filter((id) => selected.has(id)).length

  return (
    <TableFrame template={template} label={t('Entries')} busy={loading || stale}>
        <TableRow header className="relative">
          <div role="columnheader" className={GUTTER}>
            <Checkbox checked={ids.length > 0 && chosen === ids.length} indeterminate={chosen > 0 && chosen < ids.length} label={<span className="sr-only">{t('Select All')}</span>} onChange={(on) => onSelect(ids, on)} disabled={loading || ids.length === 0} />
          </div>
          {nested && <span role="none" />}
          <HeaderCell column={titleColumn} sort={sort} onSort={onSort} />
          {columns.map((column) => <HeaderCell key={column.id} column={column} sort={sort} onSort={onSort} />)}
          <TableHeader label={t('Actions')} hiddenLabel />
        </TableRow>

        {loading ? (
          <SkeletonRows columns={columns} tree={nested} />
        ) : (
          <div className={cn('transition-opacity duration-180', stale && 'opacity-60')}>
            {tree ? (
              <TreeLevel handle={handle} nested={nested} nodes={items} parentId={null} depth={0} columns={columns} ctx={ctx} selected={selected} onSelect={onSelect} cursor={cursor} />
            ) : (
              items.map((item) => <EntryRow key={item.id} item={item} handle={handle} columns={columns} ctx={ctx} selected={selected.has(item.id)} onSelect={onSelect} active={cursor === item.id} />)
            )}
          </div>
        )}
    </TableFrame>
  )
}

/** Width of an address in the table's monospace text, so the URL column grows to fit before the title gives way. */
const urlTrack = (urls: string[]) => `minmax(120px,${Math.min(360, Math.max(120, Math.ceil(Math.max(0, ...urls.map((u) => u.length)) * 7.3) + 8))}px)`

/**
 * One template for every entries table (and the built-in pages under Pages): the title, the
 * columns, the row actions. A tree has a track of no width before the title, so its gap holds
 * the expand toggles. The checkboxes lie in the gutter left of the rows (`GUTTER`), so titles
 * line up with the search above them.
 */
export function gridTemplate(columns: Column[], urls: string[] = [], nested = false, tree = nested): string {
  // A tree's row actions start with its drag handle.
  return [...(nested ? ['0px'] : []), 'minmax(200px,1fr)', ...columns.map((c) => c.id === 'uri' ? urlTrack(urls) : typeof c.width === 'number' ? `${c.width}px` : c.width), tree ? '76px' : '52px'].join(' ')
}

/** A row's checkbox: in the sheet's gutter, left of the row, on a wide screen; before the title on a phone. */
export const GUTTER = 'relative z-10 flex items-center max-sm:w-4 max-sm:shrink-0 sm:absolute sm:right-full sm:top-1/2 sm:-translate-y-1/2 md:mr-1 [&_label]:gap-0'

export const hasChildren = (nodes: ListItem[]) => nodes.some((node) => (node.children?.length ?? 0) > 0)

export function flatten(nodes: ListItem[]): ListItem[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children ?? [])])
}

function HeaderCell({ column, sort, onSort }: { column: Column; sort: TableSort | null; onSort: (c: Column) => void }) {
  const active = sort?.field === column.sort
  return <TableHeader label={column.label} align={column.align} direction={active ? sort!.desc ? 'descending' : 'ascending' : undefined} onSort={column.sort ? () => onSort(column) : undefined} />
}

function SkeletonRows({ columns, tree }: { columns: Column[]; tree?: boolean }) {
  const widths = ['56%', '38%', '64%', '44%', '50%', '32%', '60%', '42%']
  return (
    <div aria-hidden="true">
      {widths.map((w, i) => (
        <TableRow key={i} className="max-sm:[&>*:nth-child(n+3)]:hidden">
          {tree && <span />}
          <div style={{ width: w }} className="max-sm:flex-1"><Skeleton className="h-3" /></div>
          {columns.map((c) => <Skeleton key={c.id} className="h-3 w-3/5" />)}
          <span />
        </TableRow>
      ))}
    </div>
  )
}

interface RowProps {
  item: ListItem
  handle: string
  columns: Column[]
  ctx: CellContext
  selected: boolean
  onSelect: (ids: string[], on: boolean) => void
  active?: boolean
  depth?: number
  expander?: ReactNode
  dragHandle?: ReactNode
  /** In a tree: the toggles' track before the title. */
  tree?: boolean
}

function EntryRow({ item, handle, columns, ctx, selected, onSelect, active, depth = 0, expander, dragHandle, tree }: RowProps) {
  return (
    <TableRow recordId={item.id} selected={selected} active={active}>
      <div role="cell" data-row-check="" className={GUTTER}>
        <Checkbox checked={selected} onChange={(on) => onSelect([item.id], on)} label={<span className="sr-only">{t('Select {name}', { name: item.title || t('Untitled') })}</span>} />
      </div>
      {tree && <span role="none" className="max-sm:hidden" />}
      <div role="cell" className="flex min-w-0 items-center max-sm:flex-1" style={depth ? { paddingLeft: depth * INDENT } : undefined}>
        {expander}
        {/* The link covers the whole row; controls sit above it. */}
        <Link to={`/content/${handle}/${item.id}`} className="min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus">
          {item.title || <span className="text-faint">{t('Untitled')}</span>}
        </Link>
      </div>
      <TableMeta>
        {columns.map((column) => (
          <div key={column.id} role="cell" data-align={column.align} className={cn('flex min-w-0 items-center', column.align === 'end' && 'justify-end')}>
            {column.render(item, ctx)}
          </div>
        ))}
      </TableMeta>
      <div role="cell" data-table-actions className={rowActionsClass}>
        {dragHandle}
        <EntryActions item={item} handle={handle} />
      </div>
    </TableRow>
  )
}

interface LevelProps {
  handle: string
  nodes: ListItem[]
  parentId: string | null
  depth: number
  columns: Column[]
  ctx: CellContext
  selected: Set<string>
  onSelect: (ids: string[], on: boolean) => void
  cursor: string | null
  nested: boolean
}

/** One level of the tree: siblings reorder by dragging; children open and close. */
function TreeLevel(props: LevelProps & { collapsed?: Record<string, boolean>; setCollapsed?: (fn: (c: Record<string, boolean>) => Record<string, boolean>) => void }) {
  const [own, setOwn] = useState<Record<string, boolean>>({})
  const collapsed = props.collapsed ?? own
  const setCollapsed = props.setCollapsed ?? setOwn
  const { handle, nodes, parentId, depth } = props
  const capabilities = useManifest().collections.find((collection) => collection.handle === handle)?.can
  const editable = nodes.every((node) => entryActionAvailability(capabilities, node).move)
  const [order, setOrder] = useState<ListItem[] | null>(null)
  const list = order ?? nodes
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const onDragEnd = async (e: DragEndEvent) => {
    if (!editable || !e.over || e.active.id === e.over.id) return
    const ids = list.map((n) => n.id)
    const next = arrayMove(list, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)))
    setOrder(next)
    try {
      await run('entries/reorder', { collection: handle, ids: next.map((n) => n.id), parentId, versions: Object.fromEntries(next.map((node) => [node.id, node.version])) })
      invalidate('entries/')
    } catch (err) {
      toast.error(err)
    } finally {
      setOrder(null)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={list.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {list.map((node) => {
          const children = node.children ?? []
          const open = !collapsed[node.id]
          return (
            <SortableTreeRow key={node.id} id={node.id} disabled={!editable}>
              {(dragHandle) => (
                <>
                  <EntryRow
                    item={node}
                    handle={handle}
                    columns={props.columns}
                    ctx={props.ctx}
                    selected={props.selected.has(node.id)}
                    onSelect={props.onSelect}
                    active={props.cursor === node.id}
                    depth={depth}
                    tree={props.nested}
                    dragHandle={dragHandle}
                    expander={
                      children.length > 0 && (
                        // Sits in the space left of the title, so titles line up whatever their children.
                        <button
                          type="button"
                          onClick={() => setCollapsed((c) => ({ ...c, [node.id]: open }))}
                          className="relative z-10 -ml-5 mr-0 grid size-5 shrink-0 -translate-x-0.5 place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text"
                          aria-expanded={open}
                          aria-label={open ? t('Collapse') : t('Expand')}
                        >
                          <Icon name="chevron-right" size={12} className={cn('transition-transform duration-120', open && 'rotate-90')} />
                        </button>
                      )
                    }
                  />
                  {children.length > 0 && open && <TreeLevel {...props} nodes={children} parentId={node.id} depth={depth + 1} collapsed={collapsed} setCollapsed={setCollapsed} />}
                </>
              )}
            </SortableTreeRow>
          )
        })}
      </SortableContext>
    </DndContext>
  )
}

function SortableTreeRow({ id, children, disabled }: { disabled?: boolean; id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="grid size-6 cursor-grab place-items-center rounded-xs text-faint transition-colors duration-120 hover:bg-hover hover:text-text active:cursor-grabbing max-sm:hidden"
      aria-label={t('Drag to Reorder')}
    >
      <Icon name="drag" size={14} />
    </button>
  )
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'relative z-20 bg-bg shadow-pop')}>
      {children(disabled ? null : handle)}
    </div>
  )
}
