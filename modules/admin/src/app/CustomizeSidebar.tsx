import { KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { Pressable } from '../ui/Pressable'
import { DndContext } from '../ui/dnd'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { can, t, useManifest, type NavItem } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Button, Dialog, Icon, Switch, cn } from '../ui'
import { isPinned, loadSiteDefault, reorder, resetEveryonesDefault, resetToDefault, saveForEveryone, setPinned } from './sidebarStore'

/**
 * Every item of the sidebar, section by section: pin or unpin, drag to
 * reorder. Changes apply as they are made; the sidebar behind follows.
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

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('Customize Sidebar')}
      // Changes apply as they are made: the dialog closes like any other, with nothing to confirm.
      footer={(layout.personal || manage) && (
        <>
          {layout.personal && <Button variant="ghost" icon="undo" onClick={() => void resetToDefault()}>{t('Reset to Default')}</Button>}
          {manage && <Button variant="ghost" onClick={() => void saveForEveryone().then(() => loadSiteDefault()).then((result) => setCustomized(!!result?.customized))}>{t('Save as Default')}</Button>}
          {manage && customized && <Button variant="ghost" onClick={() => void resetEveryonesDefault().then((done) => done && setCustomized(false))}>{t('Reset Everyone’s Default')}</Button>}
        </>
      )}
    >
      {layout.sections.map((section) => {
        const ids = section.items.filter((id) => items.has(id))
        if (!ids.length) return null
        return (
          <section key={section.id} className="mb-4 last:mb-1">
            {/* Named as the sidebar names it: the first section has no name there, so none here. */}
            {section.label && <h3 className="cms-label m-0 mb-1 px-2">{section.label}</h3>}
            <Items section={section.id} ids={ids} all={section.items} items={items} pinned={(id) => isPinned(layout, id)} />
          </section>
        )
      })}
    </Dialog>
  )
}

function Items({ section, ids, all, items, pinned }: { section: string; ids: string[]; all: string[]; items: Map<string, NavItem>; pinned: (id: string) => boolean }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  const end = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    // Items this person may not open keep their place among the others.
    const moved = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
    let next = 0
    reorder(section, all.map((id) => (items.has(id) ? moved[next++] : id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="m-0 list-none space-y-px p-0">
          {ids.map((id) => <Item key={id} item={items.get(id)!} pinned={pinned(id)} />)}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function Item({ item, pinned }: { item: NavItem; pinned: boolean }) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      className={cn('flex h-9 items-center gap-2 rounded-md px-1 hover:bg-hover', isDragging && 'relative z-drag bg-bg shadow-pop')}
    >
      <Pressable
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={t('Reorder {label}', { label: item.label })}
        className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-xs text-faint outline-offset-[-2px] hover:text-text active:cursor-grabbing"
      >
        <Icon name="drag" size={14} />
      </Pressable>
      {/* The switch says whether it is pinned; the row stays as legible either way. */}
      <Icon name={item.icon} size={16} className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1 truncate text-sm text-text">{item.label}</span>
      <Switch size="sm" checked={pinned} onChange={(on) => setPinned(item.id, on)} aria-label={t('Pin {label}', { label: item.label })} />
    </li>
  )
}
