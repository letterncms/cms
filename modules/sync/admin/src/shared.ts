import { t } from '@letterncms/sdk'
import { toast } from '@letterncms/ui'

export type Direction = 'pull' | 'push'
export interface Progress { id: string; remote: string; remote_label: string; direction: Direction; groups: string[]; from: string; to: string; status: 'running' | 'waiting' | 'paused' | 'done' | 'failed' | 'cancelled'; phase: string; label: string; percent: number; eta: number | null; rows: number; files: number; bytes: number; message: string | null; error: string | null; result: { signed_in?: number } | null; started_at: string; finished_at: string | null }
export interface Overview { site: { name: string; url: string; key: string; allow_pull: boolean; allow_push: boolean }; current: Progress | null; history: { id: string; undone_at: string | null }[]; remotes: { name: string; last: { id: string; undone_at?: string } | null }[] }

export const RUNNING = ['running', 'waiting']

export const bytes = (n: number) => {
  for (const [unit, size] of [['GB', 2 ** 30], ['MB', 2 ** 20], ['KB', 2 ** 10]] as const) if (n >= size) return `${(n / size).toFixed(1).replace(/\.0$/, '')} ${unit}`
  return `${n} B`
}
export const count = (n: number) => n.toLocaleString()
export const duration = (s: number) => (s < 60 ? t('{n} s', { n: s }) : t('{n} min', { n: Math.ceil(s / 60) }))
export const error = (e: unknown) => toast.error((e as Error).message)
