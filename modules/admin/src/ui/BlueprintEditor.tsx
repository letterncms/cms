import { CmsError, invalidate, loadManifest, navigate, plural, run, t, useAbility, useTab, type FieldDef } from '@letterncms/sdk'
import { useEffect, useRef, useState } from 'react'
import { FieldsEditor, type RawField } from '../fields/FieldsEditor'
import { PartName } from '../fields/BuilderFields'
import { IconButton } from './Button'
import { Button } from './Button'
import { confirm } from './Dialog'
import { NotFoundState } from './EmptyState'
import { Notice } from './Notice'
import { QueryError } from './QueryError'
import { Fields } from './Fields'
import { Page, type Crumb } from './Page'
import { SaveBar } from './SaveBar'
import { Spinner } from './Spinner'
import { toast } from './toast'
import { Segmented, Tabs } from './Segmented'

export interface BlueprintDefinition {
  title: string
  singular?: string
  icon?: string
  route?: string | null
  structure?: string
  driver?: string
  template?: string
  sort?: string
  body?: string
  home?: string
  editor?: 'document' | 'canvas'
  fields: RawField[]
  [key: string]: any
}

/** Something with a blueprint, and how the editor reads, saves and leaves it. */
type BlueprintRemoval = [ability: string, input: Record<string, unknown>, warning: string, confirmLabel?: string]

export interface BlueprintKind {
  get: [ability: string, input: Record<string, unknown>]
  save: (def: BlueprintDefinition) => [ability: string, input: Record<string, unknown>]
  /** Resolve fresh deletion metadata before asking for confirmation. */
  remove?: BlueprintRemoval | (() => Promise<BlueprintRemoval>)
  removeLabel?: string
  canRemove?: (source: Record<string, unknown>) => boolean
  back: { label: string; to: string; icon: string }
  /** The crumbs to the editor, once it has loaded; `back` and the definition's title by default. */
  crumbs?: (def: BlueprintDefinition) => Crumb[]
  entries?: string
  /**
   * Its items come in kinds, each with fields of its own beside the first (`blueprints` of the definition):
   * the Fields tab then switches between them. Answers how many items were made with one.
   */
  blueprints?: (handle: string) => Promise<number>
  /** What every item has without a field; null when nothing. */
  builtIn?: string | null
  /** Give complex blueprints separate fields and grouped settings views. */
  settingsSections?: { title: string; handles: string[]; bare?: boolean }[]
}

function editableDefinition(source: any): BlueprintDefinition | null {
  if (!source) return null
  const { handle: _h, resolvedFields: _r, resolvedBlueprints: _b, schema: _s, data: _d, settings: _x, count: _c, deletable: _v, publishedAt: _p, updatedAt: _u, createdAt: _a, ...rest } = source
  return { ...rest, fields: source.fields ?? [] }
}

/**
 * Edits whatever has a blueprint — a collection, a global set, user profiles —
 * through the abilities its kind names. Modules describe their kind and render this.
 */
export function BlueprintEditor({ kind }: { kind: BlueprintKind }) {
  // The definition, plus its settings as fields (core's and the ones plugins add).
  const source = useAbility<any>(kind.get[0], kind.get[1], { refetchOnWindowFocus: false })
  const settings: FieldDef[] = source.data?.settings ?? []
  const [def, setDef] = useState<BlueprintDefinition | null>(() => editableDefinition(source.data))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  // What a refused save said about single fields, by the path of the option (`fields.2.handle`): shown beside them.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const operation = useRef(false)
  const [tab, setTab] = useTab(['fields', 'settings'])
  // Which set of fields is on view: the definition's own (''), or one of its named blueprints.
  const [current, setCurrent] = useState('')
  // The blueprints there were when the editor opened: items are stored under those handles.
  const savedBlueprints = useRef<Set<string> | null>(null)
  if (source.data && !savedBlueprints.current) savedBlueprints.current = new Set(Object.keys(source.data.blueprints ?? {}))
  const removable = !!kind.remove && !!source.data && (kind.canRemove?.(source.data) ?? true)

  useEffect(() => {
    if (source.data && !def) {
      setDef(editableDefinition(source.data))
    }
  }, [source.data, def])

  const patch = (p: Partial<BlueprintDefinition>) => {
    setDef((d) => (d ? { ...d, ...p } : d))
    setDirty(true)
  }
  const setFields = (fields: RawField[]) => {
    // A problem stays until its field is changed; once fields are added, removed or moved, the paths no longer say which.
    setFieldErrors((errors) => {
      const before = def?.fields ?? []
      if (!Object.keys(errors).length) return errors
      if (before.length !== fields.length) return {}
      const changed = fields.flatMap((f, i) => f === before[i] ? [] : [`fields.${i}.`])
      return Object.fromEntries(Object.entries(errors).filter(([path]) => !changed.some((prefix) => path.startsWith(prefix))))
    })
    patch({ fields })
  }

  // The save bar is the one way to save (and asks before leaving with changes); it says when saving failed.
  const save = async () => {
    if (!def || operation.current) return
    operation.current = true
    setSaving(true)
    setSaveError(null)
    setFieldErrors({})
    try {
      await run(...kind.save(def))
      setDirty(false)
      // The places drawn from a blueprint (a collection's columns) change with it.
      invalidate('collections/', 'globals/', 'entries/', 'users/', 'user-fields/', 'views/')
      await loadManifest()
    } catch (e) {
      setSaveError(e instanceof Error && e.constructor !== TypeError ? e.message : t('Couldn’t save. Check your connection.'))
      if (e instanceof CmsError && e.type === 'invalid_input') {
        const about = Object.fromEntries(Object.entries(e.details).filter(([path]) => path.startsWith('fields.') || path.startsWith('blueprints.')))
        setFieldErrors(about)
        // The field it is about is on the Fields tab.
        if (Object.keys(about).length) setTab('fields')
      }
    } finally {
      setSaving(false)
      operation.current = false
    }
  }

  const remove = async () => {
    if (!kind.remove || !removable || operation.current) return
    operation.current = true
    setRemoving(true)
    setRemoveError(null)
    try {
      const request = typeof kind.remove === 'function' ? await kind.remove() : kind.remove
      if (!(await confirm({ title: t('Delete “{title}”?', { title: def?.title }), description: request[2], confirm: request[3] ?? t('Delete'), danger: true }))) return
      await run(request[0], request[1])
      setDirty(false)
      invalidate('collections/', 'globals/', 'entries/', 'content/', 'views/')
      try { await loadManifest() } catch (e) { toast.error(e) }
      navigate(kind.back.to)
    } catch (e) {
      setRemoveError(e instanceof Error ? e.message : t('Could not delete. Try again.'))
    } finally {
      setRemoving(false)
      operation.current = false
    }
  }

  // The named blueprints, in the order they are written.
  const blueprints: Record<string, { title?: string; fields?: RawField[] }> = def?.blueprints && typeof def.blueprints === 'object' && !Array.isArray(def.blueprints) ? def.blueprints : {}
  const named = blueprints[current] ? current : ''
  const setBlueprints = (next: [string, { title?: string; fields?: RawField[] }][]) => patch({ blueprints: next.length ? Object.fromEntries(next) : undefined })
  const changeBlueprint = (handle: string, change: { title?: string; fields?: RawField[] }) => setBlueprints(Object.entries(blueprints).map(([h, b]) => (h === handle ? [h, { ...b, ...change }] : [h, b])))
  const addBlueprint = () => {
    let handle = 'kind'
    for (let n = 2; blueprints[handle]; n++) handle = `kind_${n}`
    setBlueprints([...Object.entries(blueprints), [handle, { title: t('Blueprint'), fields: [] }]])
    setCurrent(handle)
  }
  const renameBlueprint = (from: string, to: string) => {
    setBlueprints(Object.entries(blueprints).map(([h, b]) => (h === from ? [to, b] : [h, b])))
    setCurrent(to)
  }
  // What was made with it stays, without these fields: said with how many there are, before it is taken away.
  const removeBlueprint = async (handle: string) => {
    if (savedBlueprints.current?.has(handle)) {
      let count = 0
      try { count = await kind.blueprints!(handle) } catch (e) { toast.error(e); return }
      const title = blueprints[handle]?.title || handle
      if (!(await confirm({
        title: t('Remove “{title}”?', { title }),
        description: count > 0 ? plural(count, '{count} entry was made with it. It keeps its values, without these fields.', '{count} entries were made with it. They keep their values, without these fields.') : undefined,
        confirm: t('Remove Blueprint'), danger: true,
      }))) return
    }
    setBlueprints(Object.entries(blueprints).filter(([h]) => h !== handle))
    setCurrent('')
  }

  const discard = () => {
    setCurrent('')
    setDef(editableDefinition(source.data))
    setDirty(false)
    setSaveError(null)
    setFieldErrors({})
  }

  if (source.isLoading || (!def && source.data)) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (source.isError && !def) return <Page crumbs={[kind.back]}><QueryError message={source.error?.message} onRetry={() => void source.refetch()} retrying={source.isFetching} /></Page>
  if (!def) return <Page crumbs={[kind.back, { label: t('Not Found') }]}><NotFoundState icon={kind.back.icon} action={<Button onClick={() => navigate(kind.back.to)}>{t('Back to {label}', { label: kind.back.label })}</Button>} /></Page>

  // Deleting is there to see, at the end of the page, never next to Save: one quiet button, named for what it deletes.
  const removal = removable && (
    <div className="mt-10 border-t border-border pt-6">
      <Button variant="destructive" icon="trash" className="-ml-2" disabled={saving} loading={removing} onClick={remove}>{kind.removeLabel ?? t('Delete')}</Button>
    </div>
  )

  return (
    <Page
      width="wide"
      title={kind.settingsSections ? def.title : undefined}
      crumbs={kind.crumbs?.(def) ?? [kind.back, { label: kind.remove ? def.title : t('Profile Fields') }]}
      actions={kind.entries && <Button icon="arrow-up-right" onClick={() => navigate(kind.entries!)}>{t('Entries')}</Button>}
    >
      {removeError && <Notice tone="danger" className="mb-5" action={<Button size="xs" disabled={saving} loading={removing} onClick={remove}>{t('Try Again')}</Button>}>{removeError}</Notice>}
      <div inert={saving || removing}>
      {kind.settingsSections ? (
        <div className="max-w-[960px]">
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'fields', label: t('Fields') }, { value: 'settings', label: t('Settings') }]} className="mb-6" />
          {tab === 'fields' ? (
            <>
              {/* The kinds of item, where there can be several: one set of fields on view at a time, in the same editor. */}
              {kind.blueprints && (
                <div className="mb-4 flex flex-wrap items-center gap-2" data-blueprints>
                  <Segmented aria-label={t('Blueprints')} value={named} onChange={setCurrent} options={[{ value: '', label: def.singular || def.title }, ...Object.entries(blueprints).map(([handle, b]) => ({ value: handle, label: b.title || handle }))]} />
                  <IconButton icon="plus" label={t('Add Blueprint')} onClick={addBlueprint} />
                </div>
              )}
              {named === '' ? (
                <FieldsEditor heading={false} fields={def.fields} onChange={setFields} body={def.body} builtIn={kind.builtIn} errors={fieldErrors} />
              ) : (
                <div key={named}>
                  <div className="mb-5 max-w-[640px]">
                    <PartName
                      name={blueprints[named].title ?? ''} handle={named} taken={Object.keys(blueprints).filter((h) => h !== named)}
                      renamed={!savedBlueprints.current?.has(named) && [...(savedBlueprints.current ?? [])].some((h) => !blueprints[h])}
                      onName={(title) => changeBlueprint(named, { title })} onHandle={(handle) => renameBlueprint(named, handle)}
                    />
                  </div>
                  <FieldsEditor heading={false} fields={blueprints[named].fields ?? []} onChange={(fields) => changeBlueprint(named, { fields })} body={def.body} errors={fieldErrors} path={`blueprints.${named}.fields`} />
                  <div className="mt-10 border-t border-border pt-6">
                    <Button variant="destructive" icon="trash" className="-ml-2" disabled={saving} onClick={() => void removeBlueprint(named)}>{t('Remove Blueprint')}</Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              {/* A rule between two sections, none after the last: what follows draws its own. */}
              <div className="divide-y divide-border">
              {[...kind.settingsSections, { title: t('More Settings'), handles: settings.filter((f) => !kind.settingsSections!.some((s) => s.handles.includes(f.handle))).map((f) => f.handle), bare: false }].map((section) => {
                const fields = section.handles.flatMap((h) => settings.filter((f) => f.handle === h))
                if (!fields.length) return null
                return (
                  <section key={section.title} className="grid grid-cols-1 gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-8">
                    <h2 className="m-0 text-sm font-semibold text-ink">{section.title}</h2>
                    <Fields bare={section.bare} fields={fields} values={def} context={{ blueprintFields: source.data?.resolvedFields?.filter((f: FieldDef) => !source.data.fields?.some((own: RawField) => own.handle === f.handle)) }} onChange={(h, v) => patch({ [h]: v })} disabled={saving} />
                  </section>
                )
              })}
              </div>
              {removal}
            </div>
          )}
        </div>
      ) : <div className={settings.length > 0 ? 'grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]' : 'max-w-[760px]'}>
        <div className="min-w-0">
          <FieldsEditor fields={def.fields} onChange={setFields} body={def.body} builtIn={kind.builtIn} errors={fieldErrors} />
          {removal}
        </div>

        {settings.length > 0 && (
          <aside className="space-y-5">
            {/* Same height as the fields header beside it, so the two rules line up. */}
            <div className="border-b border-border pb-2">
              <h2 className="m-0 flex h-7 items-center text-sm font-semibold text-ink">{t('Settings')}</h2>
            </div>
            <Fields fields={settings} values={def} onChange={(h, v) => patch({ [h]: v })} />
          </aside>
        )}
      </div>}
      </div>
      <SaveBar dirty={dirty} saving={saving} error={saveError} onSave={() => void save()} onDiscard={discard} />
    </Page>
  )
}

