import { plural, t, timeAgo, useAbility } from '@letterncms/sdk'
import { Avatar, Icon, Widget, WidgetRow } from '@letterncms/ui'

interface Change {
  id: string
  ability: string
  label: string
  subject: string | null
  to: string | null
  transport: string
  user: { id: string; name: string; initials: string; avatar: string | null } | null
  count: number
  createdAt: string
}

/** Home-screen widget: the latest changes across the site — who did what, when, and through which channel. */
export default function WidgetActivity() {
  const recent = useAbility<Change[]>('audit/recent', { limit: 6 }, { refetchInterval: 60_000 })

  return (
    <Widget action={{ label: t('Audit Log'), to: '/audit' }} query={recent} empty={recent.data?.length === 0 && { icon: 'activity', title: t('No changes recorded yet') }}>
      {recent.data?.map((c) => {
        const via = channel(c.transport)
        const who = c.user?.name ?? (agent(c.transport) ? t('Agent') : t('System'))
        return (
          <WidgetRow
            key={c.id}
            to={c.to ?? undefined}
            leading={c.user ? <Avatar name={c.user.name} initials={c.user.initials} src={c.user.avatar} size={22} /> : <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-sunken text-muted"><Icon name={agent(c.transport) ? 'sparkle' : c.transport === 'cli' ? 'terminal' : 'settings'} size={12} /></span>}
            title={<span className="font-medium">{c.subject ?? c.label}</span>}
            description={[c.subject && c.label, who, c.count > 1 && plural(c.count, '{count} time', '{count} times'), via].filter(Boolean).join(' · ')}
            meta={timeAgo(c.createdAt)}
          />
        )
      })}
    </Widget>
  )
}

function agent(transport: string): boolean {
  return transport === 'mcp' || transport === 'assistant'
}

/** Where a change came from, when it was not someone clicking in the admin. */
function channel(transport: string): string | null {
  if (agent(transport)) return t('via agent')
  if (transport === 'rest') return t('via API')
  if (transport === 'cli') return t('via CLI')
  return null
}
