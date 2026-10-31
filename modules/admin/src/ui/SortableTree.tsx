import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type DragMoveEvent, type DragStartEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { t } from '@letterncms/sdk'
import { useMemo, useState, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

/** A tree node as the editor sees it: any data plus children. */
export interface TreeItem {
  id: string
  children?: TreeItem[]
  [key: string]: unknown
}

interface Flat<T extends TreeItem> {
  item: T
  depth: number
  parent: string | null
}

export interface SortableTreeProps<T extends TreeItem> {
  items: T[]
  onChange: (items: T[]) => void
  /** Row content. `handle` is the drag grip; place it where it fits. */
  renderItem: (item: T, ctx: { depth: number; handle: ReactNode; indent: () => void; outdent: () => void; canIndent: boolean; canOutdent: boolean }) => ReactNode
  maxDepth?: number
  /** Pixels per level; also the horizontal drag distance that changes the level. */
  indent?: number
  className?: string
}

/**
 * Drag-and-drop tree editor (menus, page trees). Drag vertically to reorder,
 * sideways to nest; children travel with their parent. Keyboard: focus the
 * grip, space to lift, arrows to move, space to drop.
 */
export function SortableTree<T extends TreeItem>({ items, onChange, renderItem, maxDepth = 5, indent = 24, className }: SortableTreeProps<T>) {
  const [active, setActive] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [over, setOver] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const flat = useMemo(() => flatten(items), [items])
  // While dragging, the dragged item's descendants are hidden (they move with it).
  const visible = useMemo(() => {
    if (!active) return flat
    const hidden = new Set(descendants(flat, active))
    return flat.filter((f) => !hidden.has(f.item.id))
  }, [flat, active])

  const projection = active && over ? project(visible, active, over, offset, indent, maxDepth) : null

  const commit = (next: Flat<T>[]) => onChange(build(next))

  const shift = (id: string, delta: number) => {
    const index = flat.findIndex((f) => f.item.id === id)
    const target = flat[index].depth + delta
    const prev = flat[index - 1]
    if (target < 0 || target > maxDepth || (delta > 0 && (!prev || target > prev.depth + 1))) return
    const moving = new Set([id, ...descendants(flat, id)])
    commit(flat.map((f) => (moving.has(f.item.id) ? { ...f, depth: f.depth + delta } : f)))
  }

  const onDragStart = ({ active: a }: DragStartEvent) => {
    setActive(String(a.id))
    setOver(String(a.id))
    setOffset(0)
  }
  const onDragMove = ({ delta, over: o }: DragMoveEvent) => {
    setOffset(delta.x)
    if (o) setOver(String(o.id))
  }
  const reset = () => {
    setActive(null)
    setOver(null)
    setOffset(0)
  }
  const onDragEnd = ({ active: a, over: o }: DragEndEvent) => {
    const id = String(a.id)
    const p = o ? project(visible, id, String(o.id), offset, indent, maxDepth) : null
    reset()
    if (!o || !p) return

    // `visible` lacks the dragged item's descendants; reinsert them right after it at the new depth.
    const moving = new Set([id, ...descendants(flat, id)])
    const block = flat.filter((f) => moving.has(f.item.id))
    const ordered = arrayMove(visible, visible.findIndex((f) => f.item.id === id), visible.findIndex((f) => f.item.id === String(o.id)))
    const at = ordered.findIndex((f) => f.item.id === id)
    const delta = p.depth - block[0].depth
    commit([...ordered.slice(0, at), ...block.map((f) => ({ ...f, depth: f.depth + delta })), ...ordered.slice(at + 1)])
  }

  const activeFlat = active ? flat.find((f) => f.item.id === active) : null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd} onDragCancel={reset}>
      <SortableContext items={visible.map((f) => f.item.id)} strategy={verticalListSortingStrategy}>
        <div className={cn('space-y-px', className)} role="tree">
          {visible.map((f, i) => {
            const depth = f.item.id === active && projection ? projection.depth : f.depth
            const prev = visible[i - 1]
            return (
              <Row key={f.item.id} id={f.item.id} depth={depth} indent={indent} ghost={f.item.id === active}>
                {(handle) =>
                  renderItem(f.item, {
                    depth,
                    handle,
                    indent: () => shift(f.item.id, 1),
                    outdent: () => shift(f.item.id, -1),
                    canIndent: !!prev && f.depth <= prev.depth && f.depth < maxDepth,
                    canOutdent: f.depth > 0,
                  })
                }
              </Row>
            )
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeFlat && (
          <div className="rounded-sm bg-bg shadow-pop">
            {renderItem(activeFlat.item, { depth: 0, handle: <Grip />, indent: () => {}, outdent: () => {}, canIndent: false, canOutdent: false })}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function Row({ id, depth, indent, ghost, children }: { id: string; depth: number; indent: number; ghost: boolean; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const handle = (
    <button type="button" {...attributes} {...listeners} className="grid size-6 shrink-0 cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing" aria-label={t('Drag to Move')}>
      <Icon name="drag" size={14} />
    </button>
  )
  return (
    <div
      ref={setNodeRef}
      role="treeitem"
      aria-level={depth + 1}
      style={{ transform: CSS.Translate.toString(transform), transition, paddingLeft: depth * indent }}
      className={cn('transition-[padding] duration-120', ghost && 'opacity-40')}
    >
      {children(handle)}
    </div>
  )
}

function Grip() {
  return (
    <span className="grid size-6 shrink-0 place-items-center text-faint">
      <Icon name="drag" size={14} />
    </span>
  )
}

function flatten<T extends TreeItem>(items: T[], depth = 0, parent: string | null = null): Flat<T>[] {
  return items.flatMap((item) => [{ item, depth, parent }, ...flatten((item.children ?? []) as T[], depth + 1, item.id)])
}

function descendants<T extends TreeItem>(flat: Flat<T>[], id: string): string[] {
  const index = flat.findIndex((f) => f.item.id === id)
  if (index < 0) return []
  const out: string[] = []
  for (let i = index + 1; i < flat.length && flat[i].depth > flat[index].depth; i++) out.push(flat[i].item.id)
  return out
}

/** Depth the dragged item would land at, from its new neighbors and the sideways drag. */
function project<T extends TreeItem>(visible: Flat<T>[], activeId: string, overId: string, offset: number, indent: number, maxDepth: number) {
  const from = visible.findIndex((f) => f.item.id === activeId)
  const to = visible.findIndex((f) => f.item.id === overId)
  if (from < 0 || to < 0) return null
  const moved = arrayMove(visible, from, to)
  const prev = moved[to - 1]
  const next = moved[to + 1]
  const wanted = visible[from].depth + Math.round(offset / indent)
  const max = Math.min(maxDepth, prev ? prev.depth + 1 : 0)
  const min = next ? next.depth : 0
  return { depth: Math.max(Math.min(wanted, max), Math.min(min, max)) }
}

/** Flat list (with depths) back to a nested tree. */
function build<T extends TreeItem>(flat: Flat<T>[]): T[] {
  const root: T[] = []
  const stack: { depth: number; children: T[] }[] = [{ depth: -1, children: root }]
  for (const f of flat) {
    const node = { ...f.item, children: [] as TreeItem[] } as T
    while (stack.length > 1 && stack[stack.length - 1].depth >= f.depth) stack.pop()
    stack[stack.length - 1].children.push(node)
    stack.push({ depth: f.depth, children: node.children as T[] })
  }
  return root
}
