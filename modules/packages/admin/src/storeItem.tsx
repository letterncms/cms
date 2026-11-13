import { invalidate, loadManifest, navigate, run, t } from '@letterncms/sdk'
import { Badge, Button, cn, confirm, Icon, IconButton, Menu, Switch, toast, Tooltip, type MenuItemDef } from '@letterncms/ui'
import { driveJob, type Job } from './installing'

/** A package in a store's catalog, as this site sees it: what can be done with it here. */
export interface Item {
  package: string
  type: string
  title: string
  summary: string
  icon: string | null
  glyph: string | null
  featured: boolean
  categories: string[]
  first_party: boolean
  author: { name: string; url: string }
  listing_url: string | null
  latest: string | null
  installed: string | null
  action: 'install' | 'update' | 'installed' | 'incompatible' | 'blocked'
}

/** A plugin installed here, as `packages/list` says it: on or off, what keeps it on, where it is set up. */
export interface Installed {
  name: string
  version: string
  label: string
  note: string
  icon: string
  core: boolean
  enabled: boolean
  locked: boolean
  keptOn: string | null
  problem: string | null
  dependents: string[]
  to: string | null
  settingsTo: string | null
}

interface Plan { steps: { package: string; version: string; title: string; enable_only: boolean; action: string }[]; capabilities: string[] }

/** A listing's page, as shown in Plugins or Site Kits. */
export const itemPath = (item: Pick<Item, 'package'> & Partial<Pick<Item, 'type'>>) => `/${item.type === 'kit' ? 'kits' : 'plugins'}/store/${item.package}`

/** Turn On After Install, as the store's menu last set it in this visit: the list and a plugin's page install alike. */
export const installing = { turnOn: true }

/** Asks, then installs or updates a plugin and what it needs, step by step. True once it's done; a failure is said in a toast. */
export async function installItem(item: Item, onStep: (step: string | null) => void): Promise<boolean> {
  try {
    const plan = await run<Plan>('packages/plan-install', { package: item.package, version: item.latest ?? undefined })
    const lines = plan.steps.filter((s) => !s.enable_only).map((s) => `${s.title} ${s.version}`)
    const yes = await confirm({
      title: item.installed ? t('Update {name}?', { name: item.title }) : t('Install {name}?', { name: item.title }),
      description: [lines.length > 1 ? t('Also installs what it needs: {list}.', { list: lines.join(', ') }) : '', plan.capabilities.length ? t('It may use: {list}.', { list: plan.capabilities.join(', ') }) : '', t('This code runs with full access to your site.')].filter(Boolean).join(' '),
      confirm: item.installed ? t('Update') : t('Install'),
    })
    if (!yes) return false
    for (const s of plan.steps) {
      if (s.enable_only) {
        await run('packages/enable', { name: s.package })
        continue
      }
      onStep(t('Installing {name}…', { name: s.title }))
      const job = await run<Job>('packages/install', { package: s.package, version: s.version, turnOn: installing.turnOn })
      await driveJob(job)
    }
    invalidate('packages/', ...(item.type === 'kit' ? ['kits/'] : []))
    toast.success(item.installed ? t('{name} updated', { name: item.title }) : t('{name} installed', { name: item.title }))
    return true
  } catch (e) {
    toast.error(e)
    return false
  } finally {
    onStep(null)
  }
}

/** The store's picture of it, else the icon it has here once installed (one icon for one plugin, wherever it is shown), else the one the store names, else a plugin's. */
export function ItemIcon({ item, icon, size = 'md' }: { item: Item; icon?: string; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'size-14 rounded-xl' : 'size-10 rounded-lg'
  return item.icon
    ? <img src={item.icon} alt="" className={cn(box, 'shrink-0 object-cover')} loading="lazy" />
    : <span className={cn(box, 'grid shrink-0 place-items-center border border-border bg-sunken text-ink')}><Icon name={icon || item.glyph || 'plugin'} size={size === 'lg' ? 26 : 20} /></span>
}

export function Action({ item, busy, locked, onInstall, size = 'sm' }: { item: Item; busy: boolean; locked: boolean; onInstall: () => void; size?: 'sm' | 'md' }) {
  switch (item.action) {
    case 'install':
    case 'update':
      return <Button size={size} variant="primary" loading={busy} disabled={locked} onClick={(e) => { e.stopPropagation(); onInstall() }}>{item.action === 'update' ? t('Update') : t('Install')}</Button>
    case 'installed':
      // An installed plugin has its switch and menu instead (PluginControls); a kit is used where kits are.
      return item.type === 'kit' ? <Button size={size} variant="ghost" onClick={(e) => { e.stopPropagation(); navigate('/kits') }}>{t('Open')}</Button> : null
    case 'blocked':
      return <Badge tone="danger">{t('Blocked')}</Badge>
    default:
      return <span className="text-xs text-muted">{t('Not for this version')}</span>
  }
}

/** Turns an installed plugin on or off, then has the admin follow (its screens come and go without a reload). */
export async function switchPlugin(plugin: Installed, on: boolean): Promise<void> {
  try {
    const done = await run<{ message: string }>('packages/switch', { name: plugin.name, on })
    toast.success(done.message)
    invalidate('packages/')
    await loadManifest()
  } catch (e) {
    toast.error(e)
  }
}

/** Asks, then removes a plugin with its data and files. True once it is gone. */
export async function uninstallPlugin(plugin: Installed): Promise<boolean> {
  if (!await confirm({ title: t('Uninstall {name}?', { name: plugin.label }), description: t('Its database tables, settings and files are removed.'), confirm: t('Uninstall'), danger: true })) return false
  try {
    const done = await run<{ message: string }>('packages/uninstall', { name: plugin.name, deleteFiles: true })
    toast.success(done.message)
    invalidate('packages/')
    await loadManifest()
    return true
  } catch (e) {
    toast.error(e)
    return false
  }
}

/** What else is done with an installed plugin: where it is set up, and the way to remove it (not while another needs it). */
export function pluginMenu(plugin: Installed, after?: () => void): (MenuItemDef | false | null)[] {
  return [
    !!plugin.settingsTo && { label: t('Settings'), icon: 'settings', onSelect: () => navigate(plugin.settingsTo!) },
    !!plugin.to && plugin.to !== plugin.settingsTo && { label: t('Open'), icon: 'arrow-right', onSelect: () => navigate(plugin.to!) },
    (!!plugin.settingsTo || !!plugin.to) && { separator: true, label: '' },
    { label: t('Uninstall…'), icon: 'trash', danger: true, disabled: plugin.dependents.length > 0, description: plugin.keptOn && plugin.dependents.length ? plugin.keptOn : undefined, onSelect: () => void uninstallPlugin(plugin).then((gone) => gone && after?.()) },
  ]
}

/** An installed plugin's switch and its menu: what stays on says why. */
export function PluginControls({ plugin, disabled }: { plugin: Installed; disabled?: boolean }) {
  const toggle = <span className="inline-flex"><Switch checked={plugin.enabled} disabled={disabled || plugin.locked} onChange={(on) => void switchPlugin(plugin, on)} aria-label={t('{name} on', { name: plugin.label })} /></span>
  return (
    <div className="flex items-center gap-1">
      {plugin.locked && plugin.keptOn ? <Tooltip content={plugin.keptOn}>{toggle}</Tooltip> : toggle}
      <Menu align="end" trigger={<IconButton icon="more" label={t('Actions for {name}', { name: plugin.label })} size="sm" />} items={pluginMenu(plugin)} />
    </div>
  )
}
