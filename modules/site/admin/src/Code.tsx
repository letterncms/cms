import { CmsError, can, invalidate, run, setQuery, t, useAbility, useLocation } from '@letterncms/sdk'
import { Button, CodeEditor, IconButton, Menu, NotFoundState, Notice, QueryError, SaveBar, SidebarGroup, SidebarRow, Skeleton, Spinner, Tooltip, Topbar, cn, confirm, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { Stylesheet, balanced } from '@letterncms/blocks'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/* The site's own code, for whoever writes it, as an editor of files: the CSS no section of the design shows and the
   stylesheets blocks load by name, the JavaScript on every page and the scripts blocks run, and the libraries
   scripts import. Their list is a panel beside the one open.
   The design is the look; this is what a developer adds. */

interface Info {
  css: string
  js: string
}

interface Files {
  scripts: string[]
  styles: string[]
}

interface Library {
  import: string
  package: string
  version: string
}

/** What Save writes: the site's CSS and JavaScript, and the files edited, by path. A part not changed is not in it. */
interface Draft {
  css?: string
  js?: string
  files: Record<string, string>
}

const EMPTY: Draft = { files: {} }

/** What a new file starts as: a script is a module a block can name as its behaviour. */
const STARTER = { scripts: 'export function mount(el, props) {\n}\n', styles: '\n' }
const EXT = { scripts: 'js', styles: 'css' } as const
type Kind = keyof typeof EXT

/** What is open: the site's CSS or JavaScript, a file by its path, or a library (`library:<import>`). */
type Open = string

export default function Code() {
  const info = useAbility<Info>('styling/get', {}, { refetchOnWindowFocus: false, retry: false })
  const files = useAbility<Files>('styling-code/list')
  const libraries = useAbility<{ imports: Library[] }>('styling-vendor/list')
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<{ message: string; refused: boolean } | null>(null)
  /** The library being fetched, or 'add' while a new one is. */
  const [fetching, setFetching] = useState<string | null>(null)
  const { query } = useLocation()
  // What is open is in the address, so Back returns to what was open before. Nothing chosen: the site's CSS, and on a phone the list.
  const open: Open = query.file ?? 'css'
  const select = (next: Open) => setQuery({ file: next }, false)
  const narrow = useNarrow()
  const code = can('site.code')
  const manage = can('settings.manage')

  const base = info.data
  const dirty = !!base && ((draft.css !== undefined && draft.css !== base.css) || (draft.js !== undefined && draft.js !== base.js) || Object.keys(draft.files).length > 0)
  const edit = (path: string, contents: string | null) => setDraft((d) => ({ ...d, files: contents === null ? Object.fromEntries(Object.entries(d.files).filter(([key]) => key !== path)) : { ...d.files, [path]: contents } }))

  if (info.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!base) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: t('Code'), icon: 'code' }]} />
        <QueryError title={t('Couldn’t load the code')} onRetry={() => void info.refetch()} retrying={info.isRefetching} />
      </div>
    )
  }

  const save = async () => {
    if (!dirty || busy) return
    setBusy(true)
    setFailed(null)
    try {
      if (draft.css !== undefined && draft.css !== base.css) await run('styling/update', { css: draft.css })
      if (draft.js !== undefined && draft.js !== base.js) await run('styling-code/set-custom', { js: draft.js })
      for (const [path, contents] of Object.entries(draft.files)) await run('styling-code/save', { path, contents })
      await info.refetch()
      invalidate('styling/', 'styling-code/')
      setDraft(EMPTY)
    } catch (e) {
      // What Tailwind refuses is the CSS's to correct: its own words, and the draft stays.
      setFailed({ message: e instanceof Error ? e.message : String(e), refused: e instanceof CmsError && e.type === 'invalid_input' })
    } finally {
      setBusy(false)
    }
  }

  // Adding or deleting a file and changing a library happen at once: they are files of the site, like fonts.
  const act = async (work: () => Promise<unknown>, done: string) => {
    try {
      await work()
      invalidate('styling-code/', 'styling-vendor/')
      toast.success(done)
      return true
    } catch (e) {
      toast.error(e)
      return false
    }
  }
  const addFile = async (kind: Kind) => {
    const asked = await prompt({
      title: kind === 'scripts' ? t('New Script') : t('New Stylesheet'),
      fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: 'hero' }],
      confirm: kind === 'scripts' ? t('Create Script') : t('Create Stylesheet'),
    })
    const name = String(asked?.name ?? '').trim().toLowerCase().replace(/\.(js|css)$/, '').replace(/\s+/g, '-')
    if (!name) return
    if ((files.data?.[kind] ?? []).includes(name)) return void toast.error(t('“{name}” already exists', { name }))
    const path = `${kind}/${name}.${EXT[kind]}`
    // It opens on what it starts with, ready to be written.
    if (await act(() => run('styling-code/save', { path, contents: STARTER[kind] }), t('{name} added', { name: `${name}.${EXT[kind]}` }))) select(path)
  }
  const removeFile = async (path: string, name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete File'), danger: true }))) return
    if (!(await act(() => run('styling-code/delete', { path }), t('{name} deleted', { name })))) return
    edit(path, null)
    if (open === path) select('css')
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
    if ((await act(() => run('styling-vendor/delete', { import: name }), t('{name} deleted', { name }))) && open === `library:${name}`) select('css')
  }

  const fileMenu = (path: string, name: string): MenuItemDef[] => (code ? [{ label: t('Delete'), icon: 'trash', danger: true, onSelect: () => void removeFile(path, name) }] : [])
  const libraryMenu = (name: string): MenuItemDef[] => (code ? [
    { label: t('Update'), icon: 'refresh', disabled: !!fetching, onSelect: () => void updateLibrary(name) },
    { separator: true, label: '' },
    { label: t('Delete'), icon: 'trash', danger: true, disabled: !!fetching, onSelect: () => void removeLibrary(name) },
  ] : [])
  /** A mark for what holds unsaved changes. */
  const edited = (on: boolean) => (on ? <span className="size-1.5 rounded-full bg-focus" aria-label={t('Unsaved changes')} role="img" /> : undefined)
  const row = (key: Open, label: string, icon: string, unsaved: boolean, menu: MenuItemDef[] = [], badge?: ReactNode) => (
    <SidebarRow key={key} label={label} icon={icon} active={open === key} onClick={() => select(key)} status={edited(unsaved)} badge={badge} actions={menu.map((item) => ({ ...item, quick: item.icon === 'trash' }))} />
  )
  const fileRows = (kind: Kind) => (files.data?.[kind] ?? []).map((name) => {
    const path = `${kind}/${name}.${EXT[kind]}`
    return row(path, `${name}.${EXT[kind]}`, 'file', path in draft.files, fileMenu(path, `${name}.${EXT[kind]}`))
  })

  const list = (
    <nav aria-label={t('Code')} className="px-2 pb-4">
      <SidebarGroup title={t('Stylesheets')} action={code && <Add label={t('New Stylesheet')} onAdd={() => void addFile('styles')} />}>
        {row('css', t('Site CSS'), 'braces', draft.css !== undefined && draft.css !== base.css)}
        {files.isError ? <QueryError compact onRetry={() => void files.refetch()} retrying={files.isRefetching} /> : !files.data ? <Loading /> : fileRows('styles')}
      </SidebarGroup>
      <SidebarGroup title={t('Scripts')} action={code && <Add label={t('New Script')} onAdd={() => void addFile('scripts')} />}>
        {row('js', t('Site JavaScript'), 'braces', draft.js !== undefined && draft.js !== base.js)}
        {files.isError ? null : !files.data ? <Loading /> : fileRows('scripts')}
      </SidebarGroup>
      <SidebarGroup title={t('Libraries')} action={code && <Add label={t('Add Library')} onAdd={() => void addLibrary()} busy={fetching === 'add'} />}>
        {libraries.isError ? <QueryError compact onRetry={() => void libraries.refetch()} retrying={libraries.isRefetching} />
          : !libraries.data ? <Loading />
          : libraries.data.imports.map((library) => row(`library:${library.import}`, library.import, 'box', false, libraryMenu(library.import), fetching === library.import ? <Spinner size={12} /> : library.version))}
      </SidebarGroup>
    </nav>
  )

  const library = open.startsWith('library:') ? libraries.data?.imports.find((entry) => `library:${entry.import}` === open) : undefined
  const path = /^(scripts|styles)\//.test(open) ? open : null
  const title = open === 'css' ? t('Site CSS') : open === 'js' ? t('Site JavaScript') : path ? path.split('/').pop() ?? path : library?.import
  const menu = path ? fileMenu(path, title ?? path) : library ? libraryMenu(library.import) : []
  const pane = open === 'css' ? <SiteCss css={draft.css ?? base.css} disabled={!manage} onChange={(css) => setDraft((d) => ({ ...d, css }))} />
    : open === 'js' ? <CodeEditor fill label={t('Site JavaScript')} language="javascript" value={draft.js ?? base.js} onChange={(js) => setDraft((d) => ({ ...d, js }))} disabled={!code} placeholder="document.addEventListener('cms:alpine', (e) => …)" />
    : path ? (code ? <File path={path} edited={draft.files[path]} onEdit={(contents) => edit(path, contents)} /> : <Notice tone="neutral" title={t('Editing code needs the “Edit Scripts and Stylesheets” permission.')} />)
    : library ? (
      <div className="space-y-1 text-sm">
        <p className="m-0 font-mono text-ink">{library.package}</p>
        <p className="m-0 font-mono text-xs text-muted">{library.version}</p>
        {code && <Button icon="refresh" loading={fetching === library.import} disabled={!!fetching} onClick={() => void updateLibrary(library.import)} className="!mt-4">{t('Update')}</Button>}
      </div>
    ) : libraries.data && files.data ? <NotFoundState /> : null

  return (
    <div className="flex h-full flex-col">
      <Topbar
        divided
        // On a phone a file takes the screen: its name, with the way back to the list.
        back={narrow && query.file ? { to: '/code', label: t('Code') } : undefined}
        crumbs={[{ label: narrow && query.file ? title : t('Code') }]}
        actions={menu.length > 0 && <Menu align="end" trigger={<IconButton icon="more" size="sm" label={t('File Actions')} />} items={menu} />}
      />
      <SaveBar dirty={dirty} saving={busy} error={failed ? (failed.refused ? t('The CSS was not saved') : failed.message) : null} onSave={() => void save()} onDiscard={() => { setDraft(EMPTY); setFailed(null) }} />
      {!code && <Notice tone="neutral" className="mx-4 mb-2" title={t('Editing code needs the “Edit Scripts and Stylesheets” permission.')} />}
      {failed?.refused && <Notice tone="danger" className="mx-4 mb-2" title={t('Tailwind refused the CSS')} onDismiss={() => setFailed(null)}>{failed.message}</Notice>}
      {/* The files beside the one open; on a phone the list takes the screen until one is chosen. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <div className={cn('min-h-0 overflow-y-auto border-border pt-3 md:border-r', query.file && 'max-md:hidden')}>{list}</div>
        <div className={cn('flex min-h-0 min-w-0 flex-col p-4', !query.file && 'max-md:hidden')}>{pane}</div>
      </div>
    </div>
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

/** What adds a file or a library to its group, beside the group's heading; a spinner while it is fetched. */
function Add({ label, onAdd, busy }: { label: string; onAdd: () => void; busy?: boolean }) {
  return busy
    ? <span role="status" aria-label={t('Working…')} className="grid size-6 place-items-center text-faint"><Spinner size={14} /></span>
    : <Tooltip content={label}><IconButton icon="plus" size="xs" label={label} title={undefined} onClick={onAdd} /></Tooltip>
}

/** A script or stylesheet of the site: its contents, loaded when it opens. What is typed joins the screen's draft. */
function File({ path, edited, onEdit }: { path: string; edited: string | undefined; onEdit: (contents: string) => void }) {
  const loaded = useAbility<{ contents: string }>('styling-code/get', { path }, { enabled: edited === undefined, staleTime: 0 })
  if (loaded.isError) return <QueryError compact onRetry={() => void loaded.refetch()} retrying={loaded.isRefetching} />
  if (edited === undefined && !loaded.data) return <Skeleton className="h-full w-full rounded-md" />
  return <CodeEditor fill key={path} label={path} language={path.endsWith('.css') ? 'css' : 'javascript'} value={edited ?? loaded.data?.contents ?? ''} onChange={onEdit} />
}

/**
 * The site's own CSS: what the stylesheet holds that no section of the design shows (a variable of another kind, a rule
 * of another selector, a variant of its own, plain CSS). What is typed is the draft once its braces close.
 */
function SiteCss({ css, onChange, disabled }: { css: string; onChange: (css: string) => void; disabled: boolean }) {
  const sheet = useMemo(() => new Stylesheet(css), [css])
  const written = useMemo(() => sheet.extra(), [sheet])
  const [text, setText] = useState(written)
  // Written elsewhere (Discard, Save): the field follows, unless it holds what is being typed.
  const typed = useRef(written)
  useEffect(() => {
    if (written !== typed.current) {
      typed.current = written
      setText(written)
    }
  }, [written])
  return (
    <CodeEditor
      fill
      label={t('Site CSS')}
      language="tailwind"
      placeholder=".hero-title { text-wrap: balance; }"
      value={text}
      disabled={disabled}
      onChange={(next) => {
        setText(next)
        if (!balanced(next)) return
        // What the stylesheet will say it holds: the field keeps what was typed while they agree.
        const written = sheet.setExtra(next)
        typed.current = written.extra()
        onChange(written.css)
      }}
    />
  )
}
