import { loadManifest, navigate, run, queryClient, setManifest, t, useAbility, useManifest } from '@letterncms/sdk'
import { Badge, Button, EmptyState, Field, Icon, IconButton, Input, Textarea, Menu, Notice, Page, QueryError, Skeleton, confirm, download, slugify, switchKit, toast, Dialog } from '@letterncms/ui'
import { useMemo, useRef, useState } from 'react'

interface Kit {
  handle: string
  name: string
  description: string
  version: string
  source: 'site' | 'saved'
  previews: string[]
  suits: boolean
  missingPlugins: string[]
  active: boolean
  /** The site was this kit, was changed, and was left: that is kept, and comes back. */
  edited: boolean
}

/**
 * The kits this site can be, as cards: choosing one makes the site that kit at once. What the site was is kept with
 * the kit it was, so there is nothing to confirm and nothing to lose: choose the other to be it again, edits and all.
 */
export default function Kits() {
  const list = useAbility<{ kits: Kit[]; problems: { folder: string; problem: string }[] }>('kits/list')
  const [busy, setBusy] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [editing, setEditing] = useState<Kit | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const choose = async (kit: Kit) => {
    setBusy(kit.handle)
    await switchKit(kit, { home: false })
    setBusy(null)
  }

  const startOver = async (kit: Kit) => {
    const ok = await confirm({
      title: t('Start {name} over?', { name: kit.name }),
      description: kit.active ? t('The site goes back to {name} as it came. What you changed is gone.', { name: kit.name }) : t('{name} goes back to how it came. What you changed in it is gone.', { name: kit.name }),
      confirm: t('Start Over'),
      danger: true,
    })
    if (!ok) return
    setBusy(kit.handle)
    await switchKit(kit, { fresh: true, home: false })
    setBusy(null)
  }

  const remove = async (kit: Kit) => {
    const ok = await confirm({
      title: t('Delete {name}?', { name: kit.name }),
      description: t('The kit goes, with what you changed in it. Your site stays as it is.'),
      confirm: t('Delete'),
      danger: true,
    })
    if (!ok) return
    setBusy(kit.handle)
    try {
      await run('kits/delete', { handle: kit.handle })
      await queryClient.invalidateQueries()
      toast.success(t('{name} deleted', { name: kit.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  // A kit's zip, as Export Site makes it: kept in kits/, where it can be switched to.
  const importKit = async (zip: File) => {
    setImporting(true)
    try {
      const bytes = new Uint8Array(await zip.arrayBuffer())
      let binary = ''
      for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      const made = await run<{ kit: Kit }>('kits/import', { content: btoa(binary), encoding: 'base64' })
      await queryClient.invalidateQueries()
      toast.success(t('{name} imported', { name: made.kit.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setImporting(false)
      if (file.current) file.current.value = ''
    }
  }

  return (
    <Page title={t('Site Kits')} actions={(
      <>
        <input ref={file} type="file" accept=".zip,application/zip" className="hidden" onChange={(e) => e.target.files?.[0] && void importKit(e.target.files[0])} />
        <Button icon="upload" loading={importing} onClick={() => file.current?.click()}>{t('Import Site')}</Button>
        <Button icon="download" onClick={() => setExporting(true)}>{t('Export Site')}</Button>
      </>
    )}>
      {list.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />)}</div>
      ) : list.error ? (
        <QueryError title={t('Site kits could not be loaded')} message={t('Try again in a moment.')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : list.data.kits.length === 0 ? (
        <EmptyState icon="box" title={t('No site kits')} />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {list.data.kits.map((kit) => (
            <KitCard key={kit.handle} kit={kit} busy={busy} onChoose={() => void choose(kit)} onStartOver={() => void startOver(kit)} onEdit={() => setEditing(kit)} onDelete={() => void remove(kit)} />
          ))}
        </ul>
      )}
      {list.data?.problems.map((p) => <Notice key={p.folder} tone="warning" title={p.folder} className="mt-4">{p.problem}</Notice>)}
      {exporting && <KitDetails onClose={() => setExporting(false)} />}
      {editing && <KitDetails kit={editing} onClose={() => setEditing(null)} />}
    </Page>
  )
}

function KitCard({ kit, busy, onChoose, onStartOver, onEdit, onDelete }: { kit: Kit; busy: string | null; onChoose: () => void; onStartOver: () => void; onEdit: () => void; onDelete: () => void }) {
  const needs = kit.missingPlugins.length > 0
  const switching = busy === kit.handle
  const chooseable = !kit.active && kit.suits && !needs && busy === null
  const canReset = kit.source !== 'saved' && (kit.active || kit.edited)
  const canDelete = !kit.active

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onChoose}
        disabled={!chooseable}
        aria-current={kit.active || undefined}
        className={`flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left outline-none transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${kit.active ? 'border-[var(--cms-focus)] shadow-[var(--cms-shadow-focus)]' : 'border-border enabled:hover:border-border-strong enabled:hover:shadow-sm focus-visible:border-[var(--cms-focus)] focus-visible:shadow-[var(--cms-shadow-focus)]'}`}
      >
        <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken">
          {kit.previews[0]
            ? <img src={kit.previews[0]} alt="" className={`size-full object-cover object-top transition-opacity ${switching ? 'opacity-50' : ''}`} />
            : <span className="grid size-full place-items-center text-faint"><Icon name="layout" size={28} /></span>}
        </span>
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{kit.name}</span>
            {kit.description && <span className="block truncate text-xs text-muted">{kit.description}</span>}
          </span>
          {kit.active && <Badge tone="neutral">{t('Current')}</Badge>}
          {!kit.active && !needs && kit.suits && <span className="shrink-0 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{switching ? t('Switching…') : t('Switch||kit')}</span>}
        </span>
      </button>
      {needs && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span className="min-w-0 flex-1 truncate">{t('Needs {plugins}', { plugins: kit.missingPlugins.join(', ') })}</span>
          <Button size="sm" onClick={() => navigate('/plugins')}>{t('Open Store')}</Button>
        </div>
      )}
      <div className="absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100">
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
 * What a kit says of itself: a name, a description and a thumbnail. One form for both ways in: **Export Site** (no `kit`: it makes
 * a kit of this site, and the description it leaves empty is the site's) and **Edit Details** of a kit that is there.
 */
function KitDetails({ kit, onClose }: { kit?: Kit; onClose: () => void }) {
  const site = useManifest().site
  const [name, setName] = useState(kit?.name ?? '')
  const [description, setDescription] = useState(kit?.description ?? '')
  const [picture, setPicture] = useState<File | null>(null)
  const [removed, setRemoved] = useState(false)
  const [busy, setBusy] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const handle = kit?.handle ?? slugify(name)
  const current = !removed && !picture ? kit?.previews[0] : undefined
  const type = picture ? ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' } as Record<string, string>)[picture.type] : undefined
  const shown = useMemo(() => (picture ? URL.createObjectURL(picture) : null), [picture])

  const save = async () => {
    setBusy(true)
    try {
      const preview = picture && type ? { preview: bytesToBase64(new Uint8Array(await picture.arrayBuffer())), previewType: type } : {}

      if (kit) {
        await run('kits/update', { handle, name: name.trim(), description: description.trim(), ...preview, ...(removed ? { removePreview: true } : {}) })
        await queryClient.invalidateQueries()
        await queryClient.refetchQueries()
        setManifest(await loadManifest())
        toast.success(t('{name} saved', { name: name.trim() }))
        onClose()
        return
      }

      // The kit as a zip, downloaded: nothing is added to this site.
      const made = await run<{ kit: Kit; files: number }>('kits/export', { handle, name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}), ...preview, zip: true })
      download(made)
      toast.success(t('{name} exported', { name: made.kit.name }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={kit ? t('Edit Details') : t('Export Site')} size="sm" onSubmit={save} submitLabel={kit ? t('Save') : t('Export Site')} busy={busy} submitDisabled={!handle || (!!picture && !type)}>
      <div className="flex flex-col gap-4">
        <Field label={t('Name')} htmlFor="kit-name">
          <Input id="kit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={80} />
        </Field>
        <Field label={t('Description')} htmlFor="kit-description">
          <Textarea id="kit-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={site.description || undefined} maxLength={400} />
        </Field>
        <Field label={t('Thumbnail')}>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { setPicture(e.target.files?.[0] ?? null); setRemoved(false) }} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => file.current?.click()} className="grid h-14 w-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-sm border border-border bg-sunken p-0 text-faint hover:border-border-strong">
              {shown || current ? <img src={shown ?? current} alt="" className="size-full object-cover object-top" /> : <Icon name="upload" size={18} />}
            </button>
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
