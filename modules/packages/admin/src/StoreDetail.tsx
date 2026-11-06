import { invalidate, locale, run, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, cn, Icon, IconButton, prompt, Skeleton, Slideover, Tabs, toast } from '@letterncms/ui'
import { useState } from 'react'
import { Action, ItemIcon, priceLabel, type Item } from './storeItem'

interface Detail extends Item {
  description_html: string
  gallery: { url: string; alt: string }[]
  requirements: string[]
  docs_url: string | null
  repository_url: string | null
  releases: { version: string; released_at: string; notes: string; security: boolean }[]
  operator: string
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

/** One plugin, as its store page shows it: what it does with pictures, what changed, and the facts beside them. */
export function StoreDetail({ item, icon, onClose, busy, locked, onInstall }: { item: Item; icon?: string; onClose: () => void; busy: boolean; locked: boolean; onInstall: () => void }) {
  const detail = useAbility<Detail>('packages/item', { store: item.store, package: item.package })
  const d = detail.data
  const [expanded, setExpanded] = useState(true)
  const [tab, setTab] = useState<'overview' | 'changelog'>('overview')

  const addKey = async () => {
    const asked = await prompt({ title: t('Add Key'), fields: [{ handle: 'key', type: 'textarea', label: t('Key'), required: true }], confirm: t('Add Key') })
    const key = asked?.key as string | undefined
    if (!key) return
    try {
      await run('packages/add-key', { key })
      invalidate('packages/')
      toast.success(t('Key added'))
      onClose()
    } catch (e) {
      toast.error(e)
    }
  }

  const releases = d?.releases ?? []
  const facts: [string, React.ReactNode][] = [
    [t('Version'), item.latest ?? '—'],
    ...(item.installed && item.installed !== item.latest ? [[t('Installed Here'), item.installed] as [string, string]] : []),
    ...(releases[0]?.released_at ? [[t('Updated'), date(releases[0].released_at)] as [string, string]] : []),
    [t('Price'), priceLabel(item)],
    ...(d?.requires.core ? [[t('Works With'), t('{brand} {version}', { version: atLeast(d.requires.core) })] as [string, string]] : []),
    ...(d?.requires.php ? [['PHP', atLeast(d.requires.php)] as [string, string]] : []),
    ...(item.categories.length ? [[t('Categories'), item.categories.join(', ')] as [string, string]] : []),
    [t('Made By'), item.author.url ? <a href={item.author.url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">{item.author.name || item.package}</a> : item.author.name || item.package],
    ...(d?.operator && item.pricing !== 'free' ? [[t('Sold By'), d.operator] as [string, string]] : []),
    [t('Package'), <code key="p" className="text-xs">{item.package}</code>],
  ]
  const links = [
    d?.docs_url && { label: t('Documentation'), href: d.docs_url, icon: 'book-open' },
    d?.repository_url && { label: t('Source Code'), href: d.repository_url, icon: 'code' },
    item.listing_url && { label: t('Store Page'), href: item.listing_url, icon: 'arrow-square-out' },
  ].filter(Boolean) as { label: string; href: string; icon: string }[]

  return (
    <Slideover id="store-item" open expanded={expanded} onExpandedChange={setExpanded} onOpenChange={(next) => { if (!next) onClose() }} title={item.title} icon="plugin">
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <header className="flex flex-wrap items-start gap-4">
          <ItemIcon item={item} icon={icon} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-xl font-medium text-ink">{item.title}</h2>
            <p className="m-0 mt-0.5 text-sm text-muted">{t('By {name}', { name: item.author.name || item.package })}</p>
            <p className="m-0 mt-2 max-w-2xl text-sm text-text">{item.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {item.action === 'buy' && <Button disabled={locked} onClick={() => void addKey()}>{t('Add Key')}</Button>}
            <Action item={item} busy={busy} locked={locked} onInstall={onInstall} size="md" />
          </div>
        </header>
        {item.access.message && <p className="m-0 mt-3 text-xs text-muted">{item.access.message}</p>}

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
      </div>
    </Slideover>
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
            <button key={s.url} type="button" onClick={() => setAt(i)} aria-label={t('Show picture {n}', { n: i + 1 })} aria-current={i === at || undefined} className={cn('w-24 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-transparent p-0 transition-opacity', i === at ? 'border-ink opacity-100' : 'border-border opacity-60 hover:opacity-100')}>
              <img src={s.url} alt="" className="block aspect-[16/10] w-full object-cover object-top" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </figure>
  )
}
