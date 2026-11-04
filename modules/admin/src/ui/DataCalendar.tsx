import { Link, locale, t } from '@letterncms/sdk'
import { useState, type ReactNode } from 'react'
import { Button, IconButton } from './Button'
import { calendarDayKey, calendarRange } from './calendar'
import { cn } from './cn'
import type { DataSelection } from './DataTable'
import { EmptyState } from './EmptyState'
import { longDate } from './recordDates'
import { Skeleton } from './Spinner'
import { Checkbox } from './Switch'

interface DataCalendarProps<T> {
  label: string
  items: T[]
  month?: string
  onMonth: (month: string | null) => void
  date: (item: T) => string | null | undefined
  title: (item: T) => ReactNode
  rowKey: (item: T) => string
  /** Where a row opens; nothing for a row with nowhere to go. */
  rowHref?: (item: T) => string | undefined
  onRowClick?: (item: T) => void
  actions?: (item: T) => ReactNode
  selection?: DataSelection<T>
  cursor?: string | null
  loading?: boolean
  stale?: boolean
  error?: boolean
  onRetry?: () => void
}

/** The one calendar renderer for content, media and administrative records. */
export function DataCalendar<T>({ label, items, month: monthValue, onMonth, date, title, rowKey, rowHref, onRowClick, actions, selection, cursor, loading, stale, error, onRetry }: DataCalendarProps<T>) {
  const { month, year, monthIndex, first, days } = calendarRange(monthValue)
  const [expanded, setExpanded] = useState<string[]>([])
  const byDay = new Map<string, T[]>()
  const undated: T[] = []
  for (const item of items) {
    const iso = date(item)
    if (!iso || !Number.isFinite(Date.parse(iso))) { undated.push(item); continue }
    const key = calendarDayKey(new Date(iso))
    byDay.set(key, [...(byDay.get(key) ?? []), item])
  }
  const today = calendarDayKey(new Date())
  const dayList = days.filter((day) => day.getMonth() === monthIndex).map((day) => [calendarDayKey(day), day, byDay.get(calendarDayKey(day)) ?? []] as const).filter(([, , records]) => records.length > 0)
  const go = (offset: number) => {
    const next = calendarDayKey(new Date(year, monthIndex + offset, 1)).slice(0, 7)
    onMonth(next === today.slice(0, 7) ? null : next)
  }
  // Checkboxes only while choosing, or under the pointer: a month of events stays a month of titles.
  const choosing = !!selection && selection.ids.size > 0
  const record = (item: T) => {
    const iso = date(item)
    const className = 'min-w-0 flex-1 truncate text-left text-inherit no-underline'
    return <div key={rowKey(item)} data-entry={rowKey(item)} className={cn('group/event flex min-h-7 min-w-0 items-center gap-1.5 rounded-sm px-1.5 text-xs text-text transition-colors duration-120 hover:bg-hover', cursor === rowKey(item) && 'bg-hover shadow-[inset_2px_0_0_var(--cms-focus)]', selection?.ids.has(rowKey(item)) && 'bg-focus-soft')} title={iso && Number.isFinite(Date.parse(iso)) ? longDate(iso) : undefined}>
      {selection && <span className={cn('flex shrink-0', !choosing && '[@media(hover:hover)]:hidden [@media(hover:hover)]:group-hover/event:flex [@media(hover:hover)]:group-focus-within/event:flex')}><Checkbox checked={selection.ids.has(rowKey(item))} label={<span className="sr-only">{t('Select Item')}</span>} onChange={(on) => selection.onSelect([rowKey(item)], on, items)} /></span>}
      {rowHref?.(item) ? <Link className={className} to={rowHref(item)!}>{title(item)}</Link> : onRowClick ? <button type="button" className={className} onClick={() => onRowClick(item)}>{title(item)}</button> : <span className={className}>{title(item)}</span>}
      {actions && <div className="flex shrink-0 items-center">{actions(item)}</div>}
    </div>
  }
  if (error) return <EmptyState icon="warning" title={t('Could not load data')} action={onRetry && <Button onClick={onRetry}>{t('Retry')}</Button>} />
  return <section aria-label={label} aria-busy={!!loading || !!stale} data-calendar>
    <div className="mb-3 flex items-center gap-2">
      <h2 className="m-0 text-sm font-semibold text-ink">{new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(first)}</h2>
      <div className="ml-auto flex items-center gap-1">
        <Button size="xs" variant="ghost" onClick={() => onMonth(null)} disabled={month === today.slice(0, 7)}>{t('Today')}</Button>
        <IconButton icon="chevron-left" label={t('Previous Month')} size="xs" onClick={() => go(-1)} />
        <IconButton icon="chevron-right" label={t('Next Month')} size="xs" onClick={() => go(1)} />
      </div>
    </div>
    {/* A phone has no room for seven columns: the month's days that have something, as a list. */}
    <div className={cn('sm:hidden', stale && !loading && 'opacity-60')}>
      {loading ? <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-7" />)}</div>
        : dayList.length === 0 ? <p className="m-0 border-y border-border py-6 text-center text-sm text-faint">{t('Nothing this month')}</p>
        : <div className="border-y border-border">{dayList.map(([key, day, records]) => <div key={key} className="flex gap-3 border-b border-border py-2 last:border-b-0">
          <div className={cn('w-10 shrink-0 pt-1 text-xs tabular-nums', key === today ? 'font-semibold text-ink' : 'text-muted')}>{new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(day)} {day.getDate()}</div>
          <div className="min-w-0 flex-1">{records.map(record)}</div>
        </div>)}</div>}
    </div>
    <div className={cn('overflow-x-auto rounded-lg border border-border [scrollbar-width:thin] max-sm:hidden', stale && !loading && 'opacity-60')}>
      <div className="min-w-[560px]">
        <div className="grid grid-cols-7 border-b border-border">{days.slice(0, 7).map((day) => <div key={calendarDayKey(day)} className="flex h-8 items-center px-2.5 text-xs font-medium text-faint">{new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(day)}</div>)}</div>
        <div className="grid grid-cols-7">{days.map((day, index) => {
          const key = calendarDayKey(day), records = byDay.get(key) ?? []
          const open = expanded.includes(key)
          return <div key={key} className={cn('min-h-24 min-w-0 p-1.5', index % 7 !== 6 && 'border-r border-border', index < 35 && 'border-b border-border', day.getMonth() !== monthIndex && 'bg-sunken')}>
            <div className="mb-1 flex h-5 items-center px-1"><span className={cn('grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs tabular-nums', key === today ? 'bg-ink font-semibold text-ink-contrast' : day.getMonth() !== monthIndex ? 'text-faint' : 'text-muted')}>{day.getDate()}</span></div>
            {loading ? index % 5 === 2 && <Skeleton className="h-5" /> : <>
              {(open ? records : records.slice(0, 3)).map(record)}
              {records.length > 3 && <button type="button" className="rounded-xs px-1.5 text-xs text-muted hover:bg-hover hover:text-text" onClick={() => setExpanded((current) => open ? current.filter((value) => value !== key) : [...current, key])}>{open ? t('Show Less') : t('Show {count} More', { count: records.length - 3 })}</button>}
            </>}
          </div>
        })}</div>
      </div>
    </div>
    {!loading && undated.length > 0 && <div className="mt-6"><h3 className="cms-label m-0 mb-2">{t('No date')}</h3><div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">{undated.map(record)}</div></div>}
  </section>
}
