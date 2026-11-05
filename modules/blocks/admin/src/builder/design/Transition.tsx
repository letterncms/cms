import { t } from '@letterncms/sdk'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { tok } from './fields'
import { StyleFields } from './StyleFields'

/** How changes between states (hover, open…) animate: what, how long, which curve. */
export function Transition({ s }: { s: StyleApi }) {
  const on = !!s.value('transitionProperty')
  return (
    <Section title={t('Transition')} open={false} empty={!on}>
      <StyleFields
        s={s}
        fields={[
          tok('transitionProperty', t('Animate'), { placeholder: t('Nothing') }),
          on && tok('transitionDuration', t('Duration'), { placeholder: 'base' }),
          on && tok('transitionTimingFunction', t('Easing'), { placeholder: 'out' }),
          on && tok('transitionDelay', t('Delay'), { placeholder: t('None') }),
        ]}
      />
    </Section>
  )
}
