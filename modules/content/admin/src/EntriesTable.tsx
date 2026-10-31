import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { invalidate, Link, run, t, useManifest } from '@letterncms/sdk'
import { Checkbox, DataTable, Icon, Skeleton, TableFrame, TableHeader, TableRow, cn, toast, entryActionAvailability } from '@letterncms/ui'
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
 * The entries table. One grid template for the header, the rows and the skeleton, so every
 * column lines up; in a tree only children are indented and the drag handle sits in the gutter.
 */
export function EntriesTable({ handle, columns, ctx, items, tree, loading, stale, selected, onSelect, sort, onSort, cursor }: TableProps) {
  // Trees add expand/reorder controls; flat entries use the same table as every overview.
  if (!tree) return <DataTable label={t('Entries')} items={items} rowKey={(item) => item.id} rowHref={(item) => `/content/${handle}/${item.id}`}
    columns={[
      { id: 'title', label: t('Title'), sort: 'title', render: (item) => item.title || <span className="text-faint">{t('Untitled')}</span> },
      ...columns.map((column) => ({ ...column, width: typeof column.width === 'number' ? `${column.width}px` : column.width, render: (item: ListItem) => column.render(item, ctx) })),
    ]}
    loading={loading} stale={stale} selection={{ ids: selected, onSelect }} cursor={cursor}
    sort={sort ? `${sort.desc ? '-' : ''}${sort.field}` : null} onSort={(column) => onSort(column.id === 'title' ? { id: 'title', label: t('Title'), width: 0, sort: 'title', render: () => null } : columns.find((c) => c.id === column.id)!)}
    actions={(item) => <EntryActions item={item} handle={handle} />}
  />
  const template = gridTemplate(columns, tree)
  const titleColumn: Column = { id: 'title', label: t('Title'), width: 0, sort: 'title', render: () => null }
  const ids = tree ? flatten(items).map((e) => e.id) : items.map((e) => e.id)
  const chosen = ids.filter((id) => selected.has(id)).length

  return (
    <TableFrame template={template} label={t('Entries')} busy={loading || stale}>
        <TableRow header>
          <div role="columnheader" className="flex items-center">
            <Checkbox checked={ids.length > 0 && chosen === ids.length} indeterminate={chosen > 0 && chosen < ids.length} label={<span className="sr-only">{t('Select All')}</span>} onChange={(on) => onSelect(ids, on)} disabled={loading || ids.length === 0} />
          </div>
          <HeaderCell column={titleColumn} sort={sort} onSort={onSort} />
          {columns.map((column) => <HeaderCell key={column.id} column={column} sort={sort} onSort={onSort} />)}
          <TableHeader label={t('Actions')} hiddenLabel />
        </TableRow>

        {loading ? (
          <SkeletonRows columns={columns} />
        ) : (
          <div className={cn('transition-opacity duration-180', stale && 'opacity-60')}>
            {tree ? (
              <TreeLevel handle={handle} nodes={items} parentId={null} depth={0} columns={columns} ctx={ctx} selected={selected} onSelect={onSelect} cursor={cursor} />
            ) : (
              items.map((item) => <EntryRow key={item.id} item={item} handle={handle} columns={columns} ctx={ctx} selected={selected.has(item.id)} onSelect={onSelect} active={cursor === item.id} />)
            )}
          </div>
        )}
    </TableFrame>
  )
}

export function gridTemplate(columns: Column[], tree?: boolean): string {
  // Trees leave room left of the title for the top level's expand toggle.
  return [`${tree ? 28 : 16}px`, 'minmax(200px,1fr)', ...columns.map((c) => (typeof c.width === 'number' ? `${c.width}px` : c.width)), '52px'].join(' ')
}

export function flatten(nodes: ListItem[]): ListItem[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children ?? [])])
}

function HeaderCell({ column, sort, onSort }: { column: Column; sort: TableSort | null; onSort: (c: Column) => void }) {
  const active = sort?.field === column.sort
  return <TableHeader label={column.label} align={column.align} direction={active ? sort!.desc ? 'descending' : 'ascending' : undefined} onSort={column.sort ? () => onSort(column) : undefined} />
}

function SkeletonRows({ columns }: { columns: Column[] }) {
  const widths = ['56%', '38%', '64%', '44%', '50%', '32%', '60%', '42%']
  return (
    <div aria-hidden="true">
      {widths.map((w, i) => (
        <TableRow key={i} className="h-9">
          <Skeleton className="size-4 rounded-[4px]" />
          <div style={{ width: w }}><Skeleton className="h-3" /></div>
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
}

function EntryRow({ item, handle, columns, ctx, selected, onSelect, active, depth = 0, expander, dragHandle }: RowProps) {
  return (
    <TableRow recordId={item.id} selected={selected} className={cn('h-9', active && 'bg-hover')}>
      {dragHandle}
      <div role="cell" className="relative z-10 flex items-center">
        <Checkbox checked={selected} onChange={(on) => onSelect([item.id], on)} label={<span className="sr-only">{t('Select {name}', { name: item.title || t('Untitled') })}</span>} />
      </div>
      <div role="cell" className="flex min-w-0 items-center" style={depth ? { paddingLeft: depth * INDENT } : undefined}>
        {expander}
        {/* The link covers the whole row; controls sit above it. */}
        <Link to={`/content/${handle}/${item.id}`} className="min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus">
          {item.title || <span className="text-faint">{t('Untitled')}</span>}
        </Link>
      </div>
      {columns.map((column) => (
        <div key={column.id} role="cell" data-align={column.align} className={cn('flex min-w-0 items-center', column.align === 'end' && 'justify-end')}>
          {column.render(item, ctx)}
        </div>
      ))}
      <div role="cell" data-table-actions className="relative z-10 flex min-w-0 items-center justify-end [&>*]:shrink-0">
        <EntryActions item={item} handle={handle} className="opacity-0 transition-opacity duration-120 group-hover:opacity-100 group-focus-within:opacity-100" />
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
      className="absolute -left-6 top-1/2 z-10 grid h-6 w-5 -translate-y-1/2 cursor-grab place-items-center rounded-xs text-faint opacity-0 transition-opacity duration-120 hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover:opacity-100 active:cursor-grabbing"
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
