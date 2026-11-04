import { fieldControlId } from '../ui/fieldIdentity'
import { can, t, useAbility, useManifest, type EntrySummary, type FieldProps } from '@letterncms/sdk'
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Icon, Popover, Spinner, Switch, cn } from '../ui'

/**
 * `link` — where a link goes, picked rather than typed: a page (searched across
 * collections), a section of this page, a web address, an email, a phone number
 * or a file from the media library. The trigger shows the destination as a chip
 * (page title, domain, address) instead of a raw URL.
 *
 * Use it as `{ type: 'url', component: 'link' }`. Options:
 *   reference  store pages as `entry:<id>` so the link follows the page when it moves
 *              (the renderer must resolve it — blocks do); otherwise the page's path
 *   anchors    sections of the current page: [{ id, label }]
 *   newTab / onNewTab   show "Open in New Tab" in the picker and report changes
 *   autofocus / onClose  open the picker at once (a toolbar's link button) and hear when it closes
 *   collections   limit page search to these collections
 */
export function LinkField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  // `autofocus` (a link being added from a toolbar) opens the picker right away.
  const [open, setOpen] = useState(!!field.autofocus && !disabled)
  const link = parse(value ?? '')
  const xs = field.size === 'xs'
  const onNewTab = field.onNewTab as ((on: boolean) => void) | undefined
  const newTab = !!field.newTab

  return (
    <div className="group/link relative min-w-0 flex-1">
      <Popover
        open={open}
        onOpenChange={(o) => {
          if (disabled) return
          setOpen(o)
          if (!o) (field.onClose as (() => void) | undefined)?.()
        }}
        align="start"
        className="w-[320px] !p-0"
        trigger={
          <button
            type="button"
            id={fieldControlId(field)}
            disabled={disabled}
            aria-label={field.label || t('Link')}
            className={cn(
              'cms-input flex w-full min-w-0 items-center text-left',
              xs ? 'h-6 gap-1.5 rounded-xs pl-1.5 pr-1.5 text-xs' : 'h-8 gap-2 rounded-md pl-2.5 pr-2.5 text-sm',
              link.kind !== 'none' && (xs ? 'pr-6' : 'pr-8'),
            )}
          >
            <Chip link={link} xs={xs} anchors={anchorsOf(field)} placeholder={(field.placeholder as string) || t('Add Link')} />
            {newTab && link.kind !== 'none' && <Icon name="external" size={xs ? 10 : 12} className="shrink-0 text-faint" aria-label={t('Opens in New Tab')} />}
          </button>
        }
      >
        <Picker field={field} value={value ?? ''} onPick={(v) => { onChange(v); setOpen(false) }} newTab={newTab} onNewTab={onNewTab} onClear={value ? () => { onChange(null); setOpen(false) } : undefined} />
      </Popover>
      {link.kind !== 'none' && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t('Remove Link')}
          className={cn('absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-xs text-faint opacity-0 transition-opacity hover:bg-hover hover:text-text focus-visible:opacity-100 group-hover/link:opacity-100', xs ? 'right-0.5 size-5' : 'right-1 size-6')}
        >
          <Icon name="close" size={xs ? 10 : 12} />
        </button>
      )}
    </div>
  )
}

type Link =
  | { kind: 'none' }
  | { kind: 'entry'; id: string; hash: string }
  | { kind: 'path'; path: string }
  | { kind: 'file'; path: string; name: string }
  | { kind: 'anchor'; id: string }
  | { kind: 'url'; url: string; host: string; rest: string }
  | { kind: 'email'; address: string }
  | { kind: 'phone'; number: string }
  | { kind: 'other'; text: string }

function parse(value: string): Link {
  const v = value.trim()
  if (!v) return { kind: 'none' }
  const entry = v.match(/^entry:([a-z0-9]+)(#[\w-]+)?$/i)
  if (entry) return { kind: 'entry', id: entry[1].toLowerCase(), hash: entry[2] ?? '' }
  if (v.startsWith('#')) return { kind: 'anchor', id: v.slice(1) }
  if (/^mailto:/i.test(v)) return { kind: 'email', address: v.slice(7).split('?')[0] }
  if (/^tel:/i.test(v)) return { kind: 'phone', number: v.slice(4) }
  if (v.startsWith('/')) {
    const name = v.split(/[?#]/)[0].split('/').pop() ?? ''
    return /\.[a-z0-9]{2,5}$/i.test(name) ? { kind: 'file', path: v, name: decodeURIComponent(name) } : { kind: 'path', path: v }
  }
  try {
    const url = new URL(v)
    if (url.protocol === 'http:' || url.protocol === 'https:') return { kind: 'url', url: v, host: url.hostname.replace(/^www\./, ''), rest: `${url.pathname === '/' ? '' : url.pathname}${url.search}${url.hash}` }
  } catch {
    /* not an absolute URL */
  }
  return { kind: 'other', text: v }
}

/** What someone typed, read as a link (or null when it is a search). */
function typed(query: string): { value: string; kind: Link['kind']; label: string; invalid?: string } | null {
  const q = query.trim()
  if (!q) return null
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(q)) {
    const link = parse(q)
    if (link.kind === 'url' && !/\.[a-z]{2,}$/i.test(link.host) && link.host !== 'localhost') return { value: q, kind: 'url', label: q, invalid: t('Enter a full address, like https://example.com') }
    if (link.kind === 'other') return { value: q, kind: 'url', label: q, invalid: t('Enter a full address, like https://example.com') }
    if (link.kind === 'anchor' && !/^#[\w-]+$/.test(q)) return { value: q, kind: 'anchor', label: q, invalid: t('Anchors use letters, digits and dashes') }
    return { value: q, kind: link.kind, label: q }
  }
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(q)) return { value: `mailto:${q}`, kind: 'email', label: q }
  if (/^\+?[\d\s().-]{6,}$/.test(q) && (q.match(/\d/g)?.length ?? 0) >= 6) return { value: `tel:${q.replace(/[\s().-]/g, '')}`, kind: 'phone', label: q }
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}(\/\S*)?$/i.test(q)) return { value: `https://${q}`, kind: 'url', label: `https://${q}` }
  return null
}

const KIND_ICON: Record<string, string> = { entry: 'page', path: 'page', file: 'file', anchor: 'hash', url: 'globe', email: 'mail', phone: 'phone', other: 'link', none: 'link' }

function anchorsOf(field: FieldProps['field']): { id: string; label: string }[] {
  return Array.isArray(field.anchors) ? (field.anchors as { id: string; label: string }[]) : []
}

/** The current destination, as people think of it. */
function Chip({ link, xs, anchors, placeholder }: { link: Link; xs: boolean; anchors: { id: string; label: string }[]; placeholder: string }) {
  const manifest = useManifest()
  const entry = useAbility<EntrySummary[]>('entries/lookup', { ids: link.kind === 'entry' ? [link.id] : [] }, { enabled: link.kind === 'entry', staleTime: 60_000 })
  const icon = (name: string, className?: string) => <Icon name={name} size={xs ? 12 : 14} className={cn('shrink-0 text-muted', className)} />
  const parts = (main: ReactNode, sub?: ReactNode) => (
    <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
      <span className="truncate">{main}</span>
      {sub && <span className="min-w-0 shrink truncate text-faint">{sub}</span>}
    </span>
  )

  switch (link.kind) {
    case 'none':
      return (
        <>
          {icon('link', 'text-faint')}
          <span className="flex-1 truncate text-faint">{placeholder}</span>
        </>
      )
    case 'entry': {
      const e = entry.data?.[0]
      const collection = manifest.collections.find((c) => c.handle === e?.collection)
      if (entry.isLoading) return <>{icon('page')}{parts(<span className="text-faint">{t('Loading…')}</span>)}</>
      if (!e) return <>{icon('warning', 'text-warning')}{parts(<span className="text-warning">{t('Missing page')}</span>)}</>
      return <>{icon(collection?.icon ?? 'page')}{parts(e.title || t('Untitled'), `${e.uri ?? ''}${link.hash}`)}</>
    }
    case 'anchor':
      return <>{icon('hash')}{parts(anchors.find((a) => a.id === link.id)?.label ?? link.id, anchors.some((a) => a.id === link.id) ? `#${link.id}` : undefined)}</>
    case 'url':
      return <>{icon('globe')}{parts(link.host, link.rest || undefined)}</>
    case 'email':
      return <>{icon('mail')}{parts(link.address)}</>
    case 'phone':
      return <>{icon('phone')}{parts(link.number)}</>
    case 'file':
      return <>{icon('file')}{parts(link.name)}</>
    case 'path':
      return <>{icon('page')}{parts(<span className="font-mono">{link.path}</span>)}</>
    default:
      return <>{icon('warning', 'text-warning')}{parts(<span className="font-mono">{link.text}</span>)}</>
  }
}

interface Option {
  key: string
  group: string
  icon: string
  label: string
  detail?: string
  value: string
  invalid?: string
  active?: boolean
}

function Picker({ field, value, onPick, newTab, onNewTab, onClear }: { field: FieldProps['field']; value: string; onPick: (value: string) => void; newTab: boolean; onNewTab?: (on: boolean) => void; onClear?: () => void }) {
  const manifest = useManifest()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [index, setIndex] = useState(0)
  const list = useRef<HTMLDivElement>(null)
  const reference = !!field.reference
  const collections = (field.collections as string[] | undefined) ?? undefined
  const media = can('media.view') && field.files !== false
  const current = parse(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 160)
    return () => window.clearTimeout(timer)
  }, [query])
  useEffect(() => setIndex(0), [debounced])

  const searching = debounced.length > 0 && !typed(debounced)
  const recent = useAbility<EntrySummary[]>('content/recent', { limit: 20 }, { enabled: !debounced, staleTime: 15_000 })
  const found = useAbility<EntrySummary[]>('content/search', { query: debounced || ' ', collections, limit: 12 }, { enabled: searching })
  const files = useAbility<{ items: { id: string; url: string; name: string; filename: string; kind: string }[] }>('media/list', { search: debounced, perPage: 5 }, { enabled: media && searching })

  const routable = new Set(manifest.collections.filter((c) => c.routable).map((c) => c.handle))
  const iconOf = (handle: string) => manifest.collections.find((c) => c.handle === handle)?.icon ?? 'page'
  const pages = ((debounced ? found.data : recent.data) ?? []).filter((e) => e.uri !== null && routable.has(e.collection) && (!collections || collections.includes(e.collection))).slice(0, 8)
  const q = debounced.toLowerCase()
  const anchors = anchorsOf(field).filter((a) => !q || a.label.toLowerCase().includes(q) || a.id.includes(q)).slice(0, 6)
  const direct = typed(query)

  const options: Option[] = []
  {
    const out = options
    if (direct) {
      const label = { url: t('Web Address'), email: t('Email'), phone: t('Phone'), anchor: t('Section'), path: t('Path'), file: t('File') }[direct.kind as string] ?? t('Link')
      out.push({ key: 'typed', group: '', icon: KIND_ICON[direct.kind] ?? 'link', label: direct.label, detail: direct.invalid ?? label, value: direct.value, invalid: direct.invalid })
    }
    for (const e of pages) {
      const target = reference ? `entry:${e.id}` : e.uri ?? ''
      out.push({ key: `e-${e.id}`, group: debounced ? t('Pages') : t('Recent Pages'), icon: iconOf(e.collection), label: e.title || t('Untitled'), detail: e.uri ?? '', value: target, active: (current.kind === 'entry' && current.id === e.id) || value === e.uri })
    }
    for (const a of anchors) out.push({ key: `a-${a.id}`, group: t('On This Page'), icon: 'hash', label: a.label, detail: `#${a.id}`, value: `#${a.id}`, active: value === `#${a.id}` })
    if (searching) for (const f of files.data?.items ?? []) out.push({ key: `f-${f.id}`, group: t('Files'), icon: f.kind === 'image' ? 'image' : 'file', label: f.name || f.filename, detail: f.filename, value: f.url, active: value === f.url })
  }

  const choose = (o: Option | undefined) => o && !o.invalid && onPick(o.value)
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(0, Math.min(options.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)))
      setIndex(next)
      list.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(options[index])
    }
  }
  const loading = (debounced ? searching && found.isFetching && !found.data : recent.isLoading)

  let group = ''
  return (
    <div className="flex max-h-[min(440px,var(--available-height))] flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-3">
        <Icon name="search" size={14} className="shrink-0 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('Search Pages or Paste a Link')}
          aria-label={t('Search Pages or Paste a Link')}
          spellCheck={false}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
        />
        {loading && <Spinner size={12} />}
      </div>
      <div ref={list} role="listbox" aria-label={t('Destinations')} className="min-h-0 flex-1 overflow-y-auto p-1">
        {options.map((o, i) => {
          const heading = o.group && o.group !== group ? (group = o.group) : null
          return (
            <div key={o.key}>
              {heading && <div className="cms-label px-2 pb-1 pt-2">{heading}</div>}
              <button
                type="button"
                role="option"
                data-index={i}
                aria-selected={i === index}
                aria-disabled={!!o.invalid || undefined}
                onMouseEnter={() => setIndex(i)}
                onClick={() => choose(o)}
                className={cn('cms-menu-item h-8 w-full', i === index && 'bg-hover', o.invalid && 'cursor-not-allowed')}
              >
                <Icon name={o.icon} size={14} className={cn('shrink-0', o.invalid ? 'text-warning' : 'text-muted')} />
                <span className={cn('min-w-0 flex-1 truncate', o.invalid && 'text-muted')}>{o.label}</span>
                {o.detail && <span className={cn('max-w-[45%] shrink-0 truncate text-xs', o.invalid ? 'text-warning' : 'text-faint')}>{o.detail}</span>}
                {o.active && <Icon name="check" size={12} className="shrink-0 text-text" />}
              </button>
            </div>
          )
        })}
        {!loading && options.length === 0 && (
          <p className="m-0 px-3 py-6 text-center text-sm text-faint">{debounced ? t('No pages found') : t('Search pages, or paste a web address, email or phone number')}</p>
        )}
      </div>
      {(onNewTab || onClear) && (
        <div className="flex h-10 shrink-0 items-center gap-2 border-t border-border px-3">
          {onNewTab && <Switch size="sm" checked={newTab} onChange={onNewTab} label={<span className="text-xs text-text">{t('Open in New Tab')}</span>} />}
          <span className="flex-1" />
          {onClear && (
            <button type="button" onClick={onClear} className="flex h-6 items-center gap-1 rounded-xs px-1.5 text-xs text-muted hover:bg-hover hover:text-danger">
              <Icon name="unlink" size={12} /> {t('Remove Link')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
