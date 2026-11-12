import {
  CmsError, events, invalidate, navigate, panelsFor, plural, registry, run, t, useAbility, useConfig,
  useLocation, useManifest, useScreenContext, type Entry, type EntryEditorProps, type EntryPanelProps,
  type FieldContext, type FieldDef,
} from '@letterncms/sdk'
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  Button, EmptyState, Fields, Icon, IconButton, InspectorPanel, Menu, PanelHeader, NotFoundState, Notice, Page, QueryError,
  ScreenSidebar, SharedMark, Spinner, StatusDot, Tabs, statusLabel, Tooltip, Topbar, confirm, cn, entryActionAvailability,
  copyText, fieldControlId, toast, useShortcut, useWideInspector,
} from '@letterncms/ui'
import { useCollection, withBlueprint, type CollectionDef } from './useCollection'
import { useEntrySession } from './useEntrySession'
import { resolveEntryFields } from './entryFields'
import { EntryDetails, PublicationDialog } from './EntryDetails'
import { EntryHistory } from './EntryHistory'
import { EntryMoveDialog } from './EntryMoveDialog'
import NewEntry from './NewEntry'


export default function EntryEditor({ params }: { params: Record<string, string> }) {
  const { collection: defined, summary, isLoading, error } = useCollection(params.collection)
  const isNew = params.id === 'new'
  const entryQuery = useEntryQuery(params.id, isNew)
  const manifest = useManifest()
  const { query } = useLocation()
  // An entry has the fields of the blueprint it was made with; a new one, of the kind chosen for it (?blueprint=).
  const blueprint = isNew ? (defined?.resolvedBlueprints?.some((b) => b.handle === query.blueprint) ? query.blueprint! : null) : entryQuery.data?.blueprint ?? null
  // Wherever New was pressed (the list, / in a thread, a widget): with several kinds and none chosen yet, that is asked first.
  const asks = isNew && !!defined?.resolvedBlueprints?.length && query.blueprint === undefined
  // On a translation, the fields that hold one value for every language are the original's: shown, not changed here.
  const shared = entryQuery.data?.sharedFields
  const origin = Object.entries(entryQuery.data?.translations ?? {}).find(([, id]) => id === entryQuery.data?.originId)?.[0] ?? manifest.site.defaultLocale
  const collection = useMemo(() => {
    const own = defined && withBlueprint(defined, blueprint)
    return own && shared?.length ? { ...own, resolvedFields: own.resolvedFields.map((field) => shared.includes(field.handle) ? { ...field, readOnly: true, shared: origin } : field) } : own
  }, [defined, blueprint, shared?.join(','), origin])
  const list = listOf(manifest, params.collection, entryQuery.data?.locale ?? query.locale)
  const retryLoad = () => {
    void entryQuery.refetch()
    invalidate('collections/get')
  }
  // An editor with a workspace of its own (the builder) holds the sidebar from the first frame, so nothing slides away once it has loaded.
  const bodyField = collection?.resolvedFields.find((field) => field.handle === collection.body)
  const holds = !!bodyField && panelsFor('entry.editor', { bodyField } as EntryEditorProps).length > 0
  const hold = holds && <ScreenSidebar title={t('Outline||structure')} backTo={list.path} backLabel={list.label}>{null}</ScreenSidebar>

  if (isLoading || (!isNew && entryQuery.isLoading)) {
    return (
      <div className="flex h-full flex-col">
        {hold}
        <Topbar back={{ to: list.path, label: list.label }} />
        <div className="grid flex-1 place-items-center"><Spinner /></div>
      </div>
    )
  }

  const failure = error ?? entryQuery.error
  const missing = !collection || (!isNew && !entryQuery.data)
  // Where it would be: its list, then what isn't there. An address that can't be an entry's (the
  // server finds the id malformed) is simply not there too: no validation message.
  const listed = manifest.collections.find((c) => c.handle === (list.within?.handle ?? params.collection))
  const crumbs = [...(listed ? [{ label: listed.title, to: list.path, icon: listed.icon }] : []), { label: t('Not Found') }]
  if (missing && failure && !['not_found', 'forbidden', 'invalid_input'].includes(failure.type)) {
    return (
      <Page crumbs={listed ? crumbs.slice(0, 1) : []}>
        <QueryError message={failure.message} onRetry={retryLoad} />
      </Page>
    )
  }
  if (!collection || !summary || (!isNew && !entryQuery.data)) {
    const back = listed && <Button onClick={() => navigate(list.path)}>{t('Back to {label}', { label: listed.title })}</Button>
    return (
      <Page crumbs={crumbs}>
        {failure?.type === 'forbidden'
          ? <><QueryError title={t('Access denied')} message={failure.message} />{back && <div className="mt-4">{back}</div>}</>
          : <NotFoundState icon={listed?.icon ?? 'file'} action={back} />}
      </Page>
    )
  }

  if (asks) {
    return (
      <>
        <Topbar back={{ to: list.path, label: list.label }} />
        <NewEntry
          props={{ collection: collection.handle, locale: query.locale, title: summary.newLabel, kinds: [{ handle: '', title: summary.singular }, ...collection.resolvedBlueprints!.map((b) => ({ handle: b.handle, title: b.title }))] }}
          close={() => navigate(list.path)}
          disabled={false} onAction={() => {}} scope={{}}
        />
      </>
    )
  }

  // Initial data is read once by the session. Background refreshes never replace local edits.
  return (
    <>
      {hold}
      <Editor
        key={`${params.collection}:${params.id}:${blueprint ?? ''}`}
        collection={collection}
        blueprint={blueprint}
        initial={isNew ? null : entryQuery.data!}
        can={summary.can}
      />
    </>
  )
}

/** Where the way back from an entry goes: its list, or the site's pages for a built-in page (they're listed there). */
function listOf(manifest: ReturnType<typeof useManifest>, handle: string, locale?: string) {
  const summary = manifest.collections.find((c) => c.handle === handle)
  const within = manifest.collections.find((c) => c.handle === summary?.within)
  const shown = within ?? summary
  const other = locale && locale !== manifest.site.defaultLocale && manifest.site.locales.includes(locale)
  // A built-in page goes back to its feature's tab; the site's pages keep their language.
  const query = summary?.tab ? `?tab=${summary.tab}` : other ? `?locale=${locale}` : ''
  return { path: `/content/${shown?.handle ?? handle}${query}`, label: shown?.title ?? '', within }
}

function useEntryQuery(id: string, skip: boolean) {
  return useAbility<Entry>('entries/get', { id }, { enabled: !skip, refetchOnWindowFocus: false })
}

interface EditorProps {
  collection: CollectionDef
  /** The blueprint a new entry is made with; an existing one has its own. */
  blueprint: string | null
  initial: Entry | null
  can: EntryPanelProps['can']
}

// A background refresh that fails while the entry is open changes nothing here: what is on view is the session's.
function Editor({ collection, blueprint, initial, can }: EditorProps) {
  const manifest = useManifest()
  const { query } = useLocation()
  const autosave = useConfig<{ autosave: number }>('content').autosave ?? 1200
  const contentLocale = initial?.locale
    ?? (manifest.site.locales.includes(query.locale ?? '') ? query.locale! : manifest.site.defaultLocale)
  // Built-in pages are listed with the site's pages: that is where the way back goes, and what they're called.
  const list = listOf(manifest, collection.handle, contentLocale)
  const listPath = list.path
  // In the person's language: the manifest's names are translated, the definition's are as written.
  const singular = list.within?.singular ?? manifest.collections.find((c) => c.handle === collection.handle)?.singular ?? collection.singular
  const shownCollection = useMemo(() => ({ ...collection, singular }), [collection, singular])
  // Someone else holds the entry (a panel says so through `hold`): read-only here, and nothing is saved, until that ends.
  const [held, setHeld] = useState(false)
  const control = useEntrySession(initial, {
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    authorId: initial ? initial.authorId : manifest.user.id,
    data: initial?.data ?? Object.fromEntries(
      collection.resolvedFields.map((field) => [field.handle, field.default ?? null]),
    ),
  }, collection.handle, contentLocale, autosave, can, held, blueprint)
  const editable = control.editable
  const { entry, working, dirty, phase, errors, conflict, update, session } = control
  // A built-in page (listed with the site's pages) is one of a kind: it is never copied.
  const builtin = !!useManifest().collections.find((c) => c.handle === collection.handle)?.within
  const actions = { ...entryActionAvailability(can, entry), ...(builtin ? { duplicate: false } : {}) }
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
  const lastSave = useRef<{ publish?: boolean; at?: string; expiresAt?: string | null }>({})
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
  // A failed save says so under the bar (SaveFeedback), not in a toast as well.
  const save = async (options: { publish?: boolean; at?: string; expiresAt?: string | null; expectedVersion?: string } = {}) => {
    lastSave.current = options
    retry.current = () => control.save(options)
    try {
      return await control.save(options)
    } catch {
      return undefined
    }
  }
  // Plugins can await persistence and must receive failures rather than a resolved error.
  const savePanel = async () => {
    lastSave.current = {}
    retry.current = () => control.save()
    await control.save()
  }
  const publish = async (at?: string, expiresAt?: string | null): Promise<boolean> => {
    if (!actions.publish) return false
    setSending(true)
    const result = await save({ publish: true, ...(at ? { at } : {}), ...(expiresAt !== undefined ? { expiresAt } : {}) })
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
      ...(ability === 'revisions/restore' ? {} : { id: current.id }),
      ...input,
      expectedVersion: current.version,
    })))
    setReplacing(false)
    invalidate('entries/', 'revisions/', 'content/')
  }
  // Both lose something for good or take the page off the site: each says what, and runs only once agreed to.
  const discard = async () => {
    if (!entry || !(await confirm({
      title: t('Discard unpublished changes to “{title}”?', { title: entry.title }),
      description: t('Every change since it was last published is lost. The published version stays as it is.'),
      confirm: t('Discard Changes'),
      danger: true,
    }))) return
    await replace('entries/discard-draft')
  }
  const unpublish = async () => {
    if (!entry || !(await confirm({
      title: t('Unpublish “{title}”?', { title: entry.title }),
      description: t('It leaves the site and its address stops working until it is published again. Its content is kept as a draft.'),
      confirm: t('Unpublish'),
      danger: true,
    }))) return
    await replace('entries/unpublish')
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
      invalidate('entries/', 'revisions/', 'content/')
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
      invalidate('entries/', 'revisions/', 'content/')
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
    entry, collection: shownCollection, content: working, values: working.data, title: working.title, setValue,
    save: savePanel, reload, editable: editable && !replacing, can, errors, hold: setHeld,
  }
  const toolbar = panelsFor('entry.toolbar', panelProps)
  const notices = panelsFor('entry.notice', panelProps)
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
    { value: 'details', label: singular, icon: collection.icon || 'file' },
    { value: 'history', label: t('History'), icon: 'history' },
    ...sidebarPanels.map((panel) => ({ value: panel.id, label: panel.label ?? panel.id, icon: panel.icon })),
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
  const fieldContext = { entry: entry ?? undefined, collection: collection.handle, blueprint: collection.blueprint, locale: contentLocale }
  // The version's dialog showed what changes and asked: nothing more to confirm here.
  const restore = async (revisionId: string) => {
    if (actions.restore) await replace('revisions/restore', { revisionId })
  }
  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <PanelHeader onClose={() => setSidebarOpen(false)}>
        <Tabs
          id="entry-sidebar"
          value={active}
          onChange={selectPanel}
          tabs={tabs}
          bordered={false}
          fit
          className="h-full min-w-0 flex-1"
        />
      </PanelHeader>
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
          />
        ) : active === 'history' ? (
          <EntryHistory entry={entry} working={working} fields={collection.resolvedFields} editable={actions.restore && !busy} onRestore={restore} />
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
    ? { ...panelProps, footer: <>{bodyPanels.map((panel) => <panel.component key={panel.id} {...panelProps} />)}</>, bodyField, setTitle: (title) => update({ title }), sidebar, sidebarOpen, setSidebarOpen, toolbar: toolHost, listPath, listLabel: list.label }
    : null
  const workspace = editorProps ? panelsFor('entry.editor', editorProps)[0] : null
  const status = entry?.displayStatus ?? 'draft'
  const live = entry?.status === 'published' && status !== 'scheduled' && status !== 'expired'
  // Saving and publishing queue up, so publishing never has to wait for an autosave.
  const upToDate = live && !dirty && !entry?.hasDraft
  const titleError = !entry && dirty && !working.title.trim()
  const shownTitle = working.title || t('Untitled')
  const saveText = phase === 'error' ? t('Couldn’t save')
    : titleError ? t('Add a title to save')
    : busy ? t('Saving…')
    : dirty ? t('Unsaved')
    : entry ? t('Saved') : ''
  // Always the same footprint: a dot while there is something to save, red when it couldn't be.
  const saveState = (
    <span aria-hidden="true" title={saveText || undefined} className={cn('block size-1.5 rounded-full',
      phase === 'error' || titleError ? 'bg-danger' : busy || dirty ? 'bg-faint' : 'bg-transparent')} />
  )

  const failed = phase === 'error' || titleError
  // The title with its dot; what went wrong is said in words, since a dot's tooltip needs a pointer.
  const titled = (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{shownTitle}</span>
      {saveState}
      {failed && <span className="shrink-0 text-xs font-normal text-danger">{saveText}</span>}
    </span>
  )

  // Said by name, so `?` lists them: each only while it would do something for this person.
  useShortcut('mod+s', () => { if (editable) void save() }, true, editable ? t('Save') : undefined)
  useShortcut('mod+shift+p', () => { if (actions.publish && !held && !upToDate && working.title.trim()) void publish() }, true, actions.publish && !held ? t('Publish') : undefined)
  useShortcut('mod+.', toggleSidebar, true, t('{name} Details', { name: singular }))
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
    <div className="relative flex h-full flex-col">
      <Topbar
        // A phone's bar has no room for the chat's toggle beside the tools: it is first in More Actions there.
        className="max-sm:[&_[data-workspace-toggle]]:hidden"
        back={{ to: listPath, label: list.label }}
        title={titled}
        children={<>
          {/* Narrow windows have no room in the middle: the title leads the bar instead (a phone has only room for where it stands). */}
          <span className="min-w-0 text-sm font-medium text-ink max-sm:hidden lg:hidden">{titled}</span>
          {workspace && <div ref={setToolHost} className="flex shrink-0 items-center gap-0.5 empty:hidden" />}
        </>}
        actions={
          <>
            {/* Saving goes without saying; its dot beside the title, which never moves anything, says how it stands. A screen reader hears it. */}
            <span role="status" className="sr-only">{saveText}</span>
            {toolbar.map((panel) => <panel.component key={panel.id} {...panelProps} />)}
            <Tooltip content={t('{name} Details', { name: singular })} shortcut="mod+.">
              <IconButton icon="sidebar" label={t('{name} Details', { name: singular })} title={undefined} active={sidebarOpen} onClick={toggleSidebar} className="[&_svg]:-scale-x-100" />
            </Tooltip>
            {/* One control says where it stands and what's next: the button while there's something to publish, its state when there isn't. */}
            {actions.publish ? (
              upToDate ? (
                // Where it stands is also the way to what publishing offers next: the date it went live, taking it off the site.
                <Menu
                  trigger={<Button variant="ghost" className="!gap-1 !px-1.5 !font-normal"><StatusDot status={status} label={statusLabel(status)} className="text-sm" /><Icon name="chevron-down" size={12} className="shrink-0 text-faint" /></Button>}
                  items={[
                    { label: t('Publication Date…'), icon: 'calendar', onSelect: () => setPublishing(true) },
                    entry && actions.unpublish && { label: t('Unpublish'), icon: 'eye-off', onSelect: () => { void unpublish() } },
                  ]}
                />
              ) : (
                <Button variant="publish" disabled={!working.title.trim() || held} loading={sending} onClick={() => { void publish() }}>
                  <span className="max-sm:hidden">{status === 'scheduled' ? t('Publish Now') : live ? t('Publish Changes') : t('Publish')}</span>
                  <span className="sm:hidden">{t('Publish')}</span>
                </Button>
              )
            ) : editable && (
              <Button variant="primary" disabled={!dirty || busy} loading={busy} onClick={() => { void save() }}>
                {t('Save Draft')}
              </Button>
            )}
            <Menu
              trigger={<IconButton icon="more" label={t('More Actions')} />}
              items={[
                ...entryActions.map((action) => ({ label: action.label, icon: action.icon, onSelect: () => action.perform(panelProps) })),
                // What the site shows is this version: see it there (a preview stands in while there are changes).
                entry && live && entry.uri && !entry.hasDraft ? {
                  label: t('View on Site'), icon: 'external',
                  onSelect: () => { window.open(entry.uri!, '_blank', 'noopener') },
                } : null,
                // With nothing left to publish these two are in the status's own menu, in the bar.
                actions.publish && !upToDate && {
                  label: status === 'scheduled' ? t('Change Schedule') : live ? t('Publication Date…') : t('Schedule…'),
                  icon: 'calendar',
                  onSelect: () => setPublishing(true),
                },
                entry && actions.move && collection.structure === 'tree' && {
                  label: t('Move…'), icon: 'arrow-right',
                  onSelect: () => setMoving(true),
                },
                entry && actions.duplicate && {
                  label: t('Duplicate'), icon: 'copy', disabled: busy || dirty,
                  description: busy || dirty ? t('Save changes before duplicating') : undefined,
                  onSelect: () => { void duplicate() },
                },
                entry && actions.discard && entry.hasDraft && {
                  label: t('Discard Unpublished Changes'), icon: 'undo',
                  onSelect: () => { void discard() },
                },
                entry && actions.unpublish && !(actions.publish && upToDate) && {
                  label: t('Unpublish'), icon: 'eye-off',
                  onSelect: () => { void unpublish() },
                },
                // What agents, the API and URLs know the entry by: copied whole, where Info could only show its start.
                entry && { label: t('Copy ID'), icon: 'hash', onSelect: () => void copyText(entry.id, { copied: t('ID copied') }) },
                entry && actions.delete && { separator: true, label: '' },
                entry && actions.delete && { label: t('Delete'), icon: 'trash', danger: true, onSelect: remove },
              ]}
            />
          </>
        }
      />
      {/* A phone's bar holds the tools; what is being edited and how its saving stands is the line under it. */}
      <div className="flex h-8 shrink-0 items-center gap-3 border-b border-border px-4 sm:hidden">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{shownTitle}</span>
        <span aria-hidden="true" className={cn('shrink-0 text-xs', failed ? 'text-danger' : 'text-faint')}>{saveText}</span>
      </div>
      {placement.error && (
        <Notice tone="danger" className="m-3">{placement.error}</Notice>
      )}
      {notices.map((panel) => <panel.component key={panel.id} {...panelProps} />)}
      {workspace && editorProps ? (
        <div className="min-h-0 flex-1"><Suspense fallback={<div className="grid h-full place-items-center"><Spinner /></div>}><workspace.component {...editorProps} /></Suspense></div>
      ) : (
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-y-auto">
            <article className="mx-auto w-full max-w-[784px] px-6 pb-24 pt-12 md:px-8 md:pt-16">
              {header}
              {bodyField?.type === 'blocks' ? <EmptyState icon="blocks" title={t('Block editor unavailable')} /> : bodyField && (
                <div className="mt-8" data-cms-body>
                  {/* The body has no label to carry the mark: it stands above it. */}
                  {typeof bodyField.shared === 'string' && <SharedMark from={bodyField.shared} className="mb-2" />}
                  <Fields bare fields={[bodyField]} values={working.data} onChange={setValue} errors={errors} disabled={!panelProps.editable} context={{ ...fieldContext, title: working.title }} />
                </div>
              )}
              {bodyPanels.map((panel) => <panel.component key={panel.id} {...panelProps} />)}
            </article>
          </div>
          <InspectorPanel open={sidebarOpen} onOpenChange={setSidebarOpen} title={singular}>{sidebar}</InspectorPanel>
        </div>
      )}
      {publishing && (
        <PublicationDialog
          entry={entry}
          changes={dirty || !!entry?.hasDraft}
          busy={busy}
          onClose={() => setPublishing(false)}
          onPublish={(at, expiresAt) => publish(at, expiresAt)}
        />
      )}
    {moving && entry && <EntryMoveDialog entry={entry} collection={shownCollection} busy={busy || replacing} onClose={() => setMoving(false)} onMove={move} />}
      {/* Over the top of the canvas, under the bar: it pushes nothing down. */}
      {control.error && phase === 'error' && (
        <SaveFeedback
          error={control.error}
          conflict={!!conflict}
          dirty={dirty}
          onReload={reload}
          onKeepMine={keepMine}
          onRetry={() => { void retry.current().catch(() => {}) }}
        />
      )}
    </div>
  )
}

interface SaveFeedbackProps {
  error: Error & { type?: string; status?: number }
  conflict: boolean
  dirty: boolean
  onReload: () => Promise<void>
  onKeepMine: () => Promise<void>
  onRetry: () => void
}

/**
 * Why the last save didn't go through, in words for people, with the way forward. A float under
 * the top bar, so the page doesn't move. The CMS's own messages are written for people; anything
 * else (the browser's "Failed to fetch") means the request never arrived.
 */
function SaveFeedback({ error, conflict, dirty, onReload, onKeepMine, onRetry }: SaveFeedbackProps) {
  const ours = error instanceof CmsError && error.status > 0
  const message = conflict ? error.message
    : ours && error.type === 'invalid_input' ? t('Couldn’t save. Check the highlighted fields.')
    : ours ? t('Couldn’t save. {reason}', { reason: error.message })
    : t('Couldn’t save. Check your connection.')
  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-sticky flex justify-center px-4 max-sm:top-[5.5rem]">
      <div role="alert" className="pointer-events-auto flex min-h-10 max-w-[560px] items-center gap-2.5 rounded-lg border border-border-float bg-float py-1.5 pl-3 pr-1.5 text-sm text-text shadow-pop">
        <Icon name="warning" size={16} className="shrink-0 text-danger" />
        <span className="min-w-0 flex-1">{message}</span>
        {conflict ? (
          <>
            <Button size="xs" variant="ghost" onClick={onReload}>{t('Load Their Version')}</Button>
            {dirty && <Button size="xs" variant="ghost" onClick={onKeepMine}>{t('Keep Mine')}</Button>}
          </>
        ) : error.type !== 'invalid_input' && <Button size="xs" variant="ghost" onClick={onRetry}>{t('Try Again')}</Button>}
      </div>
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
      <Button variant="ghost" onClick={toggle} aria-expanded={open} className="-ml-1.5 mt-2 !gap-1.5 !rounded-xs !px-1.5 !text-xs !font-normal !text-faint hover:!text-muted">
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={12} />
        {open ? t('Hide Properties') : plural(count, '{count} property', '{count} properties')}
      </Button>
    </div>
  )
}

/** Fields that are a part of the document under the properties, not a property: a short textarea, media, tags or entries stay properties, drawn small. */
const WIDE_FIELDS = ['repeater', 'blocks', 'richtext', 'markdown', 'json', 'group', 'code', 'fields']

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
      <div className="flex h-8 min-w-0 items-center gap-1.5 text-sm text-muted" title={field.instructions ?? field.label}>
        <span className="truncate">{field.label}</span>
        {typeof field.shared === 'string' && <SharedMark from={field.shared} />}
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
