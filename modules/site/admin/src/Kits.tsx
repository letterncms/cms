import { invalidate, loadManifest, navigate, plural, queryClient, run, setManifest, t, useAbility } from '@letterncms/sdk'
import { Button, Checkbox, Dialog, EmptyState, Field, Input, List, Notice, Page, QueryError, Row, Segmented, Skeleton, slugify, toast } from '@letterncms/ui'
import { useMemo, useState } from 'react'

interface Kit {
  handle: string
  name: string
  version: string
  source: 'builtin' | 'site'
  previews: string[]
  suits: boolean
  missingPlugins: string[]
  code: boolean
}

interface Step {
  action: 'create' | 'replace' | 'rename' | 'merge' | 'skip' | 'clash'
  type: string
  name: string
  as?: string
  note?: string
}

type Mode = 'design' | 'full'
type Clash = 'refuse' | 'skip' | 'replace' | 'rename'

/**
 * The site kits this site can take in, next to the design they mostly are: one row per kit, and applying one
 * shows what it would do here, from the same plan kits/apply runs, before anything is written.
 */
export default function Kits() {
  const list = useAbility<{ kits: Kit[]; problems: { folder: string; problem: string }[] }>('kits/list')
  const [applying, setApplying] = useState<Kit | null>(null)
  const [exporting, setExporting] = useState(false)

  return (
    <Page title={t('Site Kits')} width="narrow" actions={<Button icon="download" onClick={() => setExporting(true)}>{t('Export Site')}</Button>}>
      {list.isPending ? (
        <List>{[0, 1].map((i) => <Row key={i}><Skeleton className="h-10 w-16 rounded-sm" /><Skeleton className="h-4 w-32" /></Row>)}</List>
      ) : list.error ? (
        <QueryError title={t('Site kits could not be loaded')} message={t('Try again in a moment.')} onRetry={() => list.refetch()} retrying={list.isFetching} />
      ) : list.data.kits.length === 0 ? (
        <EmptyState icon="box" title={t('No site kits')} />
      ) : (
        <List>
          {list.data.kits.map((kit) => (
            <Row key={kit.handle} onClick={() => setApplying(kit)} className="py-2">
              <Preview kit={kit} className="h-10 w-16" />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{kit.name}</span>
              <span className="shrink-0 tabular-nums text-muted">{kit.version}</span>
            </Row>
          ))}
        </List>
      )}
      {list.data?.problems.map((p) => <Notice key={p.folder} tone="warning" title={p.folder} className="mt-4">{p.problem}</Notice>)}
      {applying && <ApplyKit kit={applying} onClose={() => setApplying(null)} />}
      {exporting && <ExportSite onClose={() => setExporting(false)} />}
    </Page>
  )
}

function Preview({ kit, className }: { kit: Kit; className?: string }) {
  return kit.previews[0]
    ? <img src={kit.previews[0]} alt="" className={`shrink-0 rounded-sm border border-border bg-sunken object-cover object-top ${className ?? ''}`} />
    : <span aria-hidden className={`shrink-0 rounded-sm border border-border bg-sunken ${className ?? ''}`} />
}

/** What applying would do, counted, the clashes by name, and the choice of what happens to them. */
function ApplyKit({ kit, onClose }: { kit: Kit; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('full')
  const [clash, setClash] = useState<Clash>('refuse')
  const [busy, setBusy] = useState(false)
  const [withoutPlugins, setWithoutPlugins] = useState(false)
  const plan = useAbility<{ plan: { steps: Step[] } }>('kits/get', { handle: kit.handle, mode, clash })
  // What is already here, by name, whatever is chosen for it: the plan that settles nothing.
  const unsettled = useAbility<{ plan: { steps: Step[] } }>('kits/get', { handle: kit.handle, mode, clash: 'refuse' })
  const steps = plan.data?.plan.steps ?? []
  const clashes = useMemo(() => (unsettled.data?.plan.steps ?? []).filter((s) => s.action === 'clash'), [unsettled.data])
  const counts = useMemo(() => {
    const out: Partial<Record<Step['action'], number>> = {}
    for (const s of steps) out[s.action] = (out[s.action] ?? 0) + 1
    return out
  }, [steps])
  const named = clash !== 'refuse' || clashes.length === 0
  const missing = kit.missingPlugins.length > 0
  const lines: [Step['action'], string][] = [
    ['create', plural(counts.create ?? 0, '{count} new item', '{count} new items')],
    ['replace', plural(counts.replace ?? 0, '{count} replaced', '{count} replaced')],
    ['rename', plural(counts.rename ?? 0, '{count} added under a new name', '{count} added under new names')],
    ['merge', plural(counts.merge ?? 0, '{count} list joined', '{count} lists joined')],
    ['skip', plural(counts.skip ?? 0, '{count} left as it is', '{count} left as they are')],
  ]

  const apply = async () => {
    setBusy(true)
    try {
      await run('kits/apply', { handle: kit.handle, mode, clash, withoutPlugins })
      await queryClient.invalidateQueries()
      setManifest(await loadManifest())
      toast.success(t('{name} applied', { name: kit.name }))
      onClose()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={kit.name} size="md" onSubmit={apply} submitLabel={t('Apply Kit')} busy={busy}
      submitDisabled={!kit.suits || plan.isPending || !!plan.error || !named || (missing && !withoutPlugins) || steps.every((s) => s.action === 'skip')}>
      <div className="flex flex-col gap-5">
        <Field label={t('Bring In')}>
          <Segmented<Mode> block value={mode} onChange={setMode} aria-label={t('Bring In')} options={[{ value: 'full', label: t('Design and Content') }, { value: 'design', label: t('Design Only') }]} />
        </Field>
        {!kit.suits && <Notice tone="danger" title={t('Made for another version')} />}
        {missing && (
          <>
            {/* Add them from the store first, or take the kit without them, knowing what of it needs them may not show. */}
            <Notice tone="warning" title={t('Needs {plugins}', { plugins: kit.missingPlugins.join(', ') })}
              action={<Button size="sm" onClick={() => navigate('/plugins?tab=store')}>{t('Open Store')}</Button>} />
            <Checkbox checked={withoutPlugins} onChange={setWithoutPlugins} label={t('Apply Without Them')} />
          </>
        )}
        {plan.error ? (
          <QueryError compact title={t('This kit can’t be applied')} message={plan.error.message} onRetry={() => plan.refetch()} retrying={plan.isFetching} />
        ) : plan.isPending ? (
          <List>{[0, 1, 2].map((i) => <Row key={i}><Skeleton className="h-4 w-40" /></Row>)}</List>
        ) : (
          <List>
            {lines.filter(([action]) => counts[action]).map(([action, label]) => <Row key={action}><span className="text-text">{label}</span></Row>)}
          </List>
        )}
        {(clashes.length > 0 || clash !== 'refuse') && (
          <Field label={t('Already on This Site')}>
            {/* Nothing is chosen until someone chooses: a clash is never settled for them. */}
            <Segmented<Clash> block value={clash} onChange={setClash} aria-label={t('Already on This Site')}
              options={[{ value: 'skip', label: t('Keep the Site’s') }, { value: 'replace', label: t('Replace') }, { value: 'rename', label: t('Keep Both') }]} />
          </Field>
        )}
        {clashes.length > 0 && (
          <List>
            {clashes.map((s) => <Row key={s.type + s.name}><span className="min-w-0 truncate font-mono text-xs text-muted">{s.name}</span></Row>)}
          </List>
        )}
      </div>
    </Dialog>
  )
}

function ExportSite({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const handle = slugify(name)

  const save = async () => {
    setBusy(true)
    try {
      const made = await run<{ kit: Kit; files: number }>('kits/export', { handle, name: name.trim() })
      invalidate('kits/')
      toast.success(t('{name} exported', { name: made.kit.name }), { description: `kits/${made.kit.handle}` })
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
