import { navigate, plural, run, t, type SurfaceComponentProps } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const isTaxonomy = (type: unknown) => type === 'categories' || type === 'tags'

const kind = (handle: string, taxonomy: boolean): BlueprintKind => ({
  get: ['collections/get', { handle }],
  save: (def) => ['collections/save', { handle, definition: def }],
  remove: async () => {
    const { count } = await run<{ count: number }>('collections/get', { handle })
    return ['collections/delete', { handle, deleteEntries: count > 0 }, count > 0
      ? plural(count, 'This permanently deletes the collection and its {count} entry, including drafts and history. This cannot be undone.', 'This permanently deletes the collection and its {count} entries, including drafts and history. This cannot be undone.')
      : t('This permanently deletes the empty collection. This cannot be undone.'), count > 0 ? t('Delete Collection and Entries') : t('Delete Collection')]
  },
  removeLabel: t('Delete Collection'),
  canRemove: (source) => source.deletable === true,
  back: taxonomy ? { label: t('Taxonomies'), to: '/taxonomies', icon: 'tag' } : { label: t('Collections'), to: '/collections', icon: 'collection' },
  // A collection whose type changed is listed with the other kind now, at its address.
  saved: (def) => {
    if (isTaxonomy(def.type) !== taxonomy) navigate(`/${isTaxonomy(def.type) ? 'taxonomies' : 'collections'}/${handle}?tab=settings`, { replace: true })
  },
  entries: `/content/${handle}`,
  // A collection's entries can come in kinds, each with fields of its own; how many were made with one is said before it is removed.
  blueprints: (blueprint) => run<{ total: number }>('entries/list', { collection: handle, perPage: 1, filters: [{ field: 'blueprint', value: blueprint }] }).then((page) => page.total),
  bodies: true,
  rows: (field, rowType) => run<{ rows: number }>('collections/usage', { handle, field, rowType }).then((usage) => usage.rows),
  settingsSections: [
    { title: t('General'), handles: ['title', 'singular', 'icon'] },
    // Not "Entries", the button in the bar that leaves this screen, and not "Type" or "Structure", the labels of its fields.
    { title: t('Content'), handles: ['type', 'structure'] },
    { title: t('Default Display'), handles: ['default_view', 'default_columns'], bare: true },
    { title: t('Publishing'), handles: ['route', 'template', 'archives'] },
  ],
})

/** The fields and settings of a collection or a taxonomy: the `collections/blueprint` component its view is made of (system collections never reach it). */
export default function Blueprint({ props }: SurfaceComponentProps<{ handle: string; taxonomy?: boolean }>) {
  return <BlueprintEditor key={`${props.handle} ${!!props.taxonomy}`} kind={kind(props.handle, !!props.taxonomy)} />
}
