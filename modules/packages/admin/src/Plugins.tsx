import { invalidate, loadManifest, navigate, panelsFor, registry, run, t, useAbility, useManifest, useTab, type Manifest, type RecordTimestamps } from '@letterncms/sdk'
import { useState, useSyncExternalStore } from 'react'
import { Button, cn, DataView, EmptyState, Icon, IconButton, Menu, Page, Switch, Tabs, confirm, toast } from '@letterncms/ui'
import { Store } from './Store'
import { UpdatesPanel } from './Updates'

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

/**
 * Where a plugin is set up: its settings (a page under Plugins in settings, or the Settings tab of its
 * own screen), else its screen in settings (Languages), else its screen. Nothing for one without any.
 */
function placeOf(manifest: Manifest, p: Pkg): { path: string; settings: boolean } | undefined {
  if (!p.active) return undefined
  const settings = p.settings.map((ns) => manifest.nav.find((n) => n.id === `settings.${ns}`)).find((n) => !!n)
  if (settings) return { path: settings.path, settings: true }
  const inSettings = new Set(manifest.settingsNav.flatMap((s) => s.items))
  const screens = manifest.nav.filter((n) => n.package === p.name && !n.home)
  const screen = screens.find((n) => inSettings.has(n.id)) ?? screens[0]
  return screen && { path: screen.path, settings: inSettings.has(screen.id) }
}

/**
 * The site's plugins in one place: on or off, their settings, the store, updates, and whatever else
 * belongs here (the licences of paid plugins), as tabs in the `plugins.tabs` slot. The parts of the
 * CMS itself (its modules) are not plugins and are not listed. Changes apply at once, without a reload.
 */
export default function Plugins() {
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const extra = panelsFor<Record<string, never>>('plugins.tabs', {})
  const [tab, setTab] = useTab(['installed', 'store', 'updates', ...extra.map((p) => p.id)])
  const list = useAbility<{ items: Pkg[]; errors: string[] }>('packages/list', { type: 'all' })
  const [busy, setBusy] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const all = list.data?.items ?? []

  const items = all.filter((p) => !p.core).sort((a, b) => a.label.localeCompare(b.label))
  const pending = all.filter((p) => p.active && p.installedVersion !== p.version)
  const labels = Object.fromEntries(all.map((p) => [p.name, p.label]))
  const Extra = extra.find((p) => p.id === tab)?.component
  const manifest = useManifest()

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
    <Page width="wide" crumbs={[{ label: t('Plugins'), icon: 'plugin' }]}>
      {pending.length > 0 && (
        <div className="mb-6 flex items-center gap-3 border-y border-border py-3 text-sm">
          <Icon name="database" size={16} className="shrink-0 text-warning" />
          <span className="flex-1 text-text">{t('Database updates are waiting')}</span>
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
          { value: 'installed', label: t('Installed'), count: list.data ? items.length : undefined },
          { value: 'store', label: t('Store') },
          { value: 'updates', label: t('Updates') },
          ...extra.map((p) => ({ value: p.id, label: p.label ?? p.id })),
        ]}
      />

      {tab === 'store' && <Store />}
      {tab === 'updates' && <UpdatesPanel />}
      {Extra && <Extra />}

      {tab === 'installed' && <DataView id="packages.plugins" label={t('Plugins')} items={items} rowKey={(p) => p.name} onRowClick={(p) => { const place = placeOf(manifest, p); if (place) navigate(place.path) }} searchText={(p) => `${p.label} ${p.description} ${p.name}`} icon="plugin"
        loading={list.isLoading} error={list.isError} onRetry={() => void list.refetch()}
        columns={[
          { id: 'name', label: t('Name'), width: 'minmax(128px,1fr)', value: (p) => p.label, render: (p) => (
            <span className="flex min-w-0 items-center gap-2">
              <Icon name={p.icon} size={16} className="shrink-0 text-muted" />
              <span className="shrink-0">{p.label}</span>
              <span title={p.problem ?? p.description} className={cn('ml-1 min-w-0 truncate font-normal max-sm:hidden', p.problem ? 'text-warning' : 'text-muted')}>{p.problem ?? gist(p.description)}</span>
            </span>
          ) },
          { id: 'version', label: t('Version'), width: '80px', value: (p) => p.version, render: (p) => <span className="tabular-nums">{p.version}</span> },
          { id: 'on', label: t('On'), width: '36px', value: (p) => Number(p.active), render: (p) => <Toggle pkg={p} labels={labels} locked={busy !== null} onAct={act} /> },
        ]}
        actions={(p) => <PackageActions pkg={p} place={placeOf(manifest, p)} busy={busy === p.name} locked={busy !== null} onAct={act} />}
        empty={<EmptyState icon="plugin" title={t('No plugins yet')} action={<Button onClick={() => setTab('store')}>{t('Open Store')}</Button>} />}
      />}

      {tab === 'installed' && (list.data?.errors ?? []).length > 0 && (
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

/** A description's first clause ("Media library", "Sell anything from a site"): one short line in a list; the rest is in its title. */
function gist(description: string): string {
  return description.split(/[:;,]\s|\.(\s|$)/)[0].trim()
}

function Toggle({ pkg: p, labels, locked, onAct }: { pkg: Pkg; labels: Record<string, string>; locked: boolean; onAct: Act }) {
  if (p.problem) return <span title={p.problem} className="flex"><Icon name="warning" size={16} className="text-warning" /><span className="sr-only">{p.problem}</span></span>
  const why = p.required ? t('Required') : p.enabled && p.dependents.length ? t('Needed by {names}', { names: p.dependents.map((d) => labels[d] ?? d).join(', ') }) : undefined
  const turn = (on: boolean) => void onAct(p, on ? 'packages/enable' : 'packages/disable', { name: p.name }, on ? t('{name} enabled', { name: p.label }) : t('{name} disabled', { name: p.label }))
  return <span title={why} className="flex"><Switch size="sm" checked={p.enabled} disabled={locked || !!why} onChange={turn} aria-label={t('{name} on', { name: p.label })} /></span>
}

function PackageActions({ pkg: p, place, busy, locked, onAct }: { pkg: Pkg; place?: { path: string; settings: boolean }; busy: boolean; locked: boolean; onAct: Act }) {
  return <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: p.label })} size="xs" disabled={busy} />} items={[
    place?.settings && { label: t('Settings'), icon: 'settings', onSelect: () => navigate(place.path) },
    !!p.problem && p.enabled && !p.required && { label: t('Turn Off'), icon: 'toggle', disabled: locked || p.dependents.length > 0, onSelect: () => void onAct(p, 'packages/disable', { name: p.name }, t('{name} disabled', { name: p.label })) },
    { label: t('Uninstall…'), icon: 'trash', danger: true, disabled: p.dependents.length > 0 || locked,
      onSelect: async () => {
        if (await confirm({ title: t('Uninstall {name}?', { name: p.label }), description: t('Its database tables, settings and files are removed.'), confirm: t('Uninstall'), danger: true }))
          await onAct(p, 'packages/uninstall', { name: p.name, deleteFiles: true }, t('{name} uninstalled', { name: p.label }))
      },
    },
  ]} />
}
