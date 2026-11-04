import { locale, plural, t, timeAgo } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { Avatar } from '../Avatar'
import { Badge, StatusDot, type Tone } from '../Badge'
import { safeUrl } from './scope'
import { compactNumber } from '../Widget'

/** How one value is written, by the catalog's formats (see Cms\Admin\Catalog::FORMATS). */
export interface FormatOptions {
  format?: string
  tones?: Record<string, Tone>
  labels?: Record<string, string>
  currency?: string
}

const NONE = <span className="text-faint">—</span>

const empty = (value: unknown) => value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)

/** A word for a value: its label when the view names one, otherwise the value as written. */
function word(value: unknown, labels?: Record<string, string>): string {
  const key = String(value)
  return labels?.[key] ?? key
}

const date = (iso: string, style: Intl.DateTimeFormatOptions) => {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleString(locale(), style)
}

export function formatValue(value: unknown, { format = 'text', tones, labels, currency }: FormatOptions = {}): ReactNode {
  if (format === 'yesno') return value ? t('Yes') : NONE
  if (format === 'count') return typeof value === 'number' ? value.toLocaleString(locale()) : Array.isArray(value) ? value.length.toLocaleString(locale()) : NONE
  if (empty(value)) return NONE
  switch (format) {
    case 'strong': return <span className="font-medium text-ink">{word(value, labels)}</span>
    case 'muted': return <span className="text-muted">{word(value, labels)}</span>
    case 'code': return <code className="font-mono text-xs text-muted">{String(value)}</code>
    case 'badge': return <Badge tone={tones?.[String(value)] ?? 'neutral'}>{word(value, labels)}</Badge>
    case 'badges': return <span className="flex flex-wrap items-center gap-1">{(Array.isArray(value) ? value : [value]).map((v) => <Badge key={String(v)} tone={tones?.[String(v)] ?? 'neutral'}>{word(v, labels)}</Badge>)}</span>
    // A dot and a word: the dot's tone from `tones` (or the value, for content's own states), the word from `labels`.
    case 'status': return <StatusDot status={tones?.[String(value)] ?? String(value)} label={labels?.[String(value)] ?? (tones ? String(value) : undefined)} />
    case 'date': return <span title={date(String(value), { dateStyle: 'full', timeStyle: 'short' })}>{date(String(value), { dateStyle: 'medium' })}</span>
    case 'datetime': return date(String(value), { dateStyle: 'medium', timeStyle: 'short' })
    case 'ago': return <span title={date(String(value), { dateStyle: 'medium', timeStyle: 'short' })}>{timeAgo(String(value))}</span>
    // Short, for counts at a glance: 1.2K.
    case 'compact': return typeof value === 'number' ? <span title={value.toLocaleString(locale())}>{compactNumber(value)}</span> : String(value)
    case 'number': return typeof value === 'number' ? value.toLocaleString(locale()) : String(value)
    // Amounts are kept in the currency's smallest unit (cents), as payments are.
    case 'money': return typeof value === 'number' ? (value / 100).toLocaleString(locale(), { style: 'currency', currency: currency || 'EUR' }) : String(value)
    // A share of the whole (0 to 1): a bar and its percentage, for a top list.
    case 'share': {
      const n = Math.max(0, Math.min(1, Number(value) || 0))
      return <span className="flex min-w-0 items-center gap-2"><span className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-sunken"><span className="block h-full rounded-full bg-ink/70" style={{ width: `${n * 100}%` }} /></span><span className="w-10 shrink-0 text-right tabular-nums text-muted">{Math.round(n * 100).toLocaleString(locale())}%</span></span>
    }
    case 'bytes': return typeof value === 'number' ? bytes(value) : String(value)
    case 'person': {
      const person = typeof value === 'object' ? value as { name?: string; avatar?: string | null; initials?: string } : { name: String(value) }
      return <span className="flex min-w-0 items-center gap-2"><Avatar name={person.name ?? ''} initials={person.initials} src={person.avatar ?? undefined} size={24} /><span className="truncate">{person.name}</span></span>
    }
    case 'image': return safeUrl(value) ? <img src={safeUrl(value)!} alt="" className="size-8 rounded-xs object-cover" /> : NONE
    case 'link': return safeUrl(value) ? <a href={safeUrl(value)!} target="_blank" rel="noreferrer" className="truncate text-text underline-offset-2 hover:underline">{String(value).replace(/^https?:\/\//, '')}</a> : String(value)
    default:
      if (typeof value === 'boolean') return value ? t('Yes') : t('No')
      if (typeof value === 'number') return value.toLocaleString(locale())
      if (Array.isArray(value)) return value.every((v) => typeof v !== 'object' || v === null) ? value.map((v) => word(v, labels)).join(', ') : plural(value.length, '{count} item', '{count} items')
      if (typeof value === 'object') return plural(Object.keys(value as object).length, '{count} field', '{count} fields')
      return word(value, labels)
  }
}

function bytes(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let n = size
  let i = 0
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toLocaleString(locale(), { maximumFractionDigits: i ? 1 : 0 })} ${units[i]}`
}

/** A value for client sorting and searching: what it reads as, not how it is drawn. */
export function plainValue(value: unknown, labels?: Record<string, string>): string | number | null {
  if (empty(value)) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object') return (value as { name?: string }).name ?? null
  return word(value, labels)
}
