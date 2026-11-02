import {
  events, invalidate, navigate, panelsFor, plural, registry, run, t, useAbility, useConfig,
  useLocation, useManifest, useScreenContext, type Entry, type EntryEditorProps, type EntryPanelProps,
  type FieldContext, type FieldDef,
} from '@letterncms/sdk'
import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  Button, EmptyState, Fields, Icon, IconButton, InspectorPanel, Menu, Page, QueryError,
  Spinner, StatusDot, Tabs, Tooltip, Topbar, confirm, cn, entryActionAvailability,
  fieldControlId, toast, useShortcut, useWideInspector,
} from '@letterncms/ui'
import { useCollection, type CollectionDef } from './useCollection'
import { useEntrySession } from './useEntrySession'
import { resolveEntryFields } from './entryFields'
import { EntryDetails, PublicationDialog } from './EntryDetails'
import { EntryHistory } from './EntryHistory'
import { EntryMoveDialog } from './EntryMoveDialog'

export type { EntryPanelProps } from '@letterncms/sdk'

export default function EntryEditor({ params }: { params: Record<string, string> }) {
  const { collection, summary, isLoading, error } = useCollection(params.collection)
  const isNew = params.id === 'new'
  const entryQuery = useEntryQuery(params.id, isNew)
  const retryLoad = () => {
    void entryQuery.refetch()
    invalidate('collections/get')
  }

  if (isLoading || (!isNew && entryQuery.isLoading)) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: summary?.title ?? '…', to: `/content/${params.collection}` }]} />
        <div className="grid flex-1 place-items-center"><Spinner /></div>
      </div>
    )
  }

  const failure = error ?? entryQuery.error
  const missing = !collection || (!isNew && !entryQuery.data)
  if (missing && failure && !['not_found', 'forbidden'].includes(failure.type)) {
    return (
      <Page crumbs={[{ label: t('Content') }]}>
        <QueryError message={failure.message} onRetry={retryLoad} />
      </Page>
    )
  }
  if (!collection || !summary || (!isNew && !entryQuery.data)) {
    return (
      <Page crumbs={[{ label: t('Content') }]}>
        <EmptyState
          icon="file"
          title={failure?.type === 'forbidden' ? t('Access denied') : t('Entry not found')}
          description={failure?.message ?? t('It may have been deleted.')}
          action={<Button onClick={() => navigate(`/content/${params.collection}`)}>{t('Go Back')}</Button>}
        />
      </Page>
    )
  }

  // Initial data is read once by the session. Background refreshes never replace local edits.
  return (
    <Editor
      key={`${params.collection}:${params.id}`}
      collection={collection}
      initial={isNew ? null : entryQuery.data!}
      can={summary.can}
      loadError={failure?.message}
      retryLoad={retryLoad}
    />
  )
}

function useEntryQuery(id: string, isNew: boolean) {
  return useAbility<Entry>('entries/get', { id }, { enabled: !isNew, refetchOnWindowFocus: false })
}

interface EditorProps {
  collection: CollectionDef
  initial: Entry | null
  can: EntryPanelProps['can']
  loadError?: string
  retryLoad: () => void
}

function Editor({ collection, initial, can, loadError, retryLoad }: EditorProps) {
  const manifest = useManifest()
  const { query } = useLocation()
  const autosave = useConfig<{ autosave: number }>('content').autosave ?? 1200
  const contentLocale = initial?.locale
    ?? (manifest.site.locales.includes(query.locale ?? '') ? query.locale! : manifest.site.defaultLocale)
  const listPath = `/content/${collection.handle}${contentLocale !== manifest.site.defaultLocale ? `?locale=${contentLocale}` : ''}`
  const control = useEntrySession(initial, {
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    authorId: initial ? initial.authorId : manifest.user.id,
    data: initial?.data ?? Object.fromEntries(
      collection.resolvedFields.map((field) => [field.handle, field.default ?? null]),
    ),
  }, collection.handle, contentLocale, autosave, can)
  const editable = control.editable
  const { entry, working, dirty, phase, errors, conflict, update, session } = control
  const actions = entryActionAvailability(can, entry)
  const wide = useWideInspector()
  const [sidebarOpen, setSidebarOpen] = useState(() => wide)
  const [toolHost, setToolHost] = useState<HTMLElement | null>(null)
  const [sending, setSending] = useState(false)
  const panelKey = `cms.entry.panel.${collection.handle}`
  const [selectedPanel, setSelectedPanel] = useState(() => localStorage.getItem(panelKey) || 'details')
  const [publishing, setPublishing] = useState(false)
  const [moving, setMoving] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const retry = useRef<() => Promise<unknown>>(() => control.save())
  const lastSave = useRef<{ publish?: boolean; at?: string }>({})
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const busy = phase === 'saving'

  useScreenContext({
    kind: 'entry',
    icon: collection.icon,
    rightEdge: true,
    data: () => {
      const { entry: saved, working: current, dirty: unsaved } = session.get()
      return { collection: collection.handle, id: saved?.id ?? null, status: saved?.displayStatus ?? 'draft', unsaved, title: current.title, slug: current.slug, url: saved?.uri ?? null, locale: contentLocale, fields: current.data }
    },
    // Someone about to read or change this entry gets it as it stands here.
    flush: async () => {
      const current = session.get()
      if (editable && current.dirty && current.working.title.trim()) await control.save().catch(() => {})
    },
  })
  // Changed by someone working alongside (the assistant): it shows here at once. Unsaved edits are never replaced; saving them reports the conflict.
  useEffect(() => events.on('content.changed', () => {
    const id = session.get().entry?.id
    if (!id) return
    void run<Entry>('entries/get', { id }).then((fresh) => {
      const current = session.get()
      if (current.dirty || current.phase === 'saving' || fresh.version === current.entry?.version) return
      void session.command(async () => fresh)
    }).catch(() => {})
  }), [session])

  const setValue = (handle: string, value: unknown) => {
    update({ data: { ...session.get().working.data, [handle]: value } })
  }
  const attempt = async <T,>(operation: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await operation()
    } catch (error) {
      toast.error(error)
      return undefined
    }
  }
  const save = async (options: { publish?: boolean; at?: string; expectedVersion?: string } = {}) => {
    lastSave.current = options
    retry.current = () => control.save(options)
    return attempt(() => control.save(options))
  }
  // Plugins can await persistence and must receive failures rather than a resolved error.
  const savePanel = async () => {
    lastSave.current = {}
    retry.current = () => control.save()
    try {
      await control.save()
    } catch (error) {
      toast.error(error)
      throw error
    }
  }
  const publish = async (at?: string): Promise<boolean> => {
    if (!actions.publish) return false
    setSending(true)
    const result = await save({ publish: true, ...(at ? { at } : {}) })
    setSending(false)
    if (!result) return false
    toast.success(result.displayStatus === 'scheduled' ? t('Scheduled') : t('Published'))
    return true
  }
  const resolveLocal = () => !session.get().dirty || confirm({
    title: t('Discard unsaved changes?'),
    description: t('Your unsaved edits will be replaced.'),
    confirm: t('Discard changes'),
    danger: true,
  })
  const reload = async () => {
    if (!(await resolveLocal())) return
    control.cancel()
    setReplacing(true)
    retry.current = reload
    await attempt(() => session.command((current) => run<Entry>('entries/get', { id: current.id })))
    setReplacing(false)
  }
  const replace = async (ability: string, input: Record<string, unknown> = {}) => {
    if (!(await resolveLocal())) return
    control.cancel()
    setReplacing(true)
    retry.current = () => replace(ability, input)
    await attempt(() => session.command((current) => run<Entry>(ability, {
      ...(ability === 'entries/restore' ? {} : { id: current.id }),
      ...input,
      expectedVersion: current.version,
    })))
    setReplacing(false)
    invalidate('entries/', 'content/')
  }
  const remove = async () => {
    if (!entry || !actions.delete || !(await confirm({
      title: t('Delete “{title}”?', { title: entry.title }),
      description: t('This permanently deletes the entry and its history.'),
      confirm: t('Delete'),
      danger: true,
    }))) return
    control.cancel()
    retry.current = remove
    await attempt(async () => {
      // Wait for any earlier save, then delete the version it returned.
      await session.command(async (current) => {
        await run('entries/delete', { id: current.id, expectedVersion: current.version })
        return current
      })
      session.reset()
      invalidate('entries/', 'content/')
      navigate(listPath)
    })
  }
  const duplicate = async () => {
    const current = session.get()
    const source = current.entry
    if (!actions.duplicate || !source || current.dirty || current.phase === 'saving') return
    await attempt(async () => {
      const result = await run<Entry>('entries/duplicate', {
        id: source.id,
        expectedVersion: source.version,
      })
      navigate(`/content/${collection.handle}/${result.id}`)
    })
  }
  const move = async (parentId: string | null): Promise<boolean> => {
    if (!actions.move) return false
    control.cancel()
    setReplacing(true)
    retry.current = () => move(parentId)
    try {
      if (session.get().dirty && !(await control.save())) return false
      const result = await session.command((current) => run<Entry>('entries/move', { id: current.id, parentId, expectedVersion: current.version }))
      invalidate('entries/', 'content/')
      return !!result
    } catch (error) {
      toast.error(error)
      return false
    } finally {
      setReplacing(false)
    }
  }
  const keepMine = async () => {
    if (!entry || !conflict) return
    await attempt(async () => {
      const version = conflict.version ?? (await run<Entry>('entries/get', { id: entry.id })).version
      await save({ ...lastSave.current, expectedVersion: version })
    })
  }

  const panelProps: EntryPanelProps = {
    entry, collection, content: working, values: working.data, title: working.title, setValue,
    save: savePanel, reload, editable: editable && !replacing, can, errors,
  }
  const toolbar = panelsFor('entry.toolbar', panelProps)
  useSyncExternalStore(registry.entryActions.subscribe, registry.entryActions.version)
  const entryActions = registry.entryActions.all().filter((action) => action.when?.(panelProps) ?? true).sort((a, b) => (a.order ?? 50) - (b.order ?? 50))
  const sidebarPanels = panelsFor('entry.sidebar', panelProps)
  const bodyPanels = panelsFor('entry.body', panelProps)
  const bodyHandle = collection.body
  const bodyField = collection.resolvedFields.find((field) => field.handle === bodyHandle)
  const placement = resolveEntryFields(
    collection.resolvedFields, bodyHandle, [...sidebarPanels, ...bodyPanels],
  )
  const tabs = [
    { value: 'details', label: collection.singular },
    { value: 'history', label: t('History') },
    ...sidebarPanels.map((panel) => ({ value: panel.id, label: panel.label ?? panel.id })),
  ]
  const active = tabs.some((tab) => tab.value === selectedPanel) ? selectedPanel : 'details'
  const selectPanel = (value: string) => {
    setSelectedPanel(value)
    localStorage.setItem(panelKey, value)
  }
  const toggleSidebar = () => {
    if (!sidebarOpen) selectPanel('details')
    setSidebarOpen(!sidebarOpen)
  }
  const properties = placement.document.filter((field) => !WIDE_FIELDS.includes(field.type))
  const mainFields = placement.document.filter((field) => WIDE_FIELDS.includes(field.type))
  const fieldContext = { entry: entry ?? undefined, collection: collection.handle, locale: contentLocale }
  const restore = async (revisionId: string) => {
    if (!actions.restore || !(await confirm({
      title: t('Restore this version?'),
      description: t('The current saved content stays in history.'),
      confirm: t('Restore'),
    }))) return
    await replace('entries/restore', { revisionId })
  }
  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border pl-3 pr-2">
        <Tabs
          id="entry-sidebar"
          value={active}
          onChange={selectPanel}
          tabs={tabs}
          bordered={false}
          className="h-full min-w-0 flex-1"
        />
        <IconButton icon="close" label={t('Close Panel')} size="xs" onClick={() => setSidebarOpen(false)} />
      </div>
      <div
        role="tabpanel"
        id={`entry-sidebar-${active}-panel`}
        aria-labelledby={`entry-sidebar-${active}`}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {active === 'details' ? (
          <EntryDetails
            props={panelProps}
            working={working}
            fields={bodyField?.type === 'blocks' ? [...placement.document, ...placement.sidebar] : placement.sidebar}
            titleInDetails={bodyField?.type === 'blocks'}
            update={update}
            onPublishing={() => setPublishing(true)}
            onMoving={() => setMoving(true)}
          />
        ) : active === 'history' ? (
          <EntryHistory entry={entry} editable={actions.restore && !busy} onRestore={restore} />
        ) : (
          sidebarPanels.filter((panel) => panel.id === active).map((panel) => (
            <panel.component key={panel.id} {...panelProps} />
          ))
        )}
      </div>
    </div>
  )
  const header = (
    <>
      <Fields
        bare
        fields={[{ handle: 'title', type: 'text', label: t('Title'), component: 'title', placeholder: t('Untitled'), autofocus: !entry,
          onEnter: () => { void save(); focusBody() }, onDown: focusBody }]}
        values={{ title: working.title }}
        onChange={(_, title) => update({ title: title ?? '' })}
        errors={errors}
        disabled={!panelProps.editable}
      />
      {(properties.length > 0 || mainFields.length > 0) && (
        <Properties collection={collection.handle} count={properties.length + mainFields.length}>
          {properties.map((field) => <PropertyRow key={field.handle} field={field} value={working.data[field.handle]} onChange={(value) => setValue(field.handle, value)} error={errors[field.handle]} disabled={!panelProps.editable} context={fieldContext} values={working.data} />)}
          {mainFields.length > 0 && <Fields fields={mainFields} values={working.data} onChange={setValue} errors={errors} disabled={!panelProps.editable} context={fieldContext} className="mt-4 !gap-y-4" />}
        </Properties>
      )}
    </>
  )
  const editorProps: EntryEditorProps | null = bodyField
    ? { ...panelProps, footer: <>{bodyPanels.map((panel) => <panel.component key={panel.id} {...panelProps} />)}</>, bodyField, setTitle: (title) => update({ title }), sidebar, sidebarOpen, setSidebarOpen, toolbar: toolHost, listPath }
    : null
  const workspace = editorProps ? panelsFor('entry.editor', editorProps)[0] : null
  const status = entry?.displayStatus ?? 'draft'
  const live = entry?.status === 'published' && status !== 'scheduled'
  // Saving and publishing queue up, so publishing never has to wait for an autosave.
  const upToDate = live && !dirty && !entry?.hasDraft
  const titleError = !entry && dirty && !working.title.trim()

  useShortcut('mod+s', () => { if (editable) void save() })
  useShortcut('mod+shift+p', () => { if (actions.publish && !upToDate && working.title.trim()) void publish() })
  useShortcut('mod+.', toggleSidebar)
  useEffect(() => {
    const first = Object.keys(errors)[0]
    if (!first) return
    const path = first.replace(/^data\./, '').split('.')
    const handle = path[0]
    const owner = placement.claimed.get(handle)
    if (owner || (bodyField?.type === 'blocks' && (handle === 'title' || placement.document.some((field) => field.handle === handle))) || handle === 'authorId' || handle === 'slug' || placement.sidebar.some((field) => field.handle === handle)) {
      setSidebarOpen(true)
      selectPanel(owner ?? 'details')
    }
    if (placement.document.some((field) => field.handle === handle)) {
      localStorage.setItem(`cms.properties.${collection.handle}`, 'open')
      window.dispatchEvent(new Event('cms.fields.reveal'))
    }
    requestAnimationFrame(() => {
      const node = document.getElementById(fieldControlId({ handle: path.at(-1)! }, path.slice(0, -1)))
        ?? document.getElementById(`f-${handle}`)
        ?? document.querySelector<HTMLElement>(`[data-field="${CSS.escape(handle)}"] input, [data-field="${CSS.escape(handle)}"] textarea, [data-field="${CSS.escape(handle)}"] button`)
      node?.scrollIntoView({ block: 'center' })
      node?.focus()
    })
  }, [errors])

  return (
    <div className="flex h-full flex-col">
      <Topbar
        back={{ to: listPath, label: collection.title }}
        title={working.title || t('Untitled')}
        children={workspace ? <div ref={setToolHost} className="flex shrink-0 items-center gap-0.5" /> : undefined}
        actions={
          <>
            {/* Saving goes without saying on screen; it's still said to a screen reader. */}
            <span role="status" className={cn('mr-1 text-xs', phase === 'error' ? 'text-danger' : 'text-faint', phase !== 'error' && !titleError && !busy && !dirty && 'sr-only')}>
              {phase === 'error' ? t('Couldn’t save')
                : titleError ? t('Add a title to save')
                : busy ? t('Saving…')
                : dirty ? t('Unsaved')
                : entry ? t('Saved') : ''}
            </span>
            {toolbar.map((panel) => <panel.component key={panel.id} {...panelProps} />)}
            <Tooltip content={t('Entry details')} shortcut="mod+.">
              <IconButton icon="sidebar" label={t('Entry details')} title={undefined} active={sidebarOpen} onClick={toggleSidebar} className="[&_svg]:-scale-x-100" />
            </Tooltip>
            {/* One control says where it stands and what's next: the button while there's something to publish, its state when there isn't. */}
            {actions.publish ? (
              upToDate ? (
                <StatusDot status={status} className="h-8 px-2 text-sm" />
              ) : (
                <Button variant="publish" size="md" disabled={!working.title.trim()} loading={sending} onClick={() => { void publish() }}>
                  <span className="max-sm:hidden">{status === 'scheduled' ? t('Publish now') : live ? t('Publish Changes') : t('Publish')}</span>
                  <span className="sm:hidden">{t('Publish')}</span>
                </Button>
              )
            ) : editable && (
              <Button variant="primary" size="md" disabled={!dirty || busy} loading={busy} onClick={() => { void save() }}>
                {t('Save Draft')}
              </Button>
            )}
            <Menu
              trigger={<IconButton icon="more" label={t('More Actions')} />}
              items={[
                ...entryActions.map((action) => ({ label: action.label, icon: action.icon, onSelect: () => action.perform(panelProps) })),
                entry && live && entry.uri ? {
                  label: t('View on Site'), icon: 'external',
                  onSelect: () => { window.open(entry.uri!, '_blank', 'noopener') },
                } : null,
                actions.publish && {
                  label: status === 'scheduled' ? t('Change schedule') : live ? t('Publication date…') : t('Schedule…'),
                  icon: 'calendar',
                  onSelect: () => setPublishing(true),
                },
                entry && actions.duplicate && {
                  label: t('Duplicate'), icon: 'copy', disabled: busy || dirty,
                  description: busy || dirty ? t('Save changes before duplicating') : undefined,
                  onSelect: () => { void duplicate() },
                },
                entry && actions.discard && entry.hasDraft && {
                  label: t('Discard Unpublished Changes'), icon: 'undo',
                  onSelect: () => { void replace('entries/discard-draft') },
                },
                entry && actions.unpublish && {
                  label: t('Unpublish'), icon: 'eye-off',
                  onSelect: () => { void replace('entries/unpublish') },
                },
                entry && actions.delete && { label: t('Delete'), icon: 'trash', danger: true, onSelect: remove },
              ]}
            />
          </>
        }
      />
      {loadError && <QueryError message={loadError} onRetry={retryLoad} compact />}
      {placement.error && (
        <div role="alert" className="border-b border-danger/20 p-3 text-sm text-danger">{placement.error}</div>
      )}
      {control.error && (
        <SaveFeedback
          message={control.error.message}
          conflict={!!conflict}
          dirty={dirty}
          onReload={reload}
          onKeepMine={keepMine}
          onRetry={() => { void attempt(retry.current) }}
        />
      )}
      {workspace && editorProps ? (
        <div className="min-h-0 flex-1"><Suspense fallback={<div className="grid h-full place-items-center"><Spinner /></div>}><workspace.component {...editorProps} /></Suspense></div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto">
            <article className="mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16">
              {header}
              {bodyField?.type === 'blocks' ? <EmptyState icon="blocks" title={t('Block editor unavailable')} /> : bodyField && (
                <div className="mt-8" data-cms-body><Fields bare fields={[bodyField]} values={working.data} onChange={setValue} errors={errors} disabled={!panelProps.editable} context={{ ...fieldContext, title: working.title }} /></div>
              )}
              {bodyPanels.map((panel) => <panel.component key={panel.id} {...panelProps} />)}
            </article>
          </div>
          <InspectorPanel open={sidebarOpen} onOpenChange={setSidebarOpen} title={collection.singular}>{sidebar}</InspectorPanel>
        </div>
      )}
      {publishing && (
        <PublicationDialog
          entry={entry}
          busy={busy}
          onClose={() => setPublishing(false)}
          onPublish={(at) => publish(at)}
        />
      )}
    {moving && entry && <EntryMoveDialog entry={entry} collection={collection} busy={busy || replacing} onClose={() => setMoving(false)} onMove={move} />}
    </div>
  )
}

interface SaveFeedbackProps {
  message: string
  conflict: boolean
  dirty: boolean
  onReload: () => Promise<void>
  onKeepMine: () => Promise<void>
  onRetry: () => void
}

function SaveFeedback({ message, conflict, dirty, onReload, onKeepMine, onRetry }: SaveFeedbackProps) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-2 border-b border-warning/30 bg-warning/8 px-4 py-2 text-sm">
      <Icon name="warning" size={15} />
      <span className="min-w-0 flex-1">{message}</span>
      {conflict ? (
        <>
          <Button size="xs" onClick={onReload}>{t('Load Their Version')}</Button>
          {dirty && <Button size="xs" onClick={onKeepMine}>{t('Keep Mine')}</Button>}
        </>
      ) : <Button size="xs" onClick={onRetry}>{t('Retry')}</Button>}
    </div>
  )
}

/** Into the first editable spot of the body (the title's Enter and ↓). */
function focusBody() {
  const target = (
    document.querySelector('[data-cms-body] [contenteditable="true"], [data-cms-body] textarea, [data-cms-body] input')
    ?? document.querySelector('[data-cms-fields] input, [data-cms-fields] textarea')
  ) as HTMLElement | null
  target?.focus()
}

interface PropertiesProps {
  collection: string
  count: number
  children: ReactNode
}

/** The entry's fields under the title; folded away on request (remembered per collection). */
function Properties({ collection, count, children }: PropertiesProps) {
  const key = `cms.properties.${collection}`
  const [open, setOpen] = useState(() => localStorage.getItem(key) !== 'closed')
  const toggle = () => {
    localStorage.setItem(key, open ? 'closed' : 'open')
    setOpen(!open)
  }
  useEffect(() => {
    const reveal = () => setOpen(true)
    window.addEventListener('cms.fields.reveal', reveal)
    return () => window.removeEventListener('cms.fields.reveal', reveal)
  }, [])

  return (
    <div className="mt-6" data-cms-fields={open ? '' : undefined}>
      {open && <div className="space-y-px">{children}</div>}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="-ml-1.5 mt-2 flex h-7 items-center gap-1.5 rounded-xs px-1.5 text-xs text-faint transition-colors hover:bg-hover hover:text-muted"
      >
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
        {open ? t('Hide Properties') : plural(count, '{count} property', '{count} properties')}
      </button>
    </div>
  )
}

const WIDE_FIELDS = ['repeater', 'blocks', 'richtext', 'markdown', 'json', 'group', 'code', 'fields', 'table', 'grid']

interface PropertyRowProps {
  field: FieldDef
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
  context: FieldContext
  values: Record<string, any>
}

/** One property: its label, and its value drawn small. */
function PropertyRow({ field, value, onChange, error, disabled, context, values }: PropertyRowProps) {
  return (
    <div className="grid grid-cols-[148px_minmax(0,1fr)] items-start gap-3 py-0.5">
      <div className="flex h-8 items-center truncate text-sm text-muted" title={field.instructions ?? field.label}>
        {field.label}
      </div>
      <div className="min-w-0">
        <Fields
          bare
          fields={[{
            ...field, width: 'full', size: field.size ?? 'sm',
            rows: field.type === 'textarea' ? (field.rows ?? 2) : field.rows,
          }]}
          values={{ ...values, [field.handle]: value }}
          onChange={(_, next) => onChange(next)}
          errors={error ? { [field.handle]: error } : {}}
          disabled={disabled}
          context={context}
        />
      </div>
    </div>
  )
}
