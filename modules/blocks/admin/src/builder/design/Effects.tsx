import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { seg, tok } from './fields'
import { StyleFields } from './StyleFields'

const KEYS = ['opacity', 'boxShadow', 'blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'backdropBlur', 'mixBlendMode', 'mask', 'cursor']

/** Opacity, shadow, filters, glass, blend modes and masks, each a step of the vocabulary. */
export function Effects({ s }: { s: StyleApi }) {
  return (
    <Section title={t('Effects')} open={false} empty={!KEYS.some((k) => s.value(k))}>
      <StyleFields
        s={s}
        fields={[
          tok('opacity', t('Opacity'), { placeholder: '100' }),
          tok('boxShadow', t('Shadow'), { placeholder: t('None') }),
          tok('blur', t('Blur'), { placeholder: t('None') }),
          tok('backdropBlur', t('Background Blur'), { placeholder: t('None'), title: t('Blurs what is behind the element: glass.') }),
          !!s.value('backdropBlur') && tok('backdropSaturate', t('Background Color'), { placeholder: '100' }),
          tok('brightness', t('Brightness'), { placeholder: '100' }),
          tok('contrast', t('Contrast'), { placeholder: '100' }),
          tok('saturate', t('Saturation'), { placeholder: '100' }),
          seg('grayscale', t('Grayscale'), [{ value: '0', label: t('Off') }, { value: '100', label: t('On') }]),
          tok('mixBlendMode', t('Blend'), { placeholder: 'normal' }),
          tok('mask', t('Mask'), { placeholder: t('None'), title: t('Fade an edge out, or crop to a circle.') }),
          tok('cursor', t('Cursor'), { placeholder: t('Auto') }),
          seg('pointerEvents', t('Clicks'), [{ value: 'auto', label: t('Yes') }, { value: 'none', label: t('Pass Through') }]),
        ]}
      />
    </Section>
  )
}
