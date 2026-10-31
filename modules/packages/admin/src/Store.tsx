import { invalidate, run, t, useAbility, can, plural } from '@letterncms/sdk'
import { Badge, Button, confirm, EmptyState, Icon, IconButton, Input, Menu, prompt, Select, Skeleton, Slideover, Switch, toast } from '@letterncms/ui'
import { useMemo, useRef, useState } from 'react'
import { driveJob, JobFailed, type Job } from './installing'

interface Item {
  store: string
  package: string
  type: string
  title: string
  summary: string
  icon: string | null
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

interface Detail extends Item { description_html: string; screenshots: string[]; operator: string; capabilities: string[]; requires: { core?: string; php?: string } }
interface Catalog { store: string; items: Item[]; freshness: 'ok' | 'stale' | 'expired' | 'clock' | 'none'; problem: string | null; error: string | null }
interface StoreInfo { id: string; name: string; url: string | null; default: boolean; fingerprint: string | null; problem: string | null }
interface Plan { steps: { package: string; version: string; title: string; enable_only: boolean; action: string }[]; capabilities: string[]; access: { allowed?: boolean; message?: string } }

const CHUNK = 2 * 1024 * 1024

const toBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

/** Chunks get a big zip past any host's upload limit. */
async function uploadZip(file: File, allowUnsigned: boolean): Promise<Job> {
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 24)
  const buffer = new Uint8Array(await file.arrayBuffer())
  let job: Job | null = null
  const total = Math.max(1, Math.ceil(buffer.length / CHUNK))
  for (let index = 0; index < total; index++) {
    const answer = await run<Job & { received?: number }>('packages/upload', { id, index, last: index === total - 1, allowUnsigned, data: toBase64(buffer.subarray(index * CHUNK, (index + 1) * CHUNK)) })
    if (index === total - 1) job = answer
  }
  return job!
}

const PRICE_LABEL = (item: Item) => (item.pricing === 'free' ? t('Free') : t('Paid'))

/** Browse and install from a store: signed files, checked here. Works on every site, with nothing sold here at all. */
export function Store() {
  const [store, setStore] = useState('default')
  const stores = useAbility<{ items: StoreInfo[] }>('packages/stores')
  const catalog = useAbility<Catalog>('packages/catalog', { store })
  const [search, setSearch] = useState('')
  const [pricing, setPricing] = useState('all')
  const [open, setOpen] = useState<Item | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [step, setStep] = useState<string | null>(null)
  const [turnOn, setTurnOn] = useState(true)
  const file = useRef<HTMLInputElement>(null)
  const data = catalog.data

  const items = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data?.items ?? []).filter((i) => (pricing === 'all' || i.pricing === pricing || (pricing === 'paid' && i.pricing !== 'free')) && (q === '' || `${i.title} ${i.summary} ${i.package} ${i.categories.join(' ')}`.toLowerCase().includes(q)))
  }, [data, search, pricing])

  const after = async (message: string) => {
    invalidate('packages/')
    await catalog.refetch()
    toast.success(message)
  }

  const install = async (item: Item) => {
    setBusy(item.package)
    try {
      const plan = await run<Plan>('packages/plan-install', { store: item.store, package: item.package, version: item.latest ?? undefined })
      const lines = plan.steps.filter((s) => !s.enable_only).map((s) => `${s.title} ${s.version}`)
      const yes = await confirm({
        title: t('Install {name}?', { name: item.title }),
        description: [lines.length > 1 ? t('Also installs what it needs: {list}.', { list: lines.join(', ') }) : '', plan.capabilities.length ? t('It may use: {list}.', { list: plan.capabilities.join(', ') }) : '', t('This code runs with full access to your site.')].filter(Boolean).join(' '),
        confirm: item.installed ? t('Update') : t('Install'),
      })
      if (!yes) return
      for (const s of plan.steps) {
        if (s.enable_only) {
          await run('packages/enable', { name: s.package })
          continue
        }
        setStep(t('Installing {name}…', { name: s.title }))
        const job = await run<Job>('packages/install', { store: item.store, package: s.package, version: s.version, turnOn })
        await driveJob(job)
      }
      await after(item.installed ? t('{name} updated', { name: item.title }) : t('{name} installed', { name: item.title }))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
      setStep(null)
    }
  }

  const upload = async (chosen: File) => {
    setBusy('upload')
    setStep(t('Uploading {name}…', { name: chosen.name }))
    try {
      let job = await uploadZip(chosen, false)
      try {
        job = await driveJob(job)
      } catch (e) {
        if (!(e instanceof JobFailed) || e.code !== 'unsigned' || !can('packages.install_unsigned')) throw e
        const yes = await confirm({ title: t('Install {name} unsigned?', { name: chosen.name }), description: t('No store vouches for this file. It runs with full access to your site, and it gets no update offers.'), confirm: t('Install Unsigned'), danger: true })
        if (!yes) return
        job = await driveJob(await uploadZip(chosen, true))
      }
      await after(t('{name} installed', { name: job.package ?? chosen.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
      setStep(null)
      if (file.current) file.current.value = ''
    }
  }

  const addStore = async () => {
    const asked = await prompt({ title: t('Add a store'), description: t('Code from a store runs with full access to this site. Add it only if you trust who runs it.'), fields: [{ handle: 'url', type: 'text', label: t('Store address'), required: true, placeholder: 'https://' }], confirm: t('Continue') })
    const url = asked?.url as string | undefined
    if (!url) return
    try {
      const first = await run<{ name: string; fingerprint: string; id: string }>('packages/store-add', { url })
      const answer = await prompt({ title: t('Confirm {name}', { name: first.name }), description: t('Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}', { fingerprint: first.fingerprint }), fields: [{ handle: 'fingerprint', type: 'text', label: t('Key fingerprint'), required: true }], confirm: t('Add Store') })
      const typed = answer?.fingerprint as string | undefined
      if (!typed) return
      const done = await run<{ added: boolean; id: string }>('packages/store-add', { url, confirm: typed })
      if (!done.added) {
        toast.error(t('That fingerprint does not match. The store was not added.'))
        return
      }
      await stores.refetch()
      setStore(done.id)
    } catch (e) {
      toast.error(e)
    }
  }

  const refresh = async () => {
    setBusy('refresh')
    try {
      const next = await run<Catalog>('packages/catalog', { store, refresh: true })
      if (next.error) toast.error(next.error)
      invalidate('packages/catalog')
      await catalog.refetch()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const notice = !data ? null
    : data.problem === 'dev_trust' ? t('This build carries development keys, which only count on local and test sites. The store opens once it ships with production keys.')
    : data.problem ? t('This site has no valid list of signing keys, so it cannot trust a store. Download packages and upload them instead.')
    : data.freshness === 'clock' ? t('This server’s clock looks wrong, so installs are paused. The public site is not affected.')
    : data.freshness === 'expired' ? t('Can’t confirm this catalog is current, so installs from it are off. Refresh it, or upload a package by hand.')
    : data.freshness === 'stale' ? t('This catalog is a few days old. Refresh it when you can.')
    : data.error ? t('The store could not be reached. Installed packages are not affected. {error}', { error: data.error })
    : null

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(stores.data?.items.length ?? 0) > 1 && <Select value={store} onChange={(v) => setStore(v ?? 'default')} options={stores.data!.items.map((s) => ({ value: s.id, label: s.name }))} aria-label={t('Store')} />}
        <Input className="min-w-40 flex-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search the store')} aria-label={t('Search the store')} />
        <Select value={pricing} onChange={(v) => setPricing(v ?? 'all')} aria-label={t('Price')} options={[{ value: 'all', label: t('All') }, { value: 'free', label: t('Free') }, { value: 'paid', label: t('Paid') }]} />
        <Switch checked={turnOn} onChange={setTurnOn} size="sm" label={t('Turn on after install')} />
        <input ref={file} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
        <Menu trigger={<IconButton icon="more" label={t('More store actions')} />} items={[
          { label: t('Refresh Catalog'), icon: 'refresh', disabled: busy !== null, onSelect: () => void refresh() },
          { label: t('Upload a Zip…'), icon: 'upload', disabled: busy !== null, onSelect: () => file.current?.click() },
          { label: t('Add a Store…'), icon: 'plus', onSelect: () => void addStore() },
          !stores.data?.items.find((s) => s.id === store)?.default && { label: t('Remove This Store…'), icon: 'trash', danger: true, onSelect: async () => {
            if (await confirm({ title: t('Remove this store?'), description: t('What it installed stays, without update offers.'), confirm: t('Remove Store'), danger: true })) {
              await run('packages/store-remove', { id: store })
              setStore('default')
              await stores.refetch()
            }
          } },
        ]} />
      </div>

      {step && <p role="status" className="mb-4 text-sm text-muted">{step}</p>}
      {notice && <p className="mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text"><Icon name="info" size={16} className="shrink-0 text-muted" />{notice}</p>}

      {catalog.isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon="download" title={search ? t('Nothing matches that search') : t('Nothing in this store yet')} description={search ? t('Try fewer words.') : t('You can still upload a package as a zip.')} action={search ? <Button onClick={() => setSearch('')}>{t('Clear Search')}</Button> : <Button onClick={() => file.current?.click()}>{t('Upload a Zip')}</Button>} />
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">{plural(items.length, '{count} package', '{count} packages')}</p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
            {items.map((item) => <Card key={item.package} item={item} busy={busy === item.package} locked={busy !== null} onOpen={() => setOpen(item)} onInstall={() => void install(item)} />)}
          </div>
        </>
      )}

      {open && <DetailPanel item={open} onClose={() => setOpen(null)} locked={busy !== null} onInstall={() => void install(open)} />}
    </div>
  )
}

function ItemIcon({ item }: { item: Item }) {
  return item.icon ? <img src={item.icon} alt="" className="size-8 shrink-0 rounded object-cover" loading="lazy" /> : <span className="grid size-8 shrink-0 place-items-center rounded border border-border text-muted"><Icon name="plugin" size={16} /></span>
}

function Action({ item, busy, locked, onInstall }: { item: Item; busy: boolean; locked: boolean; onInstall: () => void }) {
  switch (item.action) {
    case 'install':
    case 'update':
      return <Button size="sm" variant="primary" loading={busy} disabled={locked} onClick={onInstall}>{item.action === 'update' ? t('Update') : t('Install')}</Button>
    case 'buy':
      return item.listing_url ? <Button size="sm" onClick={() => window.open(item.listing_url!, '_blank', 'noopener')}>{t('Buy on Store')}</Button> : <span className="text-xs text-muted">{t('Paid Plugin')}</span>
    case 'installed':
      return <span className="text-xs text-muted">{t('Installed')}</span>
    case 'blocked':
      return <Badge tone="danger">{t('Blocked')}</Badge>
    default:
      return <span className="text-xs text-muted">{t('Not for this version')}</span>
  }
}

function Card({ item, busy, locked, onOpen, onInstall }: { item: Item; busy: boolean; locked: boolean; onOpen: () => void; onInstall: () => void }) {
  return (
    <article className="flex min-w-0 flex-col gap-2 rounded-lg border border-border p-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <ItemIcon item={item} />
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="block max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left text-sm font-medium text-ink hover:underline">{item.title}</button>
          <p className="m-0 truncate text-xs text-muted">{item.author.name || item.package}</p>
        </div>
        <Badge tone={item.pricing === 'free' ? 'neutral' : 'warning'}>{PRICE_LABEL(item)}</Badge>
      </div>
      <p className="m-0 line-clamp-2 min-h-8 flex-1 text-xs text-text">{item.summary}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{item.latest ?? '—'}</span>
        <Action item={item} busy={busy} locked={locked} onInstall={onInstall} />
      </div>
    </article>
  )
}

function DetailPanel({ item, onClose, locked, onInstall }: { item: Item; onClose: () => void; locked: boolean; onInstall: () => void }) {
  const detail = useAbility<Detail>('packages/item', { store: item.store, package: item.package })
  const d = detail.data
  const [expanded, setExpanded] = useState(false)
  const addKey = async () => {
    const asked = await prompt({ title: t('Add Key'), description: t('Paste the key you got when you bought this plugin.'), fields: [{ handle: 'key', type: 'textarea', label: t('Key'), required: true }], confirm: t('Add Key') })
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
  return (
    <Slideover id="store-item" open expanded={expanded} onExpandedChange={setExpanded} onOpenChange={(next) => { if (!next) onClose() }} title={item.title} icon="plugin">
      <div className="space-y-4 p-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Action item={item} busy={false} locked={locked} onInstall={onInstall} />
          {item.access.message && <span className="text-xs text-muted">{item.access.message}</span>}
          {item.action === 'buy' && <Button size="sm" disabled={locked} onClick={() => void addKey()}>{t('Add Key')}</Button>}
        </div>
        <p className="m-0 text-xs text-muted">{d ? t('Sold by {operator}, made by {author}', { operator: d.operator, author: item.author.name || item.package }) : item.package}</p>
        {detail.isLoading ? <Skeleton className="h-32" /> : d?.description_html ? <div className="cms-store-description" dangerouslySetInnerHTML={{ __html: d.description_html }} /> : <p className="m-0">{item.summary}</p>}
        {(d?.screenshots.length ?? 0) > 0 && <div className="grid gap-2">{d!.screenshots.map((src) => <img key={src} src={src} alt="" className="w-full rounded border border-border" loading="lazy" />)}</div>}
        {d && d.capabilities.length > 0 && <p className="m-0"><span className="font-medium">{t('It may use')}: </span>{d.capabilities.join(', ')}</p>}
        {d && (d.requires.core || d.requires.php) && <p className="m-0 text-xs text-muted">{[d.requires.core && t('Needs {brand} {version}', { version: d.requires.core }), d.requires.php && `PHP ${d.requires.php}`].filter(Boolean).join(' · ')}</p>}
      </div>
    </Slideover>
  )
}
