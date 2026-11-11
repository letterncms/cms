import { invalidate, navigate, run, t, timeAgo, useAbility, useManifest } from '@letterncms/sdk'
import { Button, Icon, Stat, Widget, WidgetRow, compactNumber, cn, toast } from '@letterncms/ui'
import { useState } from 'react'

interface EmailStatus {
  transport: { key: string; label: string; delivers: boolean }
  from: string
  sent: number
  failed: number
  latest: { id: string; to: string; subject: string; tag: string | null; status: 'sent' | 'failed'; error: string | null; createdAt: string }[]
}

/** Home-screen widget: whether email gets out, and the latest messages. Nothing while email is set up and none was sent: how it is sent is on the Email settings. */
export default function WidgetEmail() {
  const manifest = useManifest()
  const status = useAbility<EmailStatus>('email/status', { limit: 4 }, { refetchInterval: 60_000 })
  const [sending, setSending] = useState(false)
  const s = status.data

  const test = async () => {
    setSending(true)
    try {
      await run('email/test', { to: manifest.user.email })
      toast.success(t('Test email sent to {email}', { email: manifest.user.email }))
    } catch (e) {
      toast.error(e)
    } finally {
      setSending(false)
      invalidate('email/')
    }
  }

  const health = s && (!s.transport.delivers ? 'off' : s.latest[0]?.status === 'failed' ? 'failing' : 'ok')
  // Beside the status in the wide column, full width under it in the narrow one.
  const testButton = (wide: boolean) => (
    <div className={wide ? 'hidden shrink-0 @md:block' : '@md:hidden'}>
      {s?.transport.delivers ? (
        <Button size="sm" icon="send" loading={sending} onClick={test} className={wide ? undefined : 'w-full'}>{t('Send Test Email')}</Button>
      ) : (
        <Button size="sm" icon="settings" onClick={() => navigate('/settings/email')} className={wide ? undefined : 'w-full'}>{t('Set Up Email')}</Button>
      )}
    </div>
  )

  if (!status.isError && (!s || (s.transport.delivers && s.sent === 0 && s.failed === 0 && s.latest.length === 0))) return null

  return (
    <Widget action={{ label: t('Settings'), to: '/settings/email' }} query={status}>
      {s && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 flex items-center gap-2 text-sm font-medium text-text">
                <span className={cn('size-2 shrink-0 rounded-full', health === 'ok' ? 'bg-success' : health === 'failing' ? 'bg-danger' : 'bg-warning')} />
                <span className="truncate">{health === 'off' ? t('Not delivering') : health === 'failing' ? t('Last email failed') : t('Sending with {transport}', { transport: s.transport.label })}</span>
              </p>
              <p className="m-0 mt-0.5 truncate pl-4 text-xs text-muted">
                {health === 'off' ? t('Emails are only written to the log.') : health === 'failing' ? s.latest[0].error : t('From {address}', { address: s.from })}
              </p>
            </div>
            {testButton(true)}
          </div>

          {(s.sent > 0 || s.failed > 0) && (
            <div className="grid grid-cols-2 gap-4 @md:grid-cols-4">
              <Stat size="sm" label={t('Sent (7 days)')} value={compactNumber(s.sent)} />
              {s.failed > 0 && <Stat size="sm" label={t('Failed (7 days)')} value={compactNumber(s.failed)} />}
            </div>
          )}

          {s.latest.length > 0 && (
            <div>
              <p className="m-0 mb-1 text-xs text-muted">{t('Latest')}</p>
              {s.latest.map((m) => (
                <WidgetRow
                  key={m.id}
                  leading={<Icon name={m.status === 'failed' ? 'warning' : 'mail'} size={15} className={cn('shrink-0', m.status === 'failed' ? 'text-danger' : 'text-faint')} />}
                  title={m.subject || t('No subject')}
                  description={m.status === 'failed' ? <span title={m.error ?? undefined}>{t('Not sent to {recipient}', { recipient: m.to })}</span> : m.to}
                  meta={timeAgo(m.createdAt)}
                />
              ))}
            </div>
          )}

          {testButton(false)}
        </div>
      )}
    </Widget>
  )
}
