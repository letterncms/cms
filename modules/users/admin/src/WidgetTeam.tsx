import { can, navigate, plural, t, timeAgo, useAbility, useManifest, type User } from '@letterncms/sdk'
import { Avatar, Button, Widget, WidgetRow } from '@letterncms/ui'

/** Home-screen widget: the people on this site, most recently seen first. */
export default function WidgetTeam() {
  const manifest = useManifest()
  const team = useAbility<{ items: (User & { role: string })[]; total: number }>('users/recent', { limit: 5 })
  const manage = can('users.manage')

  return (
    <Widget action={{ label: t('All Users'), to: '/users' }} query={team} empty={!!team.data && team.data.total <= 1 && { title: t('You’re the only user'), action: manage && <Button size="sm" icon="user-plus" onClick={() => navigate('/users/new')}>{t('Invite User')}</Button> }}>
      {team.data && (
        <>
          {team.data.items.map((u) => (
            <WidgetRow
              key={u.id}
              to={manage ? `/users/${u.id}` : undefined}
              leading={<Avatar name={u.name} initials={u.initials} src={u.avatar} size={24} />}
              title={
                <span className="flex items-baseline gap-1.5">
                  <span className="truncate font-medium">{u.name}</span>
                  {u.id === manifest.user.id && <span className="shrink-0 text-xs text-faint">{t('You')}</span>}
                </span>
              }
              description={u.role || t('No role')}
              meta={u.lastLoginAt ? timeAgo(u.lastLoginAt) : t('Never signed in')}
            />
          ))}
          {manage && (
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
              <span className="text-xs text-faint">{team.data.total > team.data.items.length ? plural(team.data.total, '{count} person in all', '{count} people in all') : ''}</span>
              <Button size="sm" variant="ghost" icon="user-plus" onClick={() => navigate('/users/new')}>
                {t('Invite User')}
              </Button>
            </div>
          )}
        </>
      )}
    </Widget>
  )
}
