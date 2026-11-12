import { t } from '@letterncms/sdk'
import { useTokens } from '../../core/context'
import { splitValue } from '../css'
import type { StyleApi } from '../useStyle'
import { PanelFields } from '../controls'
import { StyleSection } from './more'
import { StyleFields, changed } from './StyleFields'

const WEIGHTS = () => [
  { value: '100', label: t('Thin 100') }, { value: '200', label: t('Extra Light 200') }, { value: '300', label: t('Light 300') }, { value: '400', label: t('Regular 400') },
  { value: '500', label: t('Medium 500') }, { value: '600', label: t('Semibold 600') }, { value: '700', label: t('Bold 700') }, { value: '800', label: t('Extra Bold 800') }, { value: '900', label: t('Black 900') },
]

/** Font, size, weight, leading, tracking, color, alignment and the finer points of text. */
export function Typography({ s, prose }: { s: StyleApi; prose?: { on: boolean; onChange: (on: boolean) => void } }) {
  const { byGroup } = useTokens()
  const fonts = byGroup.get('font') ?? []
  const weights = byGroup.get('weight') ?? []
  const keys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'textAlign', 'textTransform', 'textDecoration', 'fontStyle', 'textWrap', 'lineClamp', 'textShadow', 'textStroke']
  const any = keys.some((k) => s.value(k))

  // Outlined text: "1px currentColor" as a width and a color.
  const strokeParts = splitValue(s.value('textStroke') ?? '')
  const stroke = { width: strokeParts.find((p) => /^-?[\d.]/.test(p)), color: strokeParts.find((p) => !/^-?[\d.]/.test(p)) }

  return (
    <StyleSection s={s} group="typography" title={t('Typography')} empty={!any && !prose?.on}>
      {/* Long-form text: the design's Prose spacing and styles reach every block inside. */}
      {prose && <PanelFields fields={[{ handle: 'prose', type: 'toggle', label: t('Prose') }]} values={{ prose: prose.on }} onChange={(_, v) => prose.onChange(!!v)} />}
      <StyleFields
        s={s}
        fields={[
          { handle: 'fontFamily', type: 'select', size: 'sm', label: t('Font'), placeholder: t('Inherit'), options: fonts.map((token) => ({ value: `token:${token.path}`, label: `${token.path} · ${Array.isArray(token.value) ? token.value[0] : token.value}` })) },
          { handle: 'fontWeight', type: 'select', size: 'sm', label: t('Weight'), placeholder: t('Inherit'), options: [...weights.map((token) => ({ value: `token:${token.path}`, label: `${token.path} · ${token.value}` })), ...WEIGHTS()] },
          { handle: 'fontSize', type: 'text', component: 'blocks-value', label: t('Size'), group: 'text', prefixIcon: 'richtext', placeholder: t('Inherit'), units: ['px', 'rem', 'em', '%', 'vw'] },
          { handle: 'lineHeight', type: 'text', component: 'blocks-value', label: t('Line Height'), group: 'leading', prefixIcon: 'height', unit: '', step: 0.05, placeholder: t('Inherit'), title: t('Line Height (1.2 = 120%)') },
          { handle: 'letterSpacing', type: 'text', component: 'blocks-value', label: t('Letter Spacing'), group: 'tracking', prefixIcon: 'spacing', unit: 'em', units: ['em', 'px'], step: 0.005, placeholder: '0' },
          { handle: 'color', type: 'color', component: 'blocks-color', label: t('Color'), placeholder: t('Inherit') },
          { handle: 'textAlign', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Align'), placeholder: 'left', options: [{ value: 'left', icon: 'align-left', title: t('Left') }, { value: 'center', icon: 'align-center', title: t('Center') }, { value: 'right', icon: 'align-right', title: t('Right') }, { value: 'justify', icon: 'align-justify', title: t('Justify||text') }] },
          // Two rows, each with its own label: side by side they no longer fit the panel.
          { handle: 'fontStyle', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Style'), placeholder: 'normal', options: [{ value: 'normal', icon: 'text', title: t('Upright') }, { value: 'italic', icon: 'italic', title: t('Italic') }] },
          { handle: 'textDecoration', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Decoration'), placeholder: 'none', options: [{ value: 'none', icon: 'close', title: t('No Decoration') }, { value: 'underline', icon: 'underline', title: t('Underline') }, { value: 'line-through', icon: 'strike', title: t('Strike Through') }] },
          { handle: 'textTransform', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Case'), placeholder: 'none', options: [{ value: 'none', icon: 'close', title: t('As Typed') }, { value: 'uppercase', label: 'AA', title: t('Uppercase') }, { value: 'capitalize', label: 'Aa', title: t('Capitalize') }, { value: 'lowercase', label: 'aa', title: t('Lowercase') }] },
          { handle: 'textWrap', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Wrap'), options: [{ value: 'balance', label: t('Balance') }, { value: 'pretty', label: t('Pretty') }, { value: 'nowrap', label: t('None') }] },
          { handle: 'lineClamp', type: 'text', component: 'blocks-value', label: t('Max Lines'), unit: '', min: 1, placeholder: t('All'), prefixIcon: 'list-tree' },
        ]}
      />
      <StyleFields s={s} bare fields={[{ handle: 'textShadow', type: 'text', component: 'blocks-shadows', kind: 'text', label: t('Text Shadow') }]} />
      <StyleFields
        s={s}
        fields={[
          {
            handle: 'stroke',
            type: 'group',
            component: 'blocks-group',
            label: t('Text Stroke'),
            keys: ['textStroke'],
            get: () => stroke,
            set: (v) => {
              const next = { ...stroke, ...changed(stroke, v) }
              s.set('textStroke', next.width ? `${next.width} ${next.color ?? 'currentColor'}` : null)
            },
            fields: [
              { handle: 'width', type: 'text', component: 'blocks-value', label: t('Width'), prefixIcon: 'edit', placeholder: '0', min: 0, step: 0.5, className: '!flex-none w-[72px]' },
              { handle: 'color', type: 'color', component: 'blocks-color', label: t('Color'), placeholder: t('Text Color') },
            ],
          },
        ]}
      />
    </StyleSection>
  )
}
