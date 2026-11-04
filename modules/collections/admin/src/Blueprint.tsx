import { navigate, plural, run, t, useAbility } from '@letterncms/sdk'
import { BlueprintEditor, Button, NotFoundState, Page, type BlueprintKind } from '@letterncms/ui'
import Collections from './Collections'

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

/** The fields and settings of a collection; /collections/new opens the list with the new-collection dialog. */
export default function Blueprint({ params }: { params: Record<string, string> }) {
  if (params.handle === 'new') return <Collections creating />
  return <CollectionBlueprint key={params.handle} handle={params.handle} />
}

/** A system collection (templates, components, account pages) keeps the schema its code brings: not editable or deletable here. */
function CollectionBlueprint({ handle }: { handle: string }) {
  const source = useAbility<{ system?: boolean }>('collections/get', { handle }, { refetchOnWindowFocus: false })
  if (source.data?.system) {
    const back = { label: t('Collections'), to: '/collections', icon: 'collection' }
    return <Page crumbs={[back, { label: t('Not Found') }]}><NotFoundState icon="collection" action={<Button onClick={() => navigate(back.to)}>{t('Back to {label}', { label: back.label })}</Button>} /></Page>
  }
  return <BlueprintEditor kind={kind(handle)} />
}
