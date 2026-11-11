import { t } from '@letterncms/sdk'
import { Icon, cn } from '@letterncms/ui'
import type { MediaItem } from './upload'

export type MediaKind = MediaItem['kind']

/** Every kind a file can be (MediaItem::KINDS), in the order the filter lists them. */
export const KINDS: MediaKind[] = ['image', 'video', 'audio', 'pdf', 'model', 'texture', 'animation', 'file']

export const kindIcon: Record<MediaKind, string> = { image: 'image', video: 'video', audio: 'music-notes', pdf: 'file-text', model: 'cube', texture: 'checkerboard', animation: 'play-circle', file: 'file' }

/** One file's kind, in words. */
export const kindLabel = (kind: MediaKind) => ({ image: t('Image'), video: t('Video'), audio: t('Audio'), pdf: 'PDF', model: t('3D Model'), texture: t('Texture'), animation: t('Animation'), file: t('File') })[kind] ?? t('File')

/** The kinds as the filter names them. */
export const kindOptions = () => ({ image: t('Images'), video: t('Videos'), audio: t('Audio'), pdf: 'PDF', model: t('3D Models'), texture: t('Textures'), animation: t('Animations'), file: t('Other') })

/** What a file is, as people say it: its extension, or the player's name where the extension says less (a Lottie is a .json). */
export const fileTag = (item: Pick<MediaItem, 'mime' | 'filename'>) => item.mime === 'application/json' ? 'Lottie' : item.mime === 'application/vnd.rive' ? 'Rive' : item.filename.includes('.') ? item.filename.slice(item.filename.lastIndexOf('.') + 1).toUpperCase() : ''

/** The kind a field's `accept` fixes, if it takes one kind only. */
export const acceptKind = (accept: string): MediaKind | 'all' => accept.startsWith('image') ? 'image' : accept.startsWith('video') ? 'video' : accept.startsWith('audio') ? 'audio' : accept === 'application/pdf' ? 'pdf' : accept.startsWith('model') ? 'model' : 'all'

/** A file with no picture of its own: its kind's icon over what it is, in the place a thumbnail would be. */
export function FileTile({ item, size = 24, className }: { item: Pick<MediaItem, 'kind' | 'mime' | 'filename'>; size?: number; className?: string }) {
  const tag = fileTag(item)
  return (
    <div className={cn('flex size-full flex-col items-center justify-center gap-1.5 text-faint', className)}>
      <Icon name={kindIcon[item.kind] ?? 'file'} size={size} />
      {tag && <span className="max-w-full truncate px-1 text-2xs font-medium tracking-wide">{tag}</span>}
    </div>
  )
}
