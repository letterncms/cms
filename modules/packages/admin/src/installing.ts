import { loadManifest, run, t } from '@letterncms/sdk'

export interface Job { id: string; step: string; state: 'running' | 'done' | 'failed'; error?: string; code?: string | null; package?: string }

export class JobFailed extends Error {
  constructor(message: string, readonly code: string | null) {
    super(message)
  }
}

/** Steps are separate requests, so a time limit only pauses an install. A crash on one (a plugin's fatal error) is retried: the next request sees what happened and puts things back. */
export async function driveJob(job: Job, onStep?: (job: Job) => void): Promise<Job> {
  let misses = 0
  let current = job
  while (current.state === 'running') {
    try {
      current = await run<Job>('packages/job-step', { id: current.id })
      misses = 0
      onStep?.(current)
    } catch (e) {
      if (++misses > 3) throw e
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
  if (current.state === 'failed') throw new JobFailed(current.error ?? t('The install failed.'), current.code ?? null)
  await loadManifest()
  return current
}

const TICK = () => new URL('/_cms/update/tick', window.location.origin).toString()

/** After the switch, the new release finishes through its own door: no session, no secret. Ends when it says how it went. */
export async function driveTick(): Promise<string> {
  for (let i = 0; i < 200; i++) {
    try {
      const res = await fetch(TICK(), { method: 'POST', cache: 'no-store' })
      if (res.status === 200) {
        const body = (await res.json()) as { state?: string }
        if (body.state && !['migrating', 'checking'].includes(body.state)) return body.state
      } else if (res.status === 204) {
        return 'done'
      }
    } catch {
      // The server is busy switching: try again.
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }
  return 'unknown'
}
