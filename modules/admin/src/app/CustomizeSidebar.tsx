import { KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { Pressable } from '../ui/Pressable'
import { DndContext } from '../ui/dnd'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { can, t, useManifest, type NavItem } from '@letterncms/sdk'
import { useEffect, useState, type CSSProperties, type ReactNode, type Ref } from 'react'
import { Button, Dialog, Icon, Switch, cn } from '../ui'
import { SETTINGS } from '../ui/place'
import { PINNED, isPinned, loadSiteDefault, reorder, resetEveryonesDefault, resetToDefault, saveForEveryone, setPinned } from './sidebarStore'

/**
 * What can be pinned to the main sidebar: what is pinned first, dragged into order, then what is not: the
 * screens listed under Pinned to begin with, and those of each room but settings. Changes apply as they are made; the sidebar behind follows.
 */
export function CustomizeSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const manifest = useManifest()
  const layout = manifest.sidebar
  const items = new Map(manifest.nav.map((n) => [n.id, n]))
  const manage = can('settings.manage')
  // Whether the site's default differs from what modules and plugins set up: only then can it be reset.
  const [customized, setCustomized] = useState(false)
  useEffect(() => {
    if (open && manage) void loadSiteDefault().then((result) => setCustomized(!!result?.customized))
  }, [open, manage])
  const all = layout.sections.find((s) => s.id === PINNED)?.items ?? []
  const pinned = all.filter((id) => items.has(id) && isPinned(layout, id))
  // What is not pinned: the screens listed under Pinned to begin with, then each room's.
  const inRooms = new Set(manifest.rooms.flatMap((room) => room.sections.flatMap((s) => s.items)))
  const rooms = [
    { id: PINNED, label: t('Other'), ids: layout.hidden.filter((id) => items.has(id) && !inRooms.has(id)) },
    ...manifest.rooms.filter((room) => room.id !== SETTINGS).map((room) => ({ id: room.id, label: room.label, ids: room.sections.flatMap((s) => s.items).filter((id) => items.has(id) && !isPinned(layout, id)) })),
  ].filter((each) => each.ids.length > 0)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('Customize Sidebar')}
      // Changes apply as they are made: the dialog closes like any other, with nothing to confirm.
      footer={(layout.personal || manage) && (
        <>
          {layout.personal && <Button variant="ghost" icon="undo" onClick={() => void resetToDefault()}>{t('Reset to Default')}</Button>}
          {manage && <Button variant="ghost" onClick={() => void saveForEveryone().then(() => loadSiteDefault()).then((result) => setCustomized(!!result?.customized))}>{t('Save for Everyone')}</Button>}
          {manage && customized && <Button variant="ghost" onClick={() => void resetEveryonesDefault().then((done) => done && setCustomized(false))}>{t('Reset Everyone’s Default')}</Button>}
        </>
      )}
    >
      {pinned.length > 0 && (
        <section className="mb-4">
          <h3 className="cms-label m-0 mb-1 px-2">{t('Pinned')}</h3>
          <Sorted ids={pinned} all={all} items={items} />
        </section>
      )}
      {rooms.map(({ id, label, ids }) => (
        <section key={id} className="mb-4 last:mb-1">
          <h3 className="cms-label m-0 mb-1 px-2">{label}</h3>
          <ul className="m-0 list-none space-y-px p-0">
            {ids.map((id) => <Item key={id} item={items.get(id)!} pinned={false} />)}
          </ul>
        </section>
      ))}
    </Dialog>
  )
}

/** What is pinned, dragged into order. */
function Sorted({ ids, all, items }: { ids: string[]; all: string[]; items: Map<string, NavItem> }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const end = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    // What this person may not open, or has not pinned, keeps its place among the others.
    const moved = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    let next = 0
    reorder(all.map((id) => (ids.includes(id) ? moved[next++] : id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="m-0 list-none space-y-px p-0">
          {ids.map((id) => <SortableItem key={id} item={items.get(id)!} />)}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({ item }: { item: NavItem }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <Item
      item={item}
      pinned
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      dragging={isDragging}
      handle={
        <Pressable
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={t('Reorder {label}', { label: item.label })}
          className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-xs text-faint outline-offset-[-2px] hover:text-text active:cursor-grabbing"
        >
          <Icon name="drag" size={14} />
        </Pressable>
      }
    />
  )
}

/** A screen with the switch that pins it; one that is pinned has a handle to drag it into order. */
function Item({ item, pinned, handle, ref, style, dragging }: { item: NavItem; pinned: boolean; handle?: ReactNode; ref?: Ref<HTMLLIElement>; style?: CSSProperties; dragging?: boolean }) {
  return (
    <li ref={ref} style={style} className={cn('flex h-9 items-center gap-2 rounded-md px-1', dragging && 'relative z-drag bg-bg shadow-pop')}>
      {handle ?? <span className="size-6 shrink-0" />}
      <Icon name={item.icon} size={16} className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate text-sm text-text">{item.label}</span>
      <Switch size="sm" checked={pinned} onChange={(on) => setPinned(item.id, on)} aria-label={t('Pin {label}', { label: item.label })} />
    </li>
  )
}
