import { t, timeAgo, useAbility } from '@letterncms/sdk'
import { Widget, WidgetRow } from '@letterncms/ui'
import { RUNNING, type Overview } from './shared'

/** Home-screen widget: the sites this one syncs with, and when each was last pulled or pushed. Nothing while no site is connected. */
export default function WidgetSites() {
  const overview = useAbility<Overview>('sync/overview', undefined, { refetchInterval: 60_000 })
  const data = overview.data
  const running = data?.current && RUNNING.includes(data.current.status) ? data.current : null

  if (!overview.isError && (!data || data.remotes.length === 0)) return null

  return (
    <Widget query={overview} action={{ label: t('Open Sync'), to: '/sync' }}>
      {data?.remotes.slice(0, 6).map((r) => (
        <WidgetRow
          key={r.name}
          to="/sync"
          icon={/localhost|127\.0\.0\.1|\.test(:|\/|$)/.test(r.url) ? 'desktop' : 'globe'}
          title={<span className="font-medium">{r.label}</span>}
          description={r.url.replace(/^https?:\/\//, '')}
          meta={running?.remote === r.name ? `${running.label} · ${running.percent}%` : r.last && (r.last.undone_at ? t('last sync undone') : r.last.direction === 'pull' ? t('pulled {ago}', { ago: timeAgo(r.last.at) }) : t('pushed {ago}', { ago: timeAgo(r.last.at) }))}
        />
      ))}
    </Widget>
  )
}
