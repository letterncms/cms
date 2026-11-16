import { navigate, plural, run, t, type SurfaceComponentProps } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

/** What each type is for, and so which list in Structure it is in (Collection::KINDS). */
export type Kind = 'collections' | 'taxonomies' | 'globals' | 'menus'
export const kindOf = (type: unknown): Kind => type === 'categories' || type === 'tags' ? 'taxonomies' : type === 'global' ? 'globals' : type === 'menu' ? 'menus' : 'collections'

const lists = (): Record<Kind, { label: string; icon: string; open: string }> => ({
  collections: { label: t('Collections'), icon: 'collection', open: t('Entries') },
  taxonomies: { label: t('Taxonomies'), icon: 'tag', open: t('Terms') },
  globals: { label: t('Globals'), icon: 'globe', open: t('Values') },
  menus: { label: t('Menus'), icon: 'list-tree', open: t('Links') },
})

const blueprint = (handle: string, kind: Kind): BlueprintKind => ({
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
  back: { label: lists()[kind].label, to: `/${kind}`, icon: lists()[kind].icon },
  // A collection whose type changed is listed with the other kind now, at its address.
  saved: (def) => {
    if (kindOf(def.type) !== kind) navigate(`/${kindOf(def.type)}/${handle}?tab=settings`, { replace: true })
  },
  entries: `/content/${handle}`,
  entriesLabel: lists()[kind].open,
  // A collection's entries can come in kinds, each with fields of its own; how many were made with one is said before it is removed.
  blueprints: (name) => run<{ total: number }>('entries/list', { collection: handle, perPage: 1, filters: [{ field: 'blueprint', value: name }] }).then((page) => page.total),
  bodies: true,
  rows: (field, rowType) => run<{ rows: number }>('collections/usage', { handle, field, rowType }).then((usage) => usage.rows),
  // A global and a menu have their name, and a menu how deep it nests: the settings say so themselves (CollectionRepository::settingsFields).
  settingsSections: kind === 'globals' || kind === 'menus' ? [{ title: t('General'), handles: ['title', 'icon', 'max_depth'] }] : [
    { title: t('General'), handles: ['title', 'singular', 'icon'] },
    // Not "Entries", the button in the bar that leaves this screen, and not "Type" or "Structure", the labels of its fields.
    { title: t('Content'), handles: ['type', 'structure'] },
    { title: t('Default Display'), handles: ['default_view', 'default_columns'], bare: true },
    { title: t('Publishing'), handles: ['route', 'template', 'archives'] },
  ],
})

/** The fields and settings of a collection, a taxonomy, a global or a menu: the `collections/blueprint` component its view is made of (system collections never reach it). */
export default function Blueprint({ props }: SurfaceComponentProps<{ handle: string; kind?: Kind }>) {
  const kind = props.kind ?? 'collections'
  return <BlueprintEditor key={`${props.handle} ${kind}`} kind={blueprint(props.handle, kind)} />
}
