import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { seg, tok } from './fields'
import { StyleFields } from './StyleFields'

/** Position, offsets in space steps, fractions or screen sizes, and the layer it sits on. */
export function Position({ s }: { s: StyleApi }) {
  const position = s.value('position')
  const placed = !!position && position !== 'static'
  return (
    <Section title={t('Position')} open={false} empty={!placed && !s.value('zIndex')}>
      <StyleFields
        s={s}
        fields={[
          seg('position', t('Position'), [{ value: 'static', label: t('Flow') }, { value: 'relative', label: t('Relative') }, { value: 'absolute', label: t('Absolute') }, { value: 'fixed', label: t('Fixed') }, { value: 'sticky', label: t('Sticky') }]),
          placed && tok('top', t('Top'), { placeholder: t('Auto') }),
          placed && tok('right', t('Right'), { placeholder: t('Auto') }),
          placed && tok('bottom', t('Bottom'), { placeholder: t('Auto') }),
          placed && tok('left', t('Left'), { placeholder: t('Auto') }),
          tok('zIndex', t('Layer'), { prefixIcon: 'b-stack', placeholder: t('Auto') }),
          placed && seg('isolation', t('Isolate'), [{ value: 'auto', label: t('No') }, { value: 'isolate', label: t('Yes') }]),
        ]}
      />
    </Section>
  )
}
