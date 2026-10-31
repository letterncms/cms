import { t } from '@letterncms/sdk'
import { BlueprintEditor, type BlueprintKind } from '@letterncms/ui'

const kind = (): BlueprintKind => ({
  get: ['users/fields', {}],
  builtIn: t('Name, email and roles are built in.'),
  save: (def) => ['users/fields-save', { fields: def.fields }],
  back: { label: t('Users'), to: '/users', icon: 'users' },
})

/** The fields every user profile has. */
export default function UserBlueprint() {
  return <BlueprintEditor kind={kind()} />
}
