import { invalidate, locale, run, t, useAbility, can, plural } from '@letterncms/sdk'
import { Badge, Button, cn, confirm, EmptyState, Icon, IconButton, Input, Menu, NoMatches, prompt, Select, Skeleton, toast } from '@letterncms/ui'
import { useMemo, useRef, useState } from 'react'
import { driveJob, JobFailed, type Job } from './installing'
import { StoreDetail } from './StoreDetail'
import { Action, ItemIcon, priceLabel, type Item } from './storeItem'

interface Catalog { store: string; items: Item[]; freshness: 'ok' | 'stale' | 'expired' | 'clock' | 'none'; problem: string | null; error: string | null }
interface StoreInfo { id: string; name: string; url: string | null; default: boolean; fingerprint: string | null; problem: string | null }
interface Plan { steps: { package: string; version: string; title: string; enable_only: boolean; action: string }[]; capabilities: string[]; access: { allowed?: boolean; message?: string } }
type Sort = 'popular' | 'name' | 'installed'

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


/**
 * Browse and install from a store: signed files, checked here. Works on every site, with nothing sold here at all.
 * Search and sort sit above the categories; with nothing narrowed, featured plugins come first, then all of them
 * in the store's own order. Every card is the same size.
 */
export function Store() {
  const [store, setStore] = useState('default')
  const stores = useAbility<{ items: StoreInfo[] }>('package-stores/list')
  const catalog = useAbility<Catalog>('packages/catalog', { store })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [pricing, setPricing] = useState('all')
  const [sort, setSort] = useState<Sort>('popular')
  const [open, setOpen] = useState<Item | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [step, setStep] = useState<string | null>(null)
  const [turnOn, setTurnOn] = useState(true)
  const file = useRef<HTMLInputElement>(null)
  const data = catalog.data
  // What's installed here brings its own icon: an older store's listing may have none.
  const local = useAbility<{ items: { name: string; icon: string }[] }>('packages/list', { type: 'all' })
  const icons = Object.fromEntries((local.data?.items ?? []).map((p) => [p.name, p.icon]))
  const current = stores.data?.items.find((s) => s.id === store)
  const all = data?.items ?? []

  // Only what this store has: no empty categories, and price only once something costs money.
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of all) for (const c of item.categories) counts.set(c, (counts.get(c) ?? 0) + 1)
    return [...counts].sort((a, b) => a[0].localeCompare(b[0], locale()))
  }, [all])
  const sellsSomething = all.some((i) => i.pricing !== 'free') && all.some((i) => i.pricing === 'free')

  const items = useMemo(() => {
    const terms = search.trim().toLocaleLowerCase(locale()).split(/\s+/).filter(Boolean)
    const found = all.filter((i) => {
      const text = `${i.title} ${i.summary} ${i.package} ${i.author.name} ${i.categories.join(' ')}`.toLocaleLowerCase(locale())
      return (!category || i.categories.includes(category)) && (pricing === 'all' || (pricing === 'free') === (i.pricing === 'free')) && terms.every((term) => text.includes(term))
    })
    if (sort === 'name') return [...found].sort((a, b) => a.title.localeCompare(b.title, locale()))
    if (sort === 'installed') return [...found].sort((a, b) => Number(!!b.installed) - Number(!!a.installed))
    return found
  }, [all, search, category, pricing, sort])

  const narrowed = search.trim() !== '' || category !== '' || pricing !== 'all'
  const featured = !narrowed && sort === 'popular' ? all.filter((i) => i.featured) : []
  const clear = () => { setSearch(''); setCategory(''); setPricing('all') }

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
        title: item.installed ? t('Update {name}?', { name: item.title }) : t('Install {name}?', { name: item.title }),
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
      const first = await run<{ name: string; fingerprint: string; id: string }>('package-stores/create', { url })
      const answer = await prompt({ title: t('Confirm {name}', { name: first.name }), description: t('Compare this key fingerprint with the one in the store’s own documentation, then type it here: {fingerprint}', { fingerprint: first.fingerprint }), fields: [{ handle: 'fingerprint', type: 'text', label: t('Key fingerprint'), required: true }], confirm: t('Add Store') })
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
    : data.freshness === 'expired' ? t('This catalog is out of date, so installs are off. Refresh it.')
    : data.freshness === 'stale' ? t('This catalog is a few days old.')
    : data.error ? t('Can’t reach the store. {error}', { error: data.error })
    : null

  const card = (item: Item) => <Card key={item.package} item={item} icon={icons[item.package]} busy={busy === item.package} locked={busy !== null} onOpen={() => setOpen(item)} onInstall={() => void install(item)} />

  return (
    <div>
      <input ref={file} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />

      {/* Find first: search and order, then what to narrow it to. */}
      <div className="mb-3 flex min-h-10 flex-wrap items-center gap-2">
        <Input size="sm" className="w-full sm:w-72" icon="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('Search {items}', { items: t('Plugins') })} aria-label={t('Search')} />
        <div className="w-40"><Select size="sm" value={sort} onChange={(v) => setSort((v ?? 'popular') as Sort)} aria-label={t('Sort')} options={[{ value: 'popular', label: t('Most Popular') }, { value: 'name', label: t('Name') }, { value: 'installed', label: t('Installed First') }]} /></div>
        {sellsSomething && <div className="w-28"><Select size="sm" value={pricing} onChange={(v) => setPricing(v ?? 'all')} aria-label={t('Price')} options={[{ value: 'all', label: t('Any Price') }, { value: 'free', label: t('Free') }, { value: 'paid', label: t('Paid') }]} /></div>}
        <div className="ml-auto flex items-center gap-1">
          {(stores.data?.items.length ?? 0) > 1 && <div className="w-40"><Select size="sm" value={store} onChange={(v) => setStore(v ?? 'default')} options={stores.data!.items.map((s) => ({ value: s.id, label: s.name }))} aria-label={t('Store')} /></div>}
          <Button variant="ghost" icon="upload" disabled={busy !== null} onClick={() => file.current?.click()}>{t('Upload Zip')}</Button>
          <Menu
            trigger={<IconButton icon="more" label={t('More')} />}
            items={[
              { label: t('Refresh'), icon: 'refresh', disabled: busy !== null, onSelect: () => void refresh() },
              { label: t('Turn On After Install'), checked: turnOn, onSelect: () => setTurnOn((on) => !on) },
              { separator: true, label: '' },
              { label: t('Add Store'), icon: 'plus', onSelect: () => void addStore() },
              current && !current.default && { label: t('Remove {name}', { name: current.name }), icon: 'trash', danger: true, onSelect: () => void removeStore() },
            ]}
          />
        </div>
      </div>

      {categories.length > 1 && (
        <div role="radiogroup" aria-label={t('Category')} className="mb-5 flex flex-wrap gap-1.5">
          <Chip active={category === ''} onClick={() => setCategory('')} label={t('All')} count={all.length} />
          {categories.map(([name, count]) => <Chip key={name} active={category === name} onClick={() => setCategory(category === name ? '' : name)} label={name} count={count} />)}
        </div>
      )}

      {step && <p role="status" className="mb-4 text-sm text-muted">{step}</p>}
      {notice && <p className="mb-4 flex items-center gap-2 border-y border-border py-3 text-sm text-text"><Icon name="info" size={16} className="shrink-0 text-muted" />{notice}</p>}

      {catalog.isLoading ? (
        <Grid>{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-44" />)}</Grid>
      ) : items.length === 0 ? (
        narrowed
          ? <NoMatches onClear={clear} />
          : <EmptyState icon="download" title={t('Nothing in this store yet')} action={<Button onClick={() => file.current?.click()}>{t('Upload a Zip')}</Button>} />
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mb-8">
              <SectionHeading title={t('Featured')} />
              <Grid>{featured.map(card)}</Grid>
            </section>
          )}
          <section>
            <SectionHeading title={narrowed ? plural(items.length, '{count} result', '{count} results') : t('All Plugins')} count={narrowed ? undefined : items.length} />
            <Grid>{items.map(card)}</Grid>
          </section>
        </>
      )}

      {open && <StoreDetail item={all.find((i) => i.package === open.package) ?? open} icon={icons[open.package]} onClose={() => setOpen(null)} busy={busy === open.package} locked={busy !== null} onInstall={() => void install(open)} />}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,17rem),1fr))] gap-3">{children}</div>
}

function SectionHeading({ title, count }: { title: string; count?: number }) {
  return <h2 className="m-0 mb-3 flex items-baseline gap-2 text-sm font-medium text-ink">{title}{count !== undefined && <span className="text-xs font-normal text-muted">{count}</span>}</h2>
}

function Chip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick} className={cn('inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs transition-colors', active ? 'border-ink bg-ink text-ink-contrast' : 'border-border bg-transparent text-text hover:bg-hover')}>
      {label}<span className={active ? 'opacity-70' : 'text-muted'}>{count}</span>
    </button>
  )
}

function Card({ item, icon, busy, locked, onOpen, onInstall }: { item: Item; icon?: string; busy: boolean; locked: boolean; onOpen: () => void; onInstall: () => void }) {
  return (
    <article className="group relative flex h-full min-w-0 flex-col rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <ItemIcon item={item} icon={icon} />
        <Badge>{priceLabel(item)}</Badge>
      </div>
      {/* The whole card opens the plugin; the action keeps its own click. */}
      <h3 className="m-0 mt-3 truncate text-sm font-medium text-ink">
        <button type="button" onClick={onOpen} className="cursor-pointer border-0 bg-transparent p-0 text-left text-inherit after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none group-has-[:focus-visible]:after:outline-2 group-has-[:focus-visible]:after:outline-focus">{item.title}</button>
      </h3>
      <p className="m-0 truncate text-xs text-muted">{t('By {name}', { name: item.author.name || item.package })}</p>
      <p className="m-0 mt-2 line-clamp-2 min-h-10 flex-1 text-xs leading-5 text-text">{item.summary}</p>
      <div className="relative mt-3 flex min-h-7 items-center justify-between gap-2 border-t border-border pt-3">
        <span className="truncate text-xs text-muted">{[item.categories[0], item.latest].filter(Boolean).join(' · ')}</span>
        <Action item={item} busy={busy} locked={locked} onInstall={onInstall} />
      </div>
    </article>
  )
}
