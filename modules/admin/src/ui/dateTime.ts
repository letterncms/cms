/** datetime-local controls represent wall time; scheduling stores an unambiguous UTC instant. */
export function formatDateTimeInZone(iso: string, timeZone: string): string {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date)
  const part = (name: string) => parts.find((part) => part.type === name)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`
}

export function parseDateTimeInZone(wallTime: string, timeZone: string): { value: string | null; error?: 'invalid' | 'nonexistent' | 'ambiguous' } {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wallTime)) return { value: null, error: 'invalid' }
  const wall = Date.parse(`${wallTime}:00Z`)
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== wallTime) return { value: null, error: 'invalid' }
  const candidates = new Set<number>()
  // Inspect both sides of any offset transition, including half-hour and international-date changes.
  for (let hour = -36; hour <= 36; hour += 6) {
    const sample = wall + hour * 3_600_000
    const offset = Date.parse(`${formatDateTimeInZone(new Date(sample).toISOString(), timeZone)}:00Z`) - sample
    const candidate = wall - offset
    if (formatDateTimeInZone(new Date(candidate).toISOString(), timeZone) === wallTime) candidates.add(candidate)
  }
  if (candidates.size === 0) return { value: null, error: 'nonexistent' }
  if (candidates.size > 1) return { value: null, error: 'ambiguous' }
  return { value: new Date([...candidates][0]).toISOString() }
}

/** A time typed as people type one, in 24 or 12 hours: `HH:MM` (`HH:MM:SS` with `seconds`), or null when it isn't one. */
export function readTime(typed: string, seconds = false): string | null {
  const s = typed.trim().toLowerCase().replace(/\s+/g, ' ')
  const match = /^(\d{1,2})(?:[:.h ]?(\d{2}))?(?:[:.](\d{2}))?(?: ?([ap])\.? ?m?\.?)?$/.exec(s)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2] ?? 0)
  const second = Number(match[3] ?? 0)
  if (match[4]) {
    if (hour < 1 || hour > 12) return null
    hour = (hour % 12) + (match[4] === 'p' ? 12 : 0)
  }
  if (hour > 23 || minute > 59 || second > 59) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(hour)}:${pad(minute)}${seconds ? `:${pad(second)}` : ''}`
}
