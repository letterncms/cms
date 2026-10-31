import { t } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const kind = (handle: string): BlueprintKind => ({
  get: ['globals/get', { handle }],
  builtIn: null,
  save: (def) => ['globals/save', { handle, title: def.title, icon: def.icon, fields: def.fields }],
  remove: ['globals/delete', { handle }, t('Its values are deleted too.')],
  back: { label: t('Globals'), to: `/globals/${handle}`, icon: 'globe' },
})

/** The fields of a global set. */
export default function GlobalBlueprint({ params }: { params: Record<string, string> }) {
  return <BlueprintEditor key={params.handle} kind={kind(params.handle)} />
}
