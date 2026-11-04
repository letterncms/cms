import { locale, navigate, plural, setQuery, t, timeAgo, useAbility, useLocation, type RecordTimestamps } from '@letterncms/sdk'
import { useState } from 'react'
import { Badge, Button, DataView, Dialog, EmptyState, Icon, NoMatches, Page, ScreenTabs, Select, useScreenTabs } from '@letterncms/ui'

interface Row extends RecordTimestamps {
  id: string
  ability: string
  /** The ability's label in the user's language. */
  label: string
  /** What was changed, in words, and where it opens. */
  subject: string | null
  to: string | null
  transport: string
  user: { id: string; name: string } | null
  input: Record<string, unknown> | null
  createdAt: string
}

interface Log {
  items: Row[]
  total: number
  page: number
  pages: number
  filters: { people: { id: string; name: string }[]; actions: { value: string; label: string }[] }
}

/** Where a change came from: someone in the admin, an agent, the API or the command line. */
function channel(transport: string): string {
  const names: Record<string, string> = { mcp: t('Agent'), assistant: t('Assistant'), rest: t('API'), cli: t('CLI'), install: t('Install') }
  return names[transport] ?? t('Admin')
}

const longDate = (iso: string) => new Date(iso).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })

export default function Audit() {
  const { query } = useLocation()
  const page = Number(query.page ?? 1)
  const userId = query.person || undefined
  const ability = query.action || undefined
  const log = useAbility<Log>('audit/list', { page, perPage: 50, userId, ability }, { placeholderData: (p) => p })
  const [open, setOpen] = useState<Row | null>(null)
  const items = log.data?.items ?? []
  const filters = log.data?.filters
  const filtered = !!(userId || ability)
  const [tab, setTab] = useScreenTabs(['log'])

  return (
    <Page width="wide" crumbs={[{ label: t('Audit Log'), icon: 'activity' }]}>
      <ScreenTabs value={tab} onChange={setTab} tabs={[{ value: 'log', label: t('Log') }]}>
      <DataView id="audit" label={t('Audit Log')} items={items} source={{ ability: 'audit/list', input: { userId, ability }, perPage: 100 }} rowKey={(r) => r.id} onRowClick={setOpen}
        // When is its own column, newest first: no Updated column or sort to offer besides.
        dates={() => ({ publishedAt: null, updatedAt: null })}
        pagination={log.data && { page: log.data.page, pages: log.data.pages, onPage: (next) => setQuery({ page: next > 1 ? next : null }) }}
        loading={log.isLoading} stale={log.isPlaceholderData} error={log.isError} onRetry={() => void log.refetch()}
        toolbar={
          <span className="flex flex-wrap items-center gap-2">
            <span className="w-44 max-w-full"><Select size="sm" aria-label={t('Person')} value={userId ?? ''} onChange={(v) => setQuery({ person: v || null, page: null })}
              options={[{ value: '', label: t('Everyone') }, ...(filters?.people ?? []).map((p) => ({ value: p.id, label: p.name }))]} /></span>
            <span className="w-52 max-w-full"><Select size="sm" aria-label={t('Action')} value={ability ?? ''} onChange={(v) => setQuery({ action: v || null, page: null })}
              options={[{ value: '', label: t('All Actions') }, ...(filters?.actions ?? [])]} /></span>
          </span>
        }
        columns={[
          { id: 'change', label: t('Change'), render: (r) => <span className="flex min-w-0 items-baseline gap-2"><span className="truncate">{r.label}</span>{r.subject && <span className="truncate font-normal text-muted">{r.subject}</span>}</span> },
          { id: 'who', label: t('Who'), width: '160px', render: (r) => r.user?.name ?? t('System') },
          { id: 'via', label: t('Via'), width: '96px', render: (r) => <Badge tone={r.transport === 'mcp' || r.transport === 'assistant' ? 'info' : 'neutral'}>{channel(r.transport)}</Badge> },
          { id: 'when', label: t('When'), width: '112px', align: 'end', render: (r) => <span title={longDate(r.createdAt)}>{timeAgo(r.createdAt)}</span> },
        ]}
        empty={filtered
          ? <NoMatches onClear={() => setQuery({ person: null, action: null, page: null })} />
          : <EmptyState icon="activity" title={t('No changes recorded yet')} />}
      />
      </ScreenTabs>

      <Dialog
        open={!!open}
        onOpenChange={() => setOpen(null)}
        title={open ? (open.subject ? `${open.label} · ${open.subject}` : open.label) : ''}
        description={open ? [open.user?.name ?? t('System'), channel(open.transport), longDate(open.createdAt)].join(' · ') : ''}
        size="lg"
        footer={open?.to ? <Button variant="primary" iconRight="arrow-right" onClick={() => { const to = open.to!; setOpen(null); navigate(to) }}>{t('Open')}</Button> : undefined}
      >
        {open && <Details row={open} />}
      </Dialog>
    </Page>
  )
}

/** `entryId` → "Entry", `prefixDefault` → "Prefix Default". Ids say which; the subject already does. */
const words = (key: string) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase())
const isId = (key: string) => key === 'id' || /Id$|_id$/.test(key)

/** One value, short: a text, yes or no, a list, or how many there are of something bigger. */
function show(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? t('Yes') : t('No')
  if (typeof value === 'string') return value.length > 160 ? `${value.slice(0, 160)}…` : value
  if (typeof value === 'number') return value.toLocaleString(locale())
  if (Array.isArray(value)) return value.every((v) => typeof v !== 'object' || v === null) ? value.map(show).join(', ') || '—' : plural(value.length, '{count} item', '{count} items')
  return plural(Object.keys(value as object).length, '{count} field', '{count} fields')
}

/** What was sent, as a short list; nested values (an entry's `data`, a setting's `values`) one level in. */
function summary(input: Record<string, unknown> | null): [string, string][] {
  const out: [string, string][] = []
  for (const [key, value] of Object.entries(input ?? {})) {
    if (isId(key)) continue
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [inner, v] of Object.entries(value as Record<string, unknown>)) if (!isId(inner)) out.push([words(inner), show(v)])
    } else out.push([words(key), show(value)])
  }
  return out
}

function Details({ row }: { row: Row }) {
  const rows = summary(row.input)
  return (
    <div className="flex flex-col gap-5">
      {rows.length > 0 ? (
        <dl className="m-0 grid grid-cols-[minmax(96px,auto)_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
          {rows.map(([label, value], i) => (
            <div key={i} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd className="m-0 min-w-0 break-words text-text">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="m-0 text-sm text-muted">{t('Nothing else was sent.')}</p>
      )}
      {Object.keys(row.input ?? {}).length > 0 && <details className="group">
        <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs text-muted hover:text-text [&::-webkit-details-marker]:hidden">
          <Icon name="chevron-right" size={12} className="transition-transform group-open:rotate-90" />
          {t('Raw Data')}
        </summary>
        <div className="mt-2 space-y-2">
          <code className="block font-mono text-xs text-faint">{row.ability}</code>
          <pre className="m-0 max-h-[40vh] overflow-auto rounded-sm bg-sunken p-3 font-mono text-xs">{JSON.stringify(row.input, null, 2)}</pre>
        </div>
      </details>}
    </div>
  )
}
