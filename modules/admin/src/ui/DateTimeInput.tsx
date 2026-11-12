import { locale, t } from '@letterncms/sdk'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { calendarDayKey, calendarRange } from './calendar'
import { readTime } from './dateTime'
import { cn } from './cn'
import { controlSizes } from './controlSize'
import { Icon } from './Icon'
import { IconButton } from './Button'
import { Input } from './Input'
import { Popover } from './Popover'
import { Pressable } from './Pressable'

/**
 * A day, written and chosen the admin's way: the date as the admin's language writes it ("Nov 11, 2026",
 * "11. Nov. 2026"), and a month to pick it from. The value is `YYYY-MM-DD`, or null. Never the browser's
 * own control, which follows the browser's language rather than the admin's.
 */
export function DateInput({ value, onChange, id, disabled, invalid, required, size = 'md', className, 'aria-label': ariaLabel, 'aria-describedby': describedBy }: { value: string | null; onChange: (value: string | null) => void; id?: string; disabled?: boolean; invalid?: boolean; required?: boolean; size?: 'sm' | 'md'; className?: string; 'aria-label'?: string; 'aria-describedby'?: string }) {
  const [open, setOpen] = useState(false)
  const day = isDay(value) ? value : null
  const [month, setMonth] = useState(() => (day ?? calendarDayKey(new Date())).slice(0, 7))
  useEffect(() => { if (open) setMonth((day ?? calendarDayKey(new Date())).slice(0, 7)) }, [open, day])
  const trigger = (
    <Pressable
      id={id}
      disabled={disabled}
      aria-label={ariaLabel ? `${ariaLabel}: ${day ? writeDay(day) : t('No date')}` : undefined}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
      // A field's own look (cms-input): its edge, hover, focus, invalid and disabled states are every field's.
      className={cn('cms-input flex w-full min-w-0 items-center gap-2 text-left', controlSizes[size], size === 'sm' ? 'px-2' : 'px-2.5', className)}
    >
      <Icon name="calendar" size={14} className="shrink-0 text-faint" />
      <span className={cn('min-w-0 flex-1 truncate tabular-nums', !day && 'text-ghost')}>{day ? writeDay(day) : t('Choose a Date')}</span>
    </Pressable>
  )
  return (
    <Popover open={open} onOpenChange={setOpen} trigger={trigger} className="w-[272px] max-w-[calc(100vw-16px)] p-3">
      <Month month={month} onMonth={setMonth} value={day} onPick={(next) => { onChange(next); setOpen(false) }} />
      {day && !required && (
        <div className="mt-2 border-t border-border pt-2">
          <Pressable className="h-7 rounded-sm px-2 text-sm text-muted hover:bg-hover hover:text-text" onClick={() => { onChange(null); setOpen(false) }}>{t('Clear Date')}</Pressable>
        </div>
      )}
    </Popover>
  )
}

/** The days of a month in weeks from Monday, the chosen one filled, today ringed; arrow keys walk them. */
function Month({ month, onMonth, value, onPick }: { month: string; onMonth: (month: string) => void; value: string | null; onPick: (day: string) => void }) {
  const { year, monthIndex, days } = calendarRange(month)
  const today = calendarDayKey(new Date())
  const [cursor, setCursor] = useState(() => value && value.startsWith(month) ? value : today.startsWith(month) ? today : `${month}-01`)
  const grid = useRef<HTMLDivElement>(null)
  const moved = useRef(false)
  useEffect(() => {
    if (!cursor.startsWith(month)) setCursor(value && value.startsWith(month) ? value : `${month}-01`)
  }, [month])
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    grid.current?.querySelector<HTMLElement>(`[data-day="${cursor}"]`)?.focus()
  }, [cursor, month])
  const shift = (by: number) => {
    const [y, m] = month.split('-').map(Number)
    const next = new Date(y, m - 1 + by, 1)
    onMonth(calendarDayKey(next).slice(0, 7))
  }
  const key = (e: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    const [y, m, d] = cursor.split('-').map(Number)
    const next = calendarDayKey(new Date(y, m - 1, d + step))
    moved.current = true
    if (!next.startsWith(month)) onMonth(next.slice(0, 7))
    setCursor(next)
  }
  const name = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' }).format(new Date(year, monthIndex, 1))
  const weekday = new Intl.DateTimeFormat(locale(), { weekday: 'narrow' })
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <IconButton icon="chevron-left" label={t('Previous Month')} size="xs" onClick={() => shift(-1)} />
        <span className="text-sm font-medium text-ink" aria-live="polite">{name}</span>
        <IconButton icon="chevron-right" label={t('Next Month')} size="xs" onClick={() => shift(1)} />
      </div>
      <div ref={grid} role="grid" aria-label={name} className="grid grid-cols-7 gap-0.5" onKeyDown={key}>
        {days.slice(0, 7).map((d) => <span key={`h${d.getDay()}`} role="columnheader" className="grid h-7 place-items-center text-2xs text-faint">{weekday.format(d)}</span>)}
        {days.map((d) => {
          const k = calendarDayKey(d)
          const inMonth = d.getMonth() === monthIndex
          const chosen = k === value
          return (
            <Pressable
              key={k}
              compact
              role="gridcell"
              data-day={k}
              tabIndex={k === cursor ? 0 : -1}
              aria-selected={chosen}
              aria-label={writeDay(k)}
              onClick={() => onPick(k)}
              className={cn('grid h-8 place-items-center rounded-sm text-sm tabular-nums transition-colors duration-base',
                chosen ? 'bg-signal font-medium text-signal-ink' : 'hover:bg-hover',
                !chosen && (inMonth ? 'text-text' : 'text-faint'),
                k === today && !chosen && 'font-semibold text-ink underline decoration-2 underline-offset-4')}
            >
              {d.getDate()}
            </Pressable>
          )
        })}
      </div>
    </div>
  )
}

/**
 * A time of day, written the admin's way ("7:03 PM", "19:03") and typed either way: "19:03", "7:03 pm",
 * "7pm" and "1903" all read. The value is `HH:MM` (`HH:MM:SS` with `seconds`), or null; what can't be read is said under it by the field.
 */
export function TimeInput({ value, onChange, onInvalid, seconds, id, disabled, invalid, required, size = 'md', className, 'aria-label': ariaLabel, 'aria-describedby': describedBy }: { value: string | null; onChange: (value: string | null) => void; onInvalid?: (invalid: boolean) => void; seconds?: boolean; id?: string; disabled?: boolean; invalid?: boolean; required?: boolean; size?: 'sm' | 'md'; className?: string; 'aria-label'?: string; 'aria-describedby'?: string }) {
  const write = (time: string) => writeTime(time, seconds)
  const [text, setText] = useState(() => isTime(value) ? write(value) : '')
  const [wrong, setWrong] = useState(false)
  useEffect(() => { setText(isTime(value) ? write(value) : ''); setWrong(false) }, [value])
  const commit = () => {
    if (!text.trim()) {
      setWrong(false); onInvalid?.(false)
      if (value !== null) onChange(null)
      return
    }
    const read = readTime(text, seconds)
    setWrong(!read); onInvalid?.(!read)
    if (!read) return
    setText(write(read))
    if (read !== value) onChange(read)
  }
  return (
    <Input
      id={id}
      icon="clock"
      size={size}
      inputMode="text"
      autoComplete="off"
      placeholder={write(seconds ? '09:00:00' : '09:00')}
      value={text}
      disabled={disabled}
      required={required}
      invalid={invalid || wrong}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
      className={cn('w-32 shrink-0 tabular-nums', className)}
    />
  )
}

const isDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
const isTime = (value: unknown): value is string => typeof value === 'string' && /^\d{2}:\d{2}/.test(value)

/** A day as the admin's language writes it: "Nov 11, 2026". */
export function writeDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeZone: 'UTC' }).format(Date.UTC(y, m - 1, d))
}

/** A time of day as the admin's language writes it: "7:03 PM" in English, "19:03" in German. */
export function writeTime(time: string, seconds = false): string {
  const [h, m, sec = 0] = time.split(':').map(Number)
  return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}), timeZone: 'UTC' }).format(Date.UTC(1970, 0, 1, h, m, sec))
}
