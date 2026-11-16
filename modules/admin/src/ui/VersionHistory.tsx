import { locale, t, timeAgo, useAbility } from '@letterncms/sdk'
import { useState, type ReactNode } from 'react'
import { Button, IconButton } from './Button'
import { cn } from './cn'
import { Dialog } from './Dialog'
import { EmptyState } from './EmptyState'
import { Popover } from './Popover'
import { QueryError } from './QueryError'
import { Spinner } from './Spinner'
import { Tooltip } from './Tooltip'

/*
 * The versions of anything that keeps them, drawn one way on every screen: an entry, the styling, a file of code.
 * They all live in the one history the server keeps (revisions/list, get and restore), named by a kind and a
 * subject; a screen only says what opening an older one does.
 */

export interface Version {
  id: string
  action: string
  title: string | null
  message: string | null
  user: { name: string } | null
  createdAt: string
}

/** What the history a thing keeps is: `entry` and an entry's id, `styling` and `theme`, `code` and a file's path. */
export interface VersionSubject {
  kind: string
  subject: string
}

export function useVersions({ kind, subject }: VersionSubject, enabled = true) {
  return useAbility<Version[]>('revisions/list', { kind, subject }, { enabled: enabled && subject !== '' })
}

/** One version, whole: what the thing was then. */
export function useVersion<T>(version: Version | null) {
  return useAbility<{ snapshot: T }>('revisions/get', { id: version?.id ?? '' }, { enabled: !!version })
}

/** What happened at a version, in the words of every history. */
export function versionLabel(version: Pick<Version, 'action'>): string {
  const labels: Record<string, string> = {
    create: t('Created'),
    save: t('Edited'),
    publish: t('Published'),
    unpublish: t('Unpublished'),
    restore: t('Restored'),
    discard: t('Discarded Changes'),
    move: t('Moved'),
  }
  return labels[version.action] ?? version.action
}

export const versionTime = (iso: string) => new Date(iso).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })

/**
 * The timeline of a thing's versions, newest first: what happened, by whom and when. The newest is what there is
 * now; an older one is a button, and `onOpen` says what it does. `title` is the thing's name now: a version
 * shows the name it had when that differed.
 */
export function VersionList({ of, title, onOpen }: { of: VersionSubject; title?: string; onOpen: (version: Version) => void }) {
  const versions = useVersions(of)
  if (versions.isPending) return <div className="grid place-items-center p-6 text-faint"><Spinner /></div>
  if (versions.isError) return <QueryError compact message={t('Couldn’t load the history')} onRetry={() => void versions.refetch()} retrying={versions.isRefetching} />
  if (versions.data.length === 0) return <EmptyState compact icon="history" title={t('No history yet')} />
  return (
    <ol className="m-0 list-none p-1">
      {versions.data.map((version, index, all) => {
        const line = <>
          <span className="relative grid h-5 w-2 shrink-0 place-items-center" aria-hidden>
            <span className={cn('size-2 rounded-full', version.action === 'publish' ? 'bg-success' : 'bg-surface ring-1 ring-inset ring-border-strong')} />
          </span>
          <span className="block min-w-0 flex-1">
            <span className="block truncate text-sm text-text">
              {versionLabel(version)}
              {version.title && title !== undefined && version.title !== title && <span className="text-muted"> · {version.title}</span>}
            </span>
            <span className="block truncate text-xs text-faint">
              {version.user?.name ?? t('System')}
              {' · '}
              <Tooltip content={versionTime(version.createdAt)}><time dateTime={version.createdAt}>{timeAgo(version.createdAt)}</time></Tooltip>
            </span>
          </span>
          {index === 0 && <span className="shrink-0 pt-0.5 text-xs text-muted">{t('Current')}</span>}
        </>
        return (
          <li key={version.id} className="relative">
            {index < all.length - 1 && <span className="absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border" aria-hidden />}
            {index > 0
              ? <Button variant="ghost" onClick={() => onOpen(version)} className="!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal">{line}</Button>
              : <div className="flex min-h-12 items-start gap-2.5 px-2 py-2">{line}</div>}
          </li>
        )
      })}
    </ol>
  )
}

/** History in a top bar: the button, and the timeline under it. Opening a version closes it. */
export function VersionsButton({ of, title, onOpen, disabled = false }: { of: VersionSubject; title?: string; onOpen: (version: Version) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-80 !p-0"
      trigger={<IconButton icon="history" label={t('History')} active={open} disabled={disabled} />}
    >
      <div className="cms-label px-3 pb-1 pt-2.5">{t('History')}</div>
      <div className="max-h-96 overflow-y-auto">
        {open && <VersionList of={of} title={title} onOpen={(version) => { setOpen(false); onOpen(version) }} />}
      </div>
    </Popover>
  )
}

/**
 * An older version opened: what restoring it changes against what there is now (the screen draws that), and
 * the way to restore it. Nothing to change leaves Restore off.
 */
export function VersionDialog({ version, onClose, onRestore, loading, failed, onRetry, unchanged, children }: {
  version: Version | null
  onClose: () => void
  /** Without it the version is only looked at. */
  onRestore?: () => void
  loading: boolean
  failed: boolean
  onRetry: () => void
  /** Restoring it would change nothing. */
  unchanged: boolean
  children: ReactNode
}) {
  return (
    <Dialog
      open={!!version}
      onOpenChange={(open) => { if (!open) onClose() }}
      title={version ? `${versionLabel(version)} · ${versionTime(version.createdAt)}` : ''}
      size="lg"
      // On a phone it is a sheet with a handle that leaves the list it came from in view above it.
      className="max-sm:max-h-[72dvh] max-sm:before:mx-auto max-sm:before:mt-2 max-sm:before:h-1 max-sm:before:w-9 max-sm:before:shrink-0 max-sm:before:rounded-full max-sm:before:bg-border-strong max-sm:before:content-['']"
      {...(onRestore ? { onSubmit: onRestore, submitLabel: t('Restore Version'), submitDisabled: loading || failed || unchanged } : {})}
    >
      {failed ? <QueryError compact message={t('Couldn’t load this version')} onRetry={onRetry} />
        : loading ? <div className="grid place-items-center py-10 text-faint"><Spinner /></div>
        : unchanged ? <p role="status" className="m-0 py-6 text-center text-sm text-muted">{t('Same as now')}</p>
        : children}
    </Dialog>
  )
}
