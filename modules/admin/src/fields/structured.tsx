import { t, useAbility, type FieldProps } from '@letterncms/sdk'
import { Button, IconButton, Input, fieldControlId, cn } from '../ui'
import { DateField } from './basic'
import { LinkField } from './LinkField'

/** What a `link` field stores: where it goes, the words on it, and whether it opens in a new tab. */
type LinkValue = { type: 'entry' | 'url' | 'email' | 'phone' | 'media'; value: string; label?: string | null; new_tab?: boolean }

/** A stored link as the picker's address, and back. A file is shown by its address and kept as its id (`media:<id>` from the picker). */
function toAddress(link: LinkValue | null, file?: string): string {
  if (!link?.value) return ''
  if (link.type === 'entry') return `entry:${link.value}`
  if (link.type === 'email') return `mailto:${link.value}`
  if (link.type === 'phone') return `tel:${link.value}`
  if (link.type === 'media') return file ?? ''
  return link.value
}

function fromAddress(address: string): Pick<LinkValue, 'type' | 'value'> {
  const entry = address.match(/^entry:([a-z0-9]+)/i)
  if (entry) return { type: 'entry', value: entry[1].toLowerCase() }
  if (/^mailto:/i.test(address)) return { type: 'email', value: address.slice(7) }
  if (/^tel:/i.test(address)) return { type: 'phone', value: address.slice(4) }
  const file = address.match(/^media:([a-z0-9]+)$/i)
  if (file) return { type: 'media', value: file[1].toLowerCase() }
  return { type: 'url', value: address }
}

/** `link` — the destination, picked as everywhere else, with the label people read. */
export function LinkValueField({ field, value, onChange, disabled, error, context }: FieldProps<LinkValue | null>) {
  const link = value && typeof value === 'object' ? value : null
  const file = useAbility<{ items: { id: string; url: string }[] }>('media/get-many', { ids: link?.type === 'media' ? [link.value] : [] }, { enabled: link?.type === 'media' })
  const id = fieldControlId(field)

  return (
    <div className="space-y-2">
      <LinkField
        field={{ ...field, type: 'url', reference: true, fileIds: true, kinds: Array.isArray(field.types) && field.types.length ? field.types : undefined, newTab: !!link?.new_tab, onNewTab: (on: boolean) => link && onChange({ ...link, new_tab: on || undefined }) }}
        value={toAddress(link, file.data?.items[0]?.url) || null}
        onChange={(address) => onChange(address ? { ...fromAddress(address), ...(link?.label ? { label: link.label } : {}), ...(link?.new_tab ? { new_tab: true } : {}) } : null)}
        error={error}
        disabled={disabled}
        context={context}
      />
      {link && (
        <Input
          id={`${id}-label`}
          aria-label={t('Label')}
          placeholder={t('Label')}
          value={link.label ?? ''}
          disabled={disabled}
          onChange={(e) => onChange({ ...link, label: e.target.value || undefined })}
        />
      )}
    </div>
  )
}

/** `date-range` — a start and an end, each the date control. */
export function DateRangeField({ field, value, onChange, disabled, error, context }: FieldProps<{ start?: string | null; end?: string | null } | null>) {
  const range = value && typeof value === 'object' ? value : {}
  const id = fieldControlId(field)
  const set = (key: 'start' | 'end', date: string | null) => {
    // Half a range is a draft's to keep: only what is filled in is sent.
    const next = Object.fromEntries(Object.entries({ ...range, [key]: date }).filter(([, v]) => v))
    onChange(next.start || next.end ? next : null)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateField field={{ ...field, id, label: t('Start') }} value={range.start ?? null} onChange={(date) => set('start', date)} error={error} disabled={disabled} context={context} />
      <span className="text-sm text-faint" aria-hidden="true">–</span>
      <DateField field={{ ...field, id: `${id}-end`, label: t('End') }} value={range.end ?? null} onChange={(date) => set('end', date)} error={error} disabled={disabled} context={context} />
    </div>
  )
}

/** `time` — a time of day. */
export function TimeField({ field, value, onChange, disabled, error }: FieldProps<string | null>) {
  return (
    <Input
      id={fieldControlId(field)}
      type="time"
      step={field.seconds ? 1 : 60}
      value={value ?? ''}
      invalid={!!error}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value || null)}
      className="max-w-36 tabular-nums"
    />
  )
}

/** `geo` — an address in words, and where it is in degrees. */
export function GeoField({ field, value, onChange, disabled, error }: FieldProps<{ lat?: number | null; lng?: number | null; address?: string | null } | null>) {
  const place = value && typeof value === 'object' ? value : {}
  const id = fieldControlId(field)
  const set = (patch: Record<string, unknown>) => {
    const next = { ...place, ...patch }
    onChange(next.address || next.lat != null || next.lng != null ? next : null)
  }
  const degrees = (key: 'lat' | 'lng', label: string, limit: number) => (
    <Input
      id={`${id}-${key}`}
      type="number"
      inputMode="decimal"
      step="any"
      min={-limit}
      max={limit}
      aria-label={label}
      placeholder={label}
      value={place[key] ?? ''}
      invalid={!!error}
      disabled={disabled}
      onChange={(e) => set({ [key]: e.target.value === '' ? null : Number(e.target.value) })}
      className="tabular-nums"
    />
  )

  return (
    <div className="space-y-2">
      <Input id={id} icon="map-pin" aria-label={t('Address')} placeholder={t('Address')} value={place.address ?? ''} disabled={disabled} onChange={(e) => set({ address: e.target.value || null })} />
      <div className="grid grid-cols-2 gap-2">
        {degrees('lat', t('Latitude'), 90)}
        {degrees('lng', t('Longitude'), 180)}
      </div>
    </div>
  )
}

/** `table` — rows of text cells; with `header` the first row is the head. */
export function TableField({ field, value, onChange, disabled }: FieldProps<string[][]>) {
  const rows = Array.isArray(value) ? value.filter(Array.isArray) : []
  const width = Math.max(1, ...rows.map((row) => row.length))
  const header = field.header !== false
  const max = (field.max as number) || Infinity
  const blank = () => Array.from({ length: width }, () => '')
  const cell = (r: number, c: number, text: string) => onChange(rows.map((row, i) => (i === r ? Array.from({ length: width }, (_, j) => (j === c ? text : row[j] ?? '')) : row)))

  return (
    <div className="space-y-2">
      {rows.length > 0 && (
        <div role="table" aria-label={field.label} className="overflow-x-auto rounded-lg border border-border">
          {rows.map((row, r) => (
            <div key={r} role="row" className={cn('flex min-w-fit items-center gap-1.5 px-2 py-1.5', r > 0 && 'border-t border-border', header && r === 0 && 'bg-sunken')}>
              {Array.from({ length: width }, (_, c) => (
                <div key={c} role={header && r === 0 ? 'columnheader' : 'cell'} className="min-w-28 flex-1">
                  <Input
                    size="sm"
                    aria-label={t('Row {row}, Column {column}', { row: r + 1, column: c + 1 })}
                    value={row[c] ?? ''}
                    disabled={disabled}
                    onChange={(e) => cell(r, c, e.target.value)}
                    className={cn(header && r === 0 && 'font-medium')}
                  />
                </div>
              ))}
              <IconButton icon="trash" label={t('Remove Row')} size="xs" disabled={disabled} onClick={() => onChange(rows.filter((_, i) => i !== r))} />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {rows.length < max && (
          <Button variant="ghost" icon="plus" disabled={disabled} onClick={() => onChange([...rows, blank()])}>{t('Add Row')}</Button>
        )}
        {rows.length > 0 && width < 20 && (
          <Button variant="ghost" icon="plus" disabled={disabled} onClick={() => onChange(rows.map((row) => [...Array.from({ length: width }, (_, j) => row[j] ?? ''), '']))}>{t('Add Column')}</Button>
        )}
        {rows.length > 0 && width > 1 && (
          <Button variant="ghost" icon="trash" disabled={disabled} onClick={() => onChange(rows.map((row) => row.slice(0, width - 1)))}>{t('Remove Last Column')}</Button>
        )}
      </div>
    </div>
  )
}
