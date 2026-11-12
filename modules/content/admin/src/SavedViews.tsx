import { invalidate, run, setQuery, t, useAbility, useLocation, type SurfaceComponentProps } from '@letterncms/sdk'
import { Button, Icon, Menu, Tabs, confirm, prompt, setViewPrefs, toast, useViewPrefs } from '@letterncms/ui'
import { useSyncExternalStore } from 'react'

interface State { query: Record<string, string>; sort: string | null; columns: string[] | null; view: 'table' | 'grid' | 'calendar'; calendarDate: 'published' | 'updated' }

interface SavedView {
  id: string
  list: string
  name: string
  state: State
}

interface Props {
  /** The list's id, as its view names it (`entries.pages`). */
  list: string
  /** What narrows the list, by the name each has in the address. */
  params: string[]
  defaultView?: 'table' | 'grid' | 'calendar'
  /** Where the list draws it: `header`, the tabs above the toolbar; `toolbar`, what saves the list as it is. */
  slot?: 'header' | 'toolbar'
}

const ALL = '__all'

// The tab someone chose, per list: both slots read it, and it stays while they change the list under it.
const chosen = new Map<string, string>()
const listeners = new Set<() => void>()
const choose = (list: string, id: string) => { chosen.set(list, id); listeners.forEach((l) => l()) }
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l) } }

const same = (a: string[] | null, b: string[] | null) => (a === null || b === null ? a === b : a.length === b.length && a.every((id) => b.includes(id)))
const keeps = (state: State, now: State) => state.view === now.view && state.sort === now.sort && same(state.columns, now.columns)
  && (state.view !== 'calendar' || state.calendarDate === now.calendarDate)
  && Object.keys(state.query).length === Object.keys(now.query).length && Object.entries(state.query).every(([p, v]) => now.query[p] === v)

/**
 * A person's saved views of one list (`content/views`), as tabs above it: All, then each view. Choosing a
 * tab puts the list back as it was saved (what narrows it, its order, columns and kind of view); choosing
 * the tab on view again opens its Rename and Delete. Once the list differs from its tab, the tab shows a dot
 * and the toolbar offers Save View (on a saved view: update it or save a new one) and Reset. Without saved
 * views there are no tabs. Kept with the account (`saved-views/…`).
 */
export default function SavedViews({ props }: SurfaceComponentProps<Props>) {
  const { list, params, defaultView = 'table', slot = 'toolbar' } = props
  const views = useAbility<SavedView[]>('saved-views/list', { list })
  const { query } = useLocation()
  const prefs = `overview.${list}`
  const [display] = useViewPrefs(prefs, defaultView)
  const picked = useSyncExternalStore(subscribe, () => chosen.get(list))
  const saved = views.data ?? []
  const now: State = { query: Object.fromEntries(params.flatMap((p) => (query[p] ? [[p, query[p]]] : []))), sort: display.sort, columns: display.columns, view: display.view, calendarDate: display.calendarDate }
  const all: State = { query: {}, sort: null, columns: null, view: defaultView, calendarDate: 'published' }

  // The tab on view: the one chosen while it exists, otherwise the one that keeps exactly what is on screen.
  const tab = (picked === ALL || saved.some((v) => v.id === picked) ? picked : undefined) ?? saved.find((v) => keeps(v.state, now))?.id ?? ALL
  const view = saved.find((v) => v.id === tab)
  const changed = !keeps(view?.state ?? all, now)

  const apply = (id: string) => {
    const { query: kept, ...shown } = saved.find((v) => v.id === id)?.state ?? all
    choose(list, id)
    setViewPrefs(prefs, id === ALL ? { view: null, sort: null, columns: null, calendarDate: 'published' } : shown)
    setQuery({ ...Object.fromEntries(params.map((p) => [p, kept[p] ?? null])), page: null, month: null })
  }

  const save = async () => {
    const values = await prompt({ title: t('Save View'), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true, max: 60 }], confirm: t('Save View') })
    const called = String(values?.name ?? '').trim()
    if (!called) return
    try {
      const made = await run<SavedView>('saved-views/create', { list, name: called, state: now })
      choose(list, made.id)
      invalidate('saved-views/')
      toast.success(t('View saved'))
    } catch (e) { toast.error(e) }
  }

  const update = async () => {
    if (!view) return
    try {
      await run('saved-views/update', { id: view.id, state: now })
      invalidate('saved-views/')
      toast.success(t('View saved'))
    } catch (e) { toast.error(e) }
  }

  const rename = async () => {
    if (!view) return
    const values = await prompt({ title: t('Rename View'), confirm: t('Rename'), values: { name: view.name }, fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true, max: 60 }] })
    const called = String(values?.name ?? '').trim()
    if (!called || called === view.name) return
    try {
      await run('saved-views/update', { id: view.id, name: called })
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  const remove = async () => {
    if (!view || !(await confirm({ title: t('Delete “{name}”?', { name: view.name }), confirm: t('Delete'), danger: true }))) return
    try {
      await run('saved-views/delete', { id: view.id })
      choose(list, ALL)
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  if (slot === 'header') {
    if (saved.length === 0) return null
    return (
      <Tabs className="mb-3" value={tab} onChange={apply} tabs={[
        { value: ALL, label: t('All'), indicator: tab === ALL && changed },
        ...saved.map((v) => ({ value: v.id, label: v.name, indicator: v.id === tab && changed, menu: [
          { label: t('Rename View'), icon: 'edit', onSelect: () => void rename() },
          { label: t('Delete View'), icon: 'trash', danger: true, onSelect: () => void remove() },
        ] })),
      ]} />
    )
  }

  // The list as its tab keeps it: nothing to save.
  if (!changed) return null
  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => apply(tab)}>{t('Reset')}</Button>
      {view
        ? <Menu trigger={<Button size="sm" variant="secondary">{t('Save View')}<Icon name="chevron-down" size={14} className="-mr-0.5 shrink-0 text-muted" /></Button>} items={[
          { label: t('Update “{name}”', { name: view.name }), onSelect: () => void update() },
          { label: t('Save as New View'), onSelect: () => void save() },
        ]} />
        : <Button size="sm" variant="secondary" onClick={() => void save()}>{t('Save View')}</Button>}
    </>
  )
}
