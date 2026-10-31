import { can, navigate, plural, t, timeAgo, useAbility, type User } from '@letterncms/sdk'
import { Button, Skeleton, Widget, WidgetRow, cn } from '@letterncms/ui'
import type { ReactNode } from 'react'

interface Token {
  id: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string | null
}

type Tone = 'success' | 'warning' | 'neutral'

const MONTH = 30 * 86_400_000

/** Home-screen widget: how well your own account is secured, each item with the way to fix it. */
export default function WidgetSecurity() {
  const account = useAbility<User>('account/get')
  const mayTokens = can('tokens.manage')
  const tokens = useAbility<Token[]>('tokens/list', {}, { enabled: mayTokens })
  const me = account.data
  const loading = account.isLoading || (mayTokens && tokens.isLoading)

  const now = Date.now()
  const live = (tokens.data ?? []).filter((tk) => !tk.expiresAt || new Date(tk.expiresAt).getTime() > now)
  // Tokens nobody has used for a month are keys lying around: worth revoking.
  const idle = live.filter((tk) => (tk.lastUsedAt ? now - new Date(tk.lastUsedAt).getTime() : now - new Date(tk.createdAt ?? now).getTime()) > MONTH)

  return (
    <Widget query={account} loading={loading} skeleton={<SecuritySkeleton />}>
      {me && (
        <div>
          <Check
            tone={me.twoFactor ? 'success' : 'warning'}
            label={t('Two-Factor Sign-In')}
            value={me.twoFactor ? t('On') : t('Off')}
            action={!me.twoFactor && <Button size="xs" onClick={() => navigate('/account')}>{t('Set Up')}</Button>}
          />
          {mayTokens && (
            <Check
              tone={live.length === 0 ? 'neutral' : idle.length ? 'warning' : 'success'}
              label={t('API Tokens')}
              value={live.length === 0 ? t('None') : idle.length ? plural(idle.length, '{count} unused', '{count} unused') : plural(live.length, '{count} in use', '{count} in use')}
              action={idle.length > 0 && <Button size="xs" onClick={() => navigate('/account')}>{t('Review')}</Button>}
            />
          )}
          <Check tone="neutral" label={t('Last Sign-In')} value={me.lastLoginAt ? timeAgo(me.lastLoginAt) : t('Never')} />
        </div>
      )}
    </Widget>
  )
}

function Check({ tone, label, value, action }: { tone: Tone; label: string; value: ReactNode; action?: ReactNode }) {
  return (
    <WidgetRow
      leading={<span aria-hidden="true" className={cn('mx-[5px] size-1.5 shrink-0 rounded-full', { success: 'bg-success', warning: 'bg-warning ring-3 ring-warning/20', neutral: 'bg-faint' }[tone])} />}
      title={label}
      meta={
        <span className="flex items-center gap-2">
          <span className={tone === 'warning' ? 'text-muted' : undefined}>{value}</span>
          {action}
        </span>
      }
    />
  )
}

function SecuritySkeleton() {
  return (
    <div className="space-y-1">
      {['w-32', 'w-20', 'w-24'].map((w) => (
        <div key={w} className="flex h-9 items-center gap-3">
          <Skeleton className="mx-[5px] size-1.5 rounded-full" />
          <Skeleton className={cn('h-3', w)} />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
      ))}
    </div>
  )
}
