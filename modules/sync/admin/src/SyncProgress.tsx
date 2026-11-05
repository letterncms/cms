import { plural, queryClient, run, t, useAbility } from '@letterncms/sdk'
import { Button, Icon, confirm, toast } from '@letterncms/ui'
import { useEffect, useRef, useState } from 'react'
import { duration, error, RUNNING, type Overview, type Progress } from './shared'

/**
 * The sync going on, at the top of the Sync screen. It runs from this page, a few seconds per
 * request, so no host's time limit is ever near. Leave the page and it waits; come back and it
 * carries on. Once done it says so, with its undo, until closed.
 */
export default function SyncProgress() {
  const overview = useAbility<Overview>('sync/overview')
  const [job, setJob] = useState<Progress | null>(null)
  const [closed, setClosed] = useState<string | null>(null)
  const data = overview.data
  // A sync started from its preview shows up here as the overview's current one.
  const current = data?.current && data.current.id !== closed && data.current.id !== job?.id ? data.current : null
  useEffect(() => { if (current) setJob(current) }, [current?.id])
  // A finished sync someone has since undone, here or from the site's menu, has nothing left to offer.
  const undone = new Set([...(data?.history ?? []).filter((s) => s.undone_at).map((s) => s.id), ...(data?.remotes ?? []).filter((r) => r.last?.undone_at).map((r) => r.last!.id)])
  const shown = job && job.id !== closed && !(job.status === 'done' && undone.has(job.id)) ? job : null

  if (!shown) return null

  return <Running job={shown} onChange={setJob} onClose={() => { setClosed(shown.id); setJob(null); void queryClient.invalidateQueries() }} />
}

function Running({ job, onChange, onClose }: { job: Progress; onChange: (p: Progress) => void; onClose: () => void }) {
  const live = useRef(true)
  const [undoing, setUndoing] = useState(false)
  const active = RUNNING.includes(job.status)
  const id = job.id

  useEffect(() => {
    live.current = true
    if (!active) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = async (wait: number) => {
      await new Promise((r) => { timer = setTimeout(r, wait) })
      if (!live.current) return
      try {
        const next = await run<Progress>('sync/step', { id })
        if (!live.current) return
        onChange(next)
        if (RUNNING.includes(next.status)) void tick(next.status === 'waiting' ? 3000 : 0)
        // What it changed shows everywhere: the sites' last sync, the history, the content itself.
        else void queryClient.invalidateQueries()
      } catch {
        // A request the host cut off: the sync stays where it was, and this tries again.
        if (live.current) void tick(3000)
      }
    }
    void tick(job.status === 'waiting' ? 3000 : 0)
    return () => { live.current = false; clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, active])

  const cancel = async () => {
    if (!(await confirm({ title: t('Cancel this sync?'), description: t('Nothing has been switched over yet, so neither site changes.'), confirm: t('Cancel Sync'), danger: true }))) return
    live.current = false
    try {
      onChange(await run<Progress>('sync/cancel', { id }))
      void queryClient.invalidateQueries()
    } catch (e) {
      error(e)
    }
  }

  const resume = async () => {
    try {
      onChange(await run<Progress>('sync/resume', { id }))
    } catch (e) {
      error(e)
    }
  }

  const undo = async () => {
    if (!(await confirm({ title: t('Undo this sync?'), description: t('{site} gets back what it had just before, from the backup made then.', { site: job.to }), confirm: t('Undo Sync'), danger: true }))) return
    setUndoing(true)
    try {
      while (!(await run<{ done: boolean }>('sync/undo', { id, ...(job.direction === 'push' ? { remote: job.remote } : {}) })).done);
      toast.success(t('Undone. {site} is as it was before.', { site: job.to }))
      onClose()
    } catch (e) {
      error(e)
    } finally {
      setUndoing(false)
    }
  }

  const title = job.direction === 'pull' ? t('Pulling from {site}', { site: job.remote_label }) : t('Pushing to {site}', { site: job.remote_label })
  const took = job.finished_at ? Math.max(1, Math.round((new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()) / 1000)) : 0

  return (
    <section aria-live="polite" className="mb-8 rounded-lg border border-border-strong bg-surface p-4">
      {active || job.status === 'paused' ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="m-0 text-sm font-semibold text-ink">{title}</h2>
            <span className="text-sm tabular-nums text-muted">{job.percent}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-hover" role="progressbar" aria-valuenow={job.percent} aria-valuemin={0} aria-valuemax={100} aria-label={title}>
            <div className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out" style={{ width: `${Math.max(2, job.percent)}%` }} />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>{job.status === 'waiting' ? <span className="text-warning">{job.message} {t('Trying again…')}</span> : job.status === 'paused' ? <span className="text-warning">{job.message}</span> : `${job.label}…`}</span>
            <span className="tabular-nums">{plural(job.rows, '{count} row', '{count} rows')}, {plural(job.files, '{count} file', '{count} files')}{job.eta ? ` · ${t('about {time} left', { time: duration(job.eta) })}` : ''}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {job.status === 'paused' && <Button size="xs" variant="primary" onClick={() => void resume()}>{t('Carry On')}</Button>}
            <Button size="xs" variant="ghost" onClick={() => void cancel()}>{t('Cancel')}</Button>
          </div>
        </>
      ) : job.status === 'done' ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-success/10 text-success"><Icon name="check" size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium text-ink">{job.direction === 'pull' ? t('Pulled from {site}', { site: job.remote_label }) : t('Pushed to {site}', { site: job.remote_label })}</p>
            <p className="m-0 text-xs text-muted">{t('{rows} and {files} in {time}.', { rows: plural(job.rows, '{count} row', '{count} rows'), files: plural(job.files, '{count} file', '{count} files'), time: duration(took) })} {job.groups.join(', ')}.</p>
          </div>
          <Button size="sm" icon="undo" loading={undoing} onClick={() => void undo()}>{t('Undo')}</Button>
          <Button size="sm" variant="ghost" icon="close" aria-label={t('Close')} onClick={onClose} />
        </div>
      ) : (
        <div className="flex flex-wrap items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-danger/10 text-danger"><Icon name={job.status === 'cancelled' ? 'close' : 'warning'} size={16} /></span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium text-ink">{job.status === 'cancelled' ? t('Canceled. Neither site changed.') : t('The sync stopped. Neither site changed.')}</p>
            {job.error && <p className="m-0 mt-0.5 text-xs text-muted">{job.error}</p>}
          </div>
          <Button size="sm" variant="ghost" icon="close" aria-label={t('Close')} onClick={onClose} />
        </div>
      )}
    </section>
  )
}
