import { brand, invalidate, loadManifest, plural, run, t, useAbility, useManifest } from '@letterncms/sdk'
import { Button, Icon, Stat, Widget, WidgetRow, cn, toast } from '@letterncms/ui'
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

/** Home-screen widget: the state of the installation — version, database updates and plugins that need attention. */
export default function WidgetSystem() {
  const manifest = useManifest()
  const list = useAbility<{ items: Pkg[]; errors: string[] }>('packages/list', { type: 'all' })
  const [updating, setUpdating] = useState(false)
  const all = list.data?.items ?? []

  const extensions = all
  const plugins = extensions.filter((p) => !p.core && p.active).length
  const pending = all.filter((p) => p.active && p.installedVersion !== p.version)
  const troubled = extensions.filter((p) => p.enabled && p.problem)
  const broken = list.data?.errors ?? []

  const update = async () => {
    setUpdating(true)
    try {
      await run('packages/sync')
      await Promise.all([loadManifest(), list.refetch()])
      invalidate('packages/')
      toast.success(t('Database is up to date'))
    } catch (e) {
      toast.error(e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Widget action={{ label: t('Plugins'), to: '/plugins' }} query={list}>
      {list.data && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Stat size="sm" label={brand().name} value={manifest.cms.version} />
            <Stat size="sm" label={t('Plugins')} value={plugins} />
          </div>

          <div className="border-t border-border pt-1">
            <Check
              tone={pending.length ? 'warning' : 'success'}
              label={t('Database')}
              value={pending.length ? plural(pending.length, '{count} update pending', '{count} updates pending') : t('Up to date')}
              action={pending.length > 0 && <Button size="xs" variant="primary" loading={updating} onClick={update}>{t('Run Updates')}</Button>}
            />
            <Check
              tone={troubled.length || broken.length ? 'warning' : 'success'}
              label={t('Health')}
              value={troubled.length || broken.length ? plural(troubled.length + broken.length, '{count} needs attention', '{count} need attention') : t('All working')}
            />
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
