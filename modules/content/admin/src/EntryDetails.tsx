import { can, locale, t, useAbility, useManifest, type Entry, type EntryContent, type EntryPanelProps, type EntrySummary, type FieldDef } from '@letterncms/sdk'
import { Button, Dialog, Fields, PersonPicker, QueryError, SharedMark, StatusDot, cn, fieldControlId, slugify, statusLabel, wideFieldTypes } from '@letterncms/ui'
import { useState, type ReactNode } from 'react'

/** The pages features bring (sign in, checkout), as `pages/builtin` gives them, by what brought them. */
interface BuiltinGroup {
  id: string
  label: string
  collection: string
  pages: { handle: string; label: string; path: string | null; id: string | null; status: 'standard' | 'draft' | 'customised' | 'conflict' }[]
}

interface EntryDetailsProps {
  props: EntryPanelProps
  working: EntryContent
  fields: FieldDef[]
  titleInDetails?: boolean
  update: (patch: Partial<EntryContent>) => void
}

export function previewUri(collection: EntryPanelProps['collection'], entry: Entry | null, slug: string): string {
  if (entry?.uri) return entry.uri === '/' ? '/' : entry.uri.replace(/[^/]+$/, slug || entry.slug)
  return (collection.route ?? '/{slug}')
    .replace('{parent_uri}/', '')
    .replace('{slug}', slug || '…')
    .replace(/\{[a-z_]+\}/g, '…')
    .replace(/\/+/g, '/')
}

/**
 * The entry's panel, laid out like every inspector: rows with an 88px label column and
 * 28px controls, groups under a small title, hairlines between them.
 */
export function EntryDetails({ props, working, fields, titleInDetails, update }: EntryDetailsProps) {
  const { entry, collection, editable, errors } = props
  const manifest = useManifest()
  const summary = manifest.collections.find((c) => c.handle === collection.handle)
  // Templates, components and built-in pages come with the site: nobody authors them, and the first two are never published.
  const system = (collection as { system?: boolean }).system === true
  // The record itself (where it is kept, its id) is for whoever builds the site.
  const builder = can('collections.manage')
  const parent = useAbility<EntrySummary[]>('entries/get-many', { ids: entry?.parentId ? [entry.parentId] : [] }, { enabled: builder && !!entry?.parentId })
  // A built-in page (sign in, checkout) keeps the address its feature gives it: shown, not edited.
  const builtin = !!summary?.within
  const builtinGroups = useAbility<BuiltinGroup[]>('pages/builtin', {}, { enabled: builtin })
  const builtinPage = builtinGroups.data?.find((group) => group.collection === collection.handle)?.pages.find((page) => page.handle === (entry?.slug ?? working.slug))
  const date = (value: string) => new Intl.DateTimeFormat(locale(), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: manifest.site.timezone,
  }).format(new Date(value))
  const sectionOf = (field: FieldDef) => field.section === 'sidebar' ? 'main' : field.section ?? 'main'
  const main = fields.filter((field) => sectionOf(field) === 'main')
  const groups = [...new Set(fields.map(sectionOf))].filter((group) => group !== 'main').map((group) => {
    const inside = fields.filter((field) => sectionOf(field) === group)
    const name = group.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    // A section of one field named like it needs no heading of its own.
    return { group, inside, heading: inside.length === 1 && inside[0].label?.toLowerCase() === name.toLowerCase() ? null : name }
  })
  const status = entry?.displayStatus ?? 'draft'
  const context = { entry: entry ?? undefined, collection: collection.handle, locale: entry?.locale ?? manifest.site.defaultLocale }
  const info: [string, ReactNode][] = [
    ...((!system || collection.route || summary?.within) ? [[t('Status'), <StatusDot key="status" status={status} label={statusLabel(status)} className="text-text" />] as [string, ReactNode]] : []),
    ...(entry?.publishedAt && status !== 'draft' ? [[status === 'scheduled' ? t('Goes Live') : t('Published'), <time key="published" dateTime={entry.publishedAt} title={manifest.site.timezone}>{date(entry.publishedAt)}</time>] as [string, ReactNode]] : []),
    // When it comes off the site again, while that is still ahead or just passed.
    ...(entry?.expiresAt && status !== 'draft' ? [[status === 'expired' ? t('Ended') : t('Ends'), <time key="ends" dateTime={entry.expiresAt} title={manifest.site.timezone}>{date(entry.expiresAt)}</time>] as [string, ReactNode]] : []),
    ...(builder ? [
      ...(entry && collection.structure === 'tree' ? [[t('Parent'), entry.parentId ? parent.data?.[0]?.title ?? (parent.isLoading ? t('Loading…') : '') : t('None')] as [string, ReactNode]] : []),
      ...(summary?.within ? [] : [[t('Collection'), collection.title] as [string, ReactNode]]),
      ...(manifest.site.locales.length > 1 ? [[t('Language'), entry?.locale ?? manifest.site.defaultLocale] as [string, ReactNode]] : []),
      ...(entry?.createdAt ? [[t('Created'), date(entry.createdAt)] as [string, ReactNode]] : []),
      ...(entry?.updatedAt ? [[t('Updated'), date(entry.updatedAt)] as [string, ReactNode]] : []),
    ] : []),
  ]
  const row = (field: FieldDef) => (
    <PanelRow key={field.handle} field={field} error={errors[field.handle]}>
      <Fields
        bare
        fields={[{ ...field, width: 'full', size: field.size ?? 'sm', rows: field.type === 'textarea' ? (field.rows ?? 3) : field.rows }]}
        values={working.data}
        onChange={props.setValue}
        errors={errors}
        disabled={!editable}
        context={context}
      />
    </PanelRow>
  )

  return (
    <div>
      <PanelGroup>
        {titleInDetails && (
          <PanelRow field={{ handle: 'title', type: 'text', label: t('Title') }} error={errors.title}>
            <Fields bare fields={[{ handle: 'title', type: 'text', label: t('Title'), size: 'sm' }]} values={{ title: working.title }} onChange={(_, value) => update({ title: value ?? '' })} errors={errors} disabled={!editable} />
          </PanelRow>
        )}
        {builtin ? (
          <div className="flex min-h-7 items-start gap-2">
            <span className="flex h-7 w-[88px] shrink-0 items-center text-xs text-muted">{t('URL')}</span>
            <span className="flex h-7 min-w-0 flex-1 items-center">
              {builtinPage?.path
                ? <span className="truncate px-1 font-mono text-xs text-faint" title={builtinPage.path}>{builtinPage.path}</span>
                : <span className="truncate px-1 text-xs text-faint">{builtinGroups.isLoading ? '…' : t('Shown inside other pages')}</span>}
            </span>
          </div>
        ) : <PanelRow field={{ handle: 'slug', type: 'text', label: collection.route ? t('URL') : t('Handle') }} error={errors.slug}>
          <Fields
            bare
            fields={[collection.route
              ? { handle: 'slug', type: 'slug', label: t('URL'), component: 'uri', uri: previewUri(collection, entry, working.slug), size: 'sm' }
              : { handle: 'slug', type: 'text', label: t('Handle'), mono: true, max: 180, size: 'sm' }]}
            values={{ title: working.title, slug: working.slug || slugify(working.title) }}
            onChange={(handle, value) => update({ [handle]: value ?? '' })}
            errors={errors}
            disabled={!editable}
          />
        </PanelRow>}
        {!system && (
          <PanelRow field={{ handle: 'authorId', type: 'person', label: t('Author') }} error={errors.authorId}>
            <PersonPicker
              id="f-authorId"
              size="sm"
              aria-describedby={errors.authorId ? 'f-authorId-error' : undefined}
              value={working.authorId ? [working.authorId] : []}
              max={1}
              disabled={!editable}
              label={t('Assign Author')}
              onChange={(ids) => update({ authorId: ids[0] ?? null })}
            />
          </PanelRow>
        )}
        {main.map(row)}
      </PanelGroup>

      {groups.map(({ group, inside, heading }) => (
        <PanelGroup key={group} title={heading}>
          {inside.map(row)}
        </PanelGroup>
      ))}

      {info.length > 0 && (
        <PanelGroup title={t('Info')}>
          <dl className="m-0 space-y-1">
            {info.map(([label, value]) => (
              <div key={label} className="flex min-h-7 items-start gap-2">
                <dt className="flex h-7 w-[88px] shrink-0 items-center truncate text-xs text-muted">{label}</dt>
                <dd className="m-0 min-w-0 flex-1 break-words py-1 text-sm text-text">{value}</dd>
              </div>
            ))}
          </dl>
          {entry?.parentId && parent.isError && <QueryError message={parent.error.message} onRetry={() => void parent.refetch()} compact />}
        </PanelGroup>
      )}
    </div>
  )
}

/** A group of rows under a small title (or none, for the first), hairlines between groups. */
function PanelGroup({ title, children }: { title?: string | null; children: ReactNode }) {
  return (
    <section className={cn('border-b border-border px-4 pb-3 last:border-b-0', !title && 'pt-3')}>
      {title && <h3 className="m-0 flex h-10 items-center text-xs font-semibold text-ink">{title}</h3>}
      <div className="space-y-1">{children}</div>
    </section>
  )
}

/**
 * One field: its label in the panel's label column and the control beside it, or above
 * it for a field that needs the width. Help text sits under the control.
 */
function PanelRow({ field, error, children }: { field: FieldDef; error?: string; children: ReactNode }) {
  const toggle = field.type === 'toggle'
  const wide = wideFieldTypes.includes(field.type)
  const help = !error && field.instructions ? <p className="m-0 mt-1 text-xs text-muted">{field.instructions}</p> : null
  const label = <label htmlFor={fieldControlId(field)} className={cn('flex h-7 min-w-0 shrink-0 items-center text-xs text-muted', !wide && 'w-[88px]')}><span className="truncate">{field.label}</span>{typeof field.shared === 'string' && <SharedMark from={field.shared} className="ml-1.5" />}</label>
  if (toggle) return <div className="py-1">{children}{help}</div>
  if (wide) return <div className="pb-1">{label}{children}{help}</div>
  return (
    <div className="flex min-h-7 items-start gap-2">
      {label}
      <div className="min-w-0 flex-1">{children}{help}</div>
    </div>
  )
}

interface PublicationDialogProps {
  entry: Entry | null
  /** Whether there are changes the site doesn't show yet. */
  changes: boolean
  busy: boolean
  onClose: () => void
  /** `expiresAt`: the end date as it now is, null for none; left out when it was not touched. */
  onPublish: (at: string, expiresAt?: string | null) => Promise<boolean>
}

export function PublicationDialog({ entry, changes, busy, onClose, onPublish }: PublicationDialogProps) {
  const manifest = useManifest()
  const [at, setAt] = useState<string | null>(entry?.publishedAt ?? null)
  // An end that has passed is no end any more: publishing again starts without one.
  const kept = entry?.expiresAt && new Date(entry.expiresAt).getTime() > Date.now() ? entry.expiresAt : null
  const [ends, setEnds] = useState<string | null>(kept)
  const [error, setError] = useState<string | undefined>()
  const [endsError, setEndsError] = useState<string | undefined>()
  const scheduled = entry?.displayStatus === 'scheduled'
  const live = entry?.status === 'published' && !scheduled && entry?.displayStatus !== 'expired'
  const time = at ? new Date(at).getTime() : NaN
  const future = time > Date.now()
  const moved = (!!at && time !== new Date(entry?.publishedAt ?? 0).getTime()) || ends !== kept
  // The button says what happens; with nothing to change, there is nothing to press.
  const label = future || (!at && !live) ? (scheduled ? t('Change Schedule') : t('Schedule'))
    : live ? (changes ? t('Publish Changes') : t('Change Date'))
    : t('Publish')
  const idle = !at || (live && !changes && !moved) || (scheduled && future && !moved)

  const submit = async () => {
    if (!Number.isFinite(time)) {
      setError(t('Choose a publication date and time.'))
      return
    }
    if (live && future) {
      setError(t('Unpublish this entry before scheduling it for a future date.'))
      return
    }
    if (ends && !(new Date(ends).getTime() > Math.max(Date.now(), time))) {
      setEndsError(t('Choose an end after the publication date, and not in the past.'))
      return
    }
    if (await onPublish(at!, ends === kept ? undefined : ends)) onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !busy && onClose()}
      title={scheduled ? t('Change Schedule') : live ? t('Publication Date') : t('Schedule')}
      footer={
        <>
          <Button disabled={busy} onClick={onClose}>{t('Cancel')}</Button>
          <Button variant="publish" loading={busy} disabled={idle} onClick={submit}>{label}</Button>
        </>
      }
    >
      <Fields
        fields={[{
          handle: 'at', type: 'date', time: true, timezone: manifest.site.timezone, zone: false,
          label: t('Starts'), required: true,
        }, {
          // The zone is said once, under the last of the two.
          handle: 'ends', type: 'date', time: true, timezone: manifest.site.timezone, label: t('Ends'),
        }]}
        values={{ at, ends }}
        onChange={(handle, value) => {
          if (handle === 'ends') { setEnds(value || null); setEndsError(undefined) } else { setAt(value); setError(undefined) }
        }}
        errors={{ ...(error ? { at: error } : {}), ...(endsError ? { ends: endsError } : {}) }}
        disabled={busy}
      />
      {ends && <Button variant="ghost" size="sm" icon="close" className="-ml-2 mt-1" disabled={busy} onClick={() => { setEnds(null); setEndsError(undefined) }}>{t('Remove End Date')}</Button>}
    </Dialog>
  )
}
