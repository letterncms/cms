import { abilityKey, CmsError, loadManifest, queryClient, run, setQuery, t, useAbility, useLocation, type FieldDef } from '@letterncms/sdk'
import { useContext, useEffect, useState } from 'react'
import { confirm } from '../Dialog'
import { QueryError } from '../QueryError'
import { Fields } from '../Fields'
import { changedFrom, GroupedFields } from '../GroupedFields'
import { SaveBar } from '../SaveBar'
import { Spinner } from '../Spinner'
import { TabContext, useView } from './context'
import { at, input } from './scope'

export interface FormProps {
  /** Where the form's fields and values come from. Without it, `fields` and empty values. */
  source?: { ability: string; input?: Record<string, unknown> }
  fieldsAt?: string
  valuesAt?: string
  fields?: FieldDef[]
  /** The loaded value is one field's: a list of rows (redirects) edited as that field and saved as `{ [into]: rows }`. */
  into?: string
  /** The ability that stores the values: under `as` (`values` unless named), or spread over the input with `as: "*"`. */
  save: { ability: string; input?: Record<string, unknown>; as?: string }
  after?: 'refresh' | 'manifest'
  width?: 'narrow' | 'wide'
  onDirty?: (dirty: boolean) => void
  /** What the fields are told about where they are, such as a global set's `locale`. */
  context?: Record<string, unknown>
}

/**
 * A form as every settings page draws it: fields in their sections, switches in a group,
 * and the save bar while something changed. `?field=<handle>` opens it at one of its fields.
 */
export function Form({ source, fieldsAt = 'fields', valuesAt = 'values', fields: own, into, save, after, width = 'narrow', onDirty, context }: FormProps) {
  const { scope } = useView()
  const loadInput = input(source?.input, scope)
  const data = useAbility<unknown>(source?.ability ?? 'abilities/list', loadInput, { enabled: !!source, refetchOnWindowFocus: false })
  const loaded = source ? data.data : {}
  const fields = (own ?? (at(loaded, fieldsAt) as FieldDef[] | undefined) ?? []) as FieldDef[]
  const saved = (into ? { [into]: at(loaded, valuesAt === 'values' && Array.isArray(loaded) ? '' : valuesAt) ?? [] } : ((source ? at(loaded, valuesAt) : {}) ?? {})) as Record<string, any>
  const [values, setValues] = useState<Record<string, any> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dirty = changedFrom(values, saved)
  const tab = useContext(TabContext)
  useEffect(() => {
    onDirty?.(dirty)
    tab?.dirty(tab.id, dirty)
  }, [dirty, onDirty, tab])
  useFieldLink(!!loaded)

  const discard = () => {
    setValues(null)
    setErrors({})
    setError(null)
  }

  const submit = async () => {
    if (!values || !dirty) return
    // A change that loses something asks first, as it is saved: a field's `confirmChange` says from which value, and what is lost.
    for (const field of fields) {
      const ask = field.confirmChange as { from: unknown; title: string; text?: string; confirm: string } | undefined
      if (ask && field.handle in values && saved[field.handle] === ask.from && values[field.handle] !== ask.from
        && !(await confirm({ title: ask.title, description: ask.text, confirm: ask.confirm, danger: true }))) return
    }
    setBusy(true)
    setError(null)
    try {
      const base = input(save.input, scope)
      const stored = await run<Record<string, any>>(save.ability, save.as === '*' ? { ...base, ...values } : { ...base, [save.as ?? 'values']: values })
      // What was stored (normalized) shows straight away, without a load in between.
      if (source && !into && stored && typeof stored === 'object') {
        queryClient.setQueryData(abilityKey(source.ability, loadInput), (old: unknown) => old && typeof old === 'object' ? { ...old, [valuesAt]: stored } : old)
      }
      setValues(null)
      setErrors({})
      // A setting can reach anywhere (the sidebar, the language, what is on): whatever is cached may now be wrong.
      void queryClient.invalidateQueries()
      if (after === 'manifest') await loadManifest()
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (source && data.isError) return <QueryError title={t('Something went wrong')} message={data.error.message} onRetry={() => void data.refetch()} />
  if (source && (data.isLoading || !data.data)) return <div className="grid place-items-center py-10 text-faint"><Spinner /></div>

  return (
    <div className={width === 'wide' ? 'w-full' : 'mx-auto w-full max-w-[640px]'}>
      {/* A list edited whole is its one field, under the tab that names it: no label of its own. */}
      {into
        ? <Fields bare fields={fields} values={values ?? saved} onChange={(h, v) => setValues({ ...(values ?? saved), [h]: v })} errors={errors} context={context} />
        : <GroupedFields fields={fields} values={values ?? saved} onChange={(h, v) => setValues({ ...(values ?? saved), [h]: v })} errors={errors} context={context} />}
      <SaveBar dirty={dirty} saving={busy} error={error} onSave={() => void submit()} onDiscard={discard} />
    </div>
  )
}

/** A settings page's form: its namespace's fields, saved with settings/update. */
export function SettingsView({ namespace, onDirty }: { namespace: string; onDirty?: (dirty: boolean) => void }) {
  return <Form source={{ ability: 'settings/get', input: { namespace } }} save={{ ability: 'settings/update', input: { namespace } }} after="manifest" onDirty={onDirty} />
}

/** `?field=<handle>`: once the form has drawn it, the field scrolls into view and takes focus; the address forgets it. */
function useFieldLink(ready: boolean) {
  const { query } = useLocation()
  const handle = query.field
  useEffect(() => {
    if (!ready || !handle) return
    const found = document.querySelector<HTMLElement>(`[data-cms-screen] [data-field="${CSS.escape(handle)}"]:not([hidden] *)`)
    if (found) {
      found.scrollIntoView({ block: 'center' })
      found.querySelector<HTMLElement>('input:not([type=hidden]), select, textarea, button, [role=switch], [tabindex="0"]')?.focus({ preventScroll: true })
    }
    // A field this page doesn't have (or no longer shows) leaves the address too.
    setQuery({ field: null })
  }, [ready, handle])
}
