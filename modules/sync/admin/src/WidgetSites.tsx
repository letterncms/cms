import { can, navigate, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Button, Widget, WidgetRow } from '@letterncms/ui'

interface Remote { name: string; label: string; url: string; last: { direction: 'pull' | 'push'; at: string; undone_at?: string } | null }
interface Overview { remotes: Remote[]; current: { remote: string; label: string; percent: number; status: string } | null }

/** Home-screen widget: the sites this one syncs with, and when each was last pulled or pushed. */
export default function WidgetSites() {
  const overview = useAbility<Overview>('sync/overview', undefined, { refetchInterval: 60_000 })
  const data = overview.data
  const running = data?.current && ['running', 'waiting'].includes(data.current.status) ? data.current : null

  return (
    <Widget
      query={overview}
      action={{ label: t('Open Sync'), to: '/sync' }}
      empty={
        data?.remotes.length === 0 && {
          icon: 'sync',
          title: t('Connect another site'),
          action: can('sync.manage') && <Button size="sm" icon="plus" onClick={() => navigate('/sync')}>{t('Connect a Site')}</Button>,
        }
      }
    >
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
