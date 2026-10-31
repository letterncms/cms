import { abilityKey, blockNavigation, CmsError, loadManifest, navigate, queryClient, run, t, useAbility, useManifest, type FieldDef } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { useShortcut } from '@letterncms/ui'
import { Button, EmptyState, Fields, Page, Spinner, toast } from '@letterncms/ui'

interface Namespace {
  label: string
  description: string
  icon: string
  fields: FieldDef[]
  values: Record<string, any>
}

/**
 * One settings namespace — the core's own (site, admin) or a module's or
 * plugin's. The settings sidebar lists them all; /settings opens the first.
 */
export default function Settings({ params }: { params: Record<string, string> }) {
  const manifest = useManifest()
  const first = manifest.settings[0]?.namespace

  useEffect(() => {
    if (!params.namespace && first) navigate(`/settings/${first}`, { replace: true })
  }, [params.namespace, first])

  if (!params.namespace) {
    return first ? null : (
      <Page crumbs={[{ label: t('Settings'), icon: 'settings' }]}>
        <EmptyState icon="settings" title={t('Nothing to set up')} />
      </Page>
    )
  }

  return <NamespaceSettings key={params.namespace} namespace={params.namespace} />
}

function NamespaceSettings({ namespace }: { namespace: string }) {
  const manifest = useManifest()
  const current = manifest.settings.find((s) => s.namespace === namespace)
  const data = useAbility<Namespace>('settings/get', { namespace }, { refetchOnWindowFocus: false, enabled: !!current })
  const [values, setValues] = useState<Record<string, any> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const dirty = values !== null

  useEffect(() => blockNavigation(() => (dirty ? t('Discard unsaved changes?') : null)), [dirty])

  const save = async () => {
    if (!values) return
    setBusy(true)
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
      toast.success(t('Saved'))
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  useShortcut('mod+s', () => void save())

  return (
    <Page
      width="narrow"
      crumbs={[{ label: t('Settings'), to: '/settings', icon: 'settings' }, { label: current?.label ?? t('Not Found') }]}
      actions={
        current && (
          <>
            {dirty && <Button variant="ghost" onClick={() => { setValues(null); setErrors({}) }}>{t('Discard')}</Button>}
            <Button variant="primary" disabled={!dirty} loading={busy} onClick={save}>{t('Save')}</Button>
          </>
        )
      }
    >
      {!current ? (
        <EmptyState icon="settings" title={t('These settings do not exist')} />
      ) : data.isError ? (
        <EmptyState icon="warning" title={t('Something went wrong')} description={data.error.message} action={<Button onClick={() => void data.refetch()}>{t('Try Again')}</Button>} />
      ) : data.isLoading || !data.data ? (
        <div className="grid place-items-center py-10 text-faint"><Spinner /></div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="m-0 text-2xl font-semibold tracking-[-0.02em] text-ink">{data.data.label}</h1>
            {data.data.description && <p className="m-0 mt-1 text-sm text-muted">{data.data.description}</p>}
          </div>
          <Fields fields={data.data.fields} values={values ?? data.data.values} onChange={(h, v) => setValues({ ...(values ?? data.data!.values), [h]: v })} errors={errors} />
        </>
      )}
    </Page>
  )
}
