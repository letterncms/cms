import { t } from '@letterncms/sdk'
import { useDesign } from '../../core/context'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { col, seg, tok } from './fields'
import { StyleFields } from './StyleFields'

const KEYS = ['text', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'textAlign', 'textTransform', 'textDecorationLine', 'fontStyle', 'textWrap', 'lineClamp', 'textShadow', 'textStrokeWidth']

/**
 * Type, largest unit first: a text style sets family, size, weight, leading, tracking and
 * case in one name, so most text needs nothing else. The finer properties override it.
 */
export function Typography({ s }: { s: StyleApi }) {
  const design = useDesign()
  const style = s.value('text')
  const ts = style ? design.resolved?.textStyles[style] : undefined
  const fine = KEYS.slice(1, 6).some((k) => s.value(k))

  return (
    <Section title={t('Typography')} empty={!KEYS.some((k) => s.value(k))}>
      <StyleFields
        s={s}
        fields={[
          tok('text', t('Text Style'), { prefixIcon: 'b-text-aa', placeholder: t('Inherit'), title: t('Family, size, weight, line height, letter spacing and case in one name, from the theme.') }),
          col('color', t('Color')),
          seg('textAlign', t('Align'), [{ value: 'start', icon: 'b-text-align-left', title: t('Start') }, { value: 'center', icon: 'b-text-align-center', title: t('Center') }, { value: 'end', icon: 'b-text-align-right', title: t('End') }, { value: 'justify', icon: 'b-text-align-justify', title: t('Justify') }]),
        ]}
      />
      {ts && !fine && <p className="m-0 pb-1 pl-[88px] text-2xs text-faint">{t('{font} · {size} · {weight}', { font: ts.font, size: ts.size, weight: ts.weight })}</p>}
      <StyleFields
        s={s}
        fields={[
          tok('fontFamily', t('Font'), { placeholder: ts ? ts.font : t('Inherit') }),
          tok('fontSize', t('Size'), { placeholder: ts ? ts.size : t('Inherit') }),
          tok('fontWeight', t('Weight'), { placeholder: ts ? ts.weight : t('Inherit') }),
          tok('lineHeight', t('Line Height'), { prefixIcon: 'b-arrows-vertical', placeholder: t('From size') }),
          tok('letterSpacing', t('Letter Spacing'), { prefixIcon: 'b-arrows-out-line-horizontal', placeholder: t('From size') }),
          seg('fontStyle', t('Style'), [{ value: 'normal', icon: 'b-text-t', title: t('Upright') }, { value: 'italic', icon: 'b-text-italic', title: t('Italic') }]),
          seg('textDecorationLine', t('Decoration'), [{ value: 'none', icon: 'b-x', title: t('None') }, { value: 'underline', icon: 'b-text-underline', title: t('Underline') }, { value: 'line-through', icon: 'b-text-strikethrough', title: t('Strike Through') }]),
          seg('textTransform', t('Case'), [{ value: 'none', icon: 'b-x', title: t('As Typed') }, { value: 'uppercase', label: 'AA', title: t('Uppercase') }, { value: 'capitalize', label: 'Aa', title: t('Capitalize') }, { value: 'lowercase', label: 'aa', title: t('Lowercase') }]),
          seg('textWrap', t('Wrap'), [{ value: 'balance', label: t('Balance') }, { value: 'pretty', label: t('Pretty') }, { value: 'nowrap', label: t('None') }]),
          tok('lineClamp', t('Max Lines'), { prefixIcon: 'b-list-dashes', placeholder: t('All') }),
          tok('textShadow', t('Shadow'), { placeholder: t('None') }),
          tok('textStrokeWidth', t('Outline'), { placeholder: t('None'), title: t('Outlined text: set the color to transparent and pick an outline color.') }),
          !!s.value('textStrokeWidth') && col('textStrokeColor', t('Outline Color'), { placeholder: t('Text Color') }),
          tok('fontVariantNumeric', t('Figures'), { placeholder: t('Normal') }),
        ]}
      />
    </Section>
  )
}
