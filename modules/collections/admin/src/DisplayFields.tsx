import { t, useManifest, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Button, Checkbox, entryFieldColumns, entrySystemColumns, standardEntryColumns } from '@letterncms/ui'

/** Configure the same column IDs used by the entry list's Display menu. */
export default function DisplayFields({ value, onChange, context, disabled }: FieldProps<string[] | null>) {
  const { site } = useManifest()
  const def = context.values ?? {}
  const raw: FieldDef[] = (def.fields ?? []).filter((f: FieldDef) => f.handle && f.type)
  // Imported fields come from the resolved blueprint; local edits take precedence immediately.
  const imported = (def.fields ?? []).some((f: { import?: string }) => f.import)
    ? (context.blueprintFields ?? []).filter((f) => !raw.some((r) => r.handle === f.handle)) : []
  const fields = entryFieldColumns([...raw, ...imported])
  const system = entrySystemColumns(!!def.route, site.locales)
  const defaults = standardEntryColumns(!!def.route, def.default_view, [...raw, ...imported])
  const shown = new Set(value ?? defaults)
  const automatic = new Set(defaults)
  const changed = shown.size !== automatic.size || [...shown].some((id) => !automatic.has(id))
  const toggle = (id: string, on: boolean) => onChange(on ? [...new Set([...shown, id])] : [...shown].filter((key) => key !== id))
  const choices = (columns: { id: string; label: string; field?: FieldDef }[]) => (
    <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
      {columns.map((column) => <Checkbox key={column.id} checked={shown.has(column.id)} disabled={disabled} onChange={(on) => toggle(column.id, on)} label={
        <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5">
          <span className="break-words">{column.label}</span>
          {column.field && <span className="break-all font-mono text-2xs text-faint">{column.field.handle}</span>}
        </span>
      } />)}
    </div>
  )
  return <div id="f-default_columns" role="group" aria-label={t('Default Display Fields')} className="rounded-sm border border-border px-4 py-3">
    {choices(system)}
    {fields.length > 0 && <div className="mt-3 border-t border-border pt-3">
      <div className="cms-label mb-2.5">{t('Collection Fields')}</div>
      {choices(fields)}
    </div>}
    {changed && <div className="mt-3 border-t border-border pt-3">
      <Button size="sm" disabled={disabled} onClick={() => onChange(null)}>{t('Reset to Automatic Fields')}</Button>
    </div>}
  </div>
}
