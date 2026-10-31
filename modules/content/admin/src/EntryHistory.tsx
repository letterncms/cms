import { locale, t, timeAgo, useAbility, type Entry } from '@letterncms/sdk'
import { Button, QueryError, Spinner, cn } from '@letterncms/ui'

interface Revision {
  id: string
  action: string
  title: string
  message: string | null
  user: { name: string } | null
  createdAt: string
}

interface EntryHistoryProps {
  entry: Entry | null
  editable: boolean
  onRestore: (revisionId: string) => void
}

export function EntryHistory({ entry, editable, onRestore }: EntryHistoryProps) {
  const revisions = useAbility<Revision[]>(
    'entries/revisions',
    { id: entry?.id ?? '' },
    { enabled: !!entry },
  )

  if (!entry) {
    return <p className="m-0 p-4 text-sm text-faint">{t('History starts after the first save.')}</p>
  }
  if (revisions.isLoading) {
    return <div className="grid place-items-center p-6 text-faint"><Spinner /></div>
  }
  if (revisions.isError && !revisions.data) {
    return <QueryError message={revisions.error.message} onRetry={() => void revisions.refetch()} />
  }

  const labels: Record<string, string> = {
    create: t('Created'),
    save: t('Edited'),
    publish: t('Published'),
    unpublish: t('Unpublished'),
    restore: t('Restored'),
    discard: t('Discarded changes'),
    move: t('Moved'),
  }

  return (
    <>
      {revisions.isError && (
        <QueryError message={revisions.error.message} onRetry={() => void revisions.refetch()} compact />
      )}
      {revisions.data?.length === 0 && (
        <p className="p-4 text-sm text-muted">{t('No history available.')}</p>
      )}
      <ol className="m-0 list-none p-2">
        {(revisions.data ?? []).map((revision, index) => (
          <li key={revision.id} className="group flex items-start gap-3 rounded-sm px-2 py-2 hover:bg-surface">
            <span className={cn(
              'mt-1.5 size-2 shrink-0 rounded-full',
              revision.action === 'publish' ? 'bg-success' : 'bg-border-strong',
            )} />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-text">
                {labels[revision.action] ?? revision.action}
                <span className="text-muted"> · {revision.user?.name ?? t('System')}</span>
              </div>
              <div
                className="truncate text-xs text-faint"
                title={new Date(revision.createdAt).toLocaleString(locale(), {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              >
                {timeAgo(revision.createdAt)} · {revision.title}
              </div>
            </div>
            {index > 0 && editable && (
              <Button size="xs" variant="ghost" onClick={() => onRestore(revision.id)}>{t('Restore')}</Button>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}
