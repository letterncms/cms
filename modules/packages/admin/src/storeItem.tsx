import { invalidate, run, t } from '@letterncms/sdk'
import { Badge, Button, cn, confirm, Icon, prompt, toast } from '@letterncms/ui'
import { driveJob, type Job } from './installing'

/** A package in a store's catalog, as this site sees it: what can be done with it here. */
export interface Item {
  store: string
  package: string
  type: string
  title: string
  summary: string
  icon: string | null
  glyph: string | null
  featured: boolean
  categories: string[]
  pricing: string
  first_party: boolean
  author: { name: string; url: string }
  listing_url: string | null
  latest: string | null
  installed: string | null
  action: 'install' | 'update' | 'installed' | 'buy' | 'incompatible' | 'blocked'
  access: { allowed?: boolean; reason?: string; message?: string; buy_url?: string }
}

interface Plan { steps: { package: string; version: string; title: string; enable_only: boolean; action: string }[]; capabilities: string[]; access: { allowed?: boolean; message?: string } }

/** Where a plugin's own page in the store is: its package name, and the store when it isn't the default one. */
export const itemPath = (item: Pick<Item, 'package' | 'store'>) => `/plugins/store/${item.package}${item.store && item.store !== 'default' ? `?store=${encodeURIComponent(item.store)}` : ''}`

/** Turn On After Install, as the store's menu last set it in this visit: the list and a plugin's page install alike. */
export const installing = { turnOn: true }

/** Asks, then installs or updates a plugin and what it needs, step by step. True once it's done; a failure is said in a toast. */
export async function installItem(item: Item, onStep: (step: string | null) => void): Promise<boolean> {
  try {
    const plan = await run<Plan>('packages/plan-install', { store: item.store, package: item.package, version: item.latest ?? undefined })
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
      const job = await run<Job>('packages/install', { store: item.store, package: s.package, version: s.version, turnOn: installing.turnOn })
      await driveJob(job)
    }
    invalidate('packages/')
    toast.success(item.installed ? t('{name} updated', { name: item.title }) : t('{name} installed', { name: item.title }))
    return true
  } catch (e) {
    toast.error(e)
    return false
  } finally {
    onStep(null)
  }
}

export const priceLabel = (item: Item) => (item.pricing === 'free' ? t('Free') : t('Paid'))

/** A bought plugin's license key, asked for and added: the same words as on the Licenses tab. True once it is in. */
export async function addLicenseKey(): Promise<boolean> {
  const asked = await prompt({ title: t('Add License Key'), fields: [{ handle: 'key', type: 'textarea', label: t('License Key'), required: true }], confirm: t('Add License Key') })
  const key = asked?.key as string | undefined
  if (!key) return false
  try {
    await run('packages/add-key', { key })
    invalidate('packages/')
    toast.success(t('License key added'))
    return true
  } catch (e) {
    toast.error(e)
    return false
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
    case 'buy':
      return item.listing_url ? <Button size={size} onClick={(e) => { e.stopPropagation(); window.open(item.listing_url!, '_blank', 'noopener') }}>{t('Buy on Store')}</Button> : <span className="text-xs text-muted">{t('Paid Plugin')}</span>
    case 'installed':
      return <span className="inline-flex items-center gap-1 text-xs text-muted"><Icon name="check" size={14} />{t('Installed')}</span>
    case 'blocked':
      return <Badge tone="danger">{t('Blocked')}</Badge>
    default:
      return <span className="text-xs text-muted">{t('Not for this version')}</span>
  }
}
