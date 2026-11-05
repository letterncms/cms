import { plural, queryClient, run, t, useAbility, type SurfaceComponentProps } from '@letterncms/sdk'
import { Button, Checkbox, Dialog, Icon, Spinner, confirm } from '@letterncms/ui'
import { useState } from 'react'
import { bytes, count, error, type Direction, type Progress } from './shared'

interface Group { id: string; label: string; description: string; selected: boolean; available: boolean; reason: string | null; tables: { table: string; from: number; to: number }[]; areas: string[]; files: { add: number; change: number; remove: number; bytes: number } | null; bytes: number; collections?: { handle: string; from: number; to: number }[] }
interface Preview { direction: Direction; from: { label: string; url: string; cms: string }; to: { label: string; url: string; cms: string }; problems: string[]; notes: string[]; groups: Group[]; rewrite: [string, string][] }

/**
 * A pull or a push, opened from a site's buttons on the Sync screen: what it would change on the
 * receiving site, the groups to choose, and anything in its way, before it starts.
 */
export default function SyncDialog({ props, close }: SurfaceComponentProps<{ remote: string; label?: string; direction: Direction }>) {
  const { direction } = props
  const remote = { name: props.remote, label: props.label ?? props.remote }
  const onClose = () => close?.()
  const preview = useAbility<Preview>('sync/preview', { remote: remote.name, direction })
  const [chosen, setChosen] = useState<Set<string> | null>(null)
  const [collections, setCollections] = useState<Set<string> | null>(null)
  const [starting, setStarting] = useState(false)
  const data = preview.data
  // Nothing on either side and no files to move: nothing to choose.
  const idle = (g: Group) => g.tables.every((x) => x.from === 0 && x.to === 0) && (!g.files || g.files.add + g.files.change + g.files.remove === 0)
  const groups = (data?.groups ?? []).filter((g) => !idle(g))
  const quiet = (data?.groups ?? []).filter(idle)
  const picked = chosen ?? new Set(groups.filter((g) => g.selected).map((g) => g.id))
  const content = groups.find((g) => g.id === 'content')
  const pull = direction === 'pull'
  const selected = groups.filter((g) => picked.has(g.id))
  const total = selected.reduce((sum, g) => sum + g.bytes, 0)

  const toggle = (id: string, on: boolean) => {
    const next = new Set(picked)
    on ? next.add(id) : next.delete(id)
    setChosen(next)
  }

  const start = async () => {
    const names = selected.map((g) => g.label).join(', ')
    if (!(await confirm({ title: pull ? t('Pull into this site?') : t('Push to {site}?', { site: remote.label }), description: pull ? t('This site gets {what} from {from}, in place of its own. A backup is made first, so you can undo it.', { what: names, from: remote.label }) : t('{site} gets {what} from this site, in place of its own. A backup is made there first, so you can undo it.', { what: names, site: remote.label }), confirm: pull ? t('Pull Now') : t('Push Now'), danger: !pull }))) return
    setStarting(true)
    try {
      const all = collections === null || (content?.collections ?? []).every((c) => collections.has(c.handle))
      await run<Progress>('sync/start', { remote: remote.name, direction, groups: [...picked], collections: all ? null : [...collections!] })
      // Its progress takes over at the top of the screen, and nothing else starts meanwhile.
      void queryClient.invalidateQueries()
      onClose()
    } catch (e) {
      error(e)
      setStarting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()} size="lg"
      title={pull ? t('Pull from {site}', { site: remote.label }) : t('Push to {site}', { site: remote.label })}
      description={data ? <span className="flex flex-wrap items-center gap-1.5"><span>{data.from.label}</span><Icon name="arrow-right" size={12} /><span>{data.to.label}</span><span className="text-faint">· {data.from.url.replace(/^https?:\/\//, '')} → {data.to.url.replace(/^https?:\/\//, '')}</span></span> : t('Comparing the two sites…')}
      footer={<><Button onClick={onClose}>{t('Cancel')}</Button><Button variant={pull ? 'primary' : 'publish'} icon={pull ? 'arrow-down' : 'arrow-up'} loading={starting} disabled={!data || data.problems.length > 0 || selected.length === 0} onClick={() => void start()}>{pull ? t('Pull') : t('Push')}{selected.length > 0 && total > 0 ? ` · ${bytes(total)}` : ''}</Button></>}>
      {preview.isLoading && <div className="grid h-40 place-items-center"><div className="flex items-center gap-2 text-sm text-muted"><Spinner />{t('Comparing the two sites…')}</div></div>}
      {preview.isError && <p role="alert" className="m-0 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">{(preview.error as Error).message}</p>}
      {data && (
        <div className="grid gap-4">
          {data.problems.map((p) => <p key={p} role="alert" className="m-0 flex gap-2 rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger"><Icon name="warning" size={16} className="mt-0.5 shrink-0" />{p}</p>)}
          {data.problems.length === 0 && groups.length === 0 && <p className="m-0 text-sm text-muted">{t('The two sites already have the same content and files. There’s nothing to {direction}.', { direction: pull ? t('pull') : t('push') })}</p>}
          {groups.length > 0 && (
            <ul className="m-0 grid list-none gap-1 p-0">
              {groups.map((g) => (
                <li key={g.id} className={`rounded-md border px-3 py-2.5 ${picked.has(g.id) ? 'border-border-strong bg-surface' : 'border-border'}`}>
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5"><Checkbox checked={picked.has(g.id)} disabled={!g.available} onChange={(on) => toggle(g.id, on)} label={<span className="sr-only">{g.label}</span>} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-sm font-medium text-ink">{g.label}</span>
                        <span className="text-xs text-muted">{summary(g)}</span>
                      </div>
                      {g.available ? <p className="m-0 mt-0.5 text-xs text-muted">{g.description}</p> : <p className="m-0 mt-0.5 text-xs text-danger">{g.reason}</p>}
                      {g.id === 'content' && picked.has('content') && (g.collections?.length ?? 0) > 1 && <Collections items={g.collections!} value={collections} onChange={setCollections} />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {quiet.length > 0 && groups.length > 0 && <p className="m-0 text-xs text-muted">{t('Empty on both sites: {groups}.', { groups: quiet.map((g) => g.label).join(', ') })}</p>}
          {(data.notes.length > 0 || data.rewrite.length > 0) && (
            <div className="grid gap-1 text-xs text-muted">
              {data.rewrite.map(([a, b]) => <p key={a} className="m-0 flex items-center gap-1.5"><Icon name="link" size={12} className="shrink-0" /><span className="truncate"><code>{a}</code> → <code>{b}</code></span></p>)}
              {data.notes.map((n) => <p key={n} className="m-0 flex gap-1.5"><Icon name="info" size={12} className="mt-0.5 shrink-0" />{n}</p>)}
            </div>
          )}
          {data.problems.length === 0 && <p className="m-0 text-xs text-muted">{pull ? t('Kept here whatever you pull: your .env, secrets and keys, the plugins that are on, Sync’s connections, and everyone who is signed in.') : t('Kept on {site} whatever you push: its .env, secrets and keys, the plugins that are on, its Sync connections, and everyone who is signed in there.', { site: remote.label })}</p>}
        </div>
      )}
    </Dialog>
  )
}

function Collections({ items, value, onChange }: { items: { handle: string; from: number; to: number }[]; value: Set<string> | null; onChange: (v: Set<string>) => void }) {
  const current = value ?? new Set(items.map((c) => c.handle))
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-muted hover:text-text">{current.size === items.length ? t('All collections') : t('{n} of {total} collections', { n: current.size, total: items.length })}</summary>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {items.map((c) => (
          <Checkbox key={c.handle} checked={current.has(c.handle)} onChange={(on) => { const next = new Set(current); on ? next.add(c.handle) : next.delete(c.handle); onChange(next) }}
            label={<span>{c.handle} <span className="text-muted">{count(c.to)} → {count(c.from)}</span></span>} />
        ))}
      </div>
    </details>
  )
}

function summary(g: Group): string {
  const parts: string[] = []
  if (g.tables.length) {
    const from = g.tables.reduce((s, x) => s + x.from, 0)
    const to = g.tables.reduce((s, x) => s + x.to, 0)
    if (from > 0 || to > 0) parts.push(plural(from, '{count} row replaces {to}', '{count} rows replace {to}', { to: count(to) }))
  }
  if (g.files) {
    const f = g.files
    const changes = [f.add && t('{n} new', { n: count(f.add) }), f.change && t('{n} changed', { n: count(f.change) }), f.remove && t('{n} removed', { n: count(f.remove) })].filter(Boolean)
    parts.push(changes.length ? changes.join(', ') + (f.bytes > 0 ? ` · ${bytes(f.bytes)}` : '') : t('Files the same'))
  }
  return parts.join(' · ')
}
