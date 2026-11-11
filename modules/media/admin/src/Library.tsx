import { can, locale, setQuery, t, useAbility, useLocation, type FieldDef } from '@letterncms/sdk'
import { Badge, Button, DataView, EmptyState, Fields, Icon, IconButton, Menu, NoMatches, SelectionBar, cn, copyText, formatBytes, readViewPrefs } from '@letterncms/ui'
import { useEffect, useRef, useState, type DragEvent } from 'react'
import { deleteFiles } from './actions'
import { FileDialog } from './FileDialog'
import { libraryFolder, uploadAll, type MediaItem } from './upload'

const KINDS = ['all', 'image', 'video', 'audio', 'pdf', 'file'] as const
type Kind = (typeof KINDS)[number]

interface MediaFilters { search: string; kind: Kind; folder: string | null }
const mediaInput = (filters: MediaFilters, page: number, sort: string | null, only: { accept?: string; except?: string } = {}) => ({ ...only, search: filters.search || undefined, kind: filters.kind, folder: filters.folder, page, perPage: 60, sort: sort ?? undefined })

/** Search, and the kind switch unless the picker's field fixes the kind. */
function filterFields(kinds: boolean): FieldDef[] {
  return [
    { handle: 'search', type: 'text', label: t('Search Files'), icon: 'search', size: 'sm', placeholder: t('Search Files'), className: 'w-full sm:w-60' },
    ...(kinds ? [{ handle: 'kind', type: 'select', label: t('Kind'), display: 'segmented', required: true, options: { all: t('All'), image: t('Images'), video: t('Videos'), audio: t('Audio'), pdf: 'PDF', file: t('Other') } }] : []),
  ]
}

/**
 * The media library. In "manage" mode clicking opens details; in "pick" mode
 * clicking selects (for media fields and image blocks). `bar`: the page's bar has the
 * Upload button (the Media place, a view), so the library has none of its own.
 */
export function Library({ mode = 'manage', accept = '*', except, multiple = false, selected = [], onSelectionChange, autoUpload = false, bar = false }: { mode?: 'manage' | 'pick'; accept?: string; except?: string; multiple?: boolean; selected?: string[]; onSelectionChange?: (ids: string[], items: MediaItem[]) => void; autoUpload?: boolean; bar?: boolean }) {
  const { query } = useLocation()
  const startKind: Kind = accept.startsWith('image') ? 'image' : accept.startsWith('video') ? 'video' : accept === 'application/pdf' ? 'pdf' : 'all'
  // On the Media place the filters are in the address too: its count reads them (MediaModule::places), and a link keeps them.
  const [filters, setFilters] = useState<MediaFilters>(() => bar
    ? { search: query.search ?? '', kind: (KINDS as readonly string[]).includes(query.kind ?? '') ? query.kind as Kind : 'all', folder: query.folder || null }
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
    return () => { libraryFolder.current = '' }
  }, [bar, folder])
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState(() => readViewPrefs('overview.media', 'grid').sort)
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [open, setOpen] = useState<MediaItem | null>(null)
  const list = useAbility<{ items: MediaItem[]; total: number; page: number; pages: number; folders: string[] }>('media/list', mediaInput(filters, page, sort, only), { placeholderData: (p) => p })
  const items = list.data?.items ?? []
  const allow = can('media.upload')
  const filter = (handle: string, value: unknown) => { setPage(1); setChosen(new Set()); setFilters((f) => ({ ...f, [handle]: value })) }
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
  const preview = (item: MediaItem) => item.thumb ? <img src={item.thumb} alt={item.alt ?? ''} loading="lazy" className="absolute inset-0 size-full object-cover" style={{ objectPosition: `${item.focal.x}% ${item.focal.y}%` }} /> : <div className="grid size-full place-items-center text-faint"><Icon name={item.kind === 'video' ? 'video' : item.kind === 'audio' ? 'file' : 'file-text'} size={24} /></div>
  // What a picker opens on (images, for an image field) is where it starts, not something someone filtered by:
  // an empty library says so and offers the upload, never "No matches".
  const filtered = !!filters.search || kind !== (bar ? 'all' : startKind) || folder !== null
  // An empty library is its empty state and the way to fill it: no filters, display or count yet. The page's bar has the one black Upload.
  const blank = !filtered && !list.isError && list.data?.total === 0
  // A field that takes one kind shows that kind: nothing to switch.
  const fixed = !bar && startKind !== 'all'
  return (
    <div className={cn('relative min-w-0', dropping && 'rounded-lg outline-2 -outline-offset-2 outline-focus')} {...drop}>
      <DataView id="media" label={t('Media')} items={items} source={{ ability: 'media/list', input: mediaInput(filters, 1, sort, only), perPage: 60 }} rowKey={(item) => item.id} onRowClick={toggle} defaultView="grid" image={preview}
        pagination={list.data && { page: list.data.page, pages: list.data.pages, total: list.data.total, perPage: 60, onPage: setPage }}
        loading={list.isLoading} stale={list.isPlaceholderData} error={list.isError} onRetry={() => void list.refetch()}
        // Uploaded is a column of its own; a file is never "published".
        dates={(item) => ({ publishedAt: null, updatedAt: item.updatedAt })}
        sort={sort} dateSort={{ updated: 'updated_at' }} onSort={(sort) => { setPage(1); setSort(sort) }}
        selection={{ ids: mode === 'manage' ? chosen : new Set(selected), onSelect: select }}
        selected={(item) => open?.id === item.id}
        toolbar={blank ? undefined : <>
          <Fields layout="inline" bare className="flex min-w-0 flex-wrap items-center gap-2 max-sm:w-full" fields={[...filterFields(!fixed), ...(list.data?.folders.length ? [{ handle: 'folder', type: 'select', label: t('Folder'), size: 'sm' as const, placeholder: t('All Folders'), options: list.data.folders.map((f) => ({ value: f, label: f, icon: 'folder' })), className: 'w-44' }] : [])]} values={filters} onChange={filter} />
          {!bar && uploadButton(autoUpload)}
        </>}
        columns={[
          { id: 'name', label: t('Name'), sort: 'name', render: (item) => item.name },
          { id: 'type', label: t('Type'), width: '160px', render: (item) => item.mime },
          { id: 'size', label: t('Size'), width: '100px', align: 'end', sort: 'size', render: (item) => formatBytes(item.size) },
          { id: 'folder', label: t('Folder'), width: '160px', sort: 'folder', render: (item) => item.folder || '—' },
          { id: 'alt', label: t('Alt Text'), hiddenByDefault: true, width: '120px', render: (item) => item.kind === 'image' ? item.alt ? <Badge tone="success">{t('Added')}</Badge> : <Badge tone="warning">{t('No alt text')}</Badge> : '—' },
          { id: 'created', label: t('Uploaded'), width: '120px', sort: 'created_at', render: (item) => new Date(item.createdAt).toLocaleDateString(locale(), { dateStyle: 'medium' }) },
        ]}
        actions={(item) => <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: item.name })} size="xs" />} items={[
          { label: mode === 'pick' ? t('Choose') : t('Open'), icon: 'edit', onSelect: () => toggle(item) },
          { label: t('Copy URL'), icon: 'copy', onSelect: () => void copyText(new URL(item.url, location.origin).href, { copied: t('URL copied'), failed: t('Couldn’t copy the URL') }) },
          mode === 'manage' && can('media.delete') && { label: t('Delete'), icon: 'trash', danger: true, disabled: deleting, onSelect: () => void deleteItems([item.id]) },
        ]} />}
        empty={filtered ? <NoMatches onClear={() => { setFilters({ search: '', kind: bar ? 'all' : startKind, folder: null }); setPage(1) }} /> : <EmptyState icon="media" title={kind === 'image' ? t('No images yet') : kind === 'video' ? t('No videos yet') : t('No files yet')} action={uploadButton(false, 'secondary')} />}
      />

      {/* Opened to upload (?upload=1): the picker, with the page's own button in its bar. */}
      {bar && autoUpload && <span className="hidden">{uploadButton(true)}</span>}

      {mode === 'manage' && <SelectionBar count={chosen.size} onClear={() => setChosen(new Set())}>{can('media.delete') && <Button size="sm" variant="destructive" loading={deleting} onClick={() => void deleteItems([...chosen])}>{t('Delete')}</Button>}</SelectionBar>}

      {mode === 'manage' && open && <FileDialog key={open.id} item={items.find((i) => i.id === open.id) ?? open} onClose={() => setOpen(null)} />}
    </div>
  )
}
