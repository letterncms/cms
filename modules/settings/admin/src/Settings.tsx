import { abilityKey, CmsError, loadManifest, navigate, panelsFor, queryClient, registry, run, setQuery, t, useAbility, useLocation, useManifest, useTab, type FieldDef } from '@letterncms/sdk'
import { Suspense, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { Button, EmptyState, fieldVisible, Fields, Page, SaveBar, Section, Spinner, Switch, Tabs } from '@letterncms/ui'

interface Namespace {
  label: string
  description: string
  icon: string
  fields: FieldDef[]
  values: Record<string, any>
}

/**
 * One settings namespace — the core's own (site) or a module's or plugin's. The settings
 * sidebar lists them all; /settings opens the first. One whose plugin keeps it with its
 * own screen (`home`) is that screen's Settings tab: /settings/<namespace> goes there.
 *
 * A plugin adds tabs to a settings page through the `settings.tabs` slot, whose `when`
 * gets `{ namespace }`. The form is the first tab, "Settings"; each other tab renders its
 * own content and actions and gets `{ namespace, active }`. The bar shows with two or more.
 *
 *   registry.panels.set('redirects', { id: 'redirects', slot: 'settings.tabs', label, component: Redirects, when: (p) => p.namespace === 'seo' })
 *
 * What can be done on a tab goes in the page's top bar, through the `settings.actions` slot,
 * whose `when` and component get `{ namespace, tab, dirty }` (`tab` is `settings` for the form):
 *
 *   registry.panels.set('mail-test', { id: 'mail-test', slot: 'settings.actions', component: SendTest, when: (p) => p.namespace === 'mail' && p.tab === 'settings' })
 *
 * Every settings form, here or on a screen's Settings tab, is the same centered 640px column
 * under the page's tabs. `?field=<handle>` opens a page (or a Settings tab) at one of its fields.
 */
export default function Settings({ params }: { params: Record<string, string> }) {
  const manifest = useManifest()
  const { query } = useLocation()
  const first = manifest.settings.find((s) => !s.home)?.namespace
  const current = manifest.settings.find((s) => s.namespace === params.namespace)
  // Kept with its screen: its place is there, as that screen's Settings tab.
  const homed = current?.home ? manifest.nav.find((n) => n.id === `settings.${current.namespace}`)?.path : undefined

  useLayoutEffect(() => {
    if (!params.namespace && first) navigate(`/settings/${first}`, { replace: true })
    else if (homed) navigate(query.field ? `${homed}&field=${encodeURIComponent(query.field)}` : homed, { replace: true })
  }, [params.namespace, first, homed, query.field])

  if (!params.namespace) {
    return first ? null : (
      <Page crumbs={[{ label: t('Settings'), icon: 'settings' }]}>
        <EmptyState icon="settings" title={t('Nothing to set up')} />
      </Page>
    )
  }
  if (homed) return null

  return <NamespaceSettings key={params.namespace} namespace={params.namespace} />
}

function NamespaceSettings({ namespace }: { namespace: string }) {
  const manifest = useManifest()
  const current = manifest.settings.find((s) => s.namespace === namespace)
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const extra = current ? panelsFor<{ namespace: string; active?: boolean }>('settings.tabs', { namespace }) : []
  const [tab, setTab] = useTab(['settings', ...extra.map((p) => p.id)])
  const form = tab === 'settings'
  const [dirty, setDirty] = useState(false)
  // A tab once opened stays mounted, hidden, so what was typed there is still there on the way back.
  const [opened, setOpened] = useState<string[]>([])
  if (!form && !opened.includes(tab)) setOpened([...opened, tab])
  const actions = current ? panelsFor<{ namespace: string; tab: string; dirty: boolean }>('settings.actions', { namespace, tab, dirty }) : []

  return (
    <Page width="wide" title={current?.label} crumbs={[{ label: current?.label ?? t('Not Found'), icon: current?.icon }]} actions={actions.length > 0 && <>{actions.map(({ id, component: Action }) => <Action key={id} namespace={namespace} tab={tab} dirty={dirty} />)}</>}>
      {!current ? (
        <EmptyState icon="settings" title={t('Not Found')} action={<Button onClick={() => navigate('/settings')}>{t('Settings')}</Button>} />
      ) : (
        <>
          {extra.length > 0 && (
            <Tabs id="settings-tabs" className="mb-6" value={tab} onChange={setTab} tabs={[{ value: 'settings', label: t('Settings'), indicator: dirty }, ...extra.map((p) => ({ value: p.id, label: p.label ?? p.id }))]} />
          )}
          <div id="settings-tabs-settings-panel" role={extra.length > 0 ? 'tabpanel' : undefined} aria-labelledby={extra.length > 0 ? 'settings-tabs-settings' : undefined} hidden={!form}>
            <SettingsForm namespace={namespace} onDirty={setDirty} />
          </div>
          {extra.filter((p) => opened.includes(p.id)).map(({ id, component: Tab }) => (
            <div key={id} id={`settings-tabs-${id}-panel`} role="tabpanel" aria-labelledby={`settings-tabs-${id}`} hidden={tab !== id}>
              <Suspense fallback={<div className="grid place-items-center py-10 text-faint"><Spinner /></div>}>
                <Tab namespace={namespace} active={tab === id} />
              </Suspense>
            </div>
          ))}
        </>
      )}
    </Page>
  )
}

/** Values as a form compares them: empty is empty (null, '' or []), and objects regardless of key order. */
function same(a: unknown, b: unknown): boolean {
  const empty = (v: unknown) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
  if (empty(a) && empty(b)) return true
  const stable = (v: unknown): unknown => Array.isArray(v) ? v.map(stable) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable((v as Record<string, unknown>)[k])])) : v
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b))
}

/** Whether `values` differ from what is stored: typing something and taking it back again changes nothing. */
export function changedFrom(values: Record<string, any> | null, saved: Record<string, any> | undefined): boolean {
  if (!values) return false
  return Object.keys(values).some((key) => !same(values[key], saved?.[key]))
}

/**
 * A namespace's form: its fields in their sections, and the save bar while there are
 * changes. The same on a settings page and on a screen's Settings tab (the
 * `screen.settings` slot that `ScreenTabs` draws).
 */
export function SettingsForm({ namespace, onDirty }: { namespace: string; onDirty?: (dirty: boolean) => void }) {
  const data = useAbility<Namespace>('settings/get', { namespace }, { refetchOnWindowFocus: false })
  const [values, setValues] = useState<Record<string, any> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dirty = changedFrom(values, data.data?.values)
  useEffect(() => onDirty?.(dirty), [dirty, onDirty])
  useFieldLink(!!data.data)

  const discard = () => {
    setValues(null)
    setErrors({})
    setError(null)
  }

  const save = async () => {
    if (!values || !dirty) return
    setBusy(true)
    setError(null)
    try {
      const saved = await run<Record<string, any>>('settings/update', { namespace, values })
      // Show what was stored (normalized) straight away, without a refetch in between.
      queryClient.setQueryData<Namespace>(abilityKey('settings/get', { namespace }), (old) => old && { ...old, values: saved })
      setValues(null)
      setErrors({})
      // Settings reach everywhere: an API key turns the assistant, translation and widgets on, the site
      // name and sidebar change, mail transports switch. Whatever is cached may now be wrong.
      void queryClient.invalidateQueries()
      await loadManifest()
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (data.isError) return <EmptyState icon="warning" title={t('Something went wrong')} description={data.error.message} action={<Button onClick={() => void data.refetch()}>{t('Try Again')}</Button>} />
  if (data.isLoading || !data.data) return <div className="grid place-items-center py-10 text-faint"><Spinner /></div>

  return (
    <div className="mx-auto w-full max-w-[640px] pb-24">
      <GroupedFields fields={data.data.fields} values={values ?? data.data.values} onChange={(h, v) => setValues({ ...(values ?? data.data!.values), [h]: v })} errors={errors} />
      <SaveBar dirty={dirty} saving={busy} error={error} onSave={() => void save()} onDiscard={discard} />
    </div>
  )
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

/** A plain switch: drawn as a row of a settings group, its label on the left. */
const isSwitch = (field: FieldDef) => field.type === 'toggle' && !field.component && field.display !== 'checkbox'

/**
 * A settings page's fields, in runs under the heading their `section` names: the fields
 * before the first heading need none. Plugins name a field's section to put it under one.
 * A heading whose fields are all hidden (by their `if`) goes with them. Text fields stand
 * one under another; switches sit in a group, one row each, the way settings read in a list.
 */
export function GroupedFields({ fields, values, onChange, errors }: { fields: FieldDef[]; values: Record<string, any>; onChange: (handle: string, value: any) => void; errors: Record<string, string> }) {
  const runs: { title?: string; fields: FieldDef[] }[] = []
  for (const field of fields) {
    const title = typeof field.section === 'string' && field.section !== '' ? field.section : undefined
    const last = runs[runs.length - 1]
    if (last && last.title === title) last.fields.push(field)
    else runs.push({ title, fields: [field] })
  }
  return (
    <div>
      {runs.map((run, i) => {
        const shown = run.fields.filter((field) => fieldVisible(field, values))
        if (!shown.length) return null
        // Consecutive switches make one group; everything else is drawn by Fields, as it is.
        const parts: { switches: boolean; fields: FieldDef[] }[] = []
        for (const field of shown) {
          const last = parts[parts.length - 1]
          if (last && last.switches === isSwitch(field)) last.fields.push(field)
          else parts.push({ switches: isSwitch(field), fields: [field] })
        }
        const body = (
          <div className="space-y-4">
            {parts.map((part, j) => part.switches ? (
              <div key={j} className="overflow-hidden rounded-lg border border-border bg-bg">
                {part.fields.map((field) => (
                  <label key={field.handle} data-field={field.handle} className="flex min-h-14 cursor-pointer items-center gap-4 px-4 py-3 [&+&]:border-t [&+&]:border-border">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-text">{field.label}</span>
                      {field.instructions && <span className="mt-0.5 block text-xs text-muted">{field.instructions}</span>}
                      {errors[field.handle] && <span className="mt-0.5 block text-xs text-danger">{errors[field.handle]}</span>}
                    </span>
                    <Switch checked={!!(values[field.handle] ?? field.default)} onChange={(v) => onChange(field.handle, v)} aria-label={field.label} />
                  </label>
                ))}
              </div>
            ) : (
              <Fields key={j} fields={part.fields} values={values} onChange={onChange} errors={errors} />
            ))}
          </div>
        )
        return <Section key={i} title={run.title}>{body}</Section>
      })}
    </div>
  )
}
