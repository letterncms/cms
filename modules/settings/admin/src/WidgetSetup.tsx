import { brand, t, useAbility, useManifest } from '@letterncms/sdk'
import { Icon, Meter, Widget, WidgetRow, cn } from '@letterncms/ui'

interface Item {
  label: string
  done: boolean
  value: string
  to: string
}

/** Home-screen widget: what the site still needs before it goes live, each item linking to where it is set. */
export default function WidgetSetup() {
  const manifest = useManifest()
  const hasMail = manifest.settings.some((s) => s.namespace === 'mail')
  const site = useAbility<{ values: Record<string, any> }>('settings/get', { namespace: 'site' })
  const mail = useAbility<{ values: Record<string, any> }>('settings/get', { namespace: 'mail' }, { enabled: hasMail })
  const loading = site.isLoading || (hasMail && mail.isLoading)

  const items: Item[] = []
  if (site.data) {
    const v = site.data.values
    const name = String(v.name ?? '').trim()
    const host = hostOf(String(v.url ?? ''))
    const description = String(v.description ?? '').trim()
    const timezone = String(v.timezone ?? 'UTC')
    items.push(
      { label: t('Site Name'), done: name !== '' && name !== brand().name, value: name || t('Not set'), to: '/settings/site' },
      { label: t('Public URL'), done: !!host && !isLocal(host), value: host ? (isLocal(host) ? t('Local Address') : host) : t('Not set'), to: '/settings/site' },
      { label: t('Description'), done: description !== '', value: description ? t('Added') : t('Missing'), to: '/settings/site' },
      { label: t('Timezone'), done: timezone !== 'UTC', value: timezone, to: '/settings/site' },
    )
  }
  if (hasMail && mail.data) {
    const from = String(mail.data.values.from_address ?? '').trim()
    items.push({ label: t('Email Sender'), done: from !== '', value: from || t('Not set'), to: '/settings/mail' })
  }

  const done = items.filter((i) => i.done).length
  const ready = items.length > 0 && done === items.length

  return (
    <Widget query={site} loading={loading}>
      {items.length > 0 && (
        <>
          <div className="mb-1 flex items-center gap-3">
            <span className="shrink-0 text-xs text-muted">{ready ? t('Ready to launch') : t('{done} of {total} done', { done, total: items.length })}</span>
            <Meter value={done / items.length} tone={ready ? 'success' : 'ink'} label={t('Site Setup Progress')} className="flex-1" />
          </div>
          {items.map((i) => (
            <WidgetRow
              key={i.label}
              to={i.to}
              leading={<Icon name={i.done ? 'check-circle' : 'circle'} size={15} className={cn('shrink-0', i.done ? 'text-success' : 'text-faint')} />}
              title={i.label}
              meta={<span className={cn('block max-w-36 truncate', !i.done && 'text-muted')}>{i.value}</span>}
            />
          ))}
        </>
      )}
    </Widget>
  )
}

function hostOf(url: string): string {
  try {
    return url.trim() ? new URL(url).host : ''
  } catch {
    return url.trim()
  }
}

function isLocal(host: string): boolean {
  const name = host.replace(/:\d+$/, '').replace(/^\[|\]$/g, '')
  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(name) || /\.(localhost|local|test)$/.test(name)
}
