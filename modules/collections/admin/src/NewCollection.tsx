import { invalidate, CmsError, loadManifest, navigate, run, t, useAbility, type FieldDef, type SurfaceComponentProps } from '@letterncms/sdk'
import { useState } from 'react'
import { Dialog, Fields, Icon, Notice, QueryError, slugify, toast } from '@letterncms/ui'
import type { Kind } from './Blueprint'

interface CollectionRow {
  handle: string
  driver: 'database' | 'files'
  type: 'entries' | 'categories' | 'tags' | 'global' | 'menu'
  structure: 'list' | 'tree' | 'dated'
}

type Type = CollectionRow['type']
type Structure = CollectionRow['structure']

/** What a taxonomy's terms are: categories nest and are picked, tags are flat and made as they are typed. */
const types = (): Record<'categories' | 'tags', string> => ({
  categories: t('Categories'),
  tags: t('Tags'),
})

const structures = (): Record<Structure, string> => ({
  list: t('List'),
  tree: t('Tree'),
  dated: t('Dated'),
})

/** What a new collection of each type starts with: entries take a structure; categories nest and tags are flat. */
const iconOf = (type: Type, structure: Structure) => type === 'categories' ? 'folder' : type === 'tags' ? 'tag' : type === 'global' ? 'globe' : type === 'menu' ? 'list-tree' : structure === 'dated' ? 'article' : structure === 'tree' ? 'page' : 'collection'

/**
 * What each kind's dialog says and makes. A global starts with one text field and opens on its fields; a menu has its
 * links' `link` field and opens on its links, to add the first. Both are kept as files, where a site keeps them in git.
 */
const kinds = (): Record<Kind, { title: string; submit: string; placeholder: string; singular: string; type: Type; fields?: unknown[]; opens: (handle: string) => string }> => ({
  collections: { title: t('New Collection'), submit: t('Create Collection'), placeholder: t('Products'), singular: t('Product'), type: 'entries', opens: (h) => `/collections/${h}` },
  taxonomies: { title: t('New Taxonomy'), submit: t('Create Taxonomy'), placeholder: t('Topics'), singular: t('Topic'), type: 'categories', opens: (h) => `/taxonomies/${h}` },
  globals: { title: t('New Global'), submit: t('Create Global'), placeholder: t('Footer'), singular: t('Footer'), type: 'global', fields: [{ handle: 'text', type: 'text', label: t('Text') }], opens: (h) => `/globals/${h}` },
  menus: { title: t('New Menu'), submit: t('Create Menu'), placeholder: t('Footer'), singular: t('Link'), type: 'menu', fields: [{ handle: 'link', type: 'link', label: t('Link'), required: true }], opens: (h) => `/content/${h}` },
})

/**
 * The new-collection dialog: from a New button of a list in Structure (it closes itself), or at /<kind>/new from /
 * in a thread, where closing it leaves the list. A collection of entries takes a structure; a taxonomy is categories
 * or tags; a global and a menu are their name.
 */
export default function NewCollection({ props, close }: SurfaceComponentProps<{ kind?: Kind }>) {
  const kind = props?.kind ?? 'collections'
  const list = useAbility<CollectionRow[]>('collections/list')
  return <NewCollectionDialog kind={kind} existing={list.data ?? []} onOpenChange={(o) => { if (!o) (close ?? (() => navigate(`/${kind}`, { replace: true })))() }} />
}

interface NewCollectionValues {
  title: string
  handle: string
  singular: string
  template: string
  type: Type
  structure: Structure
  driver: CollectionRow['driver']
  route: string | null
}

function NewCollectionDialog({ kind, existing, onOpenChange }: { kind: Kind; existing: CollectionRow[]; onOpenChange: (o: boolean) => void }) {
  const made = kinds()[kind]
  const siteWide = kind === 'globals' || kind === 'menus'
  const options = useAbility<{ defaults: Record<string, unknown>; settings: FieldDef[] }>('collections/options')
  const [values, setValues] = useState<NewCollectionValues>({ title: '', handle: '', singular: '', template: '', type: made.type, structure: 'list', driver: siteWide ? 'files' : 'database', route: null })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { title, type, driver } = values
  // A taxonomy's structure is its type's.
  const structure: Structure = type === 'categories' ? 'tree' : type === 'tags' ? 'list' : values.structure
  const templateField = options.data?.settings.find((field) => field.handle === 'template')
  const handle = values.handle || slugify(title).replace(/-/g, '_').slice(0, 64)
  const base = `/${handle.replace(/_/g, '-') || 'items'}`
  const defaultRoute = type === 'categories' ? `${base}/{parent_uri}/{slug}` : structure === 'tree' ? '/{parent_uri}/{slug}' : `${base}/{slug}`
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
        definition: siteWide
          // A global's values and a menu's links are no pages: their own fields, no address, no template.
          ? { title: title.trim(), singular: values.singular.trim() || (kind === 'menus' ? made.singular : title.trim()), icon: iconOf(type, structure), type, driver, fields: made.fields }
          : {
              ...options.data.defaults,
              title: title.trim(), singular: values.singular.trim() || title.trim(),
              icon: iconOf(type, structure),
              ...(type === 'entries' ? { structure } : { type }), driver, route: (values.route ?? defaultRoute).trim() || null,
              ...(templateField && values.template.trim() ? { template: values.template.trim() } : {}),
            },
      })
      // Creation has succeeded even if refreshing navigation fails. Do not offer
      // a second create request for a collection which now exists.
      try { await loadManifest() } catch (e) { toast.error(e) }
      invalidate('collections/')
      onOpenChange(false)
      navigate(made.opens(handle))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not create the collection. Try again.'))
      if (e instanceof CmsError && e.type === 'invalid_input') setErrors(e.details)
    } finally {
      setBusy(false)
    }
  }

  const storage: FieldDef = { handle: 'driver', type: 'select', label: t('Storage'), display: 'segmented', required: true, options: { database: t('Database'), files: t('Flat Files') } }
  const advanced: FieldDef[] = siteWide ? [{ handle: 'handle', type: 'text', label: t('Handle'), placeholder: handle || 'footer', mono: true, max: 64 }, storage] : [
    { handle: 'handle', type: 'text', label: t('Handle'), placeholder: handle || (kind === 'taxonomies' ? 'topics' : 'products'), mono: true, max: 64 },
    { handle: 'singular', type: 'text', label: kind === 'taxonomies' ? t('Term Name') : t('Entry Name'), placeholder: title.trim() || made.singular },
    { handle: 'route', type: 'text', label: t('URL Pattern'), mono: true },
    ...(templateField ? [{ ...templateField, width: 'full' as const }] : []),
    storage,
  ]

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title={made.title}
      onSubmit={() => void create()}
      submitLabel={made.submit}
      submitDisabled={!options.data || !title.trim() || !!handleError}
      busy={busy}
    >
      <div className="space-y-5">
        {options.isError && <QueryError compact message={t('Could not load collection options.')} onRetry={() => void options.refetch()} />}
        <Fields fields={[{ handle: 'title', type: 'text', label: t('Name'), required: true, autofocus: true, placeholder: made.placeholder }]} values={values} onChange={change} errors={errors} disabled={busy} />
        {!siteWide && <Fields fields={[kind === 'taxonomies'
          ? { handle: 'type', type: 'select', label: t('Type'), display: 'segmented', required: true, options: types() }
          : { handle: 'structure', type: 'select', label: t('Structure'), display: 'segmented', required: true, options: structures() },
        ]} values={values} onChange={change} disabled={busy} />}
        <details className="group border-t border-border pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 py-1 text-xs font-medium text-muted hover:text-text [&::-webkit-details-marker]:hidden">
            <Icon name="chevron-right" size={12} className="group-open:rotate-90" />{t('Advanced')}
            <span className="ml-auto max-w-[60%] truncate font-mono font-normal text-faint">{handle}</span>
          </summary>
          <Fields className="mt-4" fields={advanced} values={{ ...values, route: values.route ?? defaultRoute }} onChange={change} errors={errors} disabled={busy} />
        </details>
        {handle && handleError && <Notice tone="danger">{handleError}</Notice>}
        {error && <Notice tone="danger">{error}</Notice>}
      </div>
    </Dialog>
  )
}
