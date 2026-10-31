import { t, type FieldDef } from '@letterncms/sdk'
import { Avatar, DateCell, DataCard, DataGrid, Icon, StatusDot, cn } from '@letterncms/ui'
import { EntryActions } from './EntryActions'
import { mediaIds, mediaSource, type CellContext, type Column } from './listColumns'
import type { ListItem } from './listPrefs'

export interface GridProps {
  handle: string
  items: ListItem[]
  ctx: CellContext
  /** Shows a picture on every card (the collection's first media field). */
  media?: FieldDef
  /** Text under the title on cards without a picture. */
  excerpt?: FieldDef
  /** The table's visible columns decide what a card shows too. */
  visible: Set<string>
  columns: Column[]
  icon: string
  loading?: boolean
  stale?: boolean
  selected: Set<string>
  onSelect: (ids: string[], on: boolean) => void
  cursor: string | null
}

/** Collection records use the shared overview card layout. */
export function EntriesGrid({ handle, items, ctx, media, excerpt, columns, visible, icon, loading, stale, selected, onSelect, cursor }: GridProps) {
  return <DataGrid loading={loading} stale={stale} media={!!media}>
    {items.map((item) => <Card key={item.id} item={item} handle={handle} ctx={ctx} media={media} excerpt={excerpt} columns={columns} visible={visible} icon={icon} selected={selected.has(item.id)} onSelect={onSelect} active={cursor === item.id} />)}
  </DataGrid>
}

function Card({ item, handle, ctx, media, excerpt, columns, visible, icon, selected, onSelect, active }: { item: ListItem; handle: string; ctx: CellContext; media?: FieldDef; excerpt?: FieldDef; columns: Column[]; visible: Set<string>; icon: string; selected: boolean; onSelect: (ids: string[], on: boolean) => void; active: boolean }) {
  const ids = media ? mediaIds(item.values?.[media.handle]) : []
  const src = ids[0] ? mediaSource(ids[0], ctx) : null
  const text = !media && excerpt && !columns.some((column) => column.field?.handle === excerpt.handle) ? plain(item.values?.[excerpt.handle]) : ''
  const details = columns.filter((column) => column.id === 'translations' || (column.field && column.field.handle !== media?.handle))

  return <DataCard recordId={item.id} title={item.title || <span className="text-faint">{t('Untitled')}</span>} href={`/content/${handle}/${item.id}`} icon={icon}
    selected={selected} active={active} onSelect={(on) => onSelect([item.id], on)} actions={<EntryActions item={item} handle={handle} />}
    image={media ? src ? <img src={src} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <div className="grid size-full place-items-center text-faint"><Icon name="image" size={20} /></div> : undefined}
    footer={<>
      {visible.has('status') && <StatusDot status={item.displayStatus} />}
      <span className="ml-auto flex min-w-0 items-center gap-1.5">
        {visible.has('author') && (item.author ? <Avatar name={item.author.name} initials={item.author.initials} src={item.author.avatar} size={16} /> : <span className="text-2xs text-faint">{item.authorId ? t('Unavailable person') : t('Unassigned')}</span>)}
        {visible.has('published') && <span aria-label={t('Published')}><DateCell iso={item.publishedAt} /></span>}
        {visible.has('updated') && <span aria-label={t('Updated')}><DateCell iso={item.updatedAt} relative /></span>}
      </span>
    </>}
  >
    {visible.has('uri') && item.uri && <span className={cn('mt-0.5 truncate font-mono text-2xs text-faint', !media && 'pl-[22px]')}>{item.uri}</span>}
    {text && <p className="m-0 mt-1.5 line-clamp-3 pl-[22px] text-xs leading-relaxed text-muted">{text}</p>}
    {details.length > 0 && <dl className={cn('m-0 mt-2 space-y-1.5', !media && 'pl-[22px]')}>
      {details.map((column) => <div key={column.id} className="flex min-w-0 items-center justify-between gap-3 text-xs">
        <dt className="min-w-0 flex-1 truncate text-faint">{column.label}</dt>
        <dd className="m-0 min-w-0 max-w-[65%] truncate">{column.render(item, ctx)}</dd>
      </div>)}
    </dl>}
  </DataCard>
}

/** Markdown or HTML reduced to a line of text. */
function plain(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/[#>*_`~[\]()!-]+/g, ' ').replace(/\s+/g, ' ').trim()
}
