import { locale, t, useAbility, useManifest, type Entry, type EntryContent, type EntryPanelProps, type EntrySummary, type FieldDef } from '@letterncms/sdk'
import { Button, Dialog, Field, Fields, PersonPicker, QueryError, StatusDot, entryActionAvailability, slugify } from '@letterncms/ui'
import { useState } from 'react'

interface EntryDetailsProps {
  props: EntryPanelProps
  working: EntryContent
  fields: FieldDef[]
  titleInDetails?: boolean
  update: (patch: Partial<EntryContent>) => void
  onPublishing: () => void
  onMoving: () => void
}

export function previewUri(collection: EntryPanelProps['collection'], entry: Entry | null, slug: string): string {
  if (entry?.uri) return entry.uri === '/' ? '/' : entry.uri.replace(/[^/]+$/, slug || entry.slug)
  return (collection.route ?? '/{slug}')
    .replace('{parent_uri}/', '')
    .replace('{slug}', slug || '…')
    .replace(/\{[a-z_]+\}/g, '…')
    .replace(/\/+/g, '/')
}

export function EntryDetails({ props, working, fields, titleInDetails, update, onPublishing, onMoving }: EntryDetailsProps) {
  const { entry, collection, editable, errors } = props
  const manifest = useManifest()
  const actions = entryActionAvailability(props.can, entry)
  const parent = useAbility<EntrySummary[]>('entries/lookup', { ids: entry?.parentId ? [entry.parentId] : [] }, { enabled: !!entry?.parentId })
  const date = (value: string | null | undefined) => value
    ? new Intl.DateTimeFormat(locale(), {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: manifest.site.timezone,
      }).format(new Date(value))
    : t('Unknown')
  const sectionOf = (field: FieldDef) => field.section === 'sidebar' ? 'main' : field.section ?? 'main'
  const groups = [...new Set(fields.map(sectionOf))]
  const status = entry?.displayStatus ?? 'draft'
  const statusLabels = {
    draft: 'Draft',
    changed: 'Changes',
    published: 'Published',
    scheduled: 'Scheduled',
  }

  return (
    <div className="space-y-5 p-4">
      <section className="space-y-3">
        <div className="cms-caps">{t('Identity')}</div>
        <Fields
          fields={[
            ...(titleInDetails ? [{ handle: 'title', type: 'text', label: t('Title') }] : []),
            collection.route
              ? { handle: 'slug', type: 'slug', label: t('URL'), component: 'uri', uri: previewUri(collection, entry, working.slug) }
              : { handle: 'slug', type: 'text', label: t('Handle'), mono: true, max: 180 },
          ]}
          values={{ title: working.title, slug: working.slug || slugify(working.title) }}
          onChange={(handle, value) => update({ [handle]: value ?? '' })}
          errors={errors}
          disabled={!editable}
        />
        <Field label={t('Author')} htmlFor="f-authorId" error={errors.authorId}>
          <PersonPicker
            id="f-authorId"
            aria-describedby={errors.authorId ? 'f-authorId-error' : undefined}
            value={working.authorId ? [working.authorId] : []}
            max={1}
            disabled={!editable}
            label={t('Assign author')}
            onChange={(ids) => update({ authorId: ids[0] ?? null })}
          />
        </Field>
      </section>

      {groups.map((group) => (
        <section key={group} className="space-y-3 border-t border-border pt-4">
          <div className="cms-caps">
            {group === 'main' || group === 'sidebar' ? t('Properties') : group.replace(/[_-]/g, ' ')}
          </div>
          <Fields
            fields={fields
              .filter((field) => sectionOf(field) === group)
              .map((field) => ({ ...field, width: 'full' }))}
            values={working.data}
            onChange={props.setValue}
            errors={errors}
            disabled={!editable}
            context={{
              entry: entry ?? undefined,
              collection: collection.handle,
              locale: entry?.locale ?? manifest.site.defaultLocale,
            }}
          />
        </section>
      ))}

      <section className="space-y-3 border-t border-border pt-4">
        <div className="cms-caps">{t('Publishing')}</div>
        <div className="grid justify-items-start gap-2">
          <StatusDot status={status} label={t(statusLabels[status])} />
          {entry?.publishedAt && <time dateTime={entry.publishedAt} className="text-xs leading-5 text-muted">{date(entry.publishedAt)} · {manifest.site.timezone}</time>}
          {actions.publish && <Button size="xs" disabled={!working.title.trim()} onClick={onPublishing}>{entry?.displayStatus === 'scheduled' ? t('Change schedule') : t('Publication date…')}</Button>}
        </div>
        {entry?.hasDraft && (
          <p className="m-0 text-xs text-muted">
            {t('Unpublished changes are saved separately from the published version.')}
          </p>
        )}

      </section>

      <section className="space-y-2 border-t border-border pt-4">
        <div className="cms-caps">{t('Record')}</div>
        {entry && collection.structure === 'tree' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted">{t('Parent')}</span>
            <span className="min-w-0 flex-1 truncate">{entry.parentId ? parent.data?.[0]?.title ?? (parent.isLoading ? t('Loading…') : parent.isError ? t('Unknown') : t('Unavailable parent')) : t('Root')}</span>
            {actions.move && <Button size="xs" onClick={onMoving}>{t('Move')}</Button>}
          </div>
        )}
        {entry?.parentId && parent.isError && <QueryError message={parent.error.message} onRetry={() => void parent.refetch()} compact />}
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
          <dt className="text-muted">{t('Collection')}</dt>
          <dd className="m-0 break-words">{collection.title}</dd>
          <dt className="text-muted">{t('Language')}</dt>
          <dd className="m-0">{entry?.locale ?? manifest.site.defaultLocale}</dd>
          <dt className="text-muted">{t('Created')}</dt>
          <dd className="m-0">{date(entry?.createdAt)}</dd>
          <dt className="text-muted">{t('Updated')}</dt>
          <dd className="m-0">{date(entry?.updatedAt)}</dd>
          {entry && (
            <>
              <dt className="text-muted">{t('ID')}</dt>
              <dd className="m-0 break-all font-mono text-faint">{entry.id}</dd>
            </>
          )}
        </dl>
      </section>
    </div>
  )
}

interface PublicationDialogProps {
  entry: Entry | null
  busy: boolean
  onClose: () => void
  onPublish: (at: string) => Promise<boolean>
}

export function PublicationDialog({ entry, busy, onClose, onPublish }: PublicationDialogProps) {
  const manifest = useManifest()
  const [at, setAt] = useState<string | null>(entry?.publishedAt ?? null)
  const [error, setError] = useState<string | undefined>()
  const live = entry?.status === 'published' && entry.displayStatus !== 'scheduled'
  const future = !!at && new Date(at).getTime() > Date.now()

  const submit = async () => {
    if (!at || !Number.isFinite(new Date(at).getTime())) {
      setError(t('Choose a publication date and time.'))
      return
    }
    if (live && future) {
      setError(t('Unpublish this entry before scheduling it for a future date.'))
      return
    }
    if (await onPublish(at)) onClose()
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !busy && onClose()}
      title={t('Publication date')}
      description={live
        ? t('Publish changes immediately. Future scheduling is available for unpublished entries.')
        : t('Choose when this saved version becomes public.')}
      footer={
        <>
          <Button disabled={busy} onClick={onClose}>{t('Cancel')}</Button>
          <Button variant="publish" loading={busy} onClick={submit}>
            {future && !live ? t('Schedule') : t('Publish')}
          </Button>
        </>
      }
    >
      <Fields
        fields={[{
          handle: 'at', type: 'date', time: true, timezone: manifest.site.timezone,
          label: t('Date and time'), required: true,
        }]}
        values={{ at }}
        onChange={(_, value) => { setAt(value); setError(undefined) }}
        errors={error ? { at: error } : {}}
        disabled={busy}
      />
    </Dialog>
  )
}
