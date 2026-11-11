import { Link, t } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { cn } from './cn'
import { Checkbox } from './Switch'
import { Icon } from './Icon'
import { Skeleton } from './Spinner'

/** The same responsive cards for content, assets and other overview records. Picture cards stand two across on a phone. */
export function DataGrid({ children, loading, stale, media }: { children?: ReactNode; loading?: boolean; stale?: boolean; media?: boolean }) {
  return <div aria-busy={loading || stale} className={cn('grid grid-cols-[repeat(auto-fill,minmax(min(100%,232px),1fr))] gap-4 transition-opacity duration-move', media && 'max-sm:grid-cols-2 max-sm:gap-3', stale && 'opacity-60')}>
    {loading ? Array.from({ length: 8 }, (_, i) => <div key={i} aria-hidden="true" className="overflow-hidden rounded-lg border border-border">
      {media && <Skeleton className="aspect-[3/2] rounded-none" />}
      <div className="space-y-2 p-3"><Skeleton className="h-3.5 w-3/4" /><Skeleton className="h-3 w-2/3" /><Skeleton className="mt-4 h-3 w-1/3" /></div>
    </div>) : children}
  </div>
}

export function DataCard({ title, href, onClick, icon, image, children, footer, selected, active, onSelect, actions, recordId }: {
  title: ReactNode; href?: string; onClick?: () => void; icon?: string; image?: ReactNode; children?: ReactNode; footer?: ReactNode;
  selected?: boolean; active?: boolean; onSelect?: (on: boolean) => void; actions?: ReactNode; recordId?: string;
}) {
  const linkClass = "line-clamp-2 min-w-0 text-left text-sm font-medium text-ink no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-lg focus-visible:after:outline-2 focus-visible:after:outline-focus"
  // A card lies flat on the sheet: a hairline that firms up on hover, blue only when it is selected.
  return <article data-entry={recordId} className={cn('group cms-reveal-row relative flex flex-col overflow-hidden rounded-lg border bg-bg transition-[border-color,box-shadow] duration-base ease-out', selected ? 'border-focus ring-1 ring-focus' : active ? 'border-border-strong ring-3 ring-focus-soft' : 'border-border hover:border-border-strong')}>
    {image !== undefined && <div className="relative aspect-[3/2] overflow-hidden border-b border-border bg-sunken">{image}</div>}
    <div className="flex flex-1 flex-col p-3">
      <div className={cn('flex items-start gap-2', !!actions && image === undefined && 'pr-12')}>
        {image === undefined && (icon || onSelect) && <span className="mt-0.5 size-3.5 shrink-0 text-faint">{icon && <Icon name={icon} size={14} />}</span>}
        {href ? <Link to={href} className={linkClass}>{title}</Link> : onClick ? <button type="button" onClick={onClick} className={linkClass}>{title}</button> : <div className={linkClass}>{title}</div>}
      </div>
      {children}
      {footer && <div className="mt-auto flex items-center gap-2 pt-3 text-xs text-muted">{footer}</div>}
    </div>
    {onSelect && <div className={cn('absolute z-raised flex transition-opacity duration-base', image !== undefined ? 'left-2 top-2 rounded-sm bg-float p-1 shadow-raise' : 'left-3 top-3.5 bg-bg', !selected && 'cms-reveal')}>
      <Checkbox checked={!!selected} onChange={onSelect} label={<span className="sr-only">{t('Select Item')}</span>} />
    </div>}
    {actions && <div className={cn('absolute right-2 top-2 z-raised rounded-sm', image !== undefined ? 'bg-float shadow-raise' : 'bg-bg')}>{actions}</div>}
  </article>
}
