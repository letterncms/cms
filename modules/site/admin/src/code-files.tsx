import { can, invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Fields, IconButton, Menu, QueryError, Skeleton, Spinner, confirm, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useState } from 'react'
import { Disclosure, Group } from './design-parts'

interface Files {
  scripts: string[]
  styles: string[]
}

interface Library {
  import: string
  package: string
  version: string
}

/** A row's ⋯: the kit's reveal. */
const rowAction = 'cms-reveal shrink-0'

const Loading = () => <div className="space-y-2 py-3"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-24" /></div>
const None = ({ children }: { children: string }) => <p className="m-0 py-3 text-xs text-faint">{children}</p>
const menu = (label: string, items: MenuItemDef[]) => (items.length > 0 ? <Menu trigger={<IconButton icon="more" label={label} size="xs" className={rowAction} />} items={items} /> : <span className="size-6 shrink-0" />)

/** What a new file starts as: a script is a module a block can name as its behaviour. */
const STARTER = { scripts: 'export function mount(el, props) {\n}\n', styles: '\n' }
const EXT = { scripts: 'js', styles: 'css' } as const
type Kind = keyof typeof EXT

/** One script or style of the design: its name as blocks write it, opening on its contents. What is typed joins the screen's draft. */
function File({ path, name, open, onToggle, edited, onEdit, allowed, onDelete }: { path: string; name: string; open: boolean; onToggle: () => void; edited: string | undefined; onEdit: (contents: string) => void; allowed: boolean; onDelete: () => void }) {
  const loaded = useAbility<{ contents: string }>('design-code/get', { path }, { enabled: open && allowed && edited === undefined, staleTime: 0 })
  return (
    <Disclosure open={open} onToggle={onToggle} label={<span className="font-mono">{name}</span>} menu={menu(t('File Actions'), allowed ? [{ label: t('Delete'), icon: 'trash', danger: true, onSelect: onDelete }] : [])}>
      {loaded.isError ? <QueryError compact onRetry={() => void loaded.refetch()} retrying={loaded.isRefetching} />
        : edited === undefined && !loaded.data ? <Loading />
        : <Fields bare fields={[{ handle: 'contents', type: 'code', label: name, rows: 14 }]} values={{ contents: edited ?? loaded.data?.contents ?? '' }} onChange={(_, v) => onEdit(v ?? '')} disabled={!allowed} />}
    </Disclosure>
  )
}

/**
 * The code beside the design, one list per kind: Styles and Scripts each start with the site's own file
 * (custom.css, custom.js, on every page) and go on with the files blocks, templates and components load by name
 * (content/design/styles, content/design/scripts); then the libraries scripts import. What is typed in a file is
 * part of the screen's draft and saved with it. Adding or deleting a file and changing a library happen at once:
 * they are files of the site, like fonts. All of it needs `site.code`.
 */
export function CodeFiles({ css, js, onCustom, edits, onEdit }: { css: string; js: string; onCustom: (code: { css?: string; js?: string }) => void; edits: Record<string, string>; onEdit: (path: string, contents: string | null) => void }) {
  const allowed = can('site.code')
  const files = useAbility<Files>('design-code/list')
  const libraries = useAbility<{ imports: Library[] }>('design-vendor/list')
  const [open, setOpen] = useState<string | null>(null)
  /** The library being fetched, or 'add' while a new one is. */
  const [busy, setBusy] = useState<string | null>(null)
  const refresh = () => invalidate('design-code/', 'design-vendor/')
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
      title: kind === 'scripts' ? t('New Script') : t('New Style'),
      fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: 'hero' }],
      confirm: kind === 'scripts' ? t('Create Script') : t('Create Style'),
    })
    const name = String(asked?.name ?? '').trim().toLowerCase().replace(/\.(js|css)$/, '').replace(/\s+/g, '-')
    if (!name) return
    if ((files.data?.[kind] ?? []).includes(name)) return void toast.error(t('“{name}” already exists', { name }))
    const path = `${kind}/${name}.${EXT[kind]}`
    // It opens on what it starts with, ready to be written.
    if (await act(() => run('design-code/save', { path, contents: STARTER[kind] }), t('{name} added', { name }))) setOpen(path)
  }
  const removeFile = async (path: string, name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete'), danger: true }))) return
    if (await act(() => run('design-code/delete', { path }), t('{name} deleted', { name }))) onEdit(path, null)
  }
  const addLibrary = async () => {
    const asked = await prompt({
      title: t('Add Library'),
      fields: [{ handle: 'package', type: 'text', label: t('Package'), mono: true, autofocus: true, placeholder: 'gsap@3.12.5' }],
      confirm: t('Add Library'),
    })
    const name = String(asked?.package ?? '').trim()
    if (name) await fetching('add', () => run('design-vendor/create', { package: name }), t('{name} added', { name }))
  }
  const removeLibrary = async (name: string) => {
    if (!(await confirm({ title: t('Delete “{name}”?', { name }), confirm: t('Delete'), danger: true }))) return
    await act(() => run('design-vendor/delete', { import: name }), t('{name} deleted', { name }))
  }

  const list = (kind: Kind, title: string, add: string, site: { handle: 'css' | 'js'; label: string; value: string; placeholder: string }) => (
    <Group title={title} onAdd={allowed ? () => void addFile(kind) : undefined} addLabel={add}>
      {/* The site's own file first: the same kind of thing as the files under it, on every page. */}
      <Disclosure open={open === site.handle} onToggle={() => setOpen(open === site.handle ? null : site.handle)} label={site.label} menu={<span className="size-6 shrink-0" />}>
        <Fields bare fields={[{ handle: site.handle, type: 'code', label: site.label, rows: 14, placeholder: site.placeholder }]} values={{ [site.handle]: site.value }} onChange={(_, v) => onCustom({ [site.handle]: v ?? '' })} disabled={!allowed} />
      </Disclosure>
      {files.isError ? <QueryError compact onRetry={() => void files.refetch()} retrying={files.isRefetching} />
        : !files.data ? <Loading />
        : files.data[kind].map((name) => {
          const path = `${kind}/${name}.${EXT[kind]}`
          return <File key={path} path={path} name={name} open={open === path} onToggle={() => setOpen(open === path ? null : path)} edited={edits[path]} onEdit={(contents) => onEdit(path, contents)} allowed={allowed} onDelete={() => void removeFile(path, name)} />
        })}
    </Group>
  )

  return (
    <>
      {list('styles', t('Styles'), t('New Style'), { handle: 'css', label: t('Site CSS'), value: css, placeholder: '.cms-prose figure { margin-block: 2rem; }' })}
      {list('scripts', t('Scripts'), t('New Script'), { handle: 'js', label: t('Site JavaScript'), value: js, placeholder: "document.addEventListener('cms:alpine', (e) => …)" })}
      <Group title={t('Libraries')} onAdd={allowed && busy !== 'add' ? () => void addLibrary() : undefined} addLabel={t('Add Library')} action={busy === 'add' ? <span role="status" aria-label={t('Working…')} className="grid size-6 place-items-center text-faint"><Spinner size={14} /></span> : undefined}>
        {libraries.isError ? <QueryError compact onRetry={() => void libraries.refetch()} retrying={libraries.isRefetching} />
          : !libraries.data ? <Loading />
          : libraries.data.imports.length === 0 ? <None>{t('No libraries')}</None>
          : libraries.data.imports.map((library) => (
            <div key={library.import} className="cms-reveal-row group flex min-h-10 items-center gap-2 border-b border-border last:border-b-0">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-text">{library.import}</span>
              <span className="shrink-0 font-mono text-2xs text-faint">{library.version}</span>
              {busy === library.import ? <span role="status" aria-label={t('Working…')} className="grid size-6 shrink-0 place-items-center text-faint"><Spinner size={14} /></span> : menu(t('Library Actions'), allowed ? [
                { label: t('Update'), icon: 'refresh', disabled: !!busy, onSelect: () => void fetching(library.import, () => run('design-vendor/update', { import: library.import }), t('{name} updated', { name: library.import })) },
                { separator: true, label: '' },
                { label: t('Delete'), icon: 'trash', danger: true, disabled: !!busy, onSelect: () => void removeLibrary(library.import) },
              ] : [])}
            </div>
          ))}
      </Group>
      {!allowed && <p className="m-0 text-2xs text-warning">{t('Editing code needs the “Edit custom CSS and JavaScript” permission.')}</p>}
    </>
  )
}
