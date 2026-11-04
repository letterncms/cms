import { can, invalidate, CmsError, loadManifest, navigate, run, t, useAbility, useManifest, type FieldDef } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Button, DataView, Dialog, EmptyState, Fields, Icon, IconButton, Menu, NotFoundState, Page, SaveBar, Spinner, slugify, toast } from '@letterncms/ui'

export function GlobalsList() {
  const manifest = useManifest()
  const [open, setOpen] = useState(false)
  const manage = can('globals.manage')
  return (
    <Page
      width="wide"
      crumbs={[{ label: t('Globals'), icon: 'globe' }]}
      actions={manage && <Button variant="primary" icon="plus" onClick={() => setOpen(true)}>{t('New Global Set')}</Button>}
    >
      <NewGlobal open={open} onOpenChange={setOpen} />
      <DataView id="globals" label={t('Globals')} items={manifest.globals} rowKey={(g) => g.handle} rowHref={(g) => `/globals/${g.handle}`}
        searchText={(g) => (manage ? `${g.title} ${g.handle}` : g.title)}
        columns={[
          { id: 'title', label: t('Name'), value: (g) => g.title, render: (g) => <span className="flex items-center gap-2"><Icon name={g.icon} size={16} className="shrink-0 text-muted" /><span className="truncate">{g.title}</span></span> },
          // The handle is for whoever builds the site's templates, not for those who fill in the values.
          ...(manage ? [{ id: 'handle', label: t('Handle'), width: 'minmax(200px,1fr)', value: (g: (typeof manifest.globals)[number]) => g.handle, render: (g: (typeof manifest.globals)[number]) => <span className="font-mono text-xs text-muted">{g.handle}</span> }] : []),
        ]}
        actions={manage ? (g) => <Menu trigger={<IconButton icon="more" label={t('Actions for {name}', { name: g.title })} size="xs" />} items={[
          { label: t('Edit'), icon: 'edit', onSelect: () => navigate(`/globals/${g.handle}`) },
          { label: t('Edit Fields'), icon: 'field', onSelect: () => navigate(`/globals/${g.handle}/fields`) },
        ]} /> : undefined}
        empty={<EmptyState icon="globe" title={t('No global sets yet')} description={t('Site-wide values, like contact details or footer links.')} />}
      />
    </Page>
  )
}

export function GlobalEditor({ params }: { params: Record<string, string> }) {
  const manifest = useManifest()
  const [locale, setLocale] = useState(manifest.site.defaultLocale)
  const set = useAbility<{ handle: string; title: string; icon: string; resolvedFields: FieldDef[]; data: Record<string, any> }>('globals/get', { handle: params.handle, locale }, { refetchOnWindowFocus: false })
  const [values, setValues] = useState<Record<string, any> | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const dirty = values !== null

  useEffect(() => setValues(null), [locale])

  const save = async () => {
    if (!values) return
    setSaving(true)
    setFailed(null)
    try {
      await run('globals/update', { handle: params.handle, values, locale })
      setValues(null)
      setErrors({})
      invalidate('globals/')
    } catch (e) {
      if (e instanceof CmsError) setErrors(e.details)
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  if (set.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!set.data) return <Page crumbs={[{ label: t('Globals'), to: '/globals', icon: 'globe' }, { label: t('Not Found') }]}><NotFoundState icon="globe" action={<Button onClick={() => navigate('/globals')}>{t('Back to {label}', { label: t('Globals') })}</Button>} /></Page>

  return (
    <Page
      width="narrow"
      crumbs={[{ label: t('Globals'), to: '/globals', icon: 'globe' }, { label: set.data.title }]}
      actions={
        <>
          {manifest.site.locales.length > 1 && <Fields bare layout="inline" fields={[{ handle: 'locale', type: 'select', label: t('Language'), display: 'segmented', required: true, options: manifest.site.locales.map((l) => ({ value: l, label: l.toUpperCase() })) }]} values={{ locale }} onChange={(_, v) => setLocale(v)} />}
          {can('globals.manage') && <Button icon="field" onClick={() => navigate(`/globals/${params.handle}/fields`)}>{t('Edit Fields')}</Button>}
        </>
      }
      title={set.data.title}
    >
      <Fields fields={set.data.resolvedFields} values={values ?? set.data.data} onChange={(h, v) => setValues({ ...(values ?? set.data!.data), [h]: v })} errors={errors} context={{ locale }} />
      <SaveBar dirty={dirty} saving={saving} error={failed} onSave={() => void save()} onDiscard={() => { setValues(null); setErrors({}); setFailed(null) }} />
    </Page>
  )
}

function NewGlobal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const handle = slugify(title).replace(/-/g, '_')

  const create = async () => {
    setBusy(true)
    try {
      await run('globals/save', { handle, title, fields: [{ handle: 'text', type: 'text', label: t('Text') }] })
      await loadManifest()
      invalidate('globals/')
      onOpenChange(false)
      navigate(`/globals/${handle}/fields`)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('New Global Set')} size="sm" footer={<><Button onClick={() => onOpenChange(false)}>{t('Cancel')}</Button><Button variant="primary" disabled={!handle} loading={busy} onClick={create}>{t('Create')}</Button></>}>
      <Fields fields={[{ handle: 'title', type: 'text', label: t('Name'), placeholder: t('Footer'), autofocus: true }]} values={{ title }} onChange={(_, v) => setTitle(v ?? '')} />
    </Dialog>
  )
}
