import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { seg, tok } from './fields'
import { StyleFields } from './StyleFields'

const KEYS = ['width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'aspectRatio', 'overflow', 'objectFit', 'objectPosition']

/** Width and height in steps, fractions, containers or screen sizes; aspect ratio; overflow; how media fill. */
export function Size({ s, media }: { s: StyleApi; media?: boolean }) {
  return (
    <Section title={t('Size')} empty={!KEYS.some((k) => s.value(k))}>
      <StyleFields
        s={s}
        fields={[
          tok('width', t('Width'), { prefixIcon: 'b-arrows-out-line-horizontal', placeholder: t('Auto') }),
          tok('height', t('Height'), { prefixIcon: 'b-arrows-out-line-vertical', placeholder: t('Auto') }),
          tok('maxWidth', t('Max Width'), { placeholder: t('None') }),
          tok('minHeight', t('Min Height'), { placeholder: t('None') }),
          tok('minWidth', t('Min Width'), { placeholder: t('None') }),
          tok('maxHeight', t('Max Height'), { placeholder: t('None') }),
          tok('aspectRatio', t('Aspect Ratio'), { placeholder: t('Auto') }),
          seg('overflow', t('Overflow'), [{ value: 'visible', label: t('Visible') }, { value: 'hidden', label: t('Hidden') }, { value: 'clip', label: t('Clip') }, { value: 'auto', label: t('Scroll') }]),
          media && seg('objectFit', t('Fit'), [{ value: 'cover', label: t('Cover') }, { value: 'contain', label: t('Contain') }, { value: 'fill', label: t('Stretch') }]),
          media && { handle: 'objectPosition', type: 'json', component: 'blocks-origin', label: t('Focus'), className: 'items-start py-0.5 [&>label]:leading-6' },
        ]}
      />
    </Section>
  )
}
