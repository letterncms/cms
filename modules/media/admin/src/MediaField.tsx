import { plural, t, useAbility, type FieldProps } from '@letterncms/sdk'
import { Button, Dialog, Icon, IconButton, cn } from '@letterncms/ui'
import { useState } from 'react'
import { FileTile } from './kinds'
import { Library } from './Library'
import type { MediaItem } from './upload'

/** Media field: thumbnails of the chosen files + a picker dialog with the full library. */
export function MediaField({ field, value, onChange, disabled }: FieldProps<string[]>) {
  const ids = (Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []).filter(Boolean)
  const max = (field.max as number) || Infinity
  const accept = (field.accept as string) || 'image/*'
  const images = accept.startsWith('image')
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string[]>(ids)
  const lookup = useAbility<{ items: MediaItem[] }>('media/get-many', { ids: ids.filter((i) => !i.startsWith('/') && !i.startsWith('http')) }, { enabled: ids.length > 0 })
  const byId = new Map((lookup.data?.items ?? []).map((m) => [m.id, m]))

  return (
    <div>
      <div className={cn('flex flex-wrap gap-2', ids.length === 0 && 'hidden')}>
        {ids.map((id) => {
          const m = byId.get(id)
          const isUrl = id.startsWith('/') || id.startsWith('http')
          return (
            <div key={id} className="cms-reveal-row relative size-24 overflow-hidden rounded-md border border-border bg-sunken">
              {m?.thumb || isUrl ? <img src={m?.thumb ?? id} alt={m?.alt ?? ''} className="h-full w-full object-cover" /> : m ? <FileTile item={m} size={20} /> : <div className="grid h-full place-items-center text-muted"><Icon name="file" size={20} /></div>}
              {!disabled && (
                <IconButton icon="close" label={t('Remove')} size="xs" variant="secondary" className="cms-reveal absolute right-1 top-1" onClick={() => onChange(ids.filter((x) => x !== id))} />
              )}
              {m && m.kind === 'image' && !m.alt && <span className="absolute bottom-1 left-1 rounded-xs bg-warning px-1 text-2xs font-medium text-white" title={t('No alt text')}>ALT</span>}
            </div>
          )
        })}
      </div>
      {ids.length < max && (
        <Button size="sm" icon={images ? 'image' : 'upload'} disabled={disabled} className={ids.length ? 'mt-2' : ''} onClick={() => { setPicked(ids); setOpen(true) }}>
          {ids.length ? t('Add More') : max === 1 ? (images ? t('Choose Image') : t('Choose File')) : images ? t('Choose Images') : t('Choose Files')}
        </Button>
      )}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        size="xl"
        title={max === 1 ? (images ? t('Choose Image') : t('Choose File')) : images ? t('Choose Images') : t('Choose Files')}
        // Taller than a form's dialog from `sm` up; on a phone it stays the sheet every dialog is.
        className="sm:!top-[6vh] sm:!max-h-[88vh]"
        footer={
          <>
            {/* One file is chosen by clicking it: nothing to count or to confirm. */}
            {max !== 1 && <span className="mr-auto text-xs text-faint max-sm:hidden">{t('{count} selected', { count: picked.length })}</span>}
            <Button onClick={() => setOpen(false)}>{t('Cancel')}</Button>
            {max !== 1 && <Button variant="primary" disabled={picked.length === 0} onClick={() => { onChange(picked.slice(0, max === Infinity ? undefined : max)); setOpen(false) }}>{images ? plural(picked.length || 1, 'Use Image', 'Use {count} Images') : plural(picked.length || 1, 'Use File', 'Use {count} Files')}</Button>}
          </>
        }
      >
        <div className="min-h-[40vh]">
          <Library
            mode="pick"
            accept={accept}
            except={typeof field.except === 'string' ? field.except : undefined}
            multiple={max > 1}
            selected={picked}
            onSelectionChange={(next) => {
              setPicked(next)
              if (max === 1 && next.length === 1) {
                onChange(next)
                setOpen(false)
              }
            }}
          />
        </div>
      </Dialog>
    </div>
  )
}
