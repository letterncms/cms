import { can, navigate, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Button, Widget, WidgetRow } from '@letterncms/ui'

interface GlobalSummary {
  handle: string
  title: string
  icon: string
  updatedAt: string | null
}

/** Home-screen widget: the global sets as quick links, with when each last changed. */
export default function WidgetGlobals() {
  const sets = useAbility<GlobalSummary[]>('globals/list')

  return (
    <Widget
      action={{ label: t('All Global Sets'), to: '/globals' }}
      query={sets}
      empty={sets.data?.length === 0 && { icon: 'globe', title: t('No global sets yet'), action: can('globals.manage') && <Button size="sm" icon="plus" onClick={() => navigate('/globals')}>{t('New Global Set')}</Button> }}
    >
      {sets.data?.slice(0, 6).map((g) => (
        <WidgetRow key={g.handle} to={`/globals/${g.handle}`} icon={g.icon} title={<span className="font-medium">{g.title}</span>} meta={g.updatedAt ? timeAgo(g.updatedAt) : null} />
      ))}
    </Widget>
  )
}
