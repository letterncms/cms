import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, pointerWithin, useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { can, loadManifest, locale, plural, registry, run, setQuery, t, useLocation, useManifest, type Arrangement, type WidgetInfo } from '@letterncms/sdk'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Button, Icon, IconButton, Menu, Page, WidgetSlot, WidgetMessage, cn, confirm, toast, useShortcut } from '@letterncms/ui'
import { Gallery } from './Gallery'

function greeting(name: string): string {
  const h = new Date().getHours()
  if (h < 5) return t('Working late, {name}', { name })
  if (h < 12) return t('Good morning, {name}', { name })
  if (h < 18) return t('Good afternoon, {name}', { name })
  return t('Good evening, {name}', { name })
}

type Column = 'main' | 'side'

/** Items prefer widget targets under the pointer; an empty column is a target of its own. */
const collision: CollisionDetection = (args) => {
  const under = pointerWithin(args)
  const widget = under.find((c) => !String(c.id).startsWith('column:'))
  if (widget) return [widget]
  if (under.length) return under
  return closestCenter(args)
}

/**
 * The home screen. A greeting, then the widgets in a main and a
 * side column. Customize turns the screen into its own editor: drag widgets within
 * and between columns, remove them, add more from the gallery. The result is the
 * user's own; admins can make it everyone's default.
 */
export default function Dashboard() {
  const manifest = useManifest()
  const location = useLocation()
  useSyncExternalStore(registry.widgets.subscribe, registry.widgets.version)
  const [draft, setDraft] = useState<Arrangement | null>(null)
  // Open for a column (added widgets go there) or for 'default' (each goes to its registered column).
  const [gallery, setGallery] = useState<Column | 'default' | null>(null)
  const [busy, setBusy] = useState(false)
  const editing = draft !== null

  // Only widgets whose module is loaded can be shown or added.
  const widgets = useMemo(() => new Map(manifest.widgets.filter((w) => registry.widgets.get(w.id)).map((w) => [w.id, w])), [manifest.widgets, registry.widgets.version()])
  const saved: Arrangement = manifest.home?.layout ?? { sections: manifest.dashboard, hidden: [] }
  const layout = draft ?? saved
  const hidden = new Set(layout.hidden)
  const shown = (column: Column) => layout.sections.find((s) => s.id === column)?.items.filter((id) => widgets.has(id) && !hidden.has(id)) ?? []
  const columns: Column[] = editing ? ['main', 'side'] : (['main', 'side'] as Column[]).filter((c) => shown(c).length > 0)

  const customize = () => setDraft(structuredClone(saved))
  const cancel = () => {
    setDraft(null)
    setGallery(null)
  }

  useEffect(() => {
    if (location.query.customize !== undefined) {
      customize()
      setQuery({ customize: null })
    }
  }, [location.query.customize])

  useShortcut('escape', () => !gallery && cancel(), editing)

  const reload = async (message?: string) => {
    await loadManifest()
    setDraft(null)
    setGallery(null)
    if (message) toast.success(message)
  }

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await fn()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  const done = () =>
    act(async () => {
      if (JSON.stringify(draft) !== JSON.stringify(saved)) await run('account/update', { preferences: { dashboard: draft } })
      await reload()
    })

  const resetToDefault = () =>
    act(async () => {
      await run('account/update', { preferences: { dashboard: null } })
      await reload(t('Home screen reset to the default'))
    })

  const saveForEveryone = () =>
    act(async () => {
      const ok = await confirm({ title: t('Make this everyone’s home screen?'), description: t('People who customized their own home screen keep theirs.'), confirm: t('Save as Default') })
      if (!ok) return
      await run('settings/update', { namespace: 'admin', values: { dashboard: draft } })
      await run('account/update', { preferences: { dashboard: null } })
      await reload(t('Saved as the default home screen'))
    })

  const update = (fn: (layout: Arrangement) => Arrangement) => setDraft((d) => (d ? fn(d) : d))
  const columnOf = (id: string) => layout.sections.find((s) => s.items.includes(id))?.id as Column | undefined

  const remove = (id: string) => update((d) => ({ ...d, hidden: [...d.hidden.filter((h) => h !== id), id] }))
  const add = (id: string, column: Column) =>
    update((d) => ({
      sections: d.sections.map((s) => ({ ...s, items: s.id === column ? [...s.items.filter((i) => i !== id), id] : s.items.filter((i) => i !== id) })),
      hidden: d.hidden.filter((h) => h !== id),
    }))

  return (
    <Page
      crumbs={[{ label: t('Dashboard'), icon: 'grid' }]}
      width="default"
      actions={
        editing ? (
          <>
            <Button icon="plus" variant="ghost" onClick={() => setGallery('default')}>
              {t('Add Widget')}
            </Button>
            {(manifest.home?.personal || can('settings.manage')) && (
              <Menu
                trigger={<IconButton icon="more" label={t('More')} />}
                items={[
                  can('settings.manage') && { label: t('Save as Default'), onSelect: saveForEveryone },
                  manifest.home?.personal && { label: t('Reset to Default'), icon: 'undo', onSelect: resetToDefault },
                ]}
              />
            )}
            <span className="mx-1 h-4 w-px bg-border" />
            <Button variant="ghost" onClick={cancel}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" loading={busy} onClick={done}>
              {t('Done')}
            </Button>
          </>
        ) : (
          <Button variant="ghost" icon="layout" onClick={customize}>
            {t('Customize')}
          </Button>
        )
      }
    >
      <Greeting />
      <Notices />

      {editing ? (
        <EditGrid widgets={widgets} shown={shown} setDraft={setDraft} columnOf={columnOf} onRemove={remove} onAdd={setGallery} />
      ) : columns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong">
          <WidgetMessage icon="layout" title={t('Your home screen is empty')} description={t('Add widgets for what you want to keep an eye on.')} action={<Button icon="plus" onClick={() => { customize(); setGallery('default') }}>{t('Add Widgets')}</Button>} />
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 gap-x-10 gap-y-10', columns.length > 1 && 'lg:grid-cols-[minmax(0,1fr)_300px]')}>
          {columns.map((column) => (
            <div key={column} className="min-w-0 space-y-10">
              {shown(column).map((id) => (
                <WidgetSlot key={id} widget={widgets.get(id)!} />
              ))}
            </div>
          ))}
        </div>
      )}

      <Gallery
        open={gallery !== null}
        onOpenChange={(open) => !open && setGallery(null)}
        widgets={[...widgets.values()]}
        shown={new Set([...shown('main'), ...shown('side')])}
        onAdd={(widget) => add(widget.id, gallery === 'default' || gallery === null ? widget.column : gallery)}
        onRemove={remove}
      />
    </Page>
  )
}

function Greeting() {
  const manifest = useManifest()
  const firstName = manifest.user.name.split(' ')[0]

  return (
    <div className="mb-10">
      <p className="m-0 text-sm text-muted">{new Date().toLocaleDateString(locale(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      <h1 className="m-0 mt-1 text-[28px] font-semibold leading-9 tracking-[-0.025em] text-ink">{greeting(firstName)}</h1>
    </div>
  )
}

/** What needs someone's attention before anything else: pending database updates, invalid plugins (debug mode). */
function Notices() {
  const manifest = useManifest()
  const pending = Object.keys(manifest.packages.pending)
  const problems = Object.entries(manifest.home?.problems ?? {})

  return (
    <>
      {problems.length > 0 && (
        <div role="alert" className="mb-8 rounded-lg border border-danger/25 bg-danger/5 px-4 py-3 text-sm">
          <p className="m-0 flex items-center gap-2 font-medium text-ink">
            <Icon name="warning" size={15} className="text-danger" />
            {plural(problems.length, '{count} plugin is invalid', '{count} plugins are invalid')}
          </p>
          <ul className="m-0 mt-1.5 list-none space-y-0.5 pl-[23px] text-muted">
            {problems.map(([name, problem]) => (
              <li key={name}>
                <span className="font-mono text-xs text-text">{name}</span> — {problem}
              </li>
            ))}
          </ul>
        </div>
      )}
      {pending.length > 0 && can('packages.manage') && (
        <div className="mb-8 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/6 px-4 py-3">
          <Icon name="database" className="text-warning" />
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-medium text-ink">{t('Database updates pending')}</span>
            <span className="text-muted"> · {pending.join(', ')}</span>
          </div>
          <Button size="sm" variant="primary" onClick={() => run('packages/sync').then(() => { toast.success(t('Updated')); window.location.reload() }, toast.error)}>
            {t('Run Updates')}
          </Button>
        </div>
      )}
    </>
  )
}

function EditGrid({ widgets, shown, setDraft, columnOf, onRemove, onAdd }: { widgets: Map<string, WidgetInfo>; shown: (c: Column) => string[]; setDraft: (fn: (d: Arrangement | null) => Arrangement | null) => void; columnOf: (id: string) => Column | undefined; onRemove: (id: string) => void; onAdd: (column: Column) => void }) {
  const [active, setActive] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const target = (id: string | number) => (String(id).startsWith('column:') ? (String(id).slice(7) as Column) : columnOf(String(id)))

  // Moving between columns happens while dragging, so the widget follows the pointer.
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const id = String(active.id)
    const from = columnOf(id)
    const to = target(over.id)
    if (!from || !to || from === to) return
    setDraft((d) =>
      d && {
        ...d,
        sections: d.sections.map((s) => {
          if (s.id === from) return { ...s, items: s.items.filter((i) => i !== id) }
          if (s.id !== to) return s
          const at = String(over.id).startsWith('column:') ? s.items.length : Math.max(0, s.items.indexOf(String(over.id)))
          return { ...s, items: [...s.items.slice(0, at), id, ...s.items.slice(at)] }
        }),
      },
    )
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActive(null)
    if (!over || active.id === over.id || String(over.id).startsWith('column:')) return
    const column = columnOf(String(active.id))
    setDraft((d) =>
      d && {
        ...d,
        sections: d.sections.map((s) => {
          if (s.id !== column) return s
          const from = s.items.indexOf(String(active.id))
          const to = s.items.indexOf(String(over.id))
          return from < 0 || to < 0 ? s : { ...s, items: arrayMove(s.items, from, to) }
        }),
      },
    )
  }

  const dragged = active ? widgets.get(active) : null

  return (
    <DndContext sensors={sensors} collisionDetection={collision} onDragStart={(e) => setActive(String(e.active.id))} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        {(['main', 'side'] as Column[]).map((column) => (
          <EditColumn key={column} column={column} ids={shown(column)} widgets={widgets} active={active} onRemove={onRemove} onAdd={() => onAdd(column)} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        {dragged && (
          <div className="flex h-11 cursor-grabbing items-center gap-2.5 rounded-lg bg-bg px-3.5 text-sm font-medium text-ink shadow-pop">
            <Icon name="drag" size={14} className="text-faint" />
            <Icon name={dragged.icon} size={15} className="text-muted" />
            {dragged.label}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function EditColumn({ column, ids, widgets, active, onRemove, onAdd }: { column: Column; ids: string[]; widgets: Map<string, WidgetInfo>; active: string | null; onRemove: (id: string) => void; onAdd: () => void }) {
  const drop = useDroppable({ id: `column:${column}` })

  return (
    <div ref={drop.setNodeRef} className="min-w-0">
      <p className="m-0 mb-2 text-2xs font-medium uppercase tracking-[0.04em] text-faint">{column === 'main' ? t('Main Column') : t('Side Column')}</p>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="space-y-3">
          {ids.map((id) => (
            <EditableWidget key={id} widget={widgets.get(id)!} dragging={active === id} onRemove={() => onRemove(id)} />
          ))}
        </div>
      </SortableContext>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          'mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-120 hover:border-faint hover:bg-surface hover:text-text',
          ids.length === 0 ? 'h-32' : 'h-11',
          drop.isOver && ids.length === 0 && 'border-focus bg-focus/5',
        )}
      >
        <Icon name="plus" size={14} />
        {t('Add Widget')}
      </button>
    </div>
  )
}

/** In edit mode a widget is a card you can pick up; its content shows but does not react. */
function EditableWidget({ widget, dragging, onRemove }: { widget: WidgetInfo; dragging: boolean; onRemove: () => void }) {
  const sortable = useSortable({ id: widget.id })
  // Tall widgets are cut short; only those fade out at the bottom.
  const [clipped, setClipped] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const observer = new ResizeObserver(() => setClipped(el.scrollHeight > el.clientHeight + 1))
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition }}
      className={cn('group relative rounded-lg border border-border bg-bg transition-[border-color,box-shadow,opacity] duration-120 hover:border-border-strong', dragging && 'opacity-40')}
    >
      <div
        {...sortable.attributes}
        {...sortable.listeners}
        ref={box}
        aria-label={t('Move {widget}', { widget: widget.label })}
        className={cn('max-h-80 cursor-grab overflow-hidden rounded-lg px-4 pb-4 pt-3 outline-none focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing', clipped && '[mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)]')}
      >
        <div inert className="pointer-events-none select-none">
          <WidgetSlot widget={widget} />
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={t('Remove {widget}', { widget: widget.label })}
        title={t('Remove')}
        className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-bg text-muted shadow-pop transition-[color,transform] duration-120 hover:scale-105 hover:text-danger"
      >
        <Icon name="minus" size={13} />
      </button>
    </div>
  )
}
