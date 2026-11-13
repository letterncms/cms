import { locale, navigate, t, useAbility, useLocation } from '@letterncms/sdk'
import { Badge, Button, cn, Icon, IconButton, NotFoundState, Page, Pressable, Skeleton, Switch, Tabs, Tooltip } from '@letterncms/ui'
import { useEffect, useState } from 'react'
import { Action, installItem, ItemIcon, itemPath, switchPlugin, uninstallPlugin, type Installed, type Item } from './storeItem'

interface Detail extends Item {
  description_html: string
  gallery: { url: string; alt: string }[]
  requirements: string[]
  docs_url: string | null
  demo_url?: string | null
  repository_url: string | null
  releases: { version: string; released_at: string; notes: string; security: boolean }[]
  capabilities: string[]
  requires: { core?: string; php?: string }
}

const date = (at: string) => {
  const parsed = new Date(at)
  return Number.isNaN(parsed.getTime()) ? at : parsed.toLocaleDateString(locale(), { year: 'numeric', month: 'long', day: 'numeric' })
}

/** ">=0.12 <1" or "^8.4" as a person reads it: "0.12 or later". Anything else as it's written. */
const atLeast = (constraint: string) => {
  const found = /(?:>=|\^|~)\s*v?(\d+(?:\.\d+)?)/.exec(constraint)
  return found ? t('{version} or later', { version: found[1] }) : constraint
}

const PLUGINS = '/plugins'

/**
 * A listing's pictures, changelog and details, with crumbs back to its catalog.
 */
export default function StoreItem({ params }: { params: Record<string, string> }) {
  const { path } = useLocation()
  const kits = path.startsWith('/kits/')
  const name = `${params.vendor}/${params.name}`
  const catalog = useAbility<{ items: Item[] }>('packages/catalog')
  const local = useAbility<{ items: Installed[] }>('packages/list', { type: 'plugin' }, { enabled: !kits })
  const item = catalog.data?.items.find((i) => i.package === name)
  // Keep links to kits from before they had their own catalog working.
  const redirect = item && (item.type === 'kit') !== kits ? itemPath(item) : null
  useEffect(() => { if (redirect) navigate(redirect, { replace: true }) }, [redirect])
  const crumbs = kits
    ? [{ label: t('Site Kits'), to: '/kits', icon: 'box' }, { label: t('Browse Store'), to: '/kits/store' }]
    : [{ label: t('Plugins'), to: PLUGINS, icon: 'plugin' }]
  if (redirect) return null
  if (!item) {
    return (
      <Page crumbs={[...crumbs, { label: catalog.isLoading ? name : t('Not Found') }]}>
        {catalog.isLoading ? <Skeleton className="h-14 w-72" /> : <NotFoundState icon={kits ? 'box' : 'plugin'} action={<Button onClick={() => navigate(kits ? '/kits/store' : PLUGINS)}>{t('Back to {label}', { label: kits ? t('Browse Store') : t('Plugins') })}</Button>} />}
      </Page>
    )
  }
  return <Page width="wide" crumbs={[...crumbs, { label: item.title }]}><ItemPage key={item.package} item={item} plugin={local.data?.items.find((p) => p.name === item.package)} refetch={() => { void catalog.refetch(); if (!kits) void local.refetch() }} /></Page>
}

function ItemPage({ item, plugin, refetch }: { item: Item; plugin?: Installed; refetch: () => void }) {
  const icon = plugin?.icon
  const detail = useAbility<Detail>('packages/item', { package: item.package })
  const d = detail.data
  const [tab, setTab] = useState<'overview' | 'changelog'>('overview')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<string | null>(null)

  const install = async () => {
    setBusy(true)
    if (await installItem(item, setStep)) refetch()
    setBusy(false)
  }
  const locked = busy

  const releases = d?.releases ?? []
  const facts: [string, React.ReactNode][] = [
    [t('Version'), item.latest ?? '—'],
    ...(item.installed && item.installed !== item.latest ? [[t('Installed Here'), item.installed] as [string, string]] : []),
    ...(releases[0]?.released_at ? [[t('Updated'), date(releases[0].released_at)] as [string, string]] : []),
    ...(d?.requires.core ? [[t('Works With'), t('{brand} {version}', { version: atLeast(d.requires.core) })] as [string, string]] : []),
    ...(d?.requires.php ? [['PHP', atLeast(d.requires.php)] as [string, string]] : []),
    ...(item.categories.length ? [[t('Categories'), item.categories.join(', ')] as [string, string]] : []),
    [t('Made By'), item.author.url ? <a href={item.author.url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">{item.author.name || item.package}</a> : item.author.name || item.package],
    [t('Package'), <code key="p" className="text-xs">{item.package}</code>],
  ]
  const links = [
    d?.demo_url && { label: t('View the Demo'), href: d.demo_url, icon: 'eye' },
    d?.docs_url && { label: t('Documentation'), href: d.docs_url, icon: 'book-open' },
    d?.repository_url && { label: t('Source Code'), href: d.repository_url, icon: 'code' },
    item.listing_url && { label: t('Store Page'), href: item.listing_url, icon: 'arrow-square-out' },
  ].filter(Boolean) as { label: string; href: string; icon: string }[]

  return (
    <>
        <header className="flex flex-wrap items-start gap-4">
          <ItemIcon item={item} icon={icon} size="lg" />
          {/* Its words keep a column's width: on a phone the buttons go under them instead of squeezing them to a word a line. */}
          <div className="min-w-0 flex-1 basis-56">
            <h1 className="m-0 text-xl font-medium text-ink">{item.title}</h1>
            <p className="m-0 mt-0.5 text-sm text-muted">{t('By {name}', { name: item.author.name || item.package })}</p>
            <p className="m-0 mt-2 max-w-2xl text-sm text-text">{item.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Here already: where it is set up, on or off, an update, and the way to remove it. Not yet: what the store offers. */}
            {plugin ? <>
              {plugin.settingsTo && <Button size="md" icon="settings" onClick={() => navigate(plugin.settingsTo!)}>{t('Settings')}</Button>}
              {(() => {
                const toggle = <span className="inline-flex"><Switch checked={plugin.enabled} disabled={locked || plugin.locked} onChange={(on) => void switchPlugin(plugin, on).then(refetch)} label={t('On')} /></span>
                return plugin.locked && plugin.keptOn ? <Tooltip content={plugin.keptOn}>{toggle}</Tooltip> : toggle
              })()}
              {item.action === 'update' && <Action item={item} busy={busy} locked={locked} onInstall={() => void install()} size="md" />}
              <Button size="md" icon="trash" variant="ghost" disabled={locked || plugin.dependents.length > 0} title={plugin.dependents.length ? plugin.keptOn ?? undefined : undefined} onClick={() => void uninstallPlugin(plugin).then((gone) => gone && refetch())}>{t('Uninstall')}</Button>
            </> : <Action item={item} busy={busy} locked={locked} onInstall={() => void install()} size="md" />}
          </div>
        </header>
        {step && <p role="status" className="m-0 mt-3 text-sm text-muted">{step}</p>}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">
            {detail.isLoading ? <Skeleton className="aspect-[16/10] w-full" /> : <Gallery shots={d?.gallery ?? []} />}

            <Tabs className="mt-6" value={tab} onChange={setTab} tabs={[{ value: 'overview', label: t('Overview') }, { value: 'changelog', label: t('Changelog'), count: releases.length || undefined }]} />
            <div className="pt-4 text-sm">
              {tab === 'overview' ? (
                <div className="space-y-6">
                  {detail.isLoading ? <Skeleton className="h-32" /> : d?.description_html ? <div className="cms-store-description" dangerouslySetInnerHTML={{ __html: d.description_html }} /> : <p className="m-0">{item.summary}</p>}
                  {(d?.requirements.length ?? 0) > 0 && (
                    <section>
                      <h3 className="m-0 mb-2 text-sm font-medium text-ink">{t('What It Needs')}</h3>
                      <ul className="m-0 list-disc space-y-1 pl-5 text-text">{d!.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
                    </section>
                  )}
                  {d && d.capabilities.length > 0 && (
                    <section>
                      <h3 className="m-0 mb-2 text-sm font-medium text-ink">{t('It may use')}</h3>
                      <div className="flex flex-wrap gap-1.5">{d.capabilities.map((c) => <Badge key={c}>{c}</Badge>)}</div>
                    </section>
                  )}
                </div>
              ) : releases.length === 0 ? (
                <p className="m-0 text-muted">{t('This store doesn’t say what changed.')}</p>
              ) : (
                <ol className="m-0 list-none space-y-5 p-0">
                  {releases.map((r) => (
                    <li key={r.version}>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-medium text-ink">{r.version}</span>
                        <span className="text-xs text-muted">{date(r.released_at)}</span>
                        {r.security && <Badge tone="warning">{t('Security Fix')}</Badge>}
                      </div>
                      {r.notes && <p className="m-0 mt-1 whitespace-pre-line text-text">{r.notes}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          <aside className="min-w-0 lg:border-l lg:border-border lg:pl-6">
            <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
              {facts.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted">{label}</dt>
                  <dd className="m-0 truncate text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            {links.length > 0 && (
              <div className="mt-5 grid gap-1 border-t border-border pt-4">
                {links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink no-underline hover:bg-hover">
                    <Icon name={l.icon} size={16} className="text-muted" />{l.label}
                  </a>
                ))}
              </div>
            )}
          </aside>
        </div>
    </>
  )
}

/** One large picture at a time, with its neighbours below. Nothing at all when the store has none. */
function Gallery({ shots }: { shots: { url: string; alt: string }[] }) {
  const [at, setAt] = useState(0)
  if (shots.length === 0) return null
  const shot = shots[Math.min(at, shots.length - 1)]
  const go = (step: number) => setAt((i) => (i + step + shots.length) % shots.length)
  return (
    <figure className="m-0">
      <div className="relative overflow-hidden rounded-lg border border-border bg-sunken">
        <img src={shot.url} alt={shot.alt} className="block aspect-[16/10] w-full object-cover object-top" />
        {shots.length > 1 && (
          <div className="absolute right-2 bottom-2 flex gap-1">
            <IconButton icon="arrow-left" label={t('Previous Picture')} variant="secondary" onClick={() => go(-1)} />
            <IconButton icon="arrow-right" label={t('Next Picture')} variant="secondary" onClick={() => go(1)} />
          </div>
        )}
      </div>
      {shot.alt && <figcaption className="mt-2 text-xs text-muted">{shot.alt}</figcaption>}
      {shots.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {shots.map((s, i) => (
            <Pressable key={s.url} onClick={() => setAt(i)} aria-label={t('Show picture {n}', { n: i + 1 })} aria-current={i === at || undefined} className={cn('w-24 shrink-0 overflow-hidden rounded-md border transition-opacity duration-base', i === at ? 'border-ink opacity-100' : 'border-border opacity-60 hover:opacity-100')}>
              <img src={s.url} alt="" className="block aspect-[16/10] w-full object-cover object-top" loading="lazy" />
            </Pressable>
          ))}
        </div>
      )}
    </figure>
  )
}
