import { t, type FieldProps } from '@letterncms/sdk'
import { Button, Fields, IconButton } from '@letterncms/ui'

type Archive = string | { route?: string; routes?: Record<string, string> }

/**
 * A collection's term archives: the taxonomies whose terms get a page listing this collection's entries, and
 * the address of each (`/blog/topics/{slug}`). A row per taxonomy; what a language has of its own (`routes`)
 * is kept as it is written.
 */
export default function Archives({ field, value, onChange, disabled, context }: FieldProps<Record<string, Archive> | null>) {
  const taxonomies = (field.options ?? {}) as Record<string, string>
  const archives = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const rows = Object.entries(archives)
  const free = Object.keys(taxonomies).filter((handle) => !(handle in archives))
  const write = (next: [string, Archive][]) => onChange(next.length ? Object.fromEntries(next) : null)
  const route = (archive: Archive) => (typeof archive === 'string' ? archive : archive.route ?? '')
  const withRoute = (archive: Archive, pattern: string): Archive => (typeof archive === 'string' ? pattern : { ...archive, route: pattern })
  // A new archive starts under the collection's own address: /blog/{slug} gives /blog/topics/{slug}.
  const own = typeof context?.values?.route === 'string' ? context.values.route : ''
  const prefix = own.split('{')[0].replace(/\/+$/, '')
  const suggest = (taxonomy: string) => `${prefix}/${taxonomy}/{slug}`

  return (
    <div className="space-y-5 sm:space-y-2" id="f-archives" data-archives>
      {rows.map(([taxonomy, archive], i) => (
        <div key={taxonomy} className="flex items-start gap-2 sm:items-center">
          <Fields
            bare
            className="min-w-0 flex-1"
            fields={[
              // The one it has, and the ones no other row has taken.
              { handle: 'taxonomy', type: 'select', label: t('Taxonomy'), width: 'half', options: Object.fromEntries([[taxonomy, taxonomies[taxonomy] ?? taxonomy], ...free.map((handle) => [handle, taxonomies[handle]])]) },
              { handle: 'route', type: 'text', label: t('URL Pattern'), width: 'half', placeholder: suggest(taxonomy) },
            ]}
            values={{ taxonomy, route: route(archive) }}
            disabled={disabled}
            onChange={(key, v) => write(rows.map((row, j) => (j !== i ? row : key === 'taxonomy' ? [String(v), archive] : [taxonomy, withRoute(archive, String(v ?? ''))])))}
          />
          <IconButton icon="close" label={t('Remove Archive')} size="xs" className="max-sm:mt-1" disabled={disabled} onClick={() => write(rows.filter((_, j) => j !== i))} />
        </div>
      ))}
      {free.length > 0 && (
        <Button variant="ghost" icon="plus" disabled={disabled} onClick={() => write([...rows, [free[0], suggest(free[0])]])}>{t('Add Archive')}</Button>
      )}
    </div>
  )
}
