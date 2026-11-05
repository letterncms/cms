import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { tok } from './fields'
import { StyleFields } from './StyleFields'

const KEYS = ['translateX', 'translateY', 'rotate', 'scale', 'skewX', 'skewY', 'transformOrigin', 'perspective']

/** Move, rotate, scale and skew in steps; they combine. */
export function Transform({ s }: { s: StyleApi }) {
  return (
    <Section title={t('Transform')} open={false} empty={!KEYS.some((k) => s.value(k))}>
      <StyleFields
        s={s}
        fields={[
          tok('translateX', t('Move X'), { prefixIcon: 'b-arrows-out-line-horizontal', placeholder: '0' }),
          tok('translateY', t('Move Y'), { prefixIcon: 'b-arrows-out-line-vertical', placeholder: '0' }),
          tok('rotate', t('Rotate'), { prefixIcon: 'b-arrow-clockwise', placeholder: '0' }),
          tok('scale', t('Scale'), { placeholder: '100' }),
          tok('skewX', t('Skew X'), { placeholder: '0' }),
          tok('skewY', t('Skew Y'), { placeholder: '0' }),
          { handle: 'transformOrigin', type: 'json', component: 'blocks-origin', label: t('Origin'), className: 'items-start py-0.5 [&>label]:leading-6' },
          tok('perspective', t('Depth'), { placeholder: t('None') }),
        ]}
      />
    </Section>
  )
}
