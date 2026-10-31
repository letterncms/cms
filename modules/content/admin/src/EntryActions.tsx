import { invalidate, navigate, run, t, useAction, useManifest, type EntrySummary } from '@letterncms/sdk'
import { IconButton, Menu, confirm, cn, toast, entryActionAvailability } from '@letterncms/ui'

/** A row's or card's hover actions: view the live page, and a menu with the rest. */
export function EntryActions({ item, handle, className }: { item: EntrySummary; handle: string; className?: string }) {
  const capabilities = useManifest().collections.find((collection) => collection.handle === handle)?.can
  const actions = entryActionAvailability(capabilities, item)
  const duplicate = useAction('entries/duplicate', { invalidates: ['entries/', 'content/'], onSuccess: (e: any) => navigate(`/content/${handle}/${e.id}`), onError: toast.error })
  const live = !!item.uri && item.displayStatus !== 'draft' && item.displayStatus !== 'scheduled'

  return (
    <div className={cn('flex items-center gap-0.5 has-[[data-popup-open]]:opacity-100', className)}>
      {live && <IconButton icon="external" label={t('View on Site')} size="xs" onClick={() => window.open(item.uri!, '_blank', 'noopener')} />}
      <Menu
        trigger={<IconButton icon="more" label={t('More')} size="xs" />}
        items={[
          { label: t('Open'), icon: 'edit', onSelect: () => navigate(`/content/${handle}/${item.id}`) },
          actions.duplicate ? { label: t('Duplicate'), icon: 'copy', onSelect: () => duplicate.mutate({ id: item.id, expectedVersion: item.version }) } : null,
          item.uri ? { label: t('Copy URL'), icon: 'link', onSelect: () => navigator.clipboard.writeText(new URL(item.uri!, window.location.origin).href).then(() => toast.success(t('URL copied')), toast.error) } : null,
          actions.delete ? { separator: true, label: '' } : null,
          actions.delete ? {
            label: t('Delete'),
            icon: 'trash',
            danger: true,
            onSelect: async () => {
              if (await confirm({ title: t('Delete “{title}”?', { title: item.title }), description: t('This cannot be undone.'), confirm: t('Delete'), danger: true })) {
                run('entries/delete', { id: item.id, expectedVersion: item.version }).then(() => {
                  toast.success(t('Deleted'))
                  invalidate('entries/', 'content/')
                }, toast.error)
              }
            },
          } : null,
        ]}
      />
    </div>
  )
}
