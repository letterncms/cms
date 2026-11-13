import { invalidate, loadManifest, plural, run, t, useAbility } from '@letterncms/sdk'
import { Button, Icon, Widget, WidgetRow, cn, toast } from '@letterncms/ui'
import { useState, type ReactNode } from 'react'

interface Pkg {
  name: string
  label: string
  icon: string
  core: boolean
  enabled: boolean
  active: boolean
  problem: string | null
  version: string
  installedVersion: string | null
}

/** Home-screen widget: what about the installation needs attention — database updates waiting, plugins that failed. */
export default function WidgetSystem() {
  const list = useAbility<{ items: Pkg[]; errors: string[] }>('packages/list', { type: 'all' })
  const [updating, setUpdating] = useState(false)
  const all = list.data?.items ?? []

  const pending = all.filter((p) => p.active && p.installedVersion !== p.version)
  const troubled = all.filter((p) => p.enabled && p.problem)
  const broken = list.data?.errors ?? []

  const update = async () => {
    setUpdating(true)
    try {
      await run('packages/migrate')
      await Promise.all([loadManifest(), list.refetch()])
      invalidate('packages/')
      toast.success(t('Database is up to date'))
    } catch (e) {
      toast.error(e)
    } finally {
      setUpdating(false)
    }
  }

  const healthy = !!list.data && pending.length === 0 && troubled.length === 0 && broken.length === 0

  return (
    <Widget action={{ label: t('Plugins'), to: '/plugins' }} query={list} empty={healthy && { title: t('Everything is up to date') }}>
      {list.data && (
        <div>
          <div>
            {pending.length > 0 && (
              <Check
                tone="warning"
                label={t('Database')}
                value={plural(pending.length, '{count} update pending', '{count} updates pending')}
                action={<Button size="xs" variant="primary" loading={updating} onClick={update}>{t('Run Updates')}</Button>}
              />
            )}
            {troubled.slice(0, 3).map((p) => (
              <WidgetRow key={p.name} to="/plugins" leading={<Icon name="warning" size={14} className="shrink-0 text-warning" />} title={p.label} description={p.problem} />
            ))}
            {broken.slice(0, Math.max(0, 3 - troubled.length)).map((e) => (
              <WidgetRow key={e} to="/plugins" leading={<Icon name="warning" size={14} className="shrink-0 text-warning" />} title={t('A package could not be read')} description={e} />
            ))}
          </div>
        </div>
      )}
    </Widget>
  )
}

function Check({ tone, label, value, action }: { tone: 'success' | 'warning'; label: string; value: ReactNode; action?: ReactNode }) {
  return (
    <WidgetRow
      leading={<span aria-hidden="true" className={cn('mx-[4px] size-1.5 shrink-0 rounded-full', tone === 'success' ? 'bg-success' : 'bg-warning ring-3 ring-warning/20')} />}
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
