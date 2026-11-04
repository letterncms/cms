import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCenter, pointerWithin, useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { can, loadManifest, locale, plural, registry, run, setQuery, t, useLocation, useManifest, type Arrangement, type WidgetInfo } from '@letterncms/sdk'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Button, Icon, IconButton, Page, WidgetSlot, WidgetMessage, cn, confirm, toast, useShortcut } from '@letterncms/ui'
import { Gallery } from './Gallery'

function greeting(name: string): string {
  const h = new Date().getHours()
  if (h < 5) return t('Working late, {name}', { name })
  if (h < 12) return t('Good morning, {name}', { name })
  if (h < 18) return t('Good afternoon, {name}', { name })
  return t('Good evening, {name}', { name })
}

type Column = 'main' | 'side'

// One grid in both modes, so Customize changes nothing's place.
const GRID = 'grid grid-cols-1 gap-x-10 gap-y-10'
const COLUMNS = 'lg:grid-cols-[minmax(0,1fr)_300px]'
const COLUMN = 'min-w-0 space-y-10'

/** Items prefer widget targets under the pointer; an empty column is a target of its own. */
const collision: CollisionDetection = (args) => {
  const under = pointerWithin(args)
  const widget = under.find((c) => !String(c.id).startsWith('column:'))
  if (widget) return [widget]
  if (under.length) return under
  return closestCenter(args)
}

/**
 * The Dashboard. A greeting, then the widgets in a main and a side column.
 * Customize turns the screen into its own editor, in place — nothing moves: drag
 * widgets within and between columns, remove them, add more from the gallery. The
 * result is the user's own; admins can make it everyone's default, or reset that.
 */
export default function Dashboard() {
  const manifest = useManifest()
  const location = useLocation()
  useSyncExternalStore(registry.widgets.subscribe, registry.widgets.version)
  const [draft, setDraft] = useState<Arrangement | null>(null)
  // Open for a column (added widgets go there) or for 'default' (each goes to its registered column).
  const [gallery, setGallery] = useState<Column | 'default' | null>(null)
  const [busy, setBusy] = useState(false)
  // Whether the site's default differs from what modules and plugins set up (asked for by those who may change it).
  const [customized, setCustomized] = useState(false)
  const editing = draft !== null
  const manage = can('settings.manage')

  // Only widgets whose module is loaded can be shown or added.
  const widgets = useMemo(() => new Map(manifest.widgets.filter((w) => registry.widgets.get(w.id)).map((w) => [w.id, w])), [manifest.widgets, registry.widgets.version()])
  const saved: Arrangement = manifest.home?.layout ?? { sections: manifest.dashboard, hidden: [] }
  const layout = draft ?? saved
  const hidden = new Set(layout.hidden)
  const shown = (column: Column) => layout.sections.find((s) => s.id === column)?.items.filter((id) => widgets.has(id) && !hidden.has(id)) ?? []
  const columns: Column[] = editing ? ['main', 'side'] : (['main', 'side'] as Column[]).filter((c) => shown(c).length > 0)

  const customize = () => {
    setDraft(structuredClone(saved))
    if (manage) run<{ customized: boolean }>('admin/arrangement', { of: 'dashboard' }).then((r) => setCustomized(r.customized), () => setCustomized(false))
  }
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
      await reload(t('Dashboard reset to the default'))
    })

  const saveForEveryone = () =>
    act(async () => {
      const ok = await confirm({ title: t('Make this everyone’s Dashboard?'), description: t('People who customized their own Dashboard keep theirs.'), confirm: t('Save as Default') })
      if (!ok) return
      await run('settings/update', { namespace: 'admin', values: { dashboard: draft } })
      await run('account/update', { preferences: { dashboard: null } })
      await reload(t('Saved as the default Dashboard'))
    })

  const resetEveryone = () =>
    act(async () => {
      const ok = await confirm({ title: t('Reset everyone’s Dashboard?'), description: t('People who customized their own Dashboard keep theirs.'), confirm: t('Reset') })
      if (!ok) return
      await run('settings/update', { namespace: 'admin', values: { dashboard: null } })
      await reload(t('Default Dashboard reset'))
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
    // The greeting heads the screen: no crumb, no title of its own.
    <Page
      width="wide"
      actions={
        editing ? (
          <>
            {manifest.home?.personal && <Button variant="ghost" icon="undo" disabled={busy} onClick={resetToDefault}>{t('Reset to Default')}</Button>}
            {manage && <Button variant="ghost" disabled={busy} onClick={saveForEveryone}>{t('Save as Default')}</Button>}
            {manage && customized && <Button variant="ghost" disabled={busy} onClick={resetEveryone}>{t('Reset Everyone’s Default')}</Button>}
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
          <WidgetMessage icon="layout" title={t('Your Dashboard is empty')} description={t('Add widgets for what you want to keep an eye on.')} action={<Button icon="plus" onClick={() => { customize(); setGallery('default') }}>{t('Add Widgets')}</Button>} />
        </div>
      ) : (
        <div className={cn(GRID, columns.length > 1 && COLUMNS)}>
          {columns.map((column) => (
            <div key={column} className={COLUMN}>
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
            <span className="font-medium text-ink">{t('Database updates are waiting')}</span>
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
      <div className={cn(GRID, COLUMNS)}>
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
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={COLUMN}>
          {ids.map((id) => (
            <EditableWidget key={id} widget={widgets.get(id)!} dragging={active === id} onRemove={() => onRemove(id)} />
          ))}
        </div>
      </SortableContext>
      <button
        type="button"
        onClick={onAdd}
        className={cn(
          // As wide as the tiles, a tile's gap below the last one.
          'flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border-strong text-sm text-muted transition-colors duration-120 hover:border-faint hover:bg-sunken hover:text-text',
          ids.length === 0 ? 'h-32' : 'mt-10 h-11',
          drop.isOver && ids.length === 0 && 'border-focus bg-focus/5',
        )}
      >
        <Icon name="plus" size={14} />
        {t('Add Widget')}
      </button>
    </div>
  )
}

/**
 * In edit mode a widget is a tile you can pick up; its content shows but does not react.
 * A ring on the tile's own edge says so (nothing shifts, no frame around it); its remove
 * button takes the place of the tile's own header link.
 */
function EditableWidget({ widget, dragging, onRemove }: { widget: WidgetInfo; dragging: boolean; onRemove: () => void }) {
  const sortable = useSortable({ id: widget.id })

  return (
    <div
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition }}
      className={cn('group relative', dragging && 'opacity-40')}
    >
      <div
        {...sortable.attributes}
        {...sortable.listeners}
        aria-label={t('Move {widget}', { widget: widget.label })}
        className="cursor-grab rounded-lg outline-none ring-1 ring-border-strong transition-shadow duration-120 hover:ring-faint focus-visible:ring-2 focus-visible:ring-focus active:cursor-grabbing"
      >
        <div inert className="pointer-events-none select-none [&_section>header>:is(a,button,div)]:invisible">
          <WidgetSlot widget={widget} />
        </div>
      </div>
      <IconButton
        icon="close"
        size="xs"
        label={t('Remove {widget}', { widget: widget.label })}
        title={undefined}
        onClick={onRemove}
        className="absolute right-3 top-4 hover:text-danger"
      />
    </div>
  )
}
