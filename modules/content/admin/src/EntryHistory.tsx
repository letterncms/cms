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
    return <p className="m-0 px-4 py-3 text-sm text-muted">{t('History starts after the first save.')}</p>
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
    discard: t('Discarded Changes'),
    move: t('Moved'),
  }

  return (
    <>
      {revisions.isError && (
        <QueryError message={revisions.error.message} onRetry={() => void revisions.refetch()} compact />
      )}
      {revisions.data?.length === 0 && (
        <p className="m-0 px-4 py-3 text-sm text-muted">{t('No history yet.')}</p>
      )}
      {/* A timeline: one line per version, newest first, publishes marked; restore an older one from its row. */}
      <ol className="m-0 list-none px-2 py-2">
        {(revisions.data ?? []).map((revision, index, all) => (
          <li key={revision.id} className="group relative flex min-h-12 items-start gap-2.5 rounded-md px-2 py-2 hover:bg-hover">
            {index < all.length - 1 && <span className="absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border" aria-hidden />}
            <span className="relative grid h-5 w-2 shrink-0 place-items-center" aria-hidden>
              <span className={cn('size-2 rounded-full', revision.action === 'publish' ? 'bg-success' : 'bg-surface shadow-[inset_0_0_0_1.5px_var(--cms-border-strong)]')} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-text">
                {labels[revision.action] ?? revision.action}
                {/* Its title then, when it was called something else. */}
                {revision.title && revision.title !== entry.title && <span className="text-muted"> · {revision.title}</span>}
              </div>
              <div className="truncate text-xs text-faint">
                {revision.user?.name ?? t('System')}
                {' · '}
                <time
                  dateTime={revision.createdAt}
                  title={new Date(revision.createdAt).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })}
                >
                  {timeAgo(revision.createdAt)}
                </time>
              </div>
            </div>
            {index > 0 && editable && (
              <Button size="xs" variant="secondary" className="opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100" onClick={() => onRestore(revision.id)}>{t('Restore')}</Button>
            )}
          </li>
        ))}
      </ol>
    </>
  )
}
