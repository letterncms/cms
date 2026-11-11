import { invalidate, run, t, type SurfaceComponentProps } from '@letterncms/sdk'
import { Button, Dialog, Icon, cn, confirm, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { libraryFolder, type MediaItem } from './upload'

/** A folder is its path: `press/2026` is 2026 inside press. */
export const folderName = (path: string) => path.slice(path.lastIndexOf('/') + 1)
export const folderParent = (path: string) => path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''
const inside = (path: string, folder: string) => path === folder || path.startsWith(`${folder}/`)

/** Ask for a name and make the folder, inside `parent`. Resolves with its path, or null. */
export async function newFolder(parent = ''): Promise<string | null> {
  const asked = await prompt({ title: t('New Folder'), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true }], confirm: t('Create Folder') })
  const name = String(asked?.name ?? '').trim()
  if (!name) return null
  try {
    const { path } = await run<{ path: string }>('media-folders/create', { path: parent ? `${parent}/${name}` : name })
    invalidate('media/')
    return path
  } catch (error) {
    toast.error(error)
    return null
  }
}

/** Ask for a folder's new name. Resolves with its new path, or null. */
export async function renameFolder(path: string): Promise<string | null> {
  const asked = await prompt({ title: t('Rename Folder'), fields: [{ handle: 'name', type: 'text', label: t('Name'), required: true }], values: { name: folderName(path) }, confirm: t('Rename') })
  const name = String(asked?.name ?? '').trim()
  if (!name || name === folderName(path)) return null
  try {
    const renamed = await run<{ path: string }>('media-folders/rename', { path, to: folderParent(path) ? `${folderParent(path)}/${name}` : name })
    invalidate('media/')
    return renamed.path
  } catch (error) {
    toast.error(error)
    return null
  }
}

/** Delete a folder after asking: its files live on in the folder above. */
export async function deleteFolder(path: string): Promise<boolean> {
  if (!await confirm({ title: t('Delete “{name}”?', { name: folderName(path) }), description: t('Its files move to the folder above.'), confirm: t('Delete'), danger: true })) return false
  try {
    await run('media-folders/delete', { path })
    invalidate('media/')
    return true
  } catch (error) {
    toast.error(error)
    return false
  }
}

/** Where the folder on view is after `from` became `to` (renamed) or went (deleted, `to` null: the folder above). */
export function folderAfter(current: string | null, from: string, to: string | null): string | null {
  if (current === null || !inside(current, from)) return current
  return to === null ? folderParent(from) || null : to + current.slice(from.length)
}

/**
 * The folders as a tree: one row each, set in by how deep it lies, under a first row for what is outside them
 * all. Rows are the sidebar's: rounded, the one chosen filled. `value` is the folder chosen; `actions` puts a
 * menu on a folder's row; `current` marks where the files are now (the move dialog).
 */
export function FolderTree({ folders, value, onChange, root, actions, current, className }: { folders: string[]; value: string | null; onChange: (folder: string | null) => void; root: { value: string | null; label: string }; actions?: (path: string) => ReactNode; current?: string | null; className?: string }) {
  const row = (path: string | null, label: string, icon: string, depth: number, menu?: ReactNode) => (
    <div key={path ?? ''} role="listitem" className="cms-reveal-row group relative flex items-center">
      <Button variant="ghost" aria-pressed={value === path} onClick={() => onChange(path)} className={cn('h-8 min-w-0 flex-1 justify-start gap-2 rounded-md pr-2 font-normal', menu ? 'pr-8' : undefined)} style={{ paddingLeft: 8 + depth * 16 }}>
        <Icon name={icon} size={16} className="shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        {current !== undefined && current === path && <span className="shrink-0 text-xs text-faint">{t('Current')}</span>}
      </Button>
      {menu && <div className="cms-reveal absolute right-1 flex items-center">{menu}</div>}
    </div>
  )
  return (
    <div role="list" className={cn('space-y-px', className)}>
      {row(root.value, root.label, 'media', 0)}
      {folders.map((path) => row(path, folderName(path), 'folder', path.split('/').length - 1, actions?.(path)))}
    </div>
  )
}

/** What a folder's menu offers where folders are managed. */
export function folderActions(path: string, done: (to: string | null | undefined, made?: string) => void): MenuItemDef[] {
  return [
    { label: t('New Folder'), icon: 'plus', onSelect: () => void newFolder(path).then((made) => made && done(undefined, made)) },
    { label: t('Rename'), icon: 'edit', onSelect: () => void renameFolder(path).then((to) => to && done(to)) },
    { label: t('Delete Folder'), icon: 'trash', danger: true, onSelect: () => void deleteFolder(path).then((gone) => gone && done(null)) },
  ]
}

/** Move files to a folder: choose one of the tree, or make one here first. */
export function MoveDialog({ files, folders, onClose }: { files: Pick<MediaItem, 'id' | 'folder'>[]; folders: string[]; onClose: (folder?: string) => void }) {
  const from = files.every((file) => file.folder === files[0].folder) ? files[0].folder : null
  // Nothing is chosen until someone chooses: the folder the files are in says so by its label, not by the fill of a choice.
  const [target, setTarget] = useState<string | null>(null)
  const [made, setMade] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const all = [...new Set([...folders, ...made])].sort()

  const move = async () => {
    setBusy(true)
    try {
      const moved = await run<{ folder: string }>('media/move', { ids: files.map((file) => file.id), folder: target ?? '' })
      invalidate('media/')
      onClose(moved.folder)
    } catch (error) {
      toast.error(error)
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()} size="sm" title={t('Move to Folder')} onSubmit={() => void move()} submitLabel={t('Move')} submitDisabled={target === null || target === from} busy={busy}>
      {/* Where the files are now is said on its row; the row chosen is the filled one. */}
      <FolderTree folders={all} value={target} current={from} onChange={(folder) => setTarget(folder ?? '')} root={{ value: '', label: t('No Folder') }} />
      <Button variant="ghost" icon="plus" className="mt-1 w-full justify-start px-2 font-normal text-muted" onClick={() => void newFolder(target ?? from ?? '').then((path) => { if (path) { setMade((list) => [...list, path]); setTarget(path) } })}>{t('New Folder')}</Button>
    </Dialog>
  )
}

/** The Media place's New Folder: asks for a name, makes it in the folder on view and goes there. */
export function NewFolderAction({ close }: SurfaceComponentProps) {
  const asked = useRef(false)
  useEffect(() => {
    if (asked.current) return
    asked.current = true
    void newFolder(libraryFolder.current).then((path) => {
      if (path) libraryFolder.show?.(path)
      close?.()
    })
  }, [])
  return null
}
