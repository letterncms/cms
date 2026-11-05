import { t } from '@letterncms/sdk'
import { useState } from 'react'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { col, seg, tok } from './fields'
import { StyleFields } from './StyleFields'

const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const
const CORNERS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const
const KEYS = ['borderWidth', ...SIDES.map((x) => `border${x}Width`), 'borderStyle', 'borderColor', 'borderRadius', ...CORNERS, 'outlineWidth', 'outlineColor']

/** Width (every side or one), style and color; radius linked or per corner; outline. */
export function Border({ s }: { s: StyleApi }) {
  const [side, setSide] = useState<'all' | (typeof SIDES)[number]>(() => SIDES.find((x) => s.value(`border${x}Width`)) ?? 'all')
  const [corners, setCorners] = useState(() => CORNERS.some((c) => s.value(c)))
  const width = side === 'all' ? 'borderWidth' : `border${side}Width`

  return (
    <Section title={t('Border')} open={false} empty={!KEYS.some((k) => s.value(k))}>
      <StyleFields
        s={s}
        fields={[
          seg('side', t('Side'), [{ value: 'all', icon: 'b-square', title: t('All Sides') }, ...SIDES.map((x) => ({ value: x, icon: `b-align-${x.toLowerCase()}`, title: t(x) }))], { keys: [], get: () => side, set: (v) => setSide(v) }),
          tok(width, t('Width'), { placeholder: '0' }),
          seg('borderStyle', t('Style'), [{ value: 'solid', label: t('Solid') }, { value: 'dashed', label: t('Dashed') }, { value: 'dotted', label: t('Dotted') }, { value: 'none', label: t('None') }]),
          col('borderColor', t('Color'), { placeholder: t('Text Color') }),
          seg('linked', t('Corners'), [{ value: 'linked', label: t('All') }, { value: 'each', label: t('Each') }], { keys: [], get: () => (corners ? 'each' : 'linked'), set: (v) => setCorners(v === 'each') }),
          !corners && tok('borderRadius', t('Radius'), { placeholder: 'none' }),
          ...(corners ? CORNERS.map((c, i) => tok(c, [t('Top Left'), t('Top Right'), t('Bottom Right'), t('Bottom Left')][i])) : []),
          tok('outlineWidth', t('Outline'), { placeholder: '0' }),
          !!s.value('outlineWidth') && col('outlineColor', t('Outline Color')),
          !!s.value('outlineWidth') && tok('outlineOffset', t('Outline Gap'), { placeholder: '0' }),
        ]}
      />
    </Section>
  )
}
