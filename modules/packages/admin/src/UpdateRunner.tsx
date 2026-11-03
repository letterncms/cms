import { run, t, useConfig } from '@letterncms/sdk'
import { Banner } from '@letterncms/ui'
import { useEffect } from 'react'
import { driveTick } from './installing'

interface ShellState extends Record<string, unknown> { tick: boolean; version?: string; state?: string; error?: string | null; security?: string | null; update?: string | null; yanked?: string | null; supportEnded?: string | null; stuck?: string[]; advisories?: string[] }

let ticking = false

/** An admin's visit moves automatic security updates along, in the background. No page waits on it, and no public request ever does this. */
async function tick() {
  if (ticking) return
  ticking = true
  try {
    for (let i = 0; i < 100; i++) {
      const answer = await run<{ more: boolean; drive: boolean }>('packages/update-tick')
      if (answer.drive) await driveTick()
      if (!answer.more) break
    }
  } catch {
    // The next visit tries again.
  } finally {
    ticking = false
  }
}

/** What people who can act on it should know about this site's version. */
export function UpdateRunner() {
  const state = useConfig<ShellState>('packages')

  useEffect(() => {
    if (state.tick) void tick()
  }, [state.tick])

  const message = state.state === 'rolled_back' ? t('An update failed its own checks, so this site went back. Your content is safe.')
    : state.yanked ? t('This version was withdrawn: {reason}', { reason: state.yanked })
    : state.supportEnded ? t('This major version stopped getting security fixes in {date}.', { date: state.supportEnded })
    : state.advisories?.length ? t('A security advisory covers: {list}.', { list: state.advisories.join(', ') })
    : state.stuck?.length ? t('A security fix for {list} needs a licence or a connection to the store.', { list: state.stuck.join(', ') })
    : state.security ? t('A security update is ready: {version}.', { version: state.security })
    : null

  if (!message) return null

  return <Banner action={{ to: '/modules?tab=updates', label: t('See Updates') }}>{message}</Banner>
}
