import { can, invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Button, Dialog, Field, Fields, Icon, IconButton, List, Row, copyText, formatBytes, toast } from '@letterncms/ui'
import { useState } from 'react'
import { deleteFiles, useHref, type MediaUse } from './actions'
import { FocalPoint } from './FocalPoint'
import type { MediaItem } from './upload'

/** One file: what it is, its words, where it is used, and the way to delete it. A form: Save is the dialog's own button. */
export function FileDialog({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const [draft, setDraft] = useState({ name: item.name, alt: item.alt ?? '', caption: item.caption ?? '', folder: item.folder })
  const [focal, setFocal] = useState(item.focal)
  const [busy, setBusy] = useState(false)
  const dirty = draft.name !== item.name || draft.alt !== (item.alt ?? '') || draft.caption !== (item.caption ?? '') || draft.folder !== item.folder || focal.x !== item.focal.x || focal.y !== item.focal.y
  const editable = can('media.edit')
  const uses = useAbility<{ usedBy: MediaUse[] }>('media/get', { id: item.id })
  const usedBy = uses.data?.usedBy ?? []
  // A photo has a point to keep in view; a drawing (SVG) is shown whole.
  const photo = item.kind === 'image' && item.mime !== 'image/svg+xml'

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

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()} title={item.name} {...(editable ? { onSubmit: () => void save(), submitLabel: t('Save'), submitDisabled: !dirty, busy } : {})}>
      <div className="flex min-w-0 flex-col gap-4">
        {photo ? (
          editable
            ? <Field label={t('Focal Point')}><FocalPoint src={item.thumb ?? item.url} value={focal} onChange={setFocal} /></Field>
            : <img src={item.thumb ?? item.url} alt={item.alt ?? ''} className="mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken" />
        ) : item.kind === 'image' ? (
          <img src={item.url} alt={item.alt ?? ''} className="mx-auto block max-h-[44vh] max-w-full rounded-md bg-sunken" />
        ) : item.kind === 'video' ? (
          <video src={item.url} controls className="max-h-[44vh] w-full rounded-md bg-sunken" />
        ) : item.kind === 'audio' ? (
          <audio src={item.url} controls className="w-full" />
        ) : (
          <div className="grid h-32 place-items-center rounded-md bg-sunken text-muted"><Icon name="file-text" size={28} /></div>
        )}

        <dl className="m-0 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-y-1 text-xs">
          <dt className="text-faint">{t('Type')}</dt><dd className="m-0 truncate">{item.mime}</dd>
          <dt className="text-faint">{t('Size')}</dt><dd className="m-0">{formatBytes(item.size)}</dd>
          {item.width && <><dt className="text-faint">{t('Dimensions')}</dt><dd className="m-0">{item.width} × {item.height}</dd></>}
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
            { handle: 'folder', type: 'text', label: t('Folder'), size: 'sm', mono: true, placeholder: 'team/2026' },
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

        {can('media.delete') && (
          <div>
            <Button size="sm" variant="destructive" icon="trash" onClick={async () => { if ((await deleteFiles([item])).length) onClose() }}>{t('Delete File')}</Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
