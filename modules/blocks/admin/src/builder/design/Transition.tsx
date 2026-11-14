import { t } from '@letterncms/sdk'
import { Button } from '@letterncms/ui'
import { useThemeTokens } from '../../core/styling'
import { partUtility } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { StyleSection } from './more'
import { StyleFields } from './StyleFields'

/** What animates, as the class that names it. */
const PROPERTIES = () => [
  { value: 'transition', label: t('Colors, Opacity, Shadow and Transform') },
  { value: 'transition-all', label: t('Everything') },
  { value: 'transition-colors', label: t('Colors') },
  { value: 'transition-transform', label: t('Transform') },
  { value: 'transition-opacity', label: t('Opacity') },
  { value: 'transition-shadow', label: t('Shadow') },
]

const MARKERS = ['transition-property', '--tw-duration', '--tw-ease', 'transition-delay']

/**
 * How state changes (hover, open…) animate: what, how long, which curve. Four classes, as people write a
 * transition: transition-colors duration-200 ease-out delay-100.
 */
export function Transition({ s }: { s: StyleApi }) {
  const tokens = useThemeTokens()
  const animated = s.value('transitionProperty')
  const options = PROPERTIES()
  const property = animated === undefined ? undefined : options.find((option) => s.engine?.value(option.value, 'transition-property') === animated)?.value
  const time = (marker: string, root: string, v: string | null | undefined) => s.swap(marker, v && s.engine ? partUtility(s.engine, root, v, 'ms') : null)

  return (
    <StyleSection s={s} group="transition" title={t('Transition')} open={!!animated} empty={!animated}>
      {!animated ? (
        <Button variant="ghost" icon="plus" disabled={!s.engine} onClick={() => s.swap('transition-property', 'transition')} className="w-full !text-xs !font-normal !text-muted hover:!text-ink">{t('Animate State Changes')}</Button>
      ) : (
        <StyleFields
          s={s}
          fields={[
            // Clearing what animates takes the whole transition off: its duration and curve mean nothing without it.
            { handle: 'property', type: 'select', size: 'sm', label: t('Animate'), options, markers: ['transition-property'], reset: () => s.swap(MARKERS, null), get: () => property, set: (v) => s.swap(v ? 'transition-property' : MARKERS, v || null) },
            {
              handle: 'timing',
              type: 'group',
              component: 'blocks-group',
              label: t('Duration'),
              markers: ['--tw-duration', 'transition-delay'],
              get: () => ({ duration: s.value('--tw-duration'), delay: s.value('transitionDelay') }),
              set: (v) => (v.duration !== s.value('--tw-duration') ? time('--tw-duration', 'duration', v.duration) : time('transition-delay', 'delay', v.delay)),
              fields: [
                { handle: 'duration', type: 'text', component: 'blocks-value', label: t('Duration'), unit: 'ms', step: 10, min: 0, prefixIcon: 'timer', placeholder: '150' },
                { handle: 'delay', type: 'text', component: 'blocks-value', label: t('Delay'), unit: 'ms', step: 10, min: 0, prefixIcon: 'pause', placeholder: t('Delay') },
              ],
            },
            {
              handle: 'ease',
              type: 'text',
              component: 'ease',
              label: t('Curve'),
              markers: ['--tw-ease'],
              get: () => s.value('--tw-ease'),
              set: (v) => s.swap('--tw-ease', v && s.engine ? partUtility(s.engine, 'ease', v, 'number') : null),
              options: [...tokens.of('ease').map((ease) => ({ value: ease.ref, label: ease.name, curve: ease.value })), { value: 'linear', label: t('Linear') }, { value: 'cubic-bezier(0.2, 0.8, 0.2, 1)', label: t('Smooth Out') }, { value: 'cubic-bezier(0.65, 0, 0.35, 1)', label: t('Smooth In-Out') }, { value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: t('Overshoot') }],
            },
          ]}
        />
      )}
    </StyleSection>
  )
}
