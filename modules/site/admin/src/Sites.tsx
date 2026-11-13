import { can, loadManifest, navigate, run, queryClient, setManifest, t, useAbility, useManifest } from '@letterncms/sdk'
import { Badge, Button, EmptyState, Field, Icon, IconButton, Input, Textarea, Menu, Notice, Page, Pressable, QueryError, Skeleton, confirm, download, slugify, switchSite, toast, Dialog } from '@letterncms/ui'
import { useMemo, useRef, useState } from 'react'

interface Site {
  handle: string
  name: string
  description: string
  version: string
  source: 'site' | 'saved'
  previews: string[]
  suits: boolean
  missingPlugins: string[]
  active: boolean
  /** Whether there is a saved copy from the last switch. */
  edited: boolean
}

/**
 * Installed and saved sites. Switching saves the current site and opens the selected one.
 */
export default function Sites() {
  const list = useAbility<{ sites: Site[]; problems: { folder: string; problem: string }[] }>('sites/list')
  const [busy, setBusy] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [editing, setEditing] = useState<Site | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const choose = async (site: Site) => {
    setBusy(site.handle)
    await switchSite(site, { home: false })
    setBusy(null)
  }

  const startOver = async (site: Site) => {
    const ok = await confirm({
      title: t('Start {name} over?', { name: site.name }),
      description: site.active ? t('The site goes back to {name} as it came. What you changed is gone.', { name: site.name }) : t('{name} goes back to how it came. What you changed in it is gone.', { name: site.name }),
      confirm: t('Start Over'),
      danger: true,
    })
    if (!ok) return
    setBusy(site.handle)
    await switchSite(site, { fresh: true, home: false })
    setBusy(null)
  }

  const remove = async (site: Site) => {
    const ok = await confirm({
      title: t('Delete {name}?', { name: site.name }),
      description: t('This deletes the site and its saved changes.'),
      confirm: t('Delete'),
      danger: true,
    })
    if (!ok) return
    setBusy(site.handle)
    try {
      await run('sites/delete', { handle: site.handle })
      await queryClient.invalidateQueries()
      toast.success(t('{name} deleted', { name: site.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  // A site's zip, as Export Site makes it: kept in sites/, where it can be switched to.
  const importSite = async (zip: File) => {
    setImporting(true)
    try {
      const bytes = new Uint8Array(await zip.arrayBuffer())
      let binary = ''
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      const made = await run<{ site: Site }>('sites/import', { content: btoa(binary), encoding: 'base64' })
      await queryClient.invalidateQueries()
      toast.success(t('{name} imported', { name: made.site.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setImporting(false)
      if (file.current) file.current.value = ''
    }
  }

  return (
    <Page title={t('Sites')} actions={(
      <>
        <input ref={file} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && void importSite(e.target.files[0])} />
        {can('packages.manage') && <Button icon="search" onClick={() => navigate('/sites/store')}>{t('Browse Store')}</Button>}
        <Button icon="upload" loading={importing} onClick={() => file.current?.click()}>{t('Import Site')}</Button>
        <Button icon="download" onClick={() => setExporting(true)}>{t('Export Site')}</Button>
      </>
    )}>
      {list.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />)}</div>
      ) : list.error ? (
        <QueryError title={t('Sites could not be loaded')} message={t('Try again in a moment.')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : list.data.sites.length === 0 ? (
        <EmptyState icon="box" title={t('No sites')} />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {list.data.sites.map((site) => (
            <SiteCard key={site.handle} site={site} busy={busy} onChoose={() => void choose(site)} onStartOver={() => void startOver(site)} onEdit={() => setEditing(site)} onDelete={() => void remove(site)} />
          ))}
        </ul>
      )}
      {list.data?.problems.map((p) => <Notice key={p.folder} tone="warning" title={p.folder} className="mt-4">{p.problem}</Notice>)}
      {exporting && <SiteDetails onClose={() => setExporting(false)} />}
      {editing && <SiteDetails site={editing} onClose={() => setEditing(null)} />}
    </Page>
  )
}

function SiteCard({ site, busy, onChoose, onStartOver, onEdit, onDelete }: { site: Site; busy: string | null; onChoose: () => void; onStartOver: () => void; onEdit: () => void; onDelete: () => void }) {
  const needs = site.missingPlugins.length > 0
  const switching = busy === site.handle
  const chooseable = !site.active && site.suits && !needs && busy === null
  const canReset = site.source !== 'saved' && (site.active || site.edited)
  const canDelete = !site.active

  return (
    <li className="cms-reveal-row relative">
      <Pressable
        inset
        onClick={onChoose}
        disabled={!chooseable}
        aria-current={site.active || undefined}
        className={`flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${site.active ? 'border-focus shadow-focus' : 'border-border enabled:hover:border-border-strong enabled:hover:shadow-sm'}`}
      >
        <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken">
          {site.previews[0]
            ? <img src={site.previews[0]} alt="" className={`size-full object-cover object-top transition-opacity ${switching ? 'opacity-50' : ''}`} />
            : <span className="grid size-full place-items-center text-faint"><Icon name="layout" size={28} /></span>}
        </span>
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{site.name}</span>
            {site.description && <span className="block truncate text-xs text-muted">{site.description}</span>}
          </span>
          {site.active && <Badge tone="neutral">{t('Current')}</Badge>}
          {!site.active && !needs && site.suits && <span className="cms-reveal shrink-0 text-xs font-medium text-muted">{switching ? t('Switching…') : t('Switch||site')}</span>}
        </span>
      </Pressable>
      {needs && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span className="min-w-0 flex-1 truncate">{t('Needs {plugins}', { plugins: site.missingPlugins.join(', ') })}</span>
          <Button size="sm" onClick={() => navigate('/plugins')}>{t('Open Store')}</Button>
        </div>
      )}
      <div className="cms-reveal absolute right-2 top-2">
        <Menu
          align="end"
          trigger={<IconButton icon="dots" label={t('More')} size="sm" disabled={busy !== null} />}
          items={[
            { label: t('Edit Details'), icon: 'edit', onSelect: onEdit },
            canReset && { label: t('Start Over'), icon: 'arrow-counter-clockwise', danger: true, onSelect: onStartOver },
            canDelete && { label: t('Delete'), icon: 'trash', danger: true, onSelect: onDelete },
          ]}
        />
      </div>
    </li>
  )
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(binary)
}

/**
 * The form for editing a saved site’s details or exporting the current site.
 */
function SiteDetails({ site, onClose }: { site?: Site; onClose: () => void }) {
  const currentSite = useManifest().site
  const [name, setName] = useState(site?.name ?? '')
  const [description, setDescription] = useState(site?.description ?? '')
  const [picture, setPicture] = useState<File | null>(null)
  const [removed, setRemoved] = useState(false)
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const handle = site?.handle ?? slugify(name)
  const current = !removed && !picture ? site?.previews[0] : undefined
  const type = picture ? ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' } as Record<string, string>)[picture.type] : undefined
  const shown = useMemo(() => (picture ? URL.createObjectURL(picture) : null), [picture])

  const save = async () => {
    setBusy(true)
    try {
      const preview = picture && type ? { preview: bytesToBase64(new Uint8Array(await picture.arrayBuffer())), previewType: type } : {}

      if (site) {
        await run('sites/update', { handle, name: name.trim(), description: description.trim(), ...preview, ...(removed ? { removePreview: true } : {}) })
        await queryClient.invalidateQueries()
        await queryClient.refetchQueries()
        setManifest(await loadManifest())
        toast.success(t('{name} saved', { name: name.trim() }))
        onClose()
        return
      }

      // The site as a zip, downloaded: nothing is added to this site.
      const made = await run<{ site: Site; files: number }>('sites/export', { handle, name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}), ...preview, zip: true })
      download(made)
      toast.success(t('{name} exported', { name: made.site.name }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={site ? t('Edit Details') : t('Export Site')} size="sm" onSubmit={save} submitLabel={site ? t('Save') : t('Export Site')} busy={busy} submitDisabled={!handle || (!!picture && !type)}>
      <div className="flex flex-col gap-4">
        <Field label={t('Name')} htmlFor="site-name">
          <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={80} />
        </Field>
        <Field label={t('Description')} htmlFor="site-description">
          <Textarea id="site-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={currentSite.description || undefined} maxLength={400} />
        </Field>
        <Field label={t('Thumbnail')}>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { setPicture(e.target.files?.[0] ?? null); setRemoved(false) }} />
          <div className="flex items-center gap-3">
            <Pressable compact aria-label={picture || current ? t('Replace') : t('Upload')} onClick={() => file.current?.click()} className="grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong">
              {shown || current ? <img src={shown ?? current} alt="" className="size-full object-cover object-top" /> : <Icon name="upload" size={18} />}
            </Pressable>
            <div className="flex min-w-0 flex-col items-start gap-1">
              <Button size="sm" onClick={() => file.current?.click()}>{picture || current ? t('Replace') : t('Upload')}</Button>
              {(picture || current) && <Button size="sm" variant="ghost" onClick={() => { setPicture(null); setRemoved(true); if (file.current) file.current.value = '' }}>{t('Remove')}</Button>}
              {picture && !type && <span className="text-xs text-danger">{t('Use a .png, .jpg or .webp.')}</span>}
            </div>
          </div>
        </Field>
      </div>
    </Dialog>
  )
}
