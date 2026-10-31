import { invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, confirm, EmptyState, Icon, List, Row, Section, Skeleton, Switch, toast } from '@letterncms/ui'
import { useState, type ReactNode } from 'react'
import { driveJob, driveTick, type Job } from './installing'

interface Release { version: string; released_at: string | null; security: boolean; notes_url: string | null; major: boolean; host_problems: string[]; incompatible: string[] }
interface Offer {
  current: string
  managed: string | null
  freshness: string
  trust: string | null
  check: { checked_at?: number; error?: string }
  update: Release | null
  major: Release | null
  yanked: string | null
  support_ended: { until: string; latest?: string } | null
  auto: boolean
  postponed_until: number | null
}
interface Updates {
  core: Offer
  status: { state: string; target?: string; previous?: string; error?: string; drive?: boolean }
  packages: { package: string; label: string; installed: string; version: string; security: boolean; store: string; allowed: boolean; message: string | null; buy_url: string | null; backup: boolean }[]
  advisories: { package: string; label: string; version: string; severity: string; advisory: string | null }[]
  unverified: string[]
}

const RUNNING = ['downloading', 'verifying', 'extracting', 'checking_files', 'ready']

const STATE_TEXT = (state: string) =>
  ({
    downloading: t('Downloading…'),
    verifying: t('Checking the signature…'),
    extracting: t('Unpacking…'),
    checking_files: t('Checking every file…'),
    ready: t('Switching…'),
    migrating: t('Updating the database…'),
    checking: t('Checking the new version…'),
  })[state] ?? state

const MANAGED_TEXT = (reason: string) =>
  ({
    checkout: t('This site runs from a checkout. Update it through your deploy.'),
    git: t('This site runs from a checkout. Update it through your deploy.'),
    deployed: t('This site is deployed. Update it through your deploy.'),
    lockdown: t('This site is locked. Update it through your deploy.'),
    file_mods: t('This site does not change its own files. Update it through your deploy.'),
  })[reason] ?? reason

/** One click, always: the steps below run beside the live site, and whatever goes wrong puts it back. */
export function UpdatesPanel() {
  const updates = useAbility<Updates>('packages/updates')
  const [progress, setProgress] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const data = updates.data

  const reload = async () => {
    invalidate('packages/')
    await updates.refetch()
  }

  const check = async () => {
    setBusy('check')
    try {
      const answer = await run<{ error?: string }>('packages/update-check')
      if (answer.error) toast.error(answer.error)
      await reload()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const updateCore = async (release: Release) => {
    if (release.major) {
      const yes = await confirm({
        title: t('Update to {version}?', { version: release.version }),
        description: [t('This is a new major version. Back up first, and read the release notes.'), release.incompatible.length ? t('These plugins go inactive: {list}.', { list: release.incompatible.join(', ') }) : ''].filter(Boolean).join(' '),
        confirm: t('Update'),
      })
      if (!yes) return
    }
    setBusy('core')
    try {
      let status = await run<{ state: string; drive?: boolean; error?: string }>('packages/update-start', { version: release.version })
      setProgress(STATE_TEXT(status.state))
      while (RUNNING.includes(status.state)) {
        status = await run('packages/update-step')
        setProgress(STATE_TEXT(status.state))
      }
      if (status.drive) {
        setProgress(STATE_TEXT('migrating'))
        const end = await driveTick()
        // The admin itself just changed underneath this page.
        if (end === 'done') {
          window.location.reload()
          return
        }
      }
      await reload()
      if (status.state === 'failed') toast.error(status.error ?? t('The update failed. Nothing was changed.'))
    } catch (e) {
      toast.error(e)
      await reload()
    } finally {
      setBusy(null)
      setProgress(null)
    }
  }

  const updatePackage = async (name: string, store: string, version: string) => {
    setBusy(name)
    try {
      const job = await run<Job>('packages/install', { store, package: name, version })
      await driveJob(job)
      toast.success(t('{name} updated', { name }))
      await reload()
    } catch (e) {
      toast.error(e)
      await reload()
    } finally {
      setBusy(null)
    }
  }

  if (updates.isLoading || !data) return <Skeleton className="h-40" />

  const { core, status } = data
  const release = core.update

  return (
    <div>
      <Section
        title={t('{brand} {version}', { version: core.current })}
        description={core.check.checked_at ? t('Checked {date}', { date: new Date(core.check.checked_at * 1000).toLocaleString() }) : t('Not checked yet')}
        actions={<Button size="sm" loading={busy === 'check'} disabled={busy !== null} onClick={() => void check()}>{t('Check Now')}</Button>}
      >
        {core.managed ? (
          <Note icon="info">{MANAGED_TEXT(core.managed)}</Note>
        ) : core.trust === 'dev_trust' ? (
          <Note icon="info">{t('This build carries development keys, which only count on local and test sites. Updates start once it ships with production keys.')}</Note>
        ) : null}
        {status.state === 'rolled_back' && <Note icon="warning">{t('The update to {version} failed its own checks, so this site went back. Your content is safe. {error}', { version: status.target ?? '', error: status.error ?? '' })}</Note>}
        {status.state === 'failed' && <Note icon="warning">{t('The last update stopped before anything changed. {error}', { error: status.error ?? '' })}</Note>}
        {core.yanked && <Note icon="warning">{t('This version was withdrawn: {reason}', { reason: core.yanked })}</Note>}
        {core.support_ended && <Note icon="warning">{t('This major version stopped getting security fixes in {date}. Plan the move to a newer one.', { date: core.support_ended.until })}</Note>}
        {core.check.error && !core.trust && <Note icon="info">{t('The last check failed: {error}', { error: core.check.error })}</Note>}
        {progress && <p role="status" className="mt-3 flex items-center gap-2 text-sm text-text"><Icon name="spinner" size={16} className="animate-spin" />{progress}</p>}

        {!core.managed && (release || core.major) ? (
          <List className="mt-3">
            {[release, core.major].filter((r): r is Release => r !== null).map((r) => (
              <Row key={r.version}>
                <span className="font-medium">{r.version}</span>
                {r.security && <Badge tone="warning">{t('Security')}</Badge>}
                {r.major && <Badge tone="neutral">{t('New major')}</Badge>}
                <span className="min-w-0 flex-1 truncate text-xs text-muted">
                  {r.host_problems.length ? t('Needs {what} on this host', { what: r.host_problems.join(', ') }) : r.incompatible.length ? t('Not for: {list}', { list: r.incompatible.join(', ') }) : ''}
                </span>
                {r.notes_url && <a href={r.notes_url} target="_blank" rel="noreferrer" className="text-xs text-muted underline">{t('What changed')}</a>}
                <Button size="sm" variant="primary" loading={busy === 'core'} disabled={busy !== null || r.host_problems.length > 0 || core.freshness === 'expired' || core.freshness === 'clock'} onClick={() => void updateCore(r)}>{t('Update')}</Button>
              </Row>
            ))}
          </List>
        ) : !core.managed && !core.trust ? (
          <p className="m-0 mt-3 text-sm text-muted">{t('Up to date.')}</p>
        ) : null}

        {status.state === 'done' && status.previous && (
          <p className="m-0 mt-3 text-sm text-muted">
            {t('Updated from {version}.', { version: status.previous })}{' '}
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-sm underline" disabled={busy !== null} onClick={async () => {
              if (await confirm({ title: t('Go back to {version}?', { version: status.previous! }), description: t('The database stays as it is: updates within a major only add to it.'), confirm: t('Go Back'), danger: true })) {
                try {
                  await run('packages/update-rollback')
                  window.location.reload()
                } catch (e) {
                  toast.error(e)
                }
              }
            }}>{t('Go back')}</button>
          </p>
        )}

        {!core.managed && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text">
            <Switch checked={core.auto} size="sm" label={t('Install security updates by themselves')} onChange={(on) => void run('packages/update-auto', { on }).then(reload)} />
            {core.auto && release?.security && <Button size="sm" variant="ghost" onClick={async () => { await run('packages/update-postpone', { days: 7 }); toast.success(t('Postponed for 7 days')); await reload() }}>{t('Postpone 7 Days')}</Button>}
          </div>
        )}
      </Section>

      {data.advisories.length > 0 && (
        <Section title={t('Security advisories')}>
          <List>
            {data.advisories.map((a) => (
              <Row key={a.package}>
                <Icon name="warning" size={16} className="shrink-0 text-warning" />
                <span className="min-w-0 flex-1 truncate">{t('{name} {version} has a known problem. It keeps running until you decide.', { name: a.label, version: a.version })}</span>
                {a.advisory && <a href={a.advisory} target="_blank" rel="noreferrer" className="text-xs underline">{t('Read More')}</a>}
              </Row>
            ))}
          </List>
        </Section>
      )}

      <Section title={t('Plugins')}>
        {data.packages.length === 0 ? (
          <EmptyState icon="check" title={t('Everything from the store is up to date')} className="py-8" />
        ) : (
          <List>
            {data.packages.map((p) => (
              <Row key={p.package}>
                <span className="min-w-0 truncate font-medium">{p.label}</span>
                <span className="shrink-0 text-xs text-muted">{p.installed} → {p.version}</span>
                {p.security && <Badge tone="warning">{t('Security')}</Badge>}
                <span className="min-w-0 flex-1 truncate text-xs text-muted">{p.message}</span>
                {p.allowed ? <Button size="sm" variant="primary" loading={busy === p.package} disabled={busy !== null} onClick={() => void updatePackage(p.package, p.store, p.version)}>{t('Update')}</Button>
                  : p.buy_url ? <Button size="sm" onClick={() => window.open(p.buy_url!, '_blank', 'noopener')}>{t('Extend Licence')}</Button> : null}
                {p.backup && <Button size="sm" variant="ghost" disabled={busy !== null} onClick={async () => { await run('packages/rollback', { package: p.package }); await reload() }}>{t('Go Back')}</Button>}
              </Row>
            ))}
          </List>
        )}
        {data.unverified.length > 0 && <p className="mt-3 text-xs text-muted">{t('Not from a store, so no update offers: {list}', { list: data.unverified.join(', ') })}</p>}
      </Section>
    </div>
  )
}

function Note({ icon, children }: { icon: string; children: ReactNode }) {
  return <p className="m-0 mt-2 flex items-start gap-2 text-sm text-text"><Icon name={icon} size={16} className="mt-0.5 shrink-0 text-muted" /><span className="min-w-0">{children}</span></p>
}
