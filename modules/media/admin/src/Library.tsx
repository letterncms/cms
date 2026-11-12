import { can, locale, setQuery, t, useAbility, useLocation, type FieldDef } from '@letterncms/sdk'
import { Badge, Button, DataView, EmptyState, Fields, Icon, IconButton, Menu, NoMatches, SelectionBar, cn, copyText, drawing, formatBytes, readViewPrefs } from '@letterncms/ui'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { deleteFiles } from './actions'
import { FileDialog } from './FileDialog'
import { FileTile, KINDS, acceptKind, kindOptions, kindWords, type MediaKind } from './kinds'
import { FolderTree, MoveDialog, folderActions, folderAfter, folderName } from './Folders'
import { libraryFolder, uploadAll, type MediaItem } from './upload'

type Kind = MediaKind | 'all'

interface MediaFilters { search: string; kind: Kind; folder: string | null }
const mediaInput = (filters: MediaFilters, page: number, sort: string | null, only: { accept?: string; except?: string } = {}) => ({ ...only, search: filters.search || undefined, kind: filters.kind, folder: filters.folder, page, perPage: 60, sort: sort ?? undefined })

/** Search, and the kind unless the picker's field fixes it: a select, so eight kinds are one quiet control. */
function filterFields(kinds: boolean): FieldDef[] {
  return [
    { handle: 'search', type: 'text', label: t('Search Files'), icon: 'search', size: 'sm', placeholder: t('Search Files'), className: 'w-full sm:w-60' },
    ...(kinds ? [{ handle: 'kind', type: 'select', label: t('Kind'), size: 'sm' as const, placeholder: t('All Kinds'), options: kindOptions(), className: 'w-full sm:w-40' }] : []),
  ]
}

/**
 * The media library. In "manage" mode clicking opens details; in "pick" mode
 * clicking selects (for media fields and image blocks). `bar`: the page's bar has the
 * Upload button (the Media place, a view), so the library has none of its own.
 */
export function Library({ mode = 'manage', accept = '*', except, multiple = false, selected = [], onSelectionChange, autoUpload = false, bar = false }: { mode?: 'manage' | 'pick'; accept?: string; except?: string; multiple?: boolean; selected?: string[]; onSelectionChange?: (ids: string[], items: MediaItem[]) => void; autoUpload?: boolean; bar?: boolean }) {
  const { query } = useLocation()
  const startKind: Kind = acceptKind(accept)
  // On the Media place the filters are in the address too: its count reads them (MediaModule::places), and a link keeps them.
  const [filters, setFilters] = useState<MediaFilters>(() => bar
    ? { search: query.search ?? '', kind: (KINDS as string[]).includes(query.kind ?? '') ? query.kind as Kind : 'all', folder: query.folder || null }
    : { search: '', kind: startKind, folder: null })
  const { kind, folder } = filters
  // A picker lists what its field takes: a family of types (image/*) is the kind filter, anything narrower is asked of the list.
  const only = mode === 'pick' ? { accept: accept !== '*' && !/^(image|video)\/\*$/.test(accept) && accept !== 'application/pdf' ? accept : undefined, except } : {}
  useEffect(() => {
    if (bar) setQuery({ search: filters.search || null, kind: filters.kind === 'all' ? null : filters.kind, folder: filters.folder })
  }, [bar, filters])
  // The page's Upload puts files in the folder on view.
  useEffect(() => {
    if (!bar) return
    libraryFolder.current = folder ?? ''
    libraryFolder.show = (to) => filter('folder', to)
    return () => { libraryFolder.current = ''; libraryFolder.show = undefined }
  }, [bar, folder])
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState(() => readViewPrefs('overview.media', 'grid').sort)
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState<MediaItem | null>(null)
  const [moving, setMoving] = useState<MediaItem[] | null>(null)
  const list = useAbility<{ items: MediaItem[]; total: number; page: number; pages: number; folders: string[] }>('media/list', mediaInput(filters, page, sort, only), { placeholderData: (p) => p })
  const items = list.data?.items ?? []
  const folders = list.data?.folders ?? []
  const allow = can('media.upload')
  const manages = mode === 'manage' && can('media.edit')
  // A folder's menu: what it does to the folder on view follows (renamed with it, up when it is deleted, into a new one).
  const folderMenu = (path: string) => folderActions(path, (to, made) => filter('folder', made ?? folderAfter(folder, path, to ?? null)))
  // The kind's select is empty for every kind.
  const filter = (handle: string, value: unknown) => { setPage(1); setChosen(new Set()); setFilters((f) => ({ ...f, [handle]: handle === 'kind' ? value || 'all' : value })) }
  // The upload button, in the page's top bar or the picker's toolbar: the one way to add files.
  const uploader = (field: Partial<FieldDef>): FieldDef[] => [{ handle: 'files', type: 'json', component: 'media-upload', label: t('Upload'), multiple: mode === 'manage' || multiple, accept: accept === '*' ? undefined : accept, ...field }]

  const send = async (files: FileList | File[]) => {
    const done = await uploadAll(files, folder ?? '')
    if (done.length && mode === 'pick') {
      const ids = multiple ? [...selected, ...done.map((d) => d.id)] : [done[0].id]
      onSelectionChange?.(ids, done)
    }
  }

  const toggle = (item: MediaItem) => {
    if (mode === 'manage') return setOpen(item)
    const next = multiple ? (selected.includes(item.id) ? selected.filter((i) => i !== item.id) : [...selected, item.id]) : [item.id]
    onSelectionChange?.(next, [item])
  }

  // Where Upload is in the screen's bar, an empty folder still offers it, under a name of its own.
  const emptyUpload = allow ? <Fields layout="inline" bare fields={uploader({ handle: 'files-here', variant: 'secondary' })} values={{}} onChange={(_, files) => void send(files)} /> : null
  const uploadButton = (autofocus = false, variant = mode === 'manage' ? 'primary' : 'secondary') => allow ? <Fields layout="inline" bare fields={uploader({ variant, autofocus })} values={{}} onChange={(_, files) => void send(files)} /> : null

  const select = (ids: string[], on: boolean, records = items) => {
    if (mode === 'pick') {
      const next = multiple ? [...new Set(on ? [...selected, ...ids] : selected.filter((id) => !ids.includes(id)))] : on ? ids.slice(0, 1) : []
      onSelectionChange?.(next, records.filter((item) => next.includes(item.id)))
    } else setChosen((current) => { const next = new Set(current); ids.forEach((id) => on ? next.add(id) : next.delete(id)); return next })
  }
  const deleteItems = async (ids: string[]) => {
    if (deleting) return
    setDeleting(true)
    try {
      const gone = await deleteFiles(items.filter((item) => ids.includes(item.id)))
      setChosen((current) => new Set([...current].filter((id) => !gone.includes(id))))
    } finally { setDeleting(false) }
  }
  // Files dragged in from the desktop land in the folder on view, like the Upload button's.
  const [dropping, setDropping] = useState(false)
  const depth = useRef(0)
  const hasFiles = (e: DragEvent) => allow && e.dataTransfer.types.includes('Files')
  const drop = {
    onDragEnter: (e: DragEvent) => { if (hasFiles(e)) { depth.current++; setDropping(true) } },
    onDragOver: (e: DragEvent) => { if (hasFiles(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } },
    onDragLeave: (e: DragEvent) => { if (hasFiles(e) && --depth.current <= 0) { depth.current = 0; setDropping(false) } },
    onDrop: (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth.current = 0
      setDropping(false)
      const files = Array.from(e.dataTransfer.files)
      void send(mode === 'pick' && !multiple ? files.slice(0, 1) : files)
    },
  }
  const preview = (item: MediaItem) => item.thumb ? <img src={item.thumb} alt={item.alt ?? ''} loading="lazy" className={cn('absolute inset-0 size-full', drawing(item.thumb) ? 'object-contain p-4' : 'object-cover')} style={drawing(item.thumb) ? undefined : { objectPosition: `${item.focal.x}% ${item.focal.y}%` }} /> : <FileTile item={item} />
  // What a picker opens on (images, for an image field) is where it starts, not something someone filtered by:
  // an empty library says so and offers the upload, never "No matches".
  // Nor is the folder on view: an empty folder is empty, not a search that found nothing.
  const filtered = !!filters.search || kind !== (bar ? 'all' : startKind)
  // An empty library is its empty state and the way to fill it: no filters, display or count yet. The page's bar has the one black Upload.
  const blank = !filtered && folder === null && !list.isError && list.data?.total === 0
  // A field that takes one kind shows that kind: nothing to switch.
  const fixed = !bar && startKind !== 'all'
  // The tree, wherever there are folders. Before the first one, New Folder is in the Media bar, beside Upload.
  const tree = folders.length > 0
  // A picker is thumbnails and names to choose from: no menus, no checkboxes, no display choices.
  const pick = mode === 'pick'
  return (
    <div className={cn('relative min-w-0', tree && 'md:grid md:grid-cols-[200px_minmax(0,1fr)] md:items-start md:gap-6', dropping && 'rounded-lg outline-2 -outline-offset-2 outline-focus')} {...drop}>
      {/* The folders, to browse: a tree beside the files; on a phone a select above them, so it stays one column. */}
      {tree && (
        <nav aria-label={t('Folders')} className="mt-1.5 max-md:hidden">
          <FolderTree folders={folders} value={folder} onChange={(to) => filter('folder', to)} root={{ value: null, label: t('All Files') }}
            actions={manages ? (path) => <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: folderName(path) })} size="xs" />} items={folderMenu(path)} /> : undefined} />
        </nav>
      )}
      {/* Files held over the library: where they will land. */}
      {dropping && <div className="pointer-events-none absolute inset-0 z-sticky flex justify-center rounded-lg bg-bg/80"><span className="sticky top-[30vh] mt-[20vh] flex h-fit items-center gap-2 rounded-md bg-float px-3 py-2 text-sm font-medium text-ink shadow-pop ring-1 ring-border-strong"><Icon name="upload" size={16} />{folder ? t('Drop to Upload to {folder}', { folder: folderName(folder) }) : t('Drop to Upload')}</span></div>}
      <div className="min-w-0">
      <DataView id="media" label={t('Media')} items={items} source={{ ability: 'media/list', input: mediaInput(filters, 1, sort, only), perPage: 60 }} rowKey={(item) => item.id} onRowClick={toggle} defaultView="grid" image={preview}
        pagination={list.data && { page: list.data.page, pages: list.data.pages, total: list.data.total, perPage: 60, onPage: setPage }}
        loading={list.isLoading} stale={list.isPlaceholderData} error={list.isError} onRetry={() => void list.refetch()}
        // Uploaded is a column of its own; a file is never "published".
        dates={(item) => ({ publishedAt: null, updatedAt: item.updatedAt })}
        sort={sort} dateSort={{ updated: 'updated_at' }} onSort={(sort) => { setPage(1); setSort(sort) }}
        selection={pick ? undefined : { ids: chosen, onSelect: select }}
        // The file that is open has its sheet over it: its tile is not marked as selected, which is what the checkboxes are for.
        selected={pick ? (item) => selected.includes(item.id) : undefined}
        plain={pick}
        toolbar={blank ? undefined : <>
          <Fields layout="inline" bare className="flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full" fields={[...filterFields(!fixed), ...(folders.length ? [{ handle: 'folder', type: 'select', label: t('Folder'), size: 'sm' as const, placeholder: t('All Files'), options: folders.map((f) => ({ value: f, label: '\u00a0\u00a0'.repeat(f.split('/').length - 1) + folderName(f), icon: 'folder' })), className: 'w-full sm:w-44 md:hidden' }] : [])]} values={{ ...filters, kind: kind === 'all' ? null : kind }} onChange={filter} />
          {manages && folder && <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: folderName(folder) })} size="sm" className="md:hidden" />} items={folderMenu(folder)} />}
          {!bar && uploadButton(autoUpload)}
        </>}
        columns={pick ? [{ id: 'name', label: t('Name'), render: (item) => item.name }] : [
          { id: 'name', label: t('Name'), sort: 'name', render: (item) => item.name },
          // What it is, in words: "Image · JPG", not a media type.
          { id: 'type', label: t('Kind'), width: '160px', render: (item) => kindWords(item) },
          { id: 'size', label: t('Size'), width: '100px', align: 'end', sort: 'size', render: (item) => formatBytes(item.size) },
          { id: 'folder', label: t('Folder'), hiddenByDefault: true, width: '160px', sort: 'folder', render: (item) => item.folder || '—' },
          { id: 'alt', label: t('Alt Text'), hiddenByDefault: true, width: '120px', render: (item) => item.kind === 'image' ? item.alt ? <Badge tone="success">{t('Added')}</Badge> : <Badge tone="warning">{t('No alt text')}</Badge> : '—' },
          { id: 'created', label: t('Uploaded'), hiddenByDefault: true, width: '120px', sort: 'created_at', render: (item) => new Date(item.createdAt).toLocaleDateString(locale(), { dateStyle: 'medium' }) },
        ]}
        actions={pick ? undefined : (item) => <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: item.name })} size="xs" />} items={[
          { label: t('Open'), icon: 'edit', onSelect: () => toggle(item) },
          { label: t('Copy URL'), icon: 'copy', onSelect: () => void copyText(new URL(item.url, location.origin).href, { copied: t('URL copied'), failed: t('Couldn’t copy the URL') }) },
          manages && { label: t('Move to Folder'), icon: 'folder', onSelect: () => setMoving([item]) },
          mode === 'manage' && can('media.delete') && { label: t('Delete'), icon: 'trash', danger: true, disabled: deleting, onSelect: () => void deleteItems([item.id]) },
        ]} />}
        empty={filtered ? <NoMatches onClear={() => { setFilters((f) => ({ search: '', kind: bar ? 'all' : startKind, folder: f.folder })); setPage(1) }} /> : <EmptyState icon={folder === null ? 'media' : 'folder'} title={folder !== null ? t('No files in this folder') : kind === 'image' ? t('No images yet') : kind === 'video' ? t('No videos yet') : t('No files yet')} action={bar ? emptyUpload : uploadButton(false, 'secondary')} />}
      />

      {/* Opened to upload (?upload=1): the picker, with the page's own button in its bar. */}
      {bar && autoUpload && <span className="hidden">{uploadButton(true)}</span>}

      {mode === 'manage' && <SelectionBar count={chosen.size} onClear={() => setChosen(new Set())}>{manages && <Button size="sm" variant="ghost" onClick={() => setMoving(items.filter((item) => chosen.has(item.id)))}>{t('Move to Folder')}</Button>}{can('media.delete') && <Button size="sm" variant="destructive" loading={deleting} onClick={() => void deleteItems([...chosen])}>{t('Delete')}</Button>}</SelectionBar>}

      {mode === 'manage' && open && <FileDialog key={open.id} item={items.find((i) => i.id === open.id) ?? open} folders={folders} onClose={() => setOpen(null)} />}
      {moving && moving.length > 0 && <MoveDialog files={moving} folders={folders} onClose={(to) => { setMoving(null); if (to !== undefined) setChosen(new Set()) }} />}
      </div>
    </div>
  )
}
