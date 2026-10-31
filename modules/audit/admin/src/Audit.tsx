import { Link, locale, setQuery, t, timeAgo, useAbility, useLocation, type RecordTimestamps } from '@letterncms/sdk'
import { useState } from 'react'
import { Badge, DataView, Dialog, EmptyState, Page } from '@letterncms/ui'

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

/** Where a change came from: someone in the admin, an agent, the API or the command line. */
function channel(transport: string): string {
  const names: Record<string, string> = { mcp: t('Agent'), assistant: t('Assistant'), rest: t('API'), cli: t('CLI'), install: t('Install') }
  return names[transport] ?? t('Admin')
}

const longDate = (iso: string) => new Date(iso).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })

export default function Audit() {
  const { query } = useLocation()
  const page = Number(query.page ?? 1)
  const log = useAbility<{ items: Row[]; total: number; page: number; pages: number }>('audit/list', { page, perPage: 50 }, { placeholderData: (p) => p })
  const [open, setOpen] = useState<Row | null>(null)
  const items = log.data?.items ?? []

  return (
    <Page width="wide" crumbs={[{ label: t('Audit Log'), icon: 'activity' }]}>
      <DataView id="audit" label={t('Audit Log')} items={items} source={{ ability: 'audit/list', perPage: 100 }} rowKey={(r) => r.id} onRowClick={setOpen}
        pagination={log.data && { page: log.data.page, pages: log.data.pages, onPage: (next) => setQuery({ page: next > 1 ? next : null }) }}
        loading={log.isLoading} stale={log.isPlaceholderData} error={log.isError} onRetry={() => void log.refetch()}
        columns={[
          { id: 'change', label: t('Change'), render: (r) => <span className="flex min-w-0 items-baseline gap-2"><span className="truncate">{r.label}</span>{r.subject && <span className="truncate font-normal text-muted">{r.subject}</span>}</span> },
          { id: 'who', label: t('Who'), width: '160px', render: (r) => r.user?.name ?? t('System') },
          { id: 'via', label: t('Via'), width: '96px', render: (r) => <Badge tone={r.transport === 'mcp' || r.transport === 'assistant' ? 'info' : 'neutral'}>{channel(r.transport)}</Badge> },
          { id: 'when', label: t('When'), width: '112px', align: 'end', render: (r) => <span title={longDate(r.createdAt)}>{timeAgo(r.createdAt)}</span> },
        ]}
        empty={<EmptyState icon="activity" title={t('No changes recorded yet')} />}
      />


      <Dialog
        open={!!open}
        onOpenChange={() => setOpen(null)}
        title={open ? (open.subject ? `${open.label} · ${open.subject}` : open.label) : ''}
        description={open ? [open.user?.name ?? t('System'), channel(open.transport), longDate(open.createdAt)].join(' · ') : ''}
        size="lg"
      >
        {open && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-faint">
              <span className="font-mono">{open.ability}</span>
              {open.to && <Link to={open.to} className="ml-auto text-xs" onClick={() => setOpen(null)}>{t('Open')}</Link>}
            </div>
            <pre className="m-0 max-h-[60vh] overflow-auto rounded-sm bg-sunken p-3 font-mono text-xs">{JSON.stringify(open.input, null, 2)}</pre>
          </div>
        )}
      </Dialog>
    </Page>
  )
}
