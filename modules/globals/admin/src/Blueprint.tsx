import { t, type SurfaceComponentProps } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const kind = (handle: string): BlueprintKind => ({
  get: ['globals/get', { handle }],
  builtIn: null,
  save: (def) => ['globals/save', { handle, title: def.title, icon: def.icon, fields: def.fields }],
  remove: ['globals/delete', { handle }, t('Its values are deleted too.')],
  removeLabel: t('Delete Global Set'),
  back: { label: t('Globals'), to: '/globals', icon: 'globe' },
  crumbs: (def) => [{ label: t('Globals'), to: '/globals', icon: 'globe' }, { label: def.title, to: `/globals/${handle}` }, { label: t('Edit Fields') }],
})

/** The fields of a global set: the `globals/fields` component its view is made of. */
export default function GlobalBlueprint({ props }: SurfaceComponentProps<{ handle: string }>) {
  return <BlueprintEditor key={props.handle} kind={kind(props.handle)} />
}
