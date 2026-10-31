import { invalidate, loadManifest, navigate, plural, run, t, useAbility, useTab, type RecordTimestamps } from '@letterncms/sdk'
import { useState } from 'react'
import { Badge, Button, DataView, EmptyState, Icon, IconButton, Menu, Page, Tabs, confirm, toast } from '@letterncms/ui'
import { Store } from './Store'
import { UpdatesPanel } from './Updates'

const kinds = ['plugins', 'modules'] as const
const tabs = [...kinds, 'store', 'updates'] as const
type Kind = (typeof kinds)[number]

interface Pkg extends RecordTimestamps {
  name: string
  version: string
  label: string
  description: string
  icon: string
  firstParty: boolean
  core: boolean
  required: boolean
  enabled: boolean
  active: boolean
  problem: string | null
  installedVersion: string | null
  dependents: string[]
  provides: string[]
  settings: string[]
}

type Act = (pkg: Pkg, ability: string, input: Record<string, unknown>, message: string) => Promise<void>

const kindOf = (p: Pkg): Kind => (p.core ? 'modules' : 'plugins')

/** Every plugin and module in one place: on or off, and its settings. Changes apply at once, without a reload. */
export default function Modules() {
  const [tab, setTab] = useTab(tabs)
  const list = useAbility<{ items: Pkg[]; errors: string[] }>('packages/list', { type: 'all' })
  const [busy, setBusy] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const all = list.data?.items ?? []

  const items = all.filter((p) => kindOf(p) === tab).sort((a, b) => a.label.localeCompare(b.label))
  const pending = all.filter((p) => p.active && p.installedVersion !== p.version)
  const count = (k: Kind) => (list.data ? all.filter((p) => kindOf(p) === k).length : undefined)
  const labels = Object.fromEntries(all.map((p) => [p.name, p.label]))

  const act: Act = async (pkg, ability, input, message) => {
    setBusy(pkg.name)
    try {
      await run(ability, input)
      if (ability === 'packages/enable') await run('packages/sync').catch(() => {})
      // The admin follows the manifest: the package's screens, fields and panels arrive or leave.
      await Promise.all([loadManifest(), list.refetch()])
      invalidate('packages/')
      toast.success(message)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const update = async () => {
    setUpdating(true)
    try {
      await run('packages/sync')
      await Promise.all([loadManifest(), list.refetch()])
      toast.success(t('Database is up to date'))
    } catch (e) {
      toast.error(e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Page width="wide" crumbs={[{ label: t('Modules'), icon: 'plugin' }]}>
      {pending.length > 0 && (
        <div className="mb-6 flex items-center gap-3 border-y border-border py-3 text-sm">
          <Icon name="database" size={16} className="shrink-0 text-warning" />
          <span className="flex-1 text-text">{plural(pending.length, '{count} package needs a database update', '{count} packages need a database update')}</span>
          <Button size="sm" variant="primary" loading={updating} onClick={update}>
            {t('Update')}
          </Button>
        </div>
      )}

      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'plugins', label: t('Plugins'), count: count('plugins') },
          { value: 'modules', label: t('Modules'), count: count('modules') },
          { value: 'store', label: t('Store') },
          { value: 'updates', label: t('Updates') },
        ]}
      />

      {tab === 'store' && <Store />}
      {tab === 'updates' && <UpdatesPanel />}

      {tab !== 'store' && tab !== 'updates' && <DataView id={`packages.${tab}`} label={t('Modules')} items={items} rowKey={(p) => p.name} searchText={(p) => `${p.label} ${p.description} ${p.name}`} icon="plugin"
        loading={list.isLoading} error={list.isError} onRetry={() => void list.refetch()}
        columns={[
          { id: 'name', label: t('Name'), value: (p) => p.label, render: (p) => <span className="flex items-center gap-2"><Icon name={p.icon} size={16} className="shrink-0 text-muted" /><span className="truncate">{p.label}</span></span> },
          { id: 'description', label: t('Description'), width: 'minmax(240px,1.5fr)', render: (p) => <span title={p.description}>{p.description}</span> },
          { id: 'version', label: t('Version'), width: '80px', value: (p) => p.version, render: (p) => p.version },
          { id: 'status', label: t('Status'), width: '120px', value: (p) => Number(p.active), render: (p) => <Badge tone={p.problem ? 'warning' : p.active ? 'success' : 'neutral'}>{p.problem ? t('Unavailable') : p.active ? t('Active') : t('Off')}</Badge> },
          { id: 'details', label: t('Details'), width: 'minmax(160px,1fr)', render: (p) => <span title={p.problem ?? p.dependents.map((d) => labels[d] ?? d).join(', ')}>{p.problem ?? (p.enabled && p.dependents.length ? t('Needed by {names}', { names: p.dependents.map((d) => labels[d] ?? d).join(', ') }) : p.required ? t('Required') : !p.firstParty ? t('Third-party') : '—')}</span> },
        ]}
        actions={(p) => <PackageActions pkg={p} busy={busy === p.name} locked={busy !== null} onAct={act} />}
        empty={<EmptyState icon="plugin" title={tab === 'plugins' ? t('No plugins yet') : t('Nothing here yet')} description={t('Add them from the Store tab, or put a package in plugins/.')} action={<Button onClick={() => setTab('store')}>{t('Open Store')}</Button>} />}
      />}

      {tab !== 'store' && tab !== 'updates' && (list.data?.errors ?? []).length > 0 && (
        <div className="mt-6 space-y-1 border-t border-border pt-4 text-xs text-danger">
          {list.data!.errors.map((e) => (
            <p key={e} className="m-0">
              {e}
            </p>
          ))}
        </div>
      )}
    </Page>
  )
}

function PackageActions({ pkg: p, busy, locked, onAct }: { pkg: Pkg; busy: boolean; locked: boolean; onAct: Act }) {
  const kind = kindOf(p)
  const pinned = p.enabled && p.dependents.length > 0
  return <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: p.label })} size="xs" disabled={busy} />} items={[
    p.active && !!p.settings[0] && { label: t('Settings'), icon: 'settings', onSelect: () => navigate(`/settings/${p.settings[0]}`) },
    { label: p.enabled ? t('Turn Off') : t('Turn On'), icon: 'check', disabled: locked || pinned || p.required, onSelect: () => void onAct(p, p.enabled ? 'packages/disable' : 'packages/enable', { name: p.name }, p.enabled ? t('{name} disabled', { name: p.label }) : t('{name} enabled', { name: p.label })) },
    kind === 'plugins' && { label: t('Uninstall…'), icon: 'trash', danger: true, disabled: p.dependents.length > 0 || locked,
      onSelect: async () => {
        if (await confirm({ title: t('Uninstall {name}?', { name: p.label }), description: t('Its database tables, settings and files are removed.'), confirm: t('Uninstall'), danger: true }))
          await onAct(p, 'packages/uninstall', { name: p.name, deleteFiles: true }, t('{name} uninstalled', { name: p.label }))
      },
    },
  ]} />
}
