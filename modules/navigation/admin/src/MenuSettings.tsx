import { CmsError, invalidate, plural, run, t, useAbility, type FieldDef, type SurfaceComponentProps } from '@letterncms/sdk'
import { Dialog, Fields, Notice, QueryError } from '@letterncms/ui'
import { useEffect, useState } from 'react'

interface Item { label?: string; url?: string; target?: { title: string | null }; children: Item[] }

interface Menu {
  handle: string
  title: string
  maxDepth: number
  items: Item[]
}

/** The links nested deeper than `levels` allows, by what they say. */
const deeper = (items: Item[], levels: number, depth = 1): string[] => items.flatMap((i) => [
  ...(depth > levels ? [i.label?.trim() || i.target?.title || i.url || t('Link')] : []),
  ...deeper(i.children ?? [], levels, depth + 1),
])

// How deep links may nest, said plainly: 1 is a flat menu, 2 allows one level of submenus.
const fields = (): FieldDef[] => [
  { handle: 'title', type: 'text', label: t('Name'), required: true, autofocus: true },
  { handle: 'maxDepth', type: 'select', label: t('Submenus'), required: true, options: [
    { value: '1', label: t('No Submenus') },
    { value: '2', label: t('One Level') },
    ...[3, 4, 5].map((n) => ({ value: String(n), label: t('{count} Levels', { count: n - 1 }) })),
  ] },
]

/**
 * What a menu is, apart from its links: its name and how deep its links may nest. Opened from the
 * menu's bar (NavigationModule::places); the editor behind it follows what is stored.
 */
export default function MenuSettings({ props, close }: SurfaceComponentProps<{ handle: string }>) {
  const menu = useAbility<Menu>('navigation/get', { handle: props.handle }, { refetchOnWindowFocus: false })
  const [values, setValues] = useState<{ title: string; maxDepth: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (menu.data && !values) setValues({ title: menu.data.title, maxDepth: String(menu.data.maxDepth) })
  }, [menu.data, values])

  const save = async () => {
    if (!values || busy) return
    setError(null)
    setErrors({})
    // A menu that already nests deeper says which links are in the way, rather than only how many levels it allows.
    const deep = deeper(menu.data?.items ?? [], Number(values.maxDepth))
    if (deep.length) return setErrors({ maxDepth: plural(deep.length, 'Move “{names}” out a level first.', 'Move these out a level first: {names}.', { names: deep.slice(0, 5).join(', ') + (deep.length > 5 ? '…' : '') }) })
    setBusy(true)
    try {
      await run('navigation/update', { handle: props.handle, title: values.title.trim(), maxDepth: Number(values.maxDepth) })
      invalidate('navigation/', 'views/')
      close?.()
    } catch (e) {
      if (e instanceof CmsError && e.type === 'invalid_input' && Object.keys(e.details).length) setErrors(e.details)
      else setError(e instanceof CmsError ? e.message : t('Couldn’t save. Check your connection.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && close?.()} size="sm" title={t('Menu Settings')} onSubmit={() => void save()} submitLabel={t('Save Settings')} submitDisabled={!values?.title.trim()} busy={busy}>
      <div className="space-y-4">
        {menu.isError && !values && <QueryError compact message={t('Couldn’t load this menu.')} onRetry={() => void menu.refetch()} retrying={menu.isFetching} />}
        {error && <Notice tone="danger">{error}</Notice>}
        {values && <Fields fields={fields()} values={values} errors={errors} disabled={busy} onChange={(h, v) => setValues({ ...values, [h]: String(v ?? '') })} />}
      </div>
    </Dialog>
  )
}
