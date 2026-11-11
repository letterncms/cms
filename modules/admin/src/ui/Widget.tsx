import { Link, locale, t } from '@letterncms/sdk'
import { createContext, useContext, useId, type ReactNode } from 'react'
import { Button } from './Button'
import { cn } from './cn'
import { Icon } from './Icon'
import { Skeleton } from './Spinner'

/**
 * Home-screen widgets. The home screen gives each widget its registration (label, icon)
 * through context; the widget draws its body inside `<Widget>`, which supplies the
 * header, loading skeleton, error and empty states — so every widget, core or plugin,
 * looks and behaves the same:
 *
 *   export default function LatestReviews() {
 *     const reviews = useAbility<Review[]>('reviews/latest', { limit: 5 })
 *     return (
 *       <Widget action={{ label: t('All Reviews'), to: '/reviews' }} query={reviews} empty={reviews.data?.length === 0 && { icon: 'star', title: t('No reviews yet') }}>
 *         {reviews.data?.map((r) => <WidgetRow key={r.id} to={`/reviews/${r.id}`} icon="star" title={r.title} meta={timeAgo(r.createdAt)} />)}
 *       </Widget>
 *     )
 *   }
 *
 * The body sits in a container (`@container`), so a widget can adapt to the column it is
 * in with container variants (`@md:grid-cols-4`) — the main column is wide, the side one narrow.
 */

export interface WidgetMeta {
  id: string
  label: string
  icon: string
}

export const WidgetContext = createContext<WidgetMeta | null>(null)

/** The registration of the widget being rendered (label, icon), when it is on the home screen. */
function useWidget(): WidgetMeta | null {
  return useContext(WidgetContext)
}

export interface WidgetEmpty {
  icon?: string
  title: string
  description?: ReactNode
  action?: ReactNode
}

export interface WidgetProps {
  /** Defaults to the registered label. */
  title?: ReactNode
  /** The registered icon names the widget in the gallery; the tile itself shows only its title. */
  icon?: string
  /** A link in the header ("View all"), or any node (a menu, a button). */
  action?: { label: string; to?: string; onClick?: () => void } | ReactNode
  /** A react-query result: loading shows the skeleton, an error a retry. */
  query?: { isLoading: boolean; isError?: boolean; refetch?: () => unknown }
  loading?: boolean
  /** The loading placeholder; rows by default. */
  skeleton?: ReactNode
  /** Shown instead of the body when truthy. */
  empty?: WidgetEmpty | false | null
  children?: ReactNode
  className?: string
}

export function Widget({ title, action, query, loading, skeleton, empty, children, className }: WidgetProps) {
  const meta = useWidget()
  const heading = title ?? meta?.label
  const headingId = useId()
  const isLoading = loading || query?.isLoading
  const failed = !isLoading && query?.isError
  // An empty state brings its own action: one way forward, not two.
  if (!isLoading && !failed && empty && empty.action) action = null

  return (
    // A tile pressed into the sheet: no border, no shadow, its title and one way further.
    <section aria-labelledby={heading ? headingId : undefined} className={cn('@container min-w-0 rounded-lg bg-sunken p-4', className)}>
      {heading && (
        <header className="mb-3 flex h-6 items-center gap-2">
          <h2 id={headingId} className="m-0 min-w-0 flex-1 truncate text-sm font-semibold text-ink">
            {heading}
          </h2>
          {action && isActionLink(action) ? (
            action.to ? (
              <Link to={action.to} className="-mr-1.5 flex h-6 shrink-0 items-center gap-0.5 rounded-xs px-1.5 text-xs text-muted no-underline transition-colors duration-base hover:bg-hover hover:text-text">
                {action.label}
                <Icon name="chevron-right" size={12} className="text-faint" />
              </Link>
            ) : (
              <button type="button" onClick={action.onClick} className="-mr-1.5 h-6 shrink-0 rounded-xs px-1.5 text-xs text-muted transition-colors duration-base hover:bg-hover hover:text-text">
                {action.label}
              </button>
            )
          ) : (
            action && <div className="-mr-1 flex shrink-0 items-center gap-1">{action}</div>
          )}
        </header>
      )}
      {isLoading ? (
        <div aria-busy="true">{skeleton ?? <WidgetSkeleton />}</div>
      ) : failed ? (
        <WidgetMessage icon="warning" title={t('This widget could not load.')} action={query?.refetch && <Button size="xs" variant="ghost" icon="refresh" onClick={() => query.refetch?.()}>{t('Try Again')}</Button>} />
      ) : empty ? (
        <WidgetMessage {...empty} />
      ) : (
        children
      )}
    </section>
  )
}

function isActionLink(action: WidgetProps['action']): action is { label: string; to?: string; onClick?: () => void } {
  return typeof action === 'object' && action !== null && 'label' in action && typeof (action as { label: unknown }).label === 'string'
}

/** Placeholder rows while a widget loads. */
export function WidgetSkeleton({ rows = 4 }: { rows?: number }) {
  const widths = ['w-3/5', 'w-2/5', 'w-1/2', 'w-2/3', 'w-1/3']
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex h-9 items-center gap-3">
          <Skeleton className="size-4 rounded-xs" />
          <Skeleton className={cn('h-3', widths[i % widths.length])} />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
      ))}
    </div>
  )
}

/** The quiet empty (or error) state inside a widget: what it is, and one action. */
export function WidgetMessage({ icon = 'inbox', title, description, action }: WidgetEmpty) {
  return (
    <div className="flex flex-col items-center px-4 py-7 text-center">
      <span className="mb-3 grid size-8 place-items-center rounded-md border border-border bg-bg text-muted">
        <Icon name={icon} size={16} />
      </span>
      <p className="m-0 text-sm font-medium text-text">{title}</p>
      {description && <p className="m-0 mt-0.5 max-w-64 text-xs text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/**
 * A row in a widget list: something to open, with an icon (or any leading node),
 * a title, an optional second line and a quiet value on the right.
 */
export function WidgetRow({ to, onClick, href, icon, leading, title, description, meta, className }: { to?: string; onClick?: () => void; href?: string; icon?: string; leading?: ReactNode; title: ReactNode; description?: ReactNode; meta?: ReactNode; className?: string }) {
  const body = (
    <>
      {leading ?? (icon && <Icon name={icon} size={16} className="shrink-0 text-muted" />)}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{title}</span>
        {description && <span className="block truncate text-xs text-muted">{description}</span>}
      </span>
      {meta !== undefined && meta !== null && <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-faint">{meta}</span>}
    </>
  )
  // Rows reach to 4px from the tile's edge, so the hover lies inside it.
  const cls = cn('-mx-3 flex items-center gap-3 rounded-md px-3 text-left text-sm no-underline', description ? 'min-h-11 py-1.5' : 'h-9', (to || onClick || href) && 'transition-colors duration-base hover:bg-hover', className)

  if (to) return <Link to={to} className={cls}>{body}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls}>{body}</a>
  if (onClick) return <button type="button" onClick={onClick} className={cn(cls, 'w-[calc(100%+1.5rem)]')}>{body}</button>
  return <div className={cls}>{body}</div>
}

/** 1,284 · 12.9K · 4.2M in the admin's language. */
export function compactNumber(value: number): string {
  return new Intl.NumberFormat(locale(), { notation: value >= 10_000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
}

/**
 * A headline number: label, value, change against the previous period and an optional trend.
 * `delta` is a fraction (0.12 = +12%); `good` says which direction is good news.
 */
export function Stat({ label, value, delta, good = 'up', trend, size = 'md', className }: { label: ReactNode; value: ReactNode; delta?: number | null; good?: 'up' | 'down'; trend?: number[]; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="m-0 truncate text-xs text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={cn('font-semibold tabular-nums text-ink', size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg')}>{value}</span>
        {delta !== undefined && delta !== null && <Delta value={delta} good={good} />}
      </div>
      {trend && trend.length > 1 && <Sparkline values={trend} label={typeof label === 'string' ? t('Trend for {label}', { label }) : t('Trend')} className="mt-2 h-8 w-full" />}
    </div>
  )
}

/** Change as a signed percentage, green when it is good news. */
export function Delta({ value, good = 'up' }: { value: number; good?: 'up' | 'down' }) {
  const flat = Math.abs(value) < 0.005
  const better = flat ? null : (value > 0) === (good === 'up')
  const format = (sign: 'exceptZero' | 'never') => new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: Math.abs(value) < 0.1 ? 1 : 0, signDisplay: sign }).format(value)

  // The arrow carries the sign; screen readers get the signed number.
  return (
    <span aria-label={flat ? t('No change') : format('exceptZero')} className={cn('inline-flex items-center gap-0.5 text-xs font-medium tabular-nums', better === null ? 'text-faint' : better ? 'text-success' : 'text-danger')}>
      {!flat && <Icon name={value > 0 ? 'arrow-up' : 'arrow-down'} size={11} />}
      {flat ? t('No change') : format('never')}
    </span>
  )
}

/** A small trend line with a soft wash — one series, no axes (details live on the screen it links to). */
export function Sparkline({ values, className, label }: { values: number[]; className?: string; label?: string }) {
  const id = useId()
  if (values.length < 2) return null

  const max = Math.max(...values, 1)
  const step = 100 / (values.length - 1)
  const points = values.map((v, i) => [i * step, 30 - (v / max) * 28] as const)
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join('')

  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" role="img" aria-label={label} className={cn('block overflow-visible text-ink', className)}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line}L100,30L0,30Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** A filled bar for a share or a score (0–1). The tone carries the state; the label stays in text color. */
export function Meter({ value, tone = 'ink', className, label }: { value: number; tone?: 'ink' | 'success' | 'warning' | 'danger' | 'muted'; className?: string; label?: string }) {
  const fill = { ink: 'bg-ink', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', muted: 'bg-border-strong' }[tone]
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label} className={cn('h-1.5 overflow-hidden rounded-full bg-active', className)}>
      <div className={cn('h-full rounded-full transition-[width] duration-slow ease-out', fill)} style={{ width: `${pct}%` }} />
    </div>
  )
}

/** A row with a proportional bar behind it — top pages, sources, devices. */
export function BarRow({ label, value, share, icon, to, href }: { label: ReactNode; value: ReactNode; share: number; icon?: ReactNode; to?: string; href?: string }) {
  const body = (
    <>
      <span aria-hidden="true" className="absolute inset-y-0.5 left-0 rounded-xs bg-active transition-[width,background-color] duration-slow ease-out" style={{ width: `${Math.max(0.5, Math.min(1, share) * 100)}%` }} />
      <span className="relative flex min-w-0 flex-1 items-center gap-2 pl-2">
        {icon}
        <span className="truncate text-text">{label}</span>
      </span>
      <span className="relative shrink-0 pr-1 text-xs tabular-nums text-muted">{value}</span>
    </>
  )
  const cls = 'relative flex h-8 items-center gap-3 text-sm no-underline'
  if (to) return <Link to={to} className={cn(cls, 'hover:[&>span:first-child]:bg-border-strong')}>{body}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cn(cls, 'hover:[&>span:first-child]:bg-border-strong')}>{body}</a>
  return <div className={cls}>{body}</div>
}
