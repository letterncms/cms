import { invalidate, run, setQuery, t, useAbility, useLocation, type SurfaceComponentProps } from '@letterncms/sdk'
import { Button, Menu, confirm, prompt, setViewPrefs, toast, useViewPrefs } from '@letterncms/ui'

interface SavedView {
  id: string
  list: string
  name: string
  state: { query: Record<string, string>; sort: string | null; columns: string[] | null; view: 'table' | 'grid' | 'calendar'; calendarDate: 'published' | 'updated' }
}

interface Props {
  /** The list's id, as its view names it (`entries.pages`). */
  list: string
  /** What narrows the list, by the name each has in the address. */
  params: string[]
  defaultView?: 'table' | 'grid' | 'calendar'
}

const same = (a: string[] | null, b: string[] | null) => (a === null || b === null ? a === b : a.length === b.length && a.every((id) => b.includes(id)))

/**
 * A person's saved views of one list (`content/views`), in the list's toolbar beside Display: one button that
 * names the view the list is in, and a menu of the views, with Save View under them. Choosing one puts the list
 * back as it was saved (what narrows it, its order, columns and kind of view). Kept with the account (`saved-views/…`).
 */
export default function SavedViews({ props }: SurfaceComponentProps<Props>) {
  const { list, params, defaultView = 'table' } = props
  const views = useAbility<SavedView[]>('saved-views/list', { list })
  const { query } = useLocation()
  const prefs = `overview.${list}`
  const [now] = useViewPrefs(prefs, defaultView)
  const narrowed = Object.fromEntries(params.flatMap((p) => (query[p] ? [[p, query[p]]] : [])))
  // The view the list is in: the one that keeps exactly what is on screen.
  const active = (views.data ?? []).find(({ state }) => state.view === now.view && state.sort === now.sort && same(state.columns, now.columns)
    && (state.view !== 'calendar' || state.calendarDate === now.calendarDate)
    && Object.keys(state.query).length === Object.keys(narrowed).length && Object.entries(state.query).every(([p, v]) => narrowed[p] === v))

  const apply = (view: SavedView) => {
    const { query: kept, ...display } = view.state
    setViewPrefs(prefs, display)
    setQuery({ ...Object.fromEntries(params.map((p) => [p, kept[p] ?? null])), page: null, month: null })
  }

  const name = (title: string, confirmLabel: string, value = '') => prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true, max: 60 }], values: { name: value }, confirm: confirmLabel })
    .then((values) => String(values?.name ?? '').trim())

  const save = async () => {
    const called = await name(t('Save View'), t('Save View'))
    if (!called) return
    try {
      await run('saved-views/create', { list, name: called, state: { query: narrowed, sort: now.sort, columns: now.columns, view: now.view, calendarDate: now.calendarDate } })
      invalidate('saved-views/')
      toast.success(t('View saved'))
    } catch (e) { toast.error(e) }
  }

  const rename = async (view: SavedView) => {
    const called = await name(t('Rename View'), t('Rename'), view.name)
    if (!called || called === view.name) return
    try {
      await run('saved-views/update', { id: view.id, name: called })
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  const remove = async (view: SavedView) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name: view.name }), confirm: t('Delete'), danger: true }))) return
    try {
      await run('saved-views/delete', { id: view.id })
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  const saved = views.data ?? []
  return (
    <Menu
      trigger={<Button size="sm" variant="ghost" icon="star" className="max-w-48"><span className="truncate">{active?.name ?? t('Views')}</span></Button>}
      items={[
        ...saved.map((view) => ({ label: view.name, checked: view.id === active?.id, onSelect: () => apply(view) })),
        saved.length > 0 && { separator: true, label: '' },
        // The view on screen is already kept: what is left to do with it is its name, or to let it go.
        ...(active ? [
          { label: t('Rename View'), icon: 'edit', onSelect: () => void rename(active) },
          { label: t('Delete View'), icon: 'trash', danger: true, onSelect: () => void remove(active) },
        ] : [{ label: t('Save View'), icon: 'plus', onSelect: () => void save() }]),
      ]}
    />
  )
}
