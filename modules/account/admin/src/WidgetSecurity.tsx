import { can, navigate, plural, t, useAbility, type User } from '@letterncms/sdk'
import { Button, Widget, WidgetRow, cn } from '@letterncms/ui'
import type { ReactNode } from 'react'

interface Token {
  id: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string | null
}

type Tone = 'warning'

const MONTH = 30 * 86_400_000

/** Home-screen widget: what about your own account's security wants doing, each item with the way to do it. Nothing while all is well: it doesn't restate the Account screen. */
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

  if (!account.isError && (loading || !me || (me.twoFactor && idle.length === 0))) return null

  return (
    <Widget query={account}>
      {me && (
        <div>
          {!me.twoFactor && <Check tone="warning" label={t('Two-Factor Authentication')} value={t('Off')} action={<Button size="xs" onClick={() => navigate('/account')}>{t('Set Up')}</Button>} />}
          {idle.length > 0 && <Check tone="warning" label={t('API Tokens')} value={plural(idle.length, '{count} unused', '{count} unused')} action={<Button size="xs" onClick={() => navigate('/account')}>{t('Review')}</Button>} />}
        </div>
      )}
    </Widget>
  )
}

function Check({ tone, label, value, action }: { tone: Tone; label: string; value: ReactNode; action?: ReactNode }) {
  return (
    <WidgetRow
      className="h-auto min-h-9 py-1"
      leading={<span aria-hidden="true" className={cn('mx-[5px] size-1.5 shrink-0 rounded-full', { warning: 'bg-warning ring-3 ring-warning/20' }[tone])} />}
      // The whole name, on two lines where the tile is narrow: never cut.
      title={<span className="whitespace-normal">{label}</span>}
      meta={
        <span className="flex items-center gap-2">
          <span className={tone === 'warning' ? 'text-muted' : undefined}>{value}</span>
          {action}
        </span>
      }
    />
  )
}
