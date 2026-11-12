import { navigate, run, queryClient, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, EmptyState, Field, Icon, IconButton, Input, Menu, Notice, Page, QueryError, Skeleton, confirm, download, slugify, switchKit, toast, Dialog } from '@letterncms/ui'
import { useState } from 'react'

interface Kit {
  handle: string
  name: string
  description: string
  version: string
  source: 'builtin' | 'site' | 'saved'
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

  const designOnly = async (kit: Kit) => {
    const ok = await confirm({
      title: t('Use the design of {name}?', { name: kit.name }),
      description: t('Templates, components, fonts and styles are replaced with {name}’s. Your pages, posts and menus stay.', { name: kit.name }),
      confirm: t('Use Design'),
    })
    if (!ok) return
    setBusy(kit.handle)
    try {
      await run('kits/apply', { handle: kit.handle, mode: 'design', clash: 'replace' })
      await queryClient.invalidateQueries()
      toast.success(t('{name}’s design is on this site', { name: kit.name }))
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  return (
    <Page title={t('Site Kits')} actions={<Button icon="download" onClick={() => setExporting(true)}>{t('Export Site')}</Button>}>
      {list.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />)}</div>
      ) : list.error ? (
        <QueryError title={t('Site kits could not be loaded')} message={t('Try again in a moment.')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : list.data.kits.length === 0 ? (
        <EmptyState icon="box" title={t('No site kits')} />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {list.data.kits.map((kit) => (
            <KitCard key={kit.handle} kit={kit} busy={busy} onChoose={() => void choose(kit)} onStartOver={() => void startOver(kit)} onDesign={() => void designOnly(kit)} />
          ))}
        </ul>
      )}
      {list.data?.problems.map((p) => <Notice key={p.folder} tone="warning" title={p.folder} className="mt-4">{p.problem}</Notice>)}
      {exporting && <ExportSite onClose={() => setExporting(false)} />}
    </Page>
  )
}

function KitCard({ kit, busy, onChoose, onStartOver, onDesign }: { kit: Kit; busy: string | null; onChoose: () => void; onStartOver: () => void; onDesign: () => void }) {
  const needs = kit.missingPlugins.length > 0
  const switching = busy === kit.handle
  const chooseable = !kit.active && kit.suits && !needs && busy === null
  const canReset = kit.source !== 'saved' && (kit.active || kit.edited)

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onChoose}
        disabled={!chooseable}
        aria-current={kit.active || undefined}
        className={`flex w-full flex-col overflow-hidden rounded-lg border bg-bg p-0 text-left outline-offset-2 transition-[border-color,box-shadow] duration-base enabled:cursor-pointer ${kit.active ? 'border-ink' : 'border-border enabled:hover:border-border-strong enabled:hover:shadow-sm'}`}
      >
        <span className="relative block aspect-[16/10] w-full overflow-hidden border-b border-border bg-sunken">
          {kit.previews[0]
            ? <img src={kit.previews[0]} alt="" className={`size-full object-cover object-top transition-opacity ${switching ? 'opacity-50' : ''}`} />
            : <span className="grid size-full place-items-center text-faint"><Icon name="layout" size={28} /></span>}
          {kit.active && <Badge tone="signal" className="absolute left-2 top-2">{t('Current')}</Badge>}
        </span>
        <span className="flex items-center gap-2 px-3 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{kit.name}</span>
            <span className="block truncate text-xs text-muted">{caption(kit)}</span>
          </span>
          {!kit.active && !needs && kit.suits && <span className="shrink-0 text-xs font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">{switching ? t('Switching…') : t('Switch||kit')}</span>}
        </span>
      </button>
      {needs && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span className="min-w-0 flex-1 truncate">{t('Needs {plugins}', { plugins: kit.missingPlugins.join(', ') })}</span>
          <Button size="sm" onClick={() => navigate('/plugins?tab=store')}>{t('Open Store')}</Button>
        </div>
      )}
      {(canReset || (!kit.active && kit.source !== 'saved' && kit.suits)) && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 data-[open]:opacity-100">
          <Menu
            align="end"
            trigger={<IconButton icon="dots" label={t('More')} size="sm" disabled={busy !== null} />}
            items={[
              !kit.active && kit.source !== 'saved' && kit.suits && !needs && { label: t('Use Only the Design'), icon: 'palette', onSelect: onDesign },
              canReset && { label: t('Start Over'), icon: 'arrow-counter-clockwise', danger: true, onSelect: onStartOver },
            ]}
          />
        </div>
      )}
    </li>
  )
}

/** One line under a kit's name: what the site is to it, else what it is. */
function caption(kit: Kit): string {
  if (!kit.suits) return t('Made for another version')
  if (kit.active) return kit.edited ? t('Saved as you leave it') : t('How it came')
  if (kit.edited) return t('Saved as you left it')
  return kit.description || kit.version
}

function ExportSite({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const handle = slugify(name)

  const save = async () => {
    setBusy(true)
    try {
      // The kit as a zip, downloaded: nothing is added to this site.
      const made = await run<{ kit: Kit; files: number }>('kits/export', { handle, name: name.trim(), zip: true })
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
    <Dialog open onOpenChange={(open) => !open && onClose()} title={t('Export Site')} size="sm" onSubmit={save} submitLabel={t('Export Site')} busy={busy} submitDisabled={!handle}>
      <Field label={t('Name')} htmlFor="kit-name">
        <Input id="kit-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={80} />
      </Field>
    </Dialog>
  )
}
