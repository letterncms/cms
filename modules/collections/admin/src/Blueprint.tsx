import { plural, run, t, type SurfaceComponentProps } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const kind = (handle: string): BlueprintKind => ({
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
  back: { label: t('Collections'), to: '/collections', icon: 'collection' },
  entries: `/content/${handle}`,
  settingsSections: [
    { title: t('General'), handles: ['title', 'singular', 'icon'] },
    { title: t('Entries'), handles: ['structure', 'body'] },
    { title: t('Default Display'), handles: ['default_view', 'default_columns'], bare: true },
    { title: t('Publishing'), handles: ['route', 'template'] },
  ],
})

/** The fields and settings of a collection: the `collections/blueprint` component its view is made of (system collections never reach it). */
export default function Blueprint({ props }: SurfaceComponentProps<{ handle: string }>) {
  return <BlueprintEditor key={props.handle} kind={kind(props.handle)} />
}
