import { can, invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Button, EmptyState, Fields, IconButton, Menu, Notice, QueryError, Skeleton, Spinner, confirm, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useState } from 'react'
import { Disclosure, Group, NoAction, rowAction } from './parts'

interface Files {
  scripts: string[]
  styles: string[]
}

interface Library {
  import: string
  package: string
  version: string
}

const Loading = () => <div className="space-y-2 py-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div>
const menu = (label: string, items: MenuItemDef[]) => (items.length > 0 ? <Menu trigger={<IconButton icon="more" label={label} size="xs" className={rowAction} />} items={items} /> : <NoAction />)

/** What a new file starts as: a script is a module a block can name as its behaviour. */
const STARTER = { scripts: 'export function mount(el, props) {\n}\n', styles: '\n' }
const EXT = { scripts: 'js', styles: 'css' } as const
type Kind = keyof typeof EXT

/** One script or style of the site: its name as blocks write it, opening on its contents. What is typed joins the screen's draft. */
function File({ path, name, open, onToggle, edited, onEdit, allowed, onDelete }: { path: string; name: string; open: boolean; onToggle: () => void; edited: string | undefined; onEdit: (contents: string) => void; allowed: boolean; onDelete: () => void }) {
  const loaded = useAbility<{ contents: string }>('styling-code/get', { path }, { enabled: open && allowed && edited === undefined, staleTime: 0 })
  // Without `site.code` a file is a name in the list: its contents are not this person's to read.
  if (!allowed) return <div className="flex min-h-10 items-center border-b border-border font-mono text-xs text-text last:border-b-0">{name}</div>
  return (
    <Disclosure open={open} onToggle={onToggle} label={<span className="font-mono">{name}</span>} menu={menu(t('File Actions'), allowed ? [{ label: t('Delete'), icon: 'trash', danger: true, onSelect: onDelete }] : [])}>
      {loaded.isError ? <QueryError compact onRetry={() => void loaded.refetch()} retrying={loaded.isRefetching} />
        : edited === undefined && !loaded.data ? <Loading />
        : <Fields bare fields={[{ handle: 'contents', type: 'code', label: name, rows: 14, language: path.endsWith('.css') ? 'css' : 'javascript' }]} values={{ contents: edited ?? loaded.data?.contents ?? '' }} onChange={(_, v) => onEdit(v ?? '')} disabled={!allowed} />}
    </Disclosure>
  )
}

/**
 * The code beside the stylesheet: the site's own script (custom.js, on every page) and the scripts and styles
 * blocks, templates and components load by name (content/styling/scripts, content/styling/styles), then the
 * libraries scripts import. What is typed in a file is part of the screen's draft and saved with it. Adding or
 * deleting a file and changing a library happen at once: they are files of the site, like fonts. All of it
 * needs `site.code`.
 */
export function CodeFiles({ js, onJs, edits, onEdit }: { js: string; onJs: (js: string) => void; edits: Record<string, string>; onEdit: (path: string, contents: string | null) => void }) {
  const allowed = can('site.code')
  const files = useAbility<Files>('styling-code/list')
  const libraries = useAbility<{ imports: Library[] }>('styling-vendor/list')
  const [open, setOpen] = useState<string | null>(null)
  /** The library being fetched, or 'add' while a new one is. */
  const [busy, setBusy] = useState<string | null>(null)
  const refresh = () => invalidate('styling-code/', 'styling-vendor/')
  const act = async (work: () => Promise<unknown>, done: string) => {
    try {
      await work()
      refresh()
      toast.success(done)
      return true
    } catch (e) {
      toast.error(e)
      return false
    }
  }
  const fetching = async (what: string, work: () => Promise<unknown>, done: string) => {
    setBusy(what)
    await act(work, done)
    setBusy(null)
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
    if (await act(() => run('styling-code/save', { path, contents: STARTER[kind] }), t('{name} added', { name }))) setOpen(path)
  }
  const removeFile = async (path: string, name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete'), danger: true }))) return
    if (await act(() => run('styling-code/delete', { path }), t('{name} deleted', { name }))) onEdit(path, null)
  }
  const addLibrary = async () => {
    const asked = await prompt({
      title: t('Add Library'),
      fields: [{ handle: 'package', type: 'text', label: t('Package'), mono: true, autofocus: true, placeholder: 'gsap@3.12.5' }],
      confirm: t('Add Library'),
    })
    const name = String(asked?.package ?? '').trim()
    if (name) await fetching('add', () => run('styling-vendor/create', { package: name }), t('{name} added', { name }))
  }
  const removeLibrary = async (name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete'), danger: true }))) return
    await act(() => run('styling-vendor/delete', { import: name }), t('{name} deleted', { name }))
  }

  const list = (kind: Kind, title: string, add: string) => {
    const names = files.data?.[kind] ?? []
    return (
      <Group title={title} onAdd={allowed && (kind === 'scripts' || names.length > 0) ? () => void addFile(kind) : undefined} addLabel={add}>
        {/* The site's own script first: the same kind of thing as the files under it, on every page. */}
        {kind === 'scripts' && (
          <Disclosure open={open === 'js'} onToggle={() => setOpen(open === 'js' ? null : 'js')} label={t('Site JavaScript')} menu={<NoAction />}>
            <Fields bare fields={[{ handle: 'js', type: 'code', label: t('Site JavaScript'), rows: 14, placeholder: "document.addEventListener('cms:alpine', (e) => …)", language: 'javascript' }]} values={{ js }} onChange={(_, v) => onJs(v ?? '')} disabled={!allowed} />
          </Disclosure>
        )}
        {files.isError ? <QueryError compact onRetry={() => void files.refetch()} retrying={files.isRefetching} />
          : !files.data ? <Loading />
          : names.length === 0 && kind === 'styles' ? <EmptyState compact icon="code" title={t('No stylesheets')} action={allowed ? <Button icon="plus" onClick={() => void addFile(kind)}>{add}</Button> : undefined} />
          : names.map((name) => {
            const path = `${kind}/${name}.${EXT[kind]}`
            return <File key={path} path={path} name={name} open={open === path} onToggle={() => setOpen(open === path ? null : path)} edited={edits[path]} onEdit={(contents) => onEdit(path, contents)} allowed={allowed} onDelete={() => void removeFile(path, name)} />
          })}
      </Group>
    )
  }

  return (
    <>
      {!allowed && <Notice tone="neutral" className="mb-4" title={t('Editing code needs the “Edit Scripts and Stylesheets” permission.')} />}
      {list('scripts', t('Scripts'), t('New Script'))}
      {list('styles', t('Stylesheets'), t('New Stylesheet'))}
      <Group title={t('Libraries')} onAdd={allowed && busy !== 'add' && libraries.data?.imports.length ? () => void addLibrary() : undefined} addLabel={t('Add Library')} action={busy === 'add' ? <span role="status" aria-label={t('Working…')} className="grid size-6 place-items-center text-faint"><Spinner size={14} /></span> : undefined}>
        {libraries.isError ? <QueryError compact onRetry={() => void libraries.refetch()} retrying={libraries.isRefetching} />
          : !libraries.data ? <Loading />
          : libraries.data.imports.length === 0 ? <EmptyState compact icon="code" title={t('No libraries')} action={allowed ? <Button icon="plus" loading={busy === 'add'} onClick={() => void addLibrary()}>{t('Add Library')}</Button> : undefined} />
          : libraries.data.imports.map((library) => (
            <div key={library.import} className="cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-text">{library.import}</span>
              <span className="shrink-0 font-mono text-2xs text-faint">{library.version}</span>
              {busy === library.import ? <span role="status" aria-label={t('Working…')} className="grid size-6 shrink-0 place-items-center text-faint"><Spinner size={14} /></span> : menu(t('Library Actions'), allowed ? [
                { label: t('Update'), icon: 'refresh', disabled: !!busy, onSelect: () => void fetching(library.import, () => run('styling-vendor/update', { import: library.import }), t('{name} updated', { name: library.import })) },
                { separator: true, label: '' },
                { label: t('Delete'), icon: 'trash', danger: true, disabled: !!busy, onSelect: () => void removeLibrary(library.import) },
              ] : [])}
            </div>
          ))}
      </Group>
    </>
  )
}
