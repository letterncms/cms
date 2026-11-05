import { invalidate, CmsError, loadManifest, navigate, run, t, useAbility, type FieldDef, type SurfaceComponentProps } from '@letterncms/sdk'
import { useState } from 'react'
import { Dialog, Fields, Icon, QueryError, slugify, toast } from '@letterncms/ui'

interface CollectionRow {
  handle: string
  driver: 'database' | 'files'
  structure: 'list' | 'tree' | 'dated'
}

type Structure = CollectionRow['structure']

const structures = (): Record<Structure, string> => ({
  list: t('List'),
  tree: t('Tree'),
  dated: t('Dated'),
})

/**
 * The new-collection dialog: from the New Collection button (it closes itself), or at
 * /collections/new from the command palette, where closing it leaves the list.
 */
export default function NewCollection({ close }: SurfaceComponentProps) {
  const list = useAbility<CollectionRow[]>('collections/list')
  return <NewCollectionDialog existing={list.data ?? []} onOpenChange={(o) => { if (!o) (close ?? (() => navigate('/collections', { replace: true })))() }} />
}

interface NewCollectionValues {
  title: string
  handle: string
  singular: string
  template: string
  structure: Structure
  driver: CollectionRow['driver']
  route: string | null
}

function NewCollectionDialog({ existing, onOpenChange }: { existing: CollectionRow[]; onOpenChange: (o: boolean) => void }) {
  const options = useAbility<{ defaults: Record<string, unknown>; settings: FieldDef[] }>('collections/options')
  const [values, setValues] = useState<NewCollectionValues>({ title: '', handle: '', singular: '', template: '', structure: 'list', driver: 'database', route: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { title, structure, driver } = values
  const templateField = options.data?.settings.find((field) => field.handle === 'template')
  const handle = values.handle || slugify(title).replace(/-/g, '_').slice(0, 64)
  const defaultRoute = structure === 'tree' ? '/{parent_uri}/{slug}' : `/${handle.replace(/_/g, '-') || 'items'}/{slug}`
  const handleError = existing.some((c) => c.handle === handle) ? t('A collection with this handle already exists.')
    : handle === 'new' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(handle) ? t('Use letters, numbers, underscores or hyphens. Start with a letter or number.') : undefined
  const change = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: key === 'handle' ? String(value ?? '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64) : value }))

  const create = async () => {
    if (busy || !options.data || !title.trim() || handleError) return
    setBusy(true)
    setError(null)
    setErrors({})
    try {
      await run('collections/save', {
        handle,
        createOnly: true,
        definition: {
          ...options.data.defaults,
          title: title.trim(), singular: values.singular.trim() || title.trim(),
          icon: structure === 'dated' ? 'article' : structure === 'tree' ? 'page' : 'collection',
          structure, driver, route: (values.route ?? defaultRoute).trim() || null,
          ...(templateField && values.template.trim() ? { template: values.template.trim() } : {}),
        },
      })
      // Creation has succeeded even if refreshing navigation fails. Do not offer
      // a second create request for a collection which now exists.
      try { await loadManifest() } catch (e) { toast.error(e) }
      invalidate('collections/')
      onOpenChange(false)
      navigate(`/collections/${handle}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not create the collection. Try again.'))
      if (e instanceof CmsError && e.type === 'invalid_input') setErrors(e.details)
    } finally {
      setBusy(false)
    }
  }

  const advanced: FieldDef[] = [
    { handle: 'handle', type: 'text', label: t('Handle'), placeholder: handle || 'products', mono: true, max: 64 },
    { handle: 'singular', type: 'text', label: t('Entry Name'), placeholder: title.trim() || t('Product') },
    { handle: 'route', type: 'text', label: t('URL Pattern'), mono: true },
    ...(templateField ? [{ ...templateField, width: 'full' as const }] : []),
    { handle: 'driver', type: 'select', label: t('Storage'), display: 'segmented', required: true, options: { database: t('Database'), files: t('Flat Files') } },
  ]

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title={t('New Collection')}
      onSubmit={() => void create()}
      submitLabel={t('Create Collection')}
      submitDisabled={!options.data || !title.trim() || !!handleError}
      busy={busy}
    >
      <div className="space-y-5">
        {options.isError && <QueryError compact message={t('Could not load collection options.')} onRetry={() => void options.refetch()} />}
        <Fields fields={[{ handle: 'title', type: 'text', label: t('Name'), required: true, autofocus: true, placeholder: t('Products') }]} values={values} onChange={change} errors={errors} disabled={busy} />
        <Fields fields={[
          { handle: 'structure', type: 'select', label: t('Structure'), display: 'segmented', required: true, options: structures() },
        ]} values={values} onChange={change} disabled={busy} />
        <details className="group border-t border-border pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden">
            <Icon name="chevron-right" size={12} className="group-open:rotate-90" />{t('Advanced')}
            <span className="ml-auto max-w-[60%] truncate font-mono font-normal text-faint">{handle}</span>
          </summary>
          <Fields className="mt-4" fields={advanced} values={{ ...values, route: values.route ?? defaultRoute }} onChange={change} errors={errors} disabled={busy} />
        </details>
        {handle && handleError && <p role="alert" className="m-0 text-xs text-danger">{handleError}</p>}
        {error && <p role="alert" className="m-0 text-sm text-danger">{error}</p>}
      </div>
    </Dialog>
  )
}
