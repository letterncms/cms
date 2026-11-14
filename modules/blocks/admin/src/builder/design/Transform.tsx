import { t } from '@letterncms/sdk'
import { inner, partUtility, type Scale } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { StyleSection } from './more'
import { StyleFields, changed } from './StyleFields'

const zero = (v: string | null | undefined) => !v || /^-?0(px|deg|%)?$/.test(v)

/**
 * Move, rotate, scale and skew, plus 3D perspective. Each is a class of its own, as Tailwind composes a
 * transform from its parts: translate-x-4, -rotate-6, scale-105, skew-x-3.
 */
export function Transform({ s }: { s: StyleApi }) {
  const move = { x: s.value('--tw-translate-x'), y: s.value('--tw-translate-y') }
  const skew = { X: inner(s.value('--tw-skew-x')), Y: inner(s.value('--tw-skew-y')) }
  // scale-105 is 105% on both axes: the control counts in times, as CSS does.
  const scaled = s.value('--tw-scale-x')
  const scale = scaled?.endsWith('%') ? String(parseFloat(scaled) / 100) : scaled
  const any = [move.x, move.y, skew.X, skew.Y, scale, s.value('rotate'), s.value('transformOrigin'), s.value('perspective')].some(Boolean)
  const part = (marker: string, root: string, v: string | null | undefined, as: Scale) => s.swap(marker, s.engine && !zero(v) ? partUtility(s.engine, root, v!, as) : null)

  const axes = (unit: string) => [
    { handle: 'x', type: 'text', component: 'blocks-value', label: 'X', prefix: 'X', placeholder: '0', unit },
    { handle: 'y', type: 'text', component: 'blocks-value', label: 'Y', prefix: 'Y', placeholder: '0', unit },
  ]

  return (
    <StyleSection s={s} group="transform" title={t('Transform')} open={!!any} empty={!any}>
      <StyleFields
        s={s}
        fields={[
          { handle: 'move', type: 'group', component: 'blocks-group', label: t('Move'), markers: ['--tw-translate-x', '--tw-translate-y'], fields: axes('px'), get: () => move, set: (v) => Object.entries(changed(move, v)).forEach(([k, x]) => part(`--tw-translate-${k}`, `translate-${k}`, x, 'spacing')) },
          { handle: 'rotate', type: 'text', component: 'blocks-value', label: t('Rotate'), unit: 'deg', prefixIcon: 'redo', placeholder: '0', markers: ['rotate'], get: () => s.value('rotate'), set: (v) => part('rotate', 'rotate', v, 'deg') },
          { handle: 'scale', type: 'text', component: 'blocks-value', label: t('Scale'), unit: '', step: 0.01, prefixIcon: 'arrows-out-simple', placeholder: '1', markers: ['scale'], get: () => scale, set: (v) => s.swap('scale', s.engine && v && Number(v) !== 1 ? partUtility(s.engine, 'scale', v, 'percent') : null) },
          {
            handle: 'skew',
            type: 'group',
            component: 'blocks-group',
            label: t('Skew'),
            markers: ['--tw-skew-x', '--tw-skew-y'],
            fields: axes('deg').map((f) => ({ ...f, handle: f.handle.toUpperCase() })),
            get: () => skew,
            set: (v) => Object.entries(changed(skew, v)).forEach(([k, x]) => part(`--tw-skew-${k.toLowerCase()}`, `skew-${k.toLowerCase()}`, x, 'deg')),
          },
          { handle: 'transformOrigin', type: 'json', component: 'blocks-origin', label: t('Origin'), className: 'items-start py-0.5 [&>label]:leading-6' },
          { handle: 'perspective', type: 'text', component: 'blocks-value', label: t('Perspective'), prefixIcon: 'perspective', placeholder: 'none', keywords: ['none'] },
        ]}
      />
    </StyleSection>
  )
}
