import { t } from '@letterncms/sdk'

export type Direction = 'pull' | 'push'
export interface Progress { id: string; remote: string; remote_label: string; direction: Direction; groups: string[]; from: string; to: string; status: 'running' | 'waiting' | 'paused' | 'done' | 'failed' | 'cancelled'; phase: string; label: string; percent: number; eta: number | null; rows: number; files: number; bytes: number; message: string | null; error: string | null; result: { signed_in?: number } | null; started_at: string; finished_at: string | null }
export interface Overview { site: { name: string; url: string; key: string; allow_pull: boolean; allow_push: boolean }; current: Progress | null; history: { id: string; undone_at: string | null }[]; remotes: Remote[] }
/** A connected site, and its last pull or push. */
export interface Remote { name: string; label: string; url: string; last: { id: string; direction: Direction; at: string; undone_at?: string } | null }

export const RUNNING = ['running', 'waiting']

export const count = (n: number) => n.toLocaleString()
export const duration = (s: number) => (s < 60 ? t('{n} s', { n: s }) : t('{n} min', { n: Math.ceil(s / 60) }))
