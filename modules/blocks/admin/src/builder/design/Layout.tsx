import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { seg, tok } from './fields'
import { StyleFields } from './StyleFields'


const DISPLAY = () => [
  { value: 'block', icon: 'b-square', title: t('Block') },
  { value: 'flex', icon: 'b-rows', title: t('Stack') },
  { value: 'grid', icon: 'b-grid-four', title: t('Grid') },
  { value: 'inline-flex', icon: 'b-arrows-in-line-horizontal', title: t('Inline Stack') },
  { value: 'none', icon: 'b-eye-slash', title: t('Hidden') },
]

const FLOWS = () => [
  { value: 'none', label: t('None') },
  { value: 'tight', label: t('Tight') },
  { value: 'normal', label: t('Normal') },
  { value: 'loose', label: t('Loose') },
  { value: 'prose', label: t('Prose') },
]

/** Display, stack and grid, and the flow that spaces a container's children. */
export function Layout({ s }: { s: StyleApi }) {
  const display = s.value('display')
  const flex = display === 'flex' || display === 'inline-flex'
  const grid = display === 'grid' || display === 'inline-grid'
  const row = flex && (s.value('flexDirection') ?? 'row').startsWith('row')

  return (
    <Section title={t('Layout')} empty={!display && !s.value('flow')}>
      <StyleFields
        s={s}
        fields={[
          seg('display', t('Display'), DISPLAY()),
          !flex && !grid && seg('flow', t('Flow'), FLOWS(), { title: t('The space between children, set once in the theme. Prose adds more before headings and around media.') }),
          flex && seg('flexDirection', t('Direction'), [
            { value: 'row', icon: 'b-arrow-right', title: t('Horizontal') },
            { value: 'column', icon: 'b-arrow-down', title: t('Vertical') },
            { value: 'row-reverse', icon: 'b-arrow-left', title: t('Horizontal, Reversed') },
            { value: 'column-reverse', icon: 'b-arrow-up', title: t('Vertical, Reversed') },
          ], { get: () => s.value('flexDirection') ?? 'row' }),
          flex && { handle: 'align', type: 'json', component: 'blocks-align', label: t('Align'), row, keys: ['alignItems', 'justifyContent'], get: () => ({ justifyContent: s.value('justifyContent'), alignItems: s.value('alignItems') }) },
          (flex || grid) && tok('gap', t('Gap'), { prefixIcon: row ? 'b-split-horizontal' : 'b-split-vertical', placeholder: '0' }),
          flex && seg('flexWrap', t('Wrap'), [{ value: 'nowrap', label: t('One Line') }, { value: 'wrap', label: t('Wrap') }], { get: () => s.value('flexWrap') ?? 'nowrap', set: (v) => s.set('flexWrap', v === 'wrap' ? 'wrap' : null) }),
          grid && { handle: 'gridTemplateColumns', type: 'number', size: 'sm', label: t('Columns'), min: 1, max: 24, placeholder: '1', get: () => (/^\d+$/.test(s.value('gridTemplateColumns') ?? '') ? Number(s.value('gridTemplateColumns')) : undefined), set: (v) => s.set('gridTemplateColumns', v ? String(Math.max(1, Math.min(24, Number(v)))) : null), title: t('Equal columns, 1 to 24. Place children on them in Grid Item.') },
          grid && seg('alignItems', t('Align'), [{ value: 'start', icon: 'b-align-top', title: t('Top') }, { value: 'center', icon: 'b-align-center-vertical', title: t('Middle') }, { value: 'end', icon: 'b-align-bottom', title: t('Bottom') }, { value: 'stretch', icon: 'b-arrows-out-line-vertical', title: t('Stretch') }]),
          grid && seg('gridAutoFlow', t('Flow'), [{ value: 'row', icon: 'b-arrow-right', title: t('Rows First') }, { value: 'column', icon: 'b-arrow-down', title: t('Columns First') }, { value: 'row dense', icon: 'b-squares-four', title: t('Fill Gaps') }]),
          (flex || grid) && tok('containerType', t('Container'), { placeholder: t('No'), title: t('Children can respond to this element’s width (@sm…@4xl).') }),
        ]}
      />
    </Section>
  )
}

/** How the element sits in a stack or grid parent: its columns, its order, how it aligns. */
export function InParent({ s, parentDisplay }: { s: StyleApi; parentDisplay?: string }) {
  if (!parentDisplay || !/flex|grid/.test(parentDisplay)) return null
  const grid = parentDisplay.includes('grid')
  const placement = s.value('gridColumn') ?? ''
  const m = placement.match(/^(\d+) \/ span (\d+)$/)
  const span = m ? Number(m[2]) : /^\d+$/.test(placement) ? Number(placement) : undefined
  const start = m ? Number(m[1]) : undefined
  const place = (next: { start?: number; span?: number }) => {
    const sp = next.span ?? span
    const st = next.start ?? start
    s.set('gridColumn', sp ? (st ? `${st} / span ${sp}` : String(sp)) : null)
  }
  return (
    <Section title={grid ? t('Grid Item') : t('Stack Item')} open={false} empty={!s.value('alignSelf') && !s.value('flex') && !s.value('gridColumn')}>
      <StyleFields
        s={s}
        fields={[
          grid && seg('gridColumnFull', t('Width'), [{ value: 'span', label: t('Columns') }, { value: 'full', label: t('Full Row') }], { keys: ['gridColumn'], get: () => (placement === 'full' ? 'full' : 'span'), set: (v) => s.set('gridColumn', v === 'full' ? 'full' : null) }),
          grid && placement !== 'full' && { handle: 'span', type: 'number', size: 'sm', label: t('Span'), min: 1, max: 24, placeholder: t('Auto'), keys: ['gridColumn'], get: () => span, set: (v) => place({ span: v ? Number(v) : undefined }) },
          grid && placement !== 'full' && { handle: 'start', type: 'number', size: 'sm', label: t('Start Line'), min: 1, max: 25, placeholder: t('Auto'), keys: ['gridColumn'], get: () => start, set: (v) => place({ start: v ? Number(v) : undefined }), title: t('Which column line it starts on: overlap items by giving them the same lines.') },
          grid && tok('gridRow', t('Row'), { placeholder: t('Auto') }),
          !grid && seg('flex', t('Grow'), [{ value: '1', label: t('Fill') }, { value: 'none', label: t('Fixed') }, { value: 'initial', label: t('Shrink') }]),
          seg('alignSelf', t('Align Self'), [{ value: 'start', icon: 'b-align-top', title: t('Start') }, { value: 'center', icon: 'b-align-center-vertical', title: t('Center') }, { value: 'end', icon: 'b-align-bottom', title: t('End') }, { value: 'stretch', icon: 'b-arrows-out-line-vertical', title: t('Stretch') }]),
          tok('order', t('Order'), { prefixIcon: 'b-list-numbers', placeholder: '0' }),
        ]}
      />
    </Section>
  )
}
