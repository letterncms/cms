import { invalidate, Link, locale, run, t, useAbility, useLocation, can, navigate, plural, setQuery } from '@letterncms/sdk'
import { Badge, Button, cn, confirm, EmptyState, Icon, IconButton, Input, List, Menu, NoMatches, Page, prompt, Segmented, Select, Skeleton, toast } from '@letterncms/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { driveJob, JobFailed, type Job } from './installing'
import { Action, addLicenseKey, installing, installItem, ItemIcon, itemPath, PluginControls, priceLabel, type Installed, type Item } from './storeItem'

interface Catalog { store: string; items: Item[]; freshness: 'ok' | 'stale' | 'expired' | 'clock' | 'none'; problem: string | null; error: string | null }
interface StoreInfo { id: string; name: string; url: string | null; default: boolean; fingerprint: string | null; problem: string | null }
type Sort = 'popular' | 'name'

/** One plugin in the list: what the store says of it, what is installed here, or both. */
interface Row { key: string; item?: Item; plugin?: Installed }

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


export function Store() {
  return <StoreList kits={false} />
}

export function KitStore() {
  return (
    <Page crumbs={[{ label: t('Site Kits'), to: '/kits', icon: 'box' }, { label: t('Browse Store') }]}>
      <StoreList kits />
    </Page>
  )
}

/** The store's catalog for plugins or site kits. The plugin list also includes locally installed plugins. */
function StoreList({ kits }: { kits: boolean }) {
  const [store, setStore] = useState('default')
  const stores = useAbility<{ items: StoreInfo[] }>('package-stores/list')
  const catalog = useAbility<Catalog>('packages/catalog', { store })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [pricing, setPricing] = useState('all')
  const [sort, setSort] = useState<Sort>('popular')
  // An older link to a plugin's page (`?item=<package>`) leads to its page of its own.
  const { query } = useLocation()
  // All of them, or what is installed here: in the address, so a link (and the way back from a plugin's page) keeps it.
  const show: 'all' | 'installed' = query.show === 'installed' ? 'installed' : 'all'
  const setShow = (next: 'all' | 'installed') => setQuery({ show: next === 'all' ? null : next })
  useEffect(() => { if (query.item) navigate(itemPath({ package: query.item, store: query.store ?? 'default' }), { replace: true }) }, [query.item, query.store])
  const [busy, setBusy] = useState<string | null>(null)
  const [step, setStep] = useState<string | null>(null)
  const [turnOn, setTurnOnHere] = useState(installing.turnOn)
  const setTurnOn = (change: (on: boolean) => boolean) => setTurnOnHere((on) => (installing.turnOn = change(on)))
  const file = useRef<HTMLInputElement>(null)
  const data = catalog.data
  const local = useAbility<{ items: Installed[] }>('packages/list', { type: 'plugin' }, { enabled: !kits })
  const plugins = kits ? undefined : local.data?.items
  const current = stores.data?.items.find((s) => s.id === store)
  const all = useMemo(() => (data?.items ?? []).filter((item) => (item.type === 'kit') === kits), [data, kits])
  const label = kits ? t('Site Kits') : t('Plugins')

  // Only what this store has: no empty categories, and price only once something costs money.
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of all) for (const c of item.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    return [...counts].sort((a, b) => a[0].localeCompare(b[0], locale()))
  }, [all])
  const sellsSomething = all.some((i) => i.pricing !== 'free') && all.some((i) => i.pricing === 'free')

  // The store's plugins, each with what is installed of it here; then what is installed from elsewhere (a zip, another store).
  const rows = useMemo<Row[]>(() => {
    const installedHere = new Map((plugins ?? []).map((p) => [p.name, p]))
    const listed = new Set(all.map((i) => i.package))
    return [
      ...all.map((item) => ({ key: item.package, item, plugin: installedHere.get(item.package) })),
      ...(plugins ?? []).filter((p) => !listed.has(p.name)).map((plugin) => ({ key: plugin.name, plugin })),
    ]
  }, [all, plugins])
  const installedCount = rows.filter(isInstalled).length

  const items = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase(locale()).split(/\s+/).filter(Boolean)
    const found = rows.filter((row) => {
      if (show === 'installed' && !isInstalled(row)) return false
      const { item, plugin } = row
      const text = (item ? `${item.title} ${item.summary} ${item.package} ${item.author.name} ${item.categories.join(' ')}` : `${plugin!.label} ${plugin!.note} ${plugin!.name}`).toLocaleLowerCase(locale())
      // Category and price are the store's words: what it doesn't list has neither.
      return (!category || !!item?.categories.includes(category)) && (pricing === 'all' || (!!item && (pricing === 'free') === (item.pricing === 'free'))) && terms.every((term) => text.includes(term))
    })
    if (sort === 'name') return [...found].sort((a, b) => title(a).localeCompare(title(b), locale()))
    return found
  }, [rows, show, search, category, pricing, sort])

  const narrowed = search.trim() !== '' || category !== '' || pricing !== 'all'
  // One list: what the store features leads it, in the store's own order, and is not listed a second time.
  const listed = !narrowed && sort === 'popular' ? [...items.filter((r) => r.item?.featured), ...items.filter((r) => !r.item?.featured)] : items
  // What every card would say alike is said by none: the price where nothing is sold, the author where there is one.
  const priced = all.some((i) => i.pricing !== 'free')
  const authored = new Set(all.map((i) => i.author.name || i.package)).size > 1
  const clear = () => { setSearch(''); setCategory(''); setPricing('all') }

  const after = async (message: string) => {
    invalidate('packages/')
    await Promise.all([catalog.refetch(), local.refetch()])
    toast.success(message)
  }

  const install = async (item: Item) => {
    setBusy(item.package)
    if (await installItem(item, setStep)) await Promise.all([catalog.refetch(), kits ? undefined : local.refetch()])
    setBusy(null)
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
    const asked = await prompt({ title: t('Add Store'), description: t('Code from a store runs with full access to this site. Add it only if you trust who runs it.'), fields: [{ handle: 'url', type: 'text', label: t('Store Address'), required: true, placeholder: 'https://' }], confirm: t('Check Store') })
    const url = asked?.url as string | undefined
    if (!url) return
    try {
      const first = await run<{ name: string; fingerprint: string; id: string }>('package-stores/create', { url })
      const answer = await prompt({ title: t('Add {name}?', { name: first.name }), description: t('Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}', { fingerprint: first.fingerprint }), fields: [{ handle: 'fingerprint', type: 'text', label: t('Key Fingerprint'), required: true }], confirm: t('Add Store') })
      const typed = answer?.fingerprint as string | undefined
      if (!typed) return
      const done = await run<{ added: boolean; id: string }>('package-stores/create', { url, confirm: typed })
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

  const removeStore = async () => {
    if (!current || !(await confirm({ title: t('Remove {name}?', { name: current.name }), description: t('What it installed stays, without update offers.'), confirm: t('Remove Store'), danger: true }))) return
    await run('package-stores/delete', { id: store })
    setStore('default')
    await stores.refetch()
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
    : data.problem === 'dev_trust' ? t('This build has development keys, so the store is closed.')
    : data.problem ? t('No valid signing keys, so the store is off. Upload packages instead.')
    : data.freshness === 'clock' ? t('This server’s clock looks wrong, so installs are paused.')
    : data.freshness === 'expired' ? t('This catalog is out of date, so installs are off until the store is checked again.')
    : data.freshness === 'stale' ? t('This catalog is a few days old.')
    : data.error ? t('Can’t reach the store. {error}', { error: data.error })
    : null

  const card = (row: Row) => <Card key={row.key} row={row} priced={priced} authored={authored} busy={busy === row.key} locked={busy !== null} onInstall={() => row.item && void install(row.item)} />

  return (
    <div>
      {!kits && <input ref={file} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />}

      {/* Find first: search and order, then what to narrow it to. */}
      <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2">
        <Segmented size="sm" value={show} onChange={setShow} aria-label={t('Show')} options={[{ value: 'all', label: t('All') }, { value: 'installed', label: t('Installed'), count: installedCount || undefined }]} />
        <Input size="sm" className="w-full sm:w-auto sm:min-w-44 sm:flex-1" icon="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search {items}', { items: label })} aria-label={t('Search')} />
        <div className="w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]"><Select size="sm" value={sort} onChange={(v) => setSort((v ?? 'popular') as Sort)} aria-label={t('Sort')} options={[{ value: 'popular', label: t('Most Popular') }, { value: 'name', label: t('Name') }]} /></div>
        {categories.some(([, count]) => count > 1) && <div className="w-36 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]"><Select size="sm" value={category || 'all'} onChange={(v) => setCategory(!v || v === 'all' ? '' : v)} aria-label={t('Category')} options={[{ value: 'all', label: t('All Categories') }, ...categories.map(([name]) => ({ value: name, label: name }))]} /></div>}
        {sellsSomething && <div className="w-28 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]"><Select size="sm" value={pricing} onChange={(v) => setPricing(v ?? 'all')} aria-label={t('Price')} options={[{ value: 'all', label: t('Any Price') }, { value: 'free', label: t('Free') }, { value: 'paid', label: t('Paid') }]} /></div>}
        <div className="flex items-center gap-1 max-sm:ml-auto">
          {(stores.data?.items.length ?? 0) > 1 && <div className="w-40 max-sm:min-w-0 max-sm:grow max-sm:basis-[calc(50%-0.25rem)]"><Select size="sm" value={store} onChange={(v) => setStore(v ?? 'default')} options={stores.data!.items.map((s) => ({ value: s.id, label: s.name }))} aria-label={t('Store')} /></div>}
          <Menu
            trigger={<IconButton icon="more" label={t('More')} />}
            items={[
              !kits && { label: t('Upload Zip'), icon: 'upload', disabled: busy !== null, onSelect: () => file.current?.click() },
              { label: t('Check Now'), icon: 'refresh', disabled: busy !== null, onSelect: () => void refresh() },
              // A key for what was bought belongs here too, before anything paid is installed and a Licenses tab exists.
              priced && { label: t('Add License Key'), icon: 'key', onSelect: () => void addLicenseKey() },
              !kits && { label: t('Turn On After Install'), checked: turnOn, onSelect: () => setTurnOn((on) => !on) },
              { separator: true, label: '' },
              { label: t('Add Store'), icon: 'plus', onSelect: () => void addStore() },
              current && !current.default && { label: t('Remove {name}', { name: current.name }), icon: 'trash', danger: true, onSelect: () => void removeStore() },
            ]}
          />
        </div>
      </div>

      {step && <p role="status" className="mb-4 text-sm text-muted">{step}</p>}
      {notice && <p className="mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text"><Icon name="info" size={16} className="shrink-0 text-muted" />{notice}</p>}

      {catalog.isLoading ? (
        <List>{[0, 1, 2, 3].map((i) => <div key={i} role="listitem" className="flex min-h-16 items-center gap-3 px-3"><Skeleton className="size-10 rounded-lg" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-64 max-w-full" /></div></div>)}</List>
      ) : items.length === 0 ? (
        narrowed
          ? <NoMatches onClear={clear} />
          : show === 'installed'
          ? <EmptyState icon={kits ? 'box' : 'plugin'} title={kits ? t('No site kits') : t('No plugins installed yet')} action={<Button onClick={() => setShow('all')}>{kits ? t('Browse Store') : t('Browse Plugins')}</Button>} />
          : <EmptyState icon="download" title={t('Nothing in this store yet')} action={kits ? undefined : <Button onClick={() => file.current?.click()}>{t('Upload Zip')}</Button>} />
      ) : (
        <>
          {narrowed && <h2 className="m-0 mb-3 text-sm font-medium text-ink">{plural(items.length, '{count} result', '{count} results')}</h2>}
          <List>{listed.map(card)}</List>
        </>
      )}

    </div>
  )
}

const isInstalled = ({ item, plugin }: Row) => !!plugin || (item?.type === 'kit' && !!item.installed)

const title = (row: Row) => row.item?.title ?? row.plugin!.label

/**
 * One plugin as a row of the list: what it is, what it does in a line (or what's wrong with it), its version, and
 * what to do with it here: install it, or once it's here its switch and menu. Its name leads to its page.
 */
function Card({ row, priced, authored, busy, locked, onInstall }: { row: Row; priced: boolean; authored: boolean; busy: boolean; locked: boolean; onInstall: () => void }) {
  const { item, plugin } = row
  const to = item ? itemPath(item) : plugin!.to
  const name = item?.title ?? plugin!.label
  const line = plugin?.problem ?? (item ? [authored && t('By {name}', { name: item.author.name || item.package }), item.summary].filter(Boolean).join(' · ') : plugin!.note)
  return (
    <div role="listitem" className="flex min-h-16 items-center gap-3 px-3 py-2">
      {item ? <ItemIcon item={item} icon={plugin?.icon} /> : <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-sunken text-ink"><Icon name={plugin!.icon || 'plugin'} size={20} /></span>}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {to ? <Link to={to} className="min-w-0 truncate rounded-xs text-sm font-medium text-ink no-underline hover:underline hover:underline-offset-2">{name}</Link> : <span className="min-w-0 truncate text-sm font-medium text-ink">{name}</span>}
          {priced && item && !isInstalled(row) && <Badge>{priceLabel(item)}</Badge>}
        </div>
        <p className={cn('m-0 truncate text-xs', plugin?.problem ? 'text-warning' : 'text-muted')}>{line}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted max-sm:hidden">{plugin?.version ?? item?.installed ?? item?.latest}</span>
      <div className="flex shrink-0 items-center gap-2">
        {/* Here already: an update if there is one, then its switch and menu. Not yet: what the store offers. */}
        {item && (!plugin || item.action === 'update') && <Action item={item} busy={busy} locked={locked} onInstall={onInstall} />}
        {plugin && <PluginControls plugin={plugin} disabled={locked} />}
      </div>
    </div>
  )
}
