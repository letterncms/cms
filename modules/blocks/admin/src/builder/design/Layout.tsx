import { t } from '@letterncms/sdk'
import type { StyleApi } from '../useStyle'
import { StyleSection } from './more'
import { StyleFields } from './StyleFields'

const DISPLAY = () => [
  { value: 'block', icon: 'square', title: t('Block') },
  { value: 'flex', icon: 'rows', title: t('Stack (flex)') },
  { value: 'grid', icon: 'grid', title: t('Grid') },
  { value: 'inline-flex', icon: 'arrows-in-line-horizontal', title: t('Inline Stack') },
  { value: 'none', icon: 'eye-off', title: t('Hidden') },
]

/** A grid template as its control shows it: three equal columns are "3". */
const tracks = (value: string | undefined) => value?.match(/^repeat\((\d+), minmax\(0, 1fr\)\)$/)?.[1] ?? value
/** A grid item's span as its control shows it: "span 2 / span 2" is "2". */
const span = (value: string | undefined) => value?.match(/^span (\d+) \/ span \1$/)?.[1] ?? value

/** A count of equal tracks is the class people write (grid-cols-3, col-span-2); anything else is the template or line itself. */
function setTracks(s: StyleApi, key: string, root: string, v: string | null) {
  if (v && /^\d+$/.test(v.trim()) && s.engine?.valid(`${root}-${v.trim()}`)) s.swap(key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), `${root}-${v.trim()}`)
  else s.set(key, v)
}

/** Display, stack (flex) and grid. A 3×3 matrix sets both axes at once, like Framer. */
export function Layout({ s }: { s: StyleApi }) {
  const display = s.value('display')
  const flex = display === 'flex' || display === 'inline-flex'
  const grid = display === 'grid' || display === 'inline-grid'
  const row = flex && (s.value('flexDirection') ?? 'row').startsWith('row')

  return (
    <StyleSection s={s} group="layout" title={t('Layout')} empty={!display}>
      <StyleFields
        s={s}
        fields={[
          { handle: 'display', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Display'), options: DISPLAY() },
          flex && {
            handle: 'flexDirection',
            type: 'select',
            display: 'segmented',
            block: true,
            size: 'sm',
            label: t('Direction'),
            get: () => s.value('flexDirection') ?? 'row',
            options: [
              { value: 'row', icon: 'arrow-right', title: t('Horizontal') },
              { value: 'column', icon: 'arrow-down', title: t('Vertical') },
              { value: 'row-reverse', icon: 'arrow-left', title: t('Horizontal, Reversed') },
              { value: 'column-reverse', icon: 'arrow-up', title: t('Vertical, Reversed') },
            ],
          },
          flex && { handle: 'align', type: 'json', component: 'blocks-align', label: t('Align'), row, keys: ['alignItems', 'justifyContent'], get: () => ({ justifyContent: s.value('justifyContent'), alignItems: s.value('alignItems') }) },
          flex && { handle: 'gap', type: 'text', component: 'blocks-value', label: t('Gap'), group: 'spacing', prefixIcon: row ? 'split' : 'split-vertical', placeholder: '0', min: 0 },
          flex && { handle: 'flexWrap', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Wrap'), options: [{ value: 'nowrap', label: t('One Line') }, { value: 'wrap', label: t('Wrap') }], get: () => s.value('flexWrap') ?? 'nowrap', set: (v) => s.set('flexWrap', v === 'wrap' ? 'wrap' : null) },
          grid && { handle: 'gridTemplateColumns', type: 'text', component: 'blocks-value', label: t('Columns'), placeholder: t('3 or 1fr 2fr'), unit: '', min: 1, title: t('A number of equal columns, or any grid template (1fr 2fr, repeat(auto-fill, minmax(16rem, 1fr)))'), get: () => tracks(s.value('gridTemplateColumns')), set: (v) => setTracks(s, 'gridTemplateColumns', 'grid-cols', v) },
          grid && { handle: 'gridTemplateRows', type: 'text', component: 'blocks-value', label: t('Rows'), placeholder: 'auto', unit: '', get: () => tracks(s.value('gridTemplateRows')), set: (v) => setTracks(s, 'gridTemplateRows', 'grid-rows', v) },
          grid && {
            handle: 'gaps',
            type: 'group',
            component: 'blocks-group',
            label: t('Gap'),
            keys: ['gap', 'rowGap', 'columnGap'],
            get: () => ({ columnGap: s.value('columnGap') ?? s.value('gap'), rowGap: s.value('rowGap') ?? s.value('gap') }),
            // One gap for both is one class (gap-4); two are gap-x and gap-y.
            set: (v) => s.write(v.columnGap && v.columnGap === v.rowGap ? { columnGap: null, rowGap: null, gap: v.columnGap } : { gap: null, columnGap: v.columnGap ?? null, rowGap: v.rowGap ?? null }),
            fields: [
              { handle: 'columnGap', type: 'text', component: 'blocks-value', label: t('Columns'), group: 'spacing', prefixIcon: 'split', placeholder: '0', min: 0 },
              { handle: 'rowGap', type: 'text', component: 'blocks-value', label: t('Rows'), group: 'spacing', prefixIcon: 'split-vertical', placeholder: '0', min: 0 },
            ],
          },
          grid && {
            handle: 'alignItems',
            type: 'select',
            display: 'segmented',
            block: true,
            size: 'sm',
            label: t('Align'),
            keys: ['alignItems', 'justifyItems'],
            get: () => s.value('alignItems'),
            options: [{ value: 'flex-start', icon: 'align-top', title: t('Top') }, { value: 'center', icon: 'align-middle', title: t('Middle') }, { value: 'flex-end', icon: 'align-bottom', title: t('Bottom') }, { value: 'stretch', icon: 'arrows-out-line-vertical', title: t('Stretch') }],
          },
          grid && { handle: 'gridAutoFlow', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Flow'), options: [{ value: 'row', icon: 'arrow-right', title: t('Rows First') }, { value: 'column', icon: 'arrow-down', title: t('Columns First') }, { value: 'row dense', icon: 'group', title: t('Fill Gaps (Dense)') }] },
        ]}
      />
    </StyleSection>
  )
}

/** How the element sits in a stack or grid parent. */
export function InParent({ s, parentDisplay }: { s: StyleApi; parentDisplay?: string }) {
  if (!parentDisplay || !/flex|grid/.test(parentDisplay)) return null
  const grid = parentDisplay.includes('grid')
  return (
    <StyleSection s={s} group="item" title={grid ? t('Grid Item') : t('Stack Item')} open={false} empty={!s.value('alignSelf') && !s.value('flex') && !s.value('gridColumn')}>
      <StyleFields
        s={s}
        fields={[
          grid && { handle: 'gridColumn', type: 'text', component: 'blocks-value', label: t('Column'), placeholder: 'auto', unit: '', title: t('Span a number of columns (2), or a range (1 / -1 for full width)'), get: () => span(s.value('gridColumn')), set: (v) => setTracks(s, 'gridColumn', 'col-span', v) },
          grid && { handle: 'gridRow', type: 'text', component: 'blocks-value', label: t('Row'), placeholder: 'auto', unit: '', get: () => span(s.value('gridRow')), set: (v) => setTracks(s, 'gridRow', 'row-span', v) },
          // The values of flex-1, flex-none and flex-initial.
          !grid && { handle: 'flex', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Grow'), options: [{ value: '1', label: t('Fill||size') }, { value: 'none', label: t('Fixed') }, { value: '0 1 auto', label: t('Shrink') }] },
          { handle: 'alignSelf', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Align Self'), options: [{ value: 'flex-start', icon: 'align-top', title: t('Start') }, { value: 'center', icon: 'align-middle', title: t('Center') }, { value: 'flex-end', icon: 'align-bottom', title: t('End') }, { value: 'stretch', icon: 'arrows-out-line-vertical', title: t('Stretch') }] },
          { handle: 'order', type: 'text', component: 'blocks-value', label: t('Display Order'), unit: '', placeholder: '0', prefixIcon: 'list-ordered' },
        ]}
      />
    </StyleSection>
  )
}
