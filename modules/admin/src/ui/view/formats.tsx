import { locale, plural, t, timeAgo, type PersonSummary } from '@letterncms/sdk'
import type { ReactNode } from 'react'
import { Avatar, AvatarStack } from '../Avatar'
import { cn } from '../cn'
import { Icon } from '../Icon'
import { DateCell } from '../recordDates'
import { Badge, StatusDot, type Tone } from '../Badge'
import { safeUrl } from './scope'
import { compactNumber } from '../Widget'

/** How one value is written, by the catalog's formats (see Cms\Admin\Catalog::FORMATS). */
export interface FormatOptions {
  format?: string
  tones?: Record<string, Tone>
  labels?: Record<string, string>
  currency?: string
  /** With `format: field`: the blueprint field the value belongs to (its `type`, its `options`). */
  field?: { type: string; options?: unknown }
  /** With `format: languages`: every language there is, the value being those it has. */
  locales?: string[]
  /** Media looked up for what is on view, by id: thumbnails for `media` (and `field` of type media). */
  media?: Map<string, MediaThumb>
}

/** A file as `media/get-many` gives it. */
export interface MediaThumb { id: string; thumb: string | null; url: string; alt?: string | null; kind?: string }

// Nothing to say: a dash in its column, and on a phone no place in the row at all (app.css, `data-wide`).
const NONE = <span data-wide="" className="text-faint">—</span>

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

export function formatValue(value: unknown, { format = 'text', tones, labels, currency, field, locales, media }: FormatOptions = {}): ReactNode {
  if (format === 'languages') return <Languages has={Array.isArray(value) ? value.map(String) : []} locales={locales ?? []} />
  if (format === 'field') return field ? <FieldValue type={field.type} options={field.options} value={value} media={media} /> : formatValue(value)
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
    // A state the tones name is shown as its tone, in the words given; any other keeps its own (Published, Changes).
    case 'status': return <StatusDot status={tones?.[String(value)] ?? String(value)} label={labels?.[String(value)] ?? (tones?.[String(value)] !== undefined ? String(value) : undefined)} />
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
    case 'bytes': return typeof value === 'number' ? formatBytes(value) : String(value)
    case 'person': {
      const person = typeof value === 'object' ? value as { name?: string; avatar?: string | null; initials?: string } : { name: String(value) }
      return <span className="flex min-w-0 items-center gap-2"><Avatar name={person.name ?? ''} initials={person.initials} src={person.avatar ?? undefined} size={24} /><span className="truncate">{person.name}</span></span>
    }
    // An address on the site, quiet and in the type addresses are written in.
    case 'address': return <span className="block truncate font-mono text-xs text-faint">{String(value)}</span>
    case 'media': return <MediaCell value={value} media={media} />
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

/** A file size in the admin's language (“12 kB”, “1,4 Mo”). */
export function formatBytes(bytes: number): string {
  const [unit, value, digits] = bytes < 1024 ? ['byte', bytes, 0] : bytes < 1024 ** 2 ? ['kilobyte', bytes / 1024, 0] : bytes < 1024 ** 3 ? ['megabyte', bytes / 1024 ** 2, 1] : ['gigabyte', bytes / 1024 ** 3, 1]
  // Bytes in short form read “109 byte”; narrow is “109B”, like kB and MB.
  return new Intl.NumberFormat(locale(), { style: 'unit', unit: unit as string, unitDisplay: unit === 'byte' ? 'narrow' : 'short', maximumFractionDigits: digits as number }).format(value as number)
}

/** A value for client sorting and searching: what it reads as, not how it is drawn. */
export function plainValue(value: unknown, labels?: Record<string, string>): string | number | null {
  if (empty(value)) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object') return (value as { name?: string }).name ?? null
  return word(value, labels)
}

export function mediaIds(value: unknown): string[] {
  return (Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []).filter((v): v is string => typeof v === 'string' && v !== '')
}

/** The picture for a media value: a looked-up thumbnail, or the address itself. */
export function mediaSource(id: string, media?: Map<string, MediaThumb>): string | null {
  const item = media?.get(id.toLowerCase())
  if (item) return item.thumb ?? (item.kind === 'image' ? item.url : null)
  return id.startsWith('/') || id.startsWith('http') ? safeUrl(id) : null
}

function MediaCell({ value, media }: { value: unknown; media?: Map<string, MediaThumb> }) {
  const ids = mediaIds(value)
  if (!ids.length) return NONE
  const src = mediaSource(ids[0], media)
  return <span className="flex items-center gap-1">
    <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-xs border border-border bg-sunken text-faint">
      {src ? <img src={src} alt="" loading="lazy" className="size-full object-cover" /> : <Icon name="file" size={12} />}
    </span>
    {ids.length > 1 && <span className="text-2xs text-faint">+{ids.length - 1}</span>}
  </span>
}

/** Every language there is, those this record has in ink. */
function Languages({ has, locales }: { has: string[]; locales: string[] }) {
  const present = new Set(has)
  return <span className="flex items-center gap-1">
    {locales.map((code) => <span key={code} title={present.has(code) ? undefined : t('Not translated')}
      className={cn('inline-flex h-4.5 w-[22px] items-center justify-center rounded-xs font-mono text-2xs uppercase', present.has(code) ? 'bg-sunken text-text' : 'text-faint/70')}>{code}</span>)}
  </span>
}

function optionLabel(options: unknown, value: unknown): string {
  const raw = options as Record<string, string> | (string | { value: string; label?: string })[] | undefined
  if (raw && !Array.isArray(raw) && typeof raw === 'object') return raw[String(value)] ?? String(value)
  if (Array.isArray(raw)) {
    const match = raw.find((o) => (typeof o === 'object' ? String(o.value) : String(o)) === String(value))
    if (match && typeof match === 'object') return match.label ?? String(value)
  }
  return String(value)
}

/** A field's value as a cell: compact, one line, as its type reads. */
function FieldValue({ type, options, value, media }: { type: string; options?: unknown; value: any; media?: Map<string, MediaThumb> }) {
  if (empty(value)) return null
  switch (type) {
    case 'toggle': return value ? <Icon name="check" size={14} className="text-text" aria-label={t('Yes')} /> : null
    case 'number': return <span className="block truncate text-right text-xs tabular-nums text-text">{Number(value).toLocaleString(locale())}</span>
    case 'date': return <DateCell iso={String(value)} />
    case 'select': return <span className="block truncate text-xs text-text">{(Array.isArray(value) ? value : [value]).map((v) => optionLabel(options, v)).join(', ')}</span>
    case 'tags': return <Chips labels={(Array.isArray(value) ? value : [value]).map(String)} />
    case 'entries': return <Chips labels={(value as { title: string }[]).map((e) => e.title)} />
    case 'users': {
      const people = value as PersonSummary[]
      return people.length === 1
        ? <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted"><Avatar name={people[0].name} initials={people[0].initials} src={people[0].avatar ?? undefined} size={18} /><span className="truncate">{people[0].name}</span></span>
        : <AvatarStack people={people} size={18} max={3} />
    }
    case 'media': return <MediaCell value={value} media={media} />
    case 'color': return <span className="flex items-center gap-1.5 text-xs"><span className="size-3 shrink-0 rounded-full border border-border" style={{ background: String(value) }} /><span className="truncate font-mono text-muted">{String(value)}</span></span>
    case 'slug': case 'url': case 'email': return <span className="block truncate font-mono text-xs text-muted">{String(value)}</span>
    // Markdown or HTML, as a line of words.
    case 'textarea': case 'markdown': case 'richtext': return <span className="text-xs text-muted">{plainText(value)}</span>
    default: return <span className="block truncate text-xs text-text">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
  }
}

/** Markdown or HTML reduced to words. */
export function plainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/[#>*_`~[\]()!-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Up to two small labels and a count of the rest. */
function Chips({ labels }: { labels: string[] }) {
  return <span className="flex min-w-0 items-center gap-1">
    {labels.slice(0, 2).map((label, i) => <span key={i} className="inline-flex h-5 min-w-0 shrink items-center rounded-xs bg-sunken px-1.5 text-2xs text-text"><span className="truncate">{label}</span></span>)}
    {labels.length > 2 && <span className="shrink-0 text-2xs text-faint">+{labels.length - 2}</span>}
  </span>
}
