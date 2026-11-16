import { Stylesheet } from '@letterncms/blocks'
import { can, invalidate, run, setQuery, t, useAbility, useLocation } from '@letterncms/sdk'
import { Button, CodeEditor, EmptyState, FileTree, Icon, IconButton, Menu, NotFoundState, Notice, Pressable, QueryError, SaveBar, Skeleton, Spinner, TextDiff, Topbar, UndoRedo, VersionDialog, VersionsButton, cn, confirm, formats, prompt, textsDiffer, toast, useShortcut, useVersion, type CodeEditorHandle, type FileTreeNode, type MenuItemDef, type Version } from '@letterncms/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ConsolePanel, type ConsoleCounts } from './ConsolePanel'
import { EXT, STARTER, describe, isFile, languageName, useDocuments, versionsOf, type DocId, type Documents, type Files, type Info, type Kind, type Library } from './documents'
import { EditorTabs } from './EditorTabs'

/* The site's own code, for whoever writes it, as a code editor: its files on the left as they lie in
   content/styling (theme.css and custom.js, the scripts and styles blocks load by name, the libraries scripts
   import), the open ones in tabs, and under them the console of a page of the site. Save formats what changed and
   writes it; nothing is saved by itself. Undo and History are the admin's own: each file keeps its versions in the
   one history, and an older one comes back as a change to save, or to undo.
   The design is the look; this is what a developer adds. */

/** What stays as it was left, in this browser: the tabs open, and the console. */
function remembered<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}
function remember(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // A browser that keeps nothing opens the editor as it does the first time.
  }
}

const TABS = 'cms:code:tabs'
const PANEL = 'cms:code:panel'
const TREE = 'cms:code:tree'

export default function Code() {
  const info = useAbility<Info>('styling/get', {}, { refetchOnWindowFocus: false, retry: false })
  const files = useAbility<Files>('styling-code/list')
  const libraries = useAbility<{ imports: Library[] }>('styling-vendor/list')
  const docs = useDocuments(info.data, () => info.refetch())
  const { query } = useLocation()
  const narrow = useNarrow()
  const code = can('site.code')
  const manage = can('settings.manage')

  // The tabs open, and the one on view: in the address, so Back returns to the file open before.
  const [tabs, setTabs] = useState<DocId[]>(() => remembered(TABS, { open: ['css'] }).open)
  const active: DocId | null = query.file ?? (narrow ? null : tabs[0] ?? null)
  // A file opened by its address (a link, Back) gets its tab.
  useEffect(() => { const file = query.file; if (file) setTabs((all) => (all.includes(file) ? all : [...all, file])) }, [query.file])
  useEffect(() => remember(TABS, { open: tabs }), [tabs])
  const select = (id: DocId | null) => setQuery({ file: id ?? undefined }, false)
  const open = (id: DocId) => {
    if (!tabs.includes(id)) setTabs((all) => [...all, id])
    select(id)
  }
  const close = (id: DocId) => {
    const index = tabs.indexOf(id)
    const rest = tabs.filter((tab) => tab !== id)
    setTabs(rest)
    if (active === id) select(rest[Math.min(index, rest.length - 1)] ?? null)
  }

  // The console under the editor: open or not, and how tall, as it was left.
  const [panel, setPanel] = useState(() => remembered(PANEL, { open: false, height: 240 }))
  useEffect(() => remember(PANEL, panel), [panel])
  const [counts, setCounts] = useState<ConsoleCounts>({ errors: 0, warnings: 0 })
  const [savedTimes, setSavedTimes] = useState(0)
  const togglePanel = () => setPanel((now) => ({ ...now, open: !now.open }))

  const editors = useRef(new Map<DocId, CodeEditorHandle>())
  const [steps, setSteps] = useState<Record<DocId, { canUndo: boolean; canRedo: boolean }>>({})
  const [version, setVersion] = useState<{ id: DocId; version: Version } | null>(null)
  const [cursor, setCursor] = useState<Record<DocId, { line: number; column: number }>>({})
  const [mistakes, setMistakes] = useState<Record<DocId, number>>({})
  /** A document opened at a line: once its editor is there (a file loads first), the cursor goes to it. */
  const openAt = (id: DocId, line?: number, column?: number) => {
    open(id)
    if (!line) return
    let frames = 0
    const go = () => {
      const editor = editors.current.get(id)
      if (editor) editor.goTo(line, column)
      else if (frames++ < 120) requestAnimationFrame(go)
    }
    requestAnimationFrame(go)
  }

  const save = async () => {
    const mistakes = await docs.save()
    if (!mistakes) return
    setSavedTimes((times) => times + 1)
    // What Prettier couldn't read is saved as it was written: said, with the way to the line.
    const first = mistakes[0]
    if (first) {
      toast(t('{name} was saved as written: {problem}', { name: describe(first.id).title, problem: first.message }), {
        duration: 8000,
        action: first.line ? { label: t('Show Line'), onClick: () => openAt(first.id, first.line, first.column) } : undefined,
      })
    }
  }
  const format = async (id: DocId) => {
    const result = await docs.format(id)
    if (result.mistake) return void toast.error(t('{name} can’t be formatted: {problem}', { name: describe(id).title, problem: result.mistake.message }))
    if (result.text !== docs.text(id)) docs.edit(id, result.text)
  }
  const actions = useFileActions({ files, docs, open, close })
  const activeDoc = active ? describe(active) : null
  const writable = (id: DocId) => (id === 'css' ? manage : code)
  const canFormat = !!activeDoc && formats(activeDoc.language) && writable(active!)
  // Undo is the open file's own, as its editor keeps it; History is its versions, wherever they were saved from.
  const activeSteps = active && activeDoc?.language ? steps[active] : undefined
  const undoable = {
    undo: () => { if (active) editors.current.get(active)?.undo() },
    redo: () => { if (active) editors.current.get(active)?.redo() },
    canUndo: !!activeSteps?.canUndo,
    canRedo: !!activeSteps?.canRedo,
  }
  const history = active ? versionsOf(active) : null

  useShortcut('ctrl+`', togglePanel, true, t('Toggle Console'), t('Code'))
  useShortcut('alt+shift+f', () => { if (active && canFormat) void format(active) }, canFormat, t('Format Document'), t('Code'))
  useShortcut('alt+mod+arrowright', () => { if (active) select(tabs[(tabs.indexOf(active) + 1) % tabs.length]) }, tabs.length > 1 && !narrow, t('Next Tab'), t('Code'))
  useShortcut('alt+mod+arrowleft', () => { if (active) select(tabs[(tabs.indexOf(active) - 1 + tabs.length) % tabs.length]) }, tabs.length > 1 && !narrow, t('Previous Tab'), t('Code'))

  if (info.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!info.data) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: t('Code'), icon: 'code' }]} />
        <QueryError title={t('Couldn’t load the code')} onRetry={() => void info.refetch()} retrying={info.isRefetching} />
      </div>
    )
  }


  const library = active?.startsWith('library:') ? libraries.data?.imports.find((entry) => `library:${entry.import}` === active) : undefined
  const menu: MenuItemDef[] = [
    ...(activeDoc?.language ? [{ label: t('Format Document'), icon: 'wand', shortcut: 'alt+shift+f', disabled: !canFormat, onSelect: () => void format(active!) }] : []),
    ...(active && isFile(active) ? actions.fileMenu(active) : library ? actions.libraryMenu(library.import) : []),
  ]
  const problem = docs.problem

  return (
    <div className="flex h-full flex-col">
      <Topbar
        divided
        // On a phone a file takes the screen: its name, with the way back to the list.
        back={narrow && query.file ? { to: '/code', label: t('Code') } : undefined}
        crumbs={[{ label: narrow && activeDoc ? activeDoc.title : t('Code') }]}
        actions={
          <>
            {activeDoc?.language && <UndoRedo history={undoable} keys="named" group={t('Code')} disabled={!writable(active!)} />}
            {history && writable(active!) && <VersionsButton of={history} onOpen={(picked) => setVersion({ id: active!, version: picked })} />}
            <IconButton icon="terminal" size="sm" label={panel.open ? t('Hide Console') : t('Show Console')} shortcut="ctrl+`" active={panel.open} onClick={togglePanel} />
            {menu.length > 0 && <Menu align="end" trigger={<IconButton icon="more" size="sm" label={t('File Actions')} />} items={menu} />}
          </>
        }
      />
      <SaveBar dirty={docs.dirtyIds.length > 0} saving={docs.saving} error={problem ? (problem.refused ? t('The CSS was not saved') : problem.message) : null} onSave={() => void save()} onDiscard={docs.discard} />
      {!code && <Notice tone="neutral" className="mx-4 mb-2" title={t('Editing code needs the “Edit Scripts and Stylesheets” permission.')} />}
      {problem?.refused && <Notice tone="danger" className="mx-4 mb-2" title={t('Tailwind refused the CSS')} onDismiss={docs.clearProblem}>{problem.message}</Notice>}
      {/* The files beside the ones open; on a phone the list takes the screen until one is chosen. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(220px,260px)_minmax(0,1fr)]">
        <div className={cn('flex min-h-0 flex-col border-border pt-1 md:border-r', narrow && query.file && 'hidden')}>
          <Explorer files={files} libraries={libraries} docs={docs} active={active} onOpen={open} actions={actions} code={code} />
        </div>
        <div className={cn('flex min-h-0 min-w-0 flex-col', narrow && !query.file && 'hidden')}>
          {!narrow && tabs.length > 0 && <EditorTabs tabs={tabs} active={active} dirty={docs.isDirty} onSelect={select} onClose={close} />}
          <div className="relative min-h-0 flex-1">
            {/* Every open file keeps its editor, so each keeps its undo, its cursor and where it was scrolled. */}
            {tabs.map((id) => (
              <div key={id} className={cn('absolute inset-0 flex flex-col', id !== active && 'hidden')}>
                <Document
                  id={id}
                  docs={docs}
                  library={libraries.data?.imports.find((entry) => `library:${entry.import}` === id)}
                  librariesLoaded={!!libraries.data}
                  disabled={!writable(id)}
                  fetching={actions.fetching}
                  onUpdateLibrary={actions.updateLibrary}
                  editorRef={(handle) => { if (handle) editors.current.set(id, handle); else editors.current.delete(id) }}
                  onCursor={(at) => setCursor((all) => ({ ...all, [id]: at }))}
                  onErrors={(count) => setMistakes((all) => ({ ...all, [id]: count }))}
                  onHistory={(at) => setSteps((all) => ({ ...all, [id]: at }))}
                />
              </div>
            ))}
            {!active && !narrow && <EmptyState icon="code" title={t('No file open')} />}
          </div>
          <ConsolePanel
            open={panel.open}
            height={narrow ? Math.min(panel.height, 320) : panel.height}
            onHeight={(height) => setPanel((now) => ({ ...now, height }))}
            onClose={() => setPanel((now) => ({ ...now, open: false }))}
            saved={savedTimes}
            onOpen={openAt}
            onCounts={setCounts}
          />
          {/* The line under it all, as editors have: what the console caught, and where the cursor is. */}
          <div className="flex h-7 shrink-0 items-center gap-3 border-t border-border bg-sunken px-2 text-2xs text-muted">
            <Pressable compact onClick={togglePanel} aria-label={t('{errors} errors, {warnings} warnings: Toggle Console', { ...counts })} className="flex h-6 items-center gap-2 rounded-sm px-1.5 hover:bg-hover hover:text-text">
              <span className={cn('flex items-center gap-1', counts.errors > 0 && 'text-danger')}><Icon name="x-circle" size={12} />{counts.errors}</span>
              <span className={cn('flex items-center gap-1', counts.warnings > 0 && 'text-warning')}><Icon name="warning" size={12} />{counts.warnings}</span>
            </Pressable>
            <span className="flex-1" />
            {active && !!mistakes[active] && <span role="status" className="text-danger">{mistakes[active] === 1 ? t('1 error') : t('{count} errors', { count: mistakes[active] })}</span>}
            {active && cursor[active] && activeDoc?.language && <span>{t('Ln {line}, Col {column}', { ...cursor[active] })}</span>}
            {activeDoc?.language && <span>{languageName(activeDoc.language)}</span>}
          </div>
        </div>
      </div>
      <CodeVersion
        opened={version}
        docs={docs}
        writable={!!version && writable(version.id)}
        onClose={() => setVersion(null)}
        onRestore={(id, text) => {
          setVersion(null)
          // The version comes back as a change in the editor: one step to undo, and Save keeps it.
          docs.edit(id, text)
          open(id)
          requestAnimationFrame(() => editors.current.get(id)?.focus())
        }}
      />
    </div>
  )
}

/**
 * An older version of a file, against what the editor holds now, and the way to bring it back into the editor.
 * The site's CSS is compared as the editor shows it: what the version had beyond the design's sections.
 */
function CodeVersion({ opened, docs, writable, onClose, onRestore }: { opened: { id: DocId; version: Version } | null; docs: Documents; writable: boolean; onClose: () => void; onRestore: (id: DocId, text: string) => void }) {
  const loaded = useVersion<{ contents?: string; css?: string }>(opened?.version ?? null)
  const snapshot = loaded.data?.snapshot
  const then = !opened || !snapshot ? '' : opened.id === 'css' ? new Stylesheet(snapshot.css ?? '').extra() : snapshot.contents ?? ''
  const now = opened ? docs.text(opened.id) ?? '' : ''
  return (
    <VersionDialog
      version={opened?.version ?? null}
      onClose={onClose}
      onRestore={opened && writable ? () => onRestore(opened.id, then) : undefined}
      loading={!snapshot}
      failed={loaded.isError}
      onRetry={() => void loaded.refetch()}
      unchanged={!!snapshot && !textsDiffer(now, then)}
    >
      <TextDiff now={now} then={then} />
    </VersionDialog>
  )
}

/** Adding and deleting files and libraries: these happen at once, like fonts, not with Save. */
function useFileActions({ files, docs, open, close }: { files: { data?: Files }; docs: Documents; open: (id: DocId) => void; close: (id: DocId) => void }) {
  /** The library being fetched, or 'add' while a new one is. */
  const [fetching, setFetching] = useState<string | null>(null)
  const code = can('site.code')
  const act = async (work: () => Promise<unknown>, done: string) => {
    try {
      await work()
      invalidate('styling-code/', 'styling-vendor/', 'revisions/')
      toast.success(done)
      return true
    } catch (error) {
      toast.error(error)
      return false
    }
  }
  /** A new file in a folder (`lib/` in scripts/lib): its name may go deeper, `lib/ease`. */
  const addFile = async (kind: Kind, folder = '') => {
    const asked = await prompt({
      title: kind === 'scripts' ? t('New Script') : t('New Stylesheet'),
      fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: `${folder}hero` }],
      values: folder ? { name: folder } : undefined,
      confirm: kind === 'scripts' ? t('Create Script') : t('Create Stylesheet'),
    })
    const name = String(asked?.name ?? '').trim().toLowerCase().replace(/\.(js|css)$/, '').replace(/\s+/g, '-').replace(/^\/+|\/+$/g, '')
    if (!name) return
    if ((files.data?.[kind] ?? []).includes(name)) return void toast.error(t('“{name}” already exists', { name }))
    const path = `${kind}/${name}.${EXT[kind]}`
    // It opens on what it starts with, ready to be written.
    if (await act(() => run('styling-code/save', { path, contents: STARTER[kind] }), t('{name} added', { name: `${name.split('/').pop()}.${EXT[kind]}` }))) open(path)
  }
  const removeFile = async (path: DocId) => {
    const name = describe(path).title
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), description: t('The file and its history are deleted for good.'), confirm: t('Delete File'), danger: true }))) return
    if (!(await act(() => run('styling-code/delete', { path }), t('{name} deleted', { name })))) return
    close(path)
    docs.forget(path)
  }
  const addLibrary = async () => {
    const asked = await prompt({ title: t('Add Library'), fields: [{ handle: 'package', type: 'text', label: t('Package'), mono: true, autofocus: true, placeholder: 'gsap@3.12.5' }], confirm: t('Add Library') })
    const name = String(asked?.package ?? '').trim()
    if (!name) return
    setFetching('add')
    await act(() => run('styling-vendor/create', { package: name }), t('{name} added', { name }))
    setFetching(null)
  }
  const updateLibrary = async (name: string) => {
    setFetching(name)
    await act(() => run('styling-vendor/update', { import: name }), t('{name} updated', { name }))
    setFetching(null)
  }
  const removeLibrary = async (name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete Library'), danger: true }))) return
    if (await act(() => run('styling-vendor/delete', { import: name }), t('{name} deleted', { name }))) close(`library:${name}`)
  }
  const fileMenu = (path: DocId): MenuItemDef[] => (code ? [{ label: t('Delete File'), icon: 'trash', danger: true, onSelect: () => void removeFile(path) }] : [])
  /** What the + makes: a script, a stylesheet (in `folder` of its own kind, from a folder's menu), a library. */
  const newMenu = (folder: string, only?: Kind | 'vendor'): MenuItemDef[] => {
    if (!code) return []
    const items: MenuItemDef[] = []
    if (!only || only === 'scripts') items.push({ label: t('New Script'), icon: 'file-js', onSelect: () => void addFile('scripts', only ? folder : '') })
    if (!only || only === 'styles') items.push({ label: t('New Stylesheet'), icon: 'file-css', onSelect: () => void addFile('styles', only ? folder : '') })
    if (!only || only === 'vendor') items.push({ label: t('Add Library'), icon: 'box', disabled: !!fetching, onSelect: () => void addLibrary() })
    return items
  }
  const folderMenu = (kind: Kind | 'vendor', folder: string) => newMenu(folder, kind)
  const libraryMenu = (name: string): MenuItemDef[] => (code ? [
    { label: t('Update'), icon: 'refresh', disabled: !!fetching, onSelect: () => void updateLibrary(name) },
    { separator: true, label: '' },
    { label: t('Delete Library'), icon: 'trash', danger: true, disabled: !!fetching, onSelect: () => void removeLibrary(name) },
  ] : [])
  return { fetching, addFile, addLibrary, updateLibrary, fileMenu, libraryMenu, newMenu, folderMenu }
}

type FileActions = ReturnType<typeof useFileActions>

/** The folders open when the editor first opens: all three, so every file is in view. */
const FOLDERS = ['dir:scripts', 'dir:styles', 'dir:vendor']

/**
 * The files of the site as they lie in content/styling, folders and all: what opens in a tab, with a dot on what
 * has unsaved changes. The + makes a script or a stylesheet, or adds a library; a folder's menu does it there.
 */
function Explorer({ files, libraries, docs, active, onOpen, actions, code }: { files: ReturnType<typeof useAbility<Files>>; libraries: ReturnType<typeof useAbility<{ imports: Library[] }>>; docs: Documents; active: DocId | null; onOpen: (id: DocId) => void; actions: FileActions; code: boolean }) {
  const [expanded, setExpanded] = useState<string[]>(() => remembered(TREE, { open: FOLDERS }).open)
  useEffect(() => remember(TREE, { open: expanded }), [expanded])
  const edited = (id: DocId) => (docs.isDirty(id) ? <span className="size-1.5 rounded-full bg-focus" aria-label={t('Unsaved changes')} role="img" /> : undefined)

  const nodes = useMemo(() => {
    const file = (id: DocId, name: string): FileTreeNode => ({ id, name, icon: describe(id).icon, status: edited(id), actions: isFile(id) ? actions.fileMenu(id).map((item) => ({ ...item, quick: item.icon === 'trash' })) : [] })
    // A kind's files by their paths, in folders as deep as their names go: scripts/lib/ease.js under scripts/lib.
    const folder = (kind: Kind): FileTreeNode => {
      const root: FileTreeNode = { id: `dir:${kind}`, name: kind, children: [], actions: actions.folderMenu(kind, '') }
      for (const name of files.data?.[kind] ?? []) {
        const parts = name.split('/')
        let at = root
        parts.slice(0, -1).forEach((part, depth) => {
          const prefix = parts.slice(0, depth + 1).join('/')
          let next = at.children!.find((child) => child.id === `dir:${kind}/${prefix}`)
          if (!next) at.children!.push(next = { id: `dir:${kind}/${prefix}`, name: part, children: [], actions: actions.folderMenu(kind, `${prefix}/`) })
          at = next
        })
        at.children!.push(file(`${kind}/${name}.${EXT[kind]}`, `${parts[parts.length - 1]}.${EXT[kind]}`))
      }
      // Folders first, then files, each by name: as a file manager lists them.
      const sort = (node: FileTreeNode) => {
        node.children?.sort((a, b) => Number(!a.children) - Number(!b.children) || a.name.localeCompare(b.name))
        node.children?.forEach(sort)
      }
      sort(root)
      return root
    }
    const vendor: FileTreeNode = {
      id: 'dir:vendor',
      name: 'vendor',
      actions: actions.folderMenu('vendor', ''),
      children: (libraries.data?.imports ?? []).map((library) => ({
        id: `library:${library.import}`,
        name: library.import,
        icon: 'box',
        badge: actions.fetching === library.import ? <Spinner size={12} /> : library.version,
        actions: actions.libraryMenu(library.import),
      })),
    }
    return [file('css', 'theme.css'), file('js', 'custom.js'), folder('scripts'), folder('styles'), vendor]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.data, libraries.data, actions.fetching, docs.dirtyIds.join(), code])

  const failed = files.isError || libraries.isError
  return (
    <nav aria-label={t('Files')} className="flex min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 pl-4 pr-2">
        <h2 className="cms-label m-0 min-w-0 flex-1 truncate">{t('Files')}</h2>
        {actions.fetching === 'add'
          ? <span role="status" aria-label={t('Working…')} className="grid size-6 place-items-center text-faint"><Spinner size={14} /></span>
          : code && <Menu align="end" trigger={<IconButton icon="plus" size="xs" label={t('New File')} />} items={actions.newMenu('')} />}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {failed ? <QueryError compact onRetry={() => { void files.refetch(); void libraries.refetch() }} retrying={files.isRefetching || libraries.isRefetching} />
          : !files.data || !libraries.data ? <Loading />
          : <FileTree label={t('Files')} nodes={nodes} active={active} onOpen={onOpen} expanded={expanded} onExpandedChange={setExpanded} />}
      </div>
    </nav>
  )
}

/** One open document: its editor, or for a library what it is. A file's contents load when it first opens. */
function Document({ id, docs, library, librariesLoaded, disabled, fetching, onUpdateLibrary, editorRef, onCursor, onErrors, onHistory }: {
  id: DocId
  docs: Documents
  library?: Library
  librariesLoaded: boolean
  disabled: boolean
  fetching: string | null
  onUpdateLibrary: (name: string) => void
  editorRef: (handle: CodeEditorHandle | null) => void
  onCursor: (at: { line: number; column: number }) => void
  onErrors: (count: number) => void
  onHistory: (steps: { canUndo: boolean; canRedo: boolean }) => void
}) {
  const doc = describe(id)
  const file = isFile(id)
  const loaded = useAbility<{ contents: string }>('styling-code/get', { path: id }, { enabled: file, staleTime: 0 })
  useEffect(() => { if (loaded.data) docs.loaded(id, loaded.data.contents) }, [id, loaded.data])
  if (doc.library) {
    if (!library) return librariesLoaded ? <NotFoundState /> : null
    return (
      <div className="space-y-1 p-4 text-sm">
        <p className="m-0 font-mono text-ink">{library.package}</p>
        <p className="m-0 font-mono text-xs text-muted">{library.version}</p>
        {can('site.code') && <Button icon="refresh" loading={fetching === library.import} disabled={!!fetching} onClick={() => onUpdateLibrary(library.import)} className="!mt-4">{t('Update')}</Button>}
      </div>
    )
  }
  if (file && loaded.isError) return <QueryError compact onRetry={() => void loaded.refetch()} retrying={loaded.isRefetching} />
  const text = docs.text(id)
  if (text === undefined) return <Skeleton className="m-4 h-full rounded-md" />
  return (
    <CodeEditor
      fill
      bare
      ref={editorRef}
      label={doc.title}
      language={doc.language}
      value={text}
      disabled={disabled}
      onChange={(next) => docs.edit(id, next)}
      onCursor={onCursor}
      onErrors={onErrors}
      onHistory={onHistory}
      placeholder={id === 'css' ? '.hero-title { text-wrap: balance; }' : id === 'js' ? "document.addEventListener('cms:alpine', (e) => …)" : undefined}
    />
  )
}

/** Whether the window is a phone's: the list and the open file take turns there. */
function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const change = () => setNarrow(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return narrow
}

const Loading = () => <div className="space-y-2 py-2 pl-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div>
