import { t, useAbility, type Entry, type EntrySummary } from '@letterncms/sdk'
import { Button, Dialog, Fields, QueryError, Spinner } from '@letterncms/ui'
import { useRef, useState } from 'react'

interface TreeEntry extends EntrySummary {
  children?: TreeEntry[]
}

export interface EntryMoveDialogProps {
  entry: Entry
  collection: { handle: string; singular: string }
  busy: boolean
  onClose: () => void
  onMove: (parentId: string | null) => Promise<boolean>
}

/** Flatten eligible parents, skipping the moving entry's entire subtree. */
function parentOptions(items: TreeEntry[], movingId: string, ancestors: string[] = []): { value: string; label: string }[] {
  return items.flatMap((item) => {
    if (item.id === movingId) return []
    const path = [...ancestors, item.title || t('Untitled')]
    return [
      { value: item.id, label: path.join(' / ') },
      ...parentOptions(item.children ?? [], movingId, path),
    ]
  })
}

/** The host serializes persistence and the move; this dialog only chooses a parent. */
export function EntryMoveDialog({ entry, collection, busy, onClose, onMove }: EntryMoveDialogProps) {
  const tree = useAbility<TreeEntry[]>(
    'entries/tree',
    { collection: collection.handle, locale: entry.locale },
    { refetchOnWindowFocus: false },
  )
  const [parentId, setParentId] = useState<string | null>(entry.parentId)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const operation = useRef(false)
  const options = [{ value: '', label: t('Root') }, ...parentOptions(tree.data ?? [], entry.id)]
  const available = parentId === null || options.some((option) => option.value === parentId)
  const ready = !!tree.data && !tree.isError
  const pending = busy || submitting
  const parentError = error ?? (ready && !available ? t('This parent is no longer available. Choose another parent.') : undefined)

  const submit = async () => {
    if (operation.current || pending || !ready || !available || parentId === entry.parentId) return
    operation.current = true
    setSubmitting(true)
    setError(null)
    try {
      if (await onMove(parentId)) onClose()
      else setError(t('Could not move this entry. Try again.'))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t('Could not move this entry. Try again.'))
    } finally {
      setSubmitting(false)
      operation.current = false
    }
  }

  return (
    <Dialog
      open
      title={t('Move {type}', { type: collection.singular })}
      description={t('Choose a new parent for “{title}”.', { title: entry.title })}
      onOpenChange={(open) => { if (!open && !pending) onClose() }}
      footer={
        <>
          <Button disabled={pending} onClick={onClose}>{t('Cancel')}</Button>
          <Button
            variant="primary"
            loading={pending}
            disabled={!ready || !available || parentId === entry.parentId}
            onClick={submit}
          >
            {t('Move')}
          </Button>
        </>
      }
    >
      {tree.isLoading || (!tree.data && tree.isFetching) ? (
        <div role="status" className="flex items-center gap-2 py-4 text-sm text-muted">
          <Spinner size={14} />{t('Loading available parents…')}
        </div>
      ) : (
        <>
          {tree.isError && (
            <QueryError message={tree.error.message} onRetry={() => void tree.refetch()} />
          )}
          {tree.data && (
            <Fields
              fields={[{
                handle: 'parentId', type: 'select', label: t('Parent'), required: true,
                options: available ? options : [
                  ...options,
                  { value: parentId!, label: t('Unavailable parent') },
                ],
                instructions: t('Choose Root to place this entry at the top level.'),
              }]}
              values={{ parentId: parentId ?? '' }}
              onChange={(_, value) => { setParentId(value || null); setError(null) }}
              errors={parentError ? { parentId: parentError } : {}}
              disabled={pending || tree.isError}
            />
          )}
        </>
      )}
      <div className="mt-4 space-y-2 text-xs text-muted">
        {entry.uri && (
          <p className="m-0">{t('Moving a published entry can change its live URL and the URLs of its descendants.')}</p>
        )}
        <p className="m-0">{t('Saved unpublished changes stay in the working copy. Moving does not publish them.')}</p>
      </div>
    </Dialog>
  )
}
