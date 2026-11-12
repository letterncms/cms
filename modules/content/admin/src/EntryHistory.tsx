import { locale, t, timeAgo, useAbility, type Entry, type EntryContent, type FieldDef } from '@letterncms/sdk'
import { Button, Dialog, EmptyState, QueryError, Spinner, cn } from '@letterncms/ui'
import { Fragment, useState } from 'react'

interface Revision {
  id: string
  action: string
  title: string
  message: string | null
  user: { name: string } | null
  createdAt: string
}

interface Snapshot {
  title: string
  slug: string
  data: Record<string, unknown>
  authorId: string | null
  /** Unpublished changes at that time: a restore lays them over the snapshot, each key whole. */
  draft: Partial<Pick<Snapshot, 'title' | 'slug' | 'data' | 'authorId'>> | null
}

interface EntryHistoryProps {
  entry: Entry | null
  /** What the editor holds now: a version is compared with it. */
  working: EntryContent
  fields: FieldDef[]
  editable: boolean
  onRestore: (revisionId: string) => void
}

/** One line of the comparison: what it is called, what is there now, what the version brings back. */
interface Change {
  label: string
  now: string
  then: string
}

const when = (iso: string) => new Date(iso).toLocaleString(locale(), { dateStyle: 'medium', timeStyle: 'short' })
const plain = (text: string) => text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
const differ = (a: unknown, b: unknown) => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const isBlock = (value: unknown): value is { id: string; type: string; props?: Record<string, unknown>; children?: unknown[] } => isObject(value) && typeof value.id === 'string' && typeof value.type === 'string'
const isBlocks = (value: unknown): value is unknown[] => Array.isArray(value) && value.some(isBlock)
/** A key as a label ("og_image" → "Og image"), for values inside a field that have no label of their own. */
const named = (key: string) => { const words = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase(); return words.charAt(0).toUpperCase() + words.slice(1) }

/** A value in words: text without its markup, a list by what its items are called, never a bare count. */
function said(value: unknown): string {
  if (value === null || value === undefined || value === '') return ''
  if (typeof value === 'string') return plain(value)
  // Off reads as nothing there, like a field that was never set.
  if (typeof value === 'boolean') return value ? t('Yes') : ''
  if (Array.isArray(value)) return value.map(said).filter(Boolean).join(', ')
  if (isObject(value)) {
    const name = [value.title, value.name, value.label, value.filename, value.text, value.url, value.id].find((part) => typeof part === 'string' && part !== '')
    return typeof name === 'string' ? plain(name) : Object.entries(value).map(([key, part]) => `${named(key)}: ${said(part)}`).filter((line) => !line.endsWith(': ')).join(', ')
  }
  return String(value)
}

/** Every block of a document by its id, with its own words (not its children's). */
function blocks(nodes: unknown[], into = new Map<string, { words: string; raw: string }>()) {
  for (const node of nodes) {
    if (!isBlock(node)) continue
    const props = node.props ?? {}
    const words = [props.text, props.label, props.title, props.question, props.alt, ...(Array.isArray(props.items) ? props.items : [])].map((part) => (typeof part === 'string' ? plain(part) : said(part))).filter(Boolean).join(' · ')
    const { children, ...own } = node
    into.set(node.id, { words, raw: JSON.stringify(own) })
    if (Array.isArray(children)) blocks(children, into)
  }
  return into
}

/** A block document, block by block: only the blocks whose words differ, then one line when only looks or settings do. */
function blockChanges(label: string, now: unknown, then: unknown): Change[] {
  const a = blocks(Array.isArray(now) ? now : []), b = blocks(Array.isArray(then) ? then : [])
  const out: Change[] = []
  let quiet = false
  for (const id of new Set([...a.keys(), ...b.keys()])) {
    const was = a.get(id), will = b.get(id)
    if (was?.raw === will?.raw) continue
    if ((was?.words ?? '') === (will?.words ?? '')) { quiet = true; continue }
    out.push({ label: out.length ? '' : label, now: was?.words ?? '', then: will?.words ?? '' })
  }
  if (quiet || (!out.length && differ(now, then))) out.push({ label: out.length ? '' : label, now: '', then: t('Layout or design changed') })
  return out
}

/** One field: a block document block by block, a group key by key under the field's name, anything else by value. */
function fieldChanges(label: string, now: unknown, then: unknown): Change[] {
  if (!differ(now, then)) return []
  if (isBlocks(now) || isBlocks(then)) return blockChanges(label, now, then)
  if ((isObject(now) || now == null) && (isObject(then) || then == null) && (isObject(now) || isObject(then))) {
    const a = isObject(now) ? now : {}, b = isObject(then) ? then : {}
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) => fieldChanges(`${label} › ${named(key)}`, a[key], b[key]))
  }
  const was = said(now), will = said(then)
  // Nothing against nothing (null, an empty list, a switch that is off) is no change to show.
  if (!was && !will) return []
  // Two values that read alike and still differ (an order, an id): say so instead of showing the same words twice.
  return [{ label, now: was, then: was === will ? t('Changed') : will }]
}

/**
 * What restoring a version changes: exactly what `revisions/restore` writes. The snapshot's title, URL, data and
 * author replace the working ones, and its unpublished changes are laid over that, each key whole.
 */
function changes(now: EntryContent, snapshot: Snapshot, fields: FieldDef[], author: string): Change[] {
  const restored = { title: snapshot.title, slug: snapshot.slug, data: snapshot.data, authorId: snapshot.authorId, ...snapshot.draft }
  const data = restored.data ?? {}
  return [
    ...fieldChanges(t('Title'), now.title, restored.title),
    ...fieldChanges(t('URL'), now.slug, restored.slug),
    ...(differ(now.authorId, restored.authorId) ? [{ label: t('Author'), now: author, then: restored.authorId ? t('Someone else') : '' }] : []),
    ...[...new Set([...Object.keys(now.data), ...Object.keys(data)])].flatMap((handle) => fieldChanges(fields.find((field) => field.handle === handle)?.label ?? named(handle), now.data[handle], data[handle])),
  ]
}

export function EntryHistory({ entry, working, fields, editable, onRestore }: EntryHistoryProps) {
  const revisions = useAbility<Revision[]>(
    'revisions/list',
    { entryId: entry?.id ?? '' },
    { enabled: !!entry },
  )
  const [viewing, setViewing] = useState<Revision | null>(null)

  if (!entry) return <EmptyState compact icon="history" title={t('No history yet')} />
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
  const label = (revision: Revision) => labels[revision.action] ?? revision.action

  return (
    <>
      {revisions.isError && (
        <QueryError message={revisions.error.message} onRetry={() => void revisions.refetch()} compact />
      )}
      {revisions.data?.length === 0 && <EmptyState compact icon="history" title={t('No history yet')} />}
      {/* A timeline: one line per version, newest first, publishes marked. An older one opens to show what restoring it changes. */}
      <ol className="m-0 list-none px-2 py-2">
        {(revisions.data ?? []).map((revision, index, all) => {
          const line = <>
            <span className="relative grid h-5 w-2 shrink-0 place-items-center" aria-hidden>
              <span className={cn('size-2 rounded-full', revision.action === 'publish' ? 'bg-success' : 'bg-surface ring-1 ring-inset ring-border-strong')} />
            </span>
            <span className="block min-w-0 flex-1">
              <span className="block truncate text-sm text-text">
                {label(revision)}
                {/* Its title then, when it was called something else. */}
                {revision.title && revision.title !== entry.title && <span className="text-muted"> · {revision.title}</span>}
              </span>
              <span className="block truncate text-xs text-faint">
                {revision.user?.name ?? t('System')}
                {' · '}
                <time dateTime={revision.createdAt} title={when(revision.createdAt)}>{timeAgo(revision.createdAt)}</time>
              </span>
            </span>
          </>
          return (
            <li key={revision.id} className="relative">
              {index < all.length - 1 && <span className="absolute bottom-[-10px] left-[11.5px] top-[22px] w-px bg-border" aria-hidden />}
              {index > 0
                ? <Button variant="ghost" onClick={() => setViewing(revision)} className="!h-auto min-h-12 w-full !items-start !justify-start !gap-2.5 !whitespace-normal !rounded-md !px-2 !py-2 text-left !font-normal">{line}</Button>
                : <div className="flex min-h-12 items-start gap-2.5 px-2 py-2">{line}</div>}
            </li>
          )
        })}
      </ol>
      <Version
        revision={viewing}
        title={viewing ? `${label(viewing)} · ${when(viewing.createdAt)}` : ''}
        working={working}
        fields={fields}
        author={entry.author?.name ?? ''}
        editable={editable}
        onClose={() => setViewing(null)}
        onRestore={(id) => { setViewing(null); onRestore(id) }}
      />
    </>
  )
}

const grid = 'grid grid-cols-[minmax(96px,0.6fr)_1fr_1fr] gap-x-4 px-3 py-2'

/** One older version: what restoring it changes against what is in the editor now, and the way to restore it. */
function Version({ revision, title, working, fields, author, editable, onClose, onRestore }: { revision: Revision | null; title: string; working: EntryContent; fields: FieldDef[]; author: string; editable: boolean; onClose: () => void; onRestore: (id: string) => void }) {
  const loaded = useAbility<{ snapshot: Snapshot }>('revisions/get', { id: revision?.id ?? '' }, { enabled: !!revision })
  const diff = revision && loaded.data ? changes(working, loaded.data.snapshot, fields, author) : null
  return (
    <Dialog
      open={!!revision}
      onOpenChange={(open) => { if (!open) onClose() }}
      title={title}
      size="lg"
      // On a phone it is a sheet with a handle that leaves the list it came from in view above it.
      className="max-sm:max-h-[72dvh] max-sm:before:mx-auto max-sm:before:mt-2 max-sm:before:h-1 max-sm:before:w-9 max-sm:before:shrink-0 max-sm:before:rounded-full max-sm:before:bg-border-strong max-sm:before:content-['']"
      {...(editable ? { onSubmit: () => revision && onRestore(revision.id), submitLabel: t('Restore Version'), submitDisabled: !diff?.length } : {})}
    >
      {loaded.isError ? <QueryError compact message={t('Couldn’t load this version')} onRetry={() => void loaded.refetch()} retrying={loaded.isRefetching} />
        : !diff ? <div className="grid place-items-center py-10 text-faint"><Spinner /></div>
        : diff.length === 0 ? <p role="status" className="m-0 py-6 text-center text-sm text-muted">{t('Same as now')}</p>
        : (
          // The look of the kit's ui/diff, with its columns named for a restore and the fields' labels as they are written.
          <div role="table" className="overflow-hidden rounded-lg border border-border">
            <div role="row" className={cn(grid, 'sticky top-0 border-b border-border bg-sunken text-xs font-medium text-muted')}>
              <span role="columnheader" />
              <span role="columnheader">{t('Current')}</span>
              <span role="columnheader">{t('This Version')}</span>
            </div>
            {diff.map((change, index) => (
              <div key={index} role="row" className={cn(grid, 'text-sm', index > 0 && (change.label ? 'border-t border-border' : 'border-t border-border/50'))}>
                <span role="rowheader" className="min-w-0 break-words text-muted">{change.label}</span>
                {change.now && change.then ? (
                  // Both have words: what they share reads plain, and only the words that differ are marked.
                  <>
                    <span role="cell" className="min-w-0 break-words text-text">{marked(change.now, change.then, 'del')}</span>
                    <span role="cell" className="min-w-0 break-words text-text">{marked(change.now, change.then, 'add')}</span>
                  </>
                ) : (
                  <>
                    <span role="cell" className={cn('min-w-0 break-words', change.now ? 'text-danger line-through decoration-danger/40' : 'text-faint')}>{change.now || '—'}</span>
                    <span role="cell" className={cn('min-w-0 break-words', change.then ? 'text-success' : 'text-faint')}>{change.then || '—'}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
    </Dialog>
  )
}

/**
 * One side of two texts, word by word: the words both share plain, the ones only this side has marked (struck in
 * red where restoring takes them away, green where it brings them). Past a few hundred words it marks the whole.
 */
function marked(now: string, then: string, side: 'del' | 'add') {
  const a = now.split(/(\s+)/)
  const b = then.split(/(\s+)/)
  const own = side === 'del' ? a : b
  const style = side === 'del' ? 'text-danger line-through decoration-danger/40' : 'text-success'
  if (a.length * b.length > 250_000) return <span className={style}>{own.join('')}</span>
  // The longest run they share, by a table of common lengths; what is not in it is this side's own.
  const m = a.length, n = b.length
  const table = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
  const kept = new Set<number>()
  for (let i = 0, j = 0; i < m && j < n;) {
    if (a[i] === b[j]) { kept.add(side === 'del' ? i : j); i++; j++ } else if (table[i + 1][j] >= table[i][j + 1]) i++; else j++
  }
  return <>{own.map((word, k) => kept.has(k) || !word.trim() ? <Fragment key={k}>{word}</Fragment> : <span key={k} className={style}>{word}</span>)}</>
}
