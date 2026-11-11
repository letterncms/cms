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
 * names the view the list is in, and a menu of the views, with Save View, Rename View and Delete View under them
 * (any view: with several, a field asks which). Choosing one puts the list
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

  const saved = views.data ?? []
  // Which view an act is about: with several, a field asks, starting on the view the list is in. Any of them can be renamed or deleted.
  const which = { handle: 'id', type: 'select', label: t('View'), required: true, options: saved.map((view) => ({ value: view.id, label: view.name })) }
  const first = active?.id ?? saved[0]?.id

  const save = async () => {
    const values = await prompt({ title: t('Save View'), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true, autofocus: true, max: 60 }], confirm: t('Save View') })
    const called = String(values?.name ?? '').trim()
    if (!called) return
    try {
      await run('saved-views/create', { list, name: called, state: { query: narrowed, sort: now.sort, columns: now.columns, view: now.view, calendarDate: now.calendarDate } })
      invalidate('saved-views/')
      toast.success(t('View saved'))
    } catch (e) { toast.error(e) }
  }

  const rename = async () => {
    const values = await prompt({
      title: t('Rename View'), confirm: t('Rename'), values: { id: first, name: saved.length === 1 ? saved[0].name : '' },
      fields: [...(saved.length > 1 ? [which] : []), { handle: 'name', type: 'text', label: saved.length > 1 ? t('New Name') : t('Name'), required: true, autofocus: true, max: 60 }],
    })
    const view = saved.find((v) => v.id === (values?.id ?? first))
    const called = String(values?.name ?? '').trim()
    if (!view || !called || called === view.name) return
    try {
      await run('saved-views/update', { id: view.id, name: called })
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  const remove = async () => {
    // With several, the dialog that asks which is the one that confirms it; with one, the usual question.
    const chosen = saved.length > 1 ? await prompt({ title: t('Delete View'), confirm: t('Delete View'), danger: true, values: { id: first }, fields: [which] }) : { id: first }
    const view = saved.find((v) => v.id === chosen?.id)
    if (!view || (saved.length === 1 && !(await confirm({ title: t('Delete “{name}”?', { name: view.name }), confirm: t('Delete'), danger: true })))) return
    try {
      await run('saved-views/delete', { id: view.id })
      invalidate('saved-views/')
    } catch (e) { toast.error(e) }
  }

  return (
    <Menu
      trigger={<Button size="sm" variant="ghost" icon="star" className="max-w-48"><span className="truncate">{active?.name ?? t('Views')}</span></Button>}
      items={[
        ...saved.map((view) => ({ label: view.name, checked: view.id === active?.id, onSelect: () => apply(view) })),
        saved.length > 0 && { separator: true, label: '' },
        // The view on screen is already kept: there is nothing to save again.
        !active && { label: t('Save View'), icon: 'plus', onSelect: () => void save() },
        saved.length > 0 && { label: t('Rename View'), icon: 'edit', onSelect: () => void rename() },
        saved.length > 0 && { label: t('Delete View'), icon: 'trash', danger: true, onSelect: () => void remove() },
      ]}
    />
  )
}
