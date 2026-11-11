import { can, invalidate, navigate, run, t, useAbility, useManifest, type FieldDef, type SurfaceComponentProps } from '@letterncms/sdk'
import { Badge, Button, EmptyState, Fields, Icon, IconButton, List, Menu as Actions, NoMatches, NotFoundState, Popover, QueryError, Row as ListRow, SaveBar, Skeleton, SortableTree, Spinner, cn, confirm, toast } from '@letterncms/ui'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

interface Target {
  title: string | null
  uri: string | null
  status: string
  collection: string | null
}

interface Item {
  id: string
  entry?: string
  url?: string
  label?: string
  newTab?: boolean
  locales?: Record<string, { label?: string; url?: string }>
  target?: Target
  children: Item[]
  [key: string]: unknown
}

interface Menu {
  handle: string
  title: string
  maxDepth: number
  items: Item[]
}

interface Found {
  id: string
  title: string
  uri: string | null
  collection: string
  displayStatus: string
}

const search = (): FieldDef => ({ handle: 'query', type: 'text', label: t('Search Content'), autofocus: true, placeholder: t('Search Pages and Posts') })

/** What is saved of a menu: its items without what is looked up for showing them, and nothing empty. */
const clean = (list: Item[]): Record<string, unknown>[] =>
  list.map(({ target: _t, ...i }) => ({ ...i, label: i.label?.trim() || undefined, url: i.url?.trim() || undefined, newTab: i.newTab || undefined, locales: words(i.locales), children: clean(i.children) }))
const words = (locales: Item['locales']) => {
  const filled = Object.entries(locales ?? {}).flatMap(([code, row]) => {
    const kept = Object.fromEntries(Object.entries(row ?? {}).filter(([, value]) => typeof value === 'string' && value.trim() !== ''))
    return Object.keys(kept).length ? [[code, kept]] : []
  })
  return filled.length ? Object.fromEntries(filled) : undefined
}
const snapshot = (items: Item[]) => JSON.stringify(clean(items))

const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('')

/**
 * The links of one menu, as a tree to drag: the place around it (its name and Menu Settings)
 * is the view `menu` (NavigationModule::places). Saved from the save bar; deleting the menu is at the foot.
 */
export default function MenuEditor({ props }: SurfaceComponentProps<{ handle: string }>) {
  const menu = useAbility<Menu>('navigation/get', { handle: props.handle }, { refetchOnWindowFocus: false })

  if (menu.isLoading) return <div className="space-y-1.5" aria-hidden>{[0, 1, 2].map((i) => <Skeleton key={i} className="h-11 rounded-lg" />)}</div>
  if (menu.isError && !menu.data) return <QueryError message={t('Couldn’t load this menu.')} onRetry={() => void menu.refetch()} retrying={menu.isFetching} />
  if (!menu.data) return <NotFoundState icon="list-tree" action={<Button onClick={() => navigate('/navigation')}>{t('Back to Navigation')}</Button>} />

  return <Editor key={menu.data.handle} menu={menu.data} />
}

function Editor({ menu }: { menu: Menu }) {
  const [items, setItems] = useState<Item[]>(menu.items)
  // How deep links may nest is the menu's own (Menu Settings): it follows the menu as it is stored.
  const maxDepth = menu.maxDepth
  const [focus, setFocus] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(() => snapshot(menu.items))
  // What Discard puts back: the menu as last saved.
  const [base, setBase] = useState<Item[]>(menu.items)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const manage = can('navigation.manage')
  // Changed only while it differs from what was saved: putting something back is no change.
  const dirty = useMemo(() => snapshot(items) !== saved, [items, saved])

  const change = (next: Item[]) => setItems(next)

  const patch = (id: string, values: Partial<Item>) => {
    const walk = (list: Item[]): Item[] => list.map((i) => (i.id === id ? { ...i, ...values } : { ...i, children: walk(i.children) }))
    change(walk(items))
  }

  // Removing acts at once, so it can be taken back at once: the link goes back where it was, under the same link and in
  // the same place, into the menu as it is by then. What was changed in between stays.
  const remove = (id: string, name: string) => {
    let taken: { item: Item; parent: string | null; index: number } | null = null
    const walk = (list: Item[], parent: string | null): Item[] => list.flatMap((i, index) => {
      if (i.id === id) { taken = { item: i, parent, index }; return [] }
      return [{ ...i, children: walk(i.children, i.id) }]
    })
    change(walk(items, null))
    const gone = taken as { item: Item; parent: string | null; index: number } | null
    if (!gone) return
    const put = (list: Item[], parent: string | null): { list: Item[]; done: boolean } => {
      if (parent === gone.parent) return { list: [...list.slice(0, gone.index), gone.item, ...list.slice(gone.index)], done: true }
      let done = false
      const next = list.map((i) => { if (done) return i; const inner = put(i.children, i.id); done = inner.done; return inner.done ? { ...i, children: inner.list } : i })
      return { list: next, done }
    }
    // Its parent may be gone by then too: it goes to the end of the menu.
    const undo = () => setItems((now) => { const back = put(now, null); return back.done ? back.list : [...now, gone.item] })
    toast(t('Removed “{name}”', { name }), { action: { label: t('Undo'), onClick: undo } })
  }

  const toggle = (id: string) => setOpen((s) => {
    const next = new Set(s)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const addEntry = (e: Found) => change([...items, { id: newId(), entry: e.id, target: { title: e.title, uri: e.uri, status: e.displayStatus, collection: e.collection }, children: [] }])

  const addLink = () => {
    const id = newId()
    change([...items, { id, url: '', label: '', children: [] }])
    setOpen((s) => new Set(s).add(id))
    // The cursor goes to the new link's label.
    setFocus(id)
  }

  const discard = () => {
    setItems(base)
    setFailed(null)
  }

  const save = async () => {
    setBusy(true)
    setFailed(null)
    try {
      const stored = await run<Menu>('navigation/update', { handle: menu.handle, items: clean(items) })
      setItems(stored.items)
      setSaved(snapshot(stored.items))
      setBase(stored.items)
      invalidate('navigation/')
    } catch (e) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  const removeMenu = async () => {
    if (!(await confirm({ title: t('Delete “{title}”?', { title: menu.title }), description: t('Repeat blocks that list this menu will show nothing.'), confirm: t('Delete'), danger: true }))) return
    setDeleting(true)
    try {
      await run('navigation/delete', { handle: menu.handle })
      invalidate('navigation/', 'views/')
      navigate('/navigation')
    } catch (e) {
      toast.error(e)
      setDeleting(false)
    }
  }

  return (
    <>
      {items.length === 0 ? (
        <EmptyState compact icon="list-tree" title={t('No links yet')} />
      ) : (
        <SortableTree<Item>
          // A level in is a clear step: a nested link starts where its parent's name does.
          indent={32}
          className="space-y-1.5!"
          items={items}
          maxDepth={maxDepth - 1}
          onChange={change}
          renderItem={(item, ctx) => (
            <Row
              item={item}
              ctx={ctx}
              expanded={open.has(item.id)}
              disabled={!manage}
              onToggle={() => toggle(item.id)}
              onPatch={(v) => patch(item.id, v)}
              onRemove={() => remove(item.id, item.label?.trim() || item.target?.title || item.url || t('Link'))}
              autoFocus={focus === item.id}
            />
          )}
        />
      )}

      {manage && (
        <div className={cn('flex flex-wrap items-center gap-2', items.length === 0 ? 'justify-center' : 'mt-3')}>
          <AddPage onPick={addEntry} />
          <Button icon="link" onClick={addLink}>{t('Add Link')}</Button>
        </div>
      )}
      {/* Deleting is there to see, at the end of the page, never next to Save. */}
      {manage && (
        <div className="mt-10 border-t border-border pt-6">
          <Button variant="destructive" icon="trash" className="-ml-2" disabled={busy} loading={deleting} onClick={() => void removeMenu()}>{t('Delete Menu')}</Button>
        </div>
      )}
      {manage && <SaveBar dirty={dirty} saving={busy} error={failed} onSave={() => void save()} onDiscard={discard} />}
    </>
  )
}

type RowCtx = { depth: number; handle: ReactNode; indent: () => void; outdent: () => void; canIndent: boolean; canOutdent: boolean }

/** One link: the same row a field has in a blueprint (drag, name, what it is, a menu, a chevron that opens its options). */
function Row({ item, ctx, expanded, disabled, onToggle, onPatch, onRemove, autoFocus }: { item: Item; ctx: RowCtx; expanded: boolean; disabled: boolean; onToggle: () => void; onPatch: (v: Partial<Item>) => void; onRemove: () => void; autoFocus?: boolean }) {
  const link = !item.entry
  const status = item.target?.status
  // Not on the site for now: said in the row. On a phone a row is its name and what is wrong with it: where it goes is a tap away.
  const hidden = !!status && status !== 'published' && status !== 'changed'
  const where = link ? item.url || t('No URL yet') : item.target?.uri ?? t('No URL')
  const site = useManifest().site
  const languages = site.locales.filter((code: string) => code !== site.defaultLocale)
  // Something to open the row for: where a link goes, or what the item says in the site's other languages.
  const more = link || languages.length > 0
  const language = (code: string) => new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code

  return (
    <div className={cn('rounded-lg border bg-bg transition-shadow', expanded ? 'border-border-strong shadow-pop' : 'border-border')}>
      <div className="flex h-11 items-center gap-2 px-2">
        {!disabled && ctx.handle}
        <Icon name={link ? 'link' : 'page'} size={14} className="shrink-0 text-muted" />
        <Fields
          bare
          // The name keeps its room; where the link goes gives way first.
          className="min-w-[60%] flex-1 max-sm:min-w-0"
          disabled={disabled}
          fields={[{ handle: 'label', type: 'text', component: 'navigation-label', label: t('Label'), autofocus: autoFocus, placeholder: link ? t('Label') : item.target?.title ?? t('Missing entry'), display: link ? undefined : 'fallback' }]}
          values={{ label: item.label ?? '' }}
          onChange={(_, v) => onPatch({ label: v })}
        />
        <span className={cn('min-w-0 shrink truncate text-xs', (hidden || !link || item.url) && 'max-sm:hidden', link && !item.url ? 'text-warning' : 'text-faint')}>{where}</span>
        {hidden && <Badge tone={status === 'missing' ? 'danger' : 'neutral'}>{status === 'missing' ? t('Missing') : t('Hidden until live')}</Badge>}
        {!disabled && (
          <>
            {/* What moves or removes the link is one menu, so two buttons a row stand 44px apart on a phone. */}
            <Actions trigger={<IconButton icon="more" label={t('Actions for {name}', { name: item.label?.trim() || item.target?.title || t('Link') })} size="xs" />} items={[
              { label: t('Move Out a Level'), icon: 'arrow-left', disabled: !ctx.canOutdent, onSelect: ctx.outdent },
              { label: t('Nest Under the Item Above'), icon: 'arrow-right', disabled: !ctx.canIndent, onSelect: ctx.indent },
              ...(!link && item.target?.collection ? [{ label: t('Edit Page'), icon: 'edit', onSelect: () => navigate(`/content/${item.target!.collection}/${item.entry}`) }] : []),
              // A link to a page has this one option: it is here, not behind a second button at the end of the row.
              ...(more ? [] : [{ label: t('Open in a New Tab'), icon: 'external', checked: !!item.newTab, onSelect: () => onPatch({ newTab: item.newTab ? undefined : true }) }]),
              { separator: true, label: '' },
              { label: t('Remove'), icon: 'trash', danger: true, onSelect: onRemove },
            ]} />
            {more && <IconButton icon={expanded ? 'chevron-up' : 'chevron-down'} label={expanded ? t('Collapse') : t('Link Options')} size="xs" className="max-sm:ml-3" onClick={onToggle} />}
          </>
        )}
      </div>
      {expanded && more && (
        <Fields
          className="gap-y-2.5! border-t border-border p-4"
          disabled={disabled}
          fields={[
            ...(link ? [{ handle: 'url', type: 'url', component: 'link', label: t('Link'), placeholder: t('Choose a page or paste a link') }] : []),
            { handle: 'newTab', type: 'toggle', label: t('Open in a New Tab'), display: 'checkbox' },
            // What this item says, and for a link where it goes, in the site's other languages.
            ...languages.flatMap((code: string): FieldDef[] => [
              { handle: `label:${code}`, type: 'text', label: t('Label in {language}', { language: language(code) }), placeholder: item.label || item.target?.title || undefined, width: link ? 'half' : undefined },
              ...(link ? [{ handle: `url:${code}`, type: 'url', component: 'link', label: t('Link in {language}', { language: language(code) }), placeholder: item.url || undefined, width: 'half' } as FieldDef] : []),
            ]),
          ]}
          values={{ url: item.url ?? '', newTab: !!item.newTab, ...Object.fromEntries(languages.flatMap((code: string) => [[`label:${code}`, item.locales?.[code]?.label ?? ''], [`url:${code}`, item.locales?.[code]?.url ?? '']])) }}
          onChange={(h, v) => {
            const [key, code] = h.split(':')
            if (!code) return onPatch(h === 'newTab' ? { newTab: v || undefined } : { url: v })
            onPatch({ locales: { ...item.locales, [code]: { ...item.locales?.[code], [key]: v } } })
          }}
        />
      )}
    </div>
  )
}

function AddPage({ onPick }: { onPick: (e: Found) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setDebounced(query.trim()), 180)
  }, [query])

  const results = useAbility<Found[]>(debounced ? 'content/search' : 'content/recent', debounced ? { query: debounced } : {}, { enabled: open })
  const routable = (results.data ?? []).filter((e) => e.uri !== null)

  return (
    <Popover
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setQuery('') }}
      className="w-[360px] max-w-[calc(100vw-16px)] p-0"
      trigger={<Button icon="page">{t('Add Page')}</Button>}
    >
      <div className="border-b border-border p-2">
        <Fields bare fields={[search()]} values={{ query }} onChange={(_, v) => setQuery(v)} />
      </div>
      <div className="max-h-72 overflow-y-auto p-1">
        {results.isFetching && !results.data ? (
          <div className="grid place-items-center py-6 text-faint"><Spinner size={14} /></div>
        ) : results.isError ? (
          <QueryError compact message={t('Couldn’t load the pages.')} onRetry={() => void results.refetch()} retrying={results.isFetching} />
        ) : routable.length === 0 ? (
          debounced ? <NoMatches className="py-6" onClear={() => setQuery('')} /> : <EmptyState compact icon="page" title={t('No pages yet')} />
        ) : (
          <>
            {!debounced && <div className="cms-label px-2 pb-1 pt-1.5">{t('Recently Edited')}</div>}
            <List className="border-y-0! divide-y-0!">
              {routable.map((e) => (
                // The popover stays open: a menu is mostly made of several pages, picked one after the other.
                <ListRow key={e.id} className="rounded-sm px-2" onClick={() => onPick(e)}>
                  <Icon name="page" size={14} className="shrink-0 text-muted" />
                  <span className="min-w-[55%] flex-1 truncate">{e.title}</span>
                  <span className="min-w-0 shrink truncate text-xs text-faint">{e.uri}</span>
                </ListRow>
              ))}
            </List>
          </>
        )}
      </div>
    </Popover>
  )
}
