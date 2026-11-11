import { t, type SurfaceComponentProps } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const kind = (handle: string): BlueprintKind => ({
  get: ['globals/get', { handle }],
  builtIn: null,
  save: (def) => ['globals/save', { handle, title: def.title, icon: def.icon, fields: def.fields }],
  remove: ['globals/delete', { handle }, t('Its values are deleted too.')],
  removeLabel: t('Delete Global Set'),
  back: { label: t('Global Sets'), to: '/globals', icon: 'globe' },
  // The same screen a collection's fields are: Fields and Settings as tabs in one column, Delete at the foot of Settings,
  // and the set's own name at the end of the trail on both tabs.
  settingsSections: [{ title: t('General'), handles: ['title', 'icon'] }],
})

/** The fields of a global set: the `globals/fields` component its view is made of. */
export default function GlobalBlueprint({ props }: SurfaceComponentProps<{ handle: string }>) {
  return <BlueprintEditor key={props.handle} kind={kind(props.handle)} />
}
