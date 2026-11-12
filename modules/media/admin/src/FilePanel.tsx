import { can, invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Button, Dialog, Field, Fields, Icon, IconButton, List, Row, confirm, copyText, formatBytes, toast } from '@letterncms/ui'
import { useRef, useState } from 'react'
import { deleteFiles, useHref, type MediaUse } from './actions'
import { CropDialog } from './Crop'
import { MoveDialog } from './Folders'
import { FileTile, kindWords } from './kinds'
import { FocalPoint } from './FocalPoint'
import { upload, type MediaItem } from './upload'

/** One file: what it is, its words, where it is used, and the way to delete it. A form: Save is the dialog's own button. */
export function FileDialog({ item: listed, folders, onClose }: { item: MediaItem; folders: string[]; onClose: () => void }) {
  // The file as it is now: replacing, rotating and cropping change it at once, ahead of the list behind.
  const [item, setItem] = useState(listed)
  const [draft, setDraft] = useState({ name: item.name, alt: item.alt ?? '', caption: item.caption ?? '' })
  // Moving is an act of its own, done at once: the folder shown follows it, whatever the list behind still holds.
  const [folder, setFolder] = useState(item.folder)
  const [moving, setMoving] = useState(false)
  const [cropping, setCropping] = useState(false)
  const [working, setWorking] = useState<'rotate' | 'replace' | null>(null)
  const [focal, setFocal] = useState(item.focal)
  const [busy, setBusy] = useState(false)
  const dirty = draft.name !== item.name || draft.alt !== (item.alt ?? '') || draft.caption !== (item.caption ?? '') || focal.x !== item.focal.x || focal.y !== item.focal.y
  const editable = can('media.edit')
  const uses = useAbility<{ usedBy: MediaUse[] }>('media/get', { id: item.id })
  const usedBy = uses.data?.usedBy ?? []
  // A photo has a point to keep in view; a drawing (SVG) is shown whole.
  const photo = item.kind === 'image' && item.mime !== 'image/svg+xml'
  // What the server can turn and cut.
  const tools = editable && ['image/jpeg', 'image/png', 'image/webp'].includes(item.mime) && !!item.width
  const url = item.url
  const picture = item.thumb ?? url
  const input = useRef<HTMLInputElement>(null)
  // New pixels: the picture, its size and where its focal point now lies.
  const changed = (next: MediaItem) => { setItem(next); setFocal(next.focal); invalidate('media/') }

  const rotate = async () => {
    setWorking('rotate')
    try {
      changed(await run<MediaItem>('media/transform', { id: item.id, rotate: 90 }))
    } catch (error) {
      toast.error(error)
    } finally {
      setWorking(null)
    }
  }

  const replace = async (chosen: File) => {
    if (!await confirm({ title: t('Replace “{name}”?', { name: item.name }), description: t('“{file}” takes its place wherever it is used. The file there now is deleted.', { file: chosen.name }), confirm: t('Replace File') })) return
    setWorking('replace')
    try {
      changed(await upload(chosen, '', undefined, item.id))
    } catch (error) {
      toast.error(error)
    } finally {
      setWorking(null)
    }
  }

  const save = async () => {
    setBusy(true)
    try {
      await run('media/update', { id: item.id, ...draft, focal })
      invalidate('media/')
      onClose()
    } catch (error) {
      toast.error(error)
      setBusy(false)
    }
  }

  // Cropping takes the sheet over: one dialog, one Cancel, and back to the details as they were, unsaved words included.
  if (cropping) return <CropDialog item={item} src={picture} onClose={(cropped) => { setCropping(false); if (cropped) changed(cropped) }} />

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()} title={item.name} {...(editable ? { onSubmit: () => void save(), submitLabel: t('Save'), submitDisabled: !dirty, busy } : {})}>
      <div className="flex min-w-0 flex-col gap-4">
        {photo ? (
          editable
            ? (
              <div>
                <FocalPoint src={picture} value={focal} onChange={setFocal} />
                {/* What changes the picture itself, under it. */}
                {tools && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <Button size="sm" icon="crop" disabled={working !== null} onClick={() => setCropping(true)}>{t('Crop')}</Button>
                    <Button size="sm" icon="arrow-clockwise" loading={working === 'rotate'} disabled={working !== null} onClick={() => void rotate()}>{t('Rotate')}</Button>
                  </div>
                )}
              </div>
            )
            : <img src={picture} alt={item.alt ?? ''} className="mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken" />
        ) : item.kind === 'image' ? (
          <img src={url} alt={item.alt ?? ''} className="mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken" />
        ) : item.kind === 'video' ? (
          <video key={url} src={url} controls className="max-h-[44vh] w-full rounded-md bg-sunken" />
        ) : (
          // Nothing here draws a model, a texture, an animation or a document: it is shown as what it is.
          <FileTile item={item} size={28} className="h-32 rounded-md bg-sunken" />
        )}

        <dl className="m-0 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-y-1 text-xs">
          <dt className="text-faint">{t('Kind')}</dt><dd className="m-0 truncate">{kindWords(item)}</dd>
          <dt className="text-faint">{t('Size')}</dt><dd className="m-0">{formatBytes(item.size)}</dd>
          {item.width && <><dt className="text-faint">{t('Dimensions')}</dt><dd className="m-0">{item.width} × {item.height}</dd></>}
          {folder && <><dt className="text-faint">{t('Folder')}</dt><dd className="m-0 truncate">{folder}</dd></>}
          <dt className="text-faint">{t('URL')}</dt>
          <dd className="m-0 flex min-w-0 items-center gap-1">
            <span className="truncate font-mono">{item.url}</span>
            <IconButton icon="copy" label={t('Copy URL')} size="xs" onClick={() => void copyText(new URL(item.url, location.origin).href, { copied: t('URL copied'), failed: t('Couldn’t copy the URL') })} />
          </dd>
        </dl>

        <Fields
          className="gap-y-4!"
          disabled={!editable}
          fields={[
            { handle: 'name', type: 'text', label: t('Name'), size: 'sm' },
            ...(item.kind === 'image' ? [{ handle: 'alt', type: 'textarea', label: t('Alt Text'), rows: 2 }] : []),
            { handle: 'caption', type: 'textarea', label: t('Caption'), rows: 2 },
          ]}
          values={draft}
          onChange={(h, v) => setDraft({ ...draft, [h]: v ?? '' })}
        />

        {usedBy.length > 0 && (
          <Field label={t('Used In')}>
            <List>
              {usedBy.map((use) => (
                <Row key={`${use.kind}:${use.id}`} to={useHref(use)}>
                  <Icon name={use.kind === 'entry' ? 'page' : use.kind === 'global' ? 'globe' : 'palette'} size={16} className="shrink-0 text-muted" />
                  <span className="truncate">{use.title}</span>
                </Row>
              ))}
            </List>
          </Field>
        )}

        {(editable || can('media.delete')) && (
          <div className="flex flex-wrap items-center gap-2 pb-0.5">
            {editable && <Button size="sm" icon="upload" loading={working === 'replace'} disabled={working !== null} onClick={() => input.current?.click()}>{t('Replace File')}</Button>}
            {editable && <Button size="sm" icon="folder" onClick={() => setMoving(true)}>{t('Move to Folder')}</Button>}
            {can('media.delete') && <Button size="sm" variant="destructive" icon="trash" onClick={async () => { if ((await deleteFiles([item])).length) onClose() }}>{t('Delete File')}</Button>}
          </div>
        )}
        {/* What opens from here has a form of its own: its submit rises through React's tree, and must not save this one too. */}
        <div className="hidden" onSubmit={(e) => e.stopPropagation()}>
            {/* Another file of the same kind, for this one's place. */}
            <input ref={input} type="file" className="hidden" accept={{ image: 'image/*', video: 'video/*', audio: 'audio/*', pdf: 'application/pdf' }[item.kind as string]} onChange={(e) => { const chosen = e.target.files?.[0]; e.target.value = ''; if (chosen) void replace(chosen) }} />
            {moving && <MoveDialog files={[{ id: item.id, folder }]} folders={folders} onClose={(to) => { setMoving(false); if (to !== undefined) setFolder(to) }} />}
        </div>
      </div>
    </Dialog>
  )
}
