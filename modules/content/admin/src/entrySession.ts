import type { Entry, EntryContent } from '@letterncms/sdk'

export interface SaveOptions { publish?: boolean; at?: string; expectedVersion?: string }
type Failure = Error & { type?: string; details?: Record<string, string> }
export interface SessionState {
  entry: Entry | null
  working: EntryContent
  dirty: boolean
  phase: 'idle' | 'saving' | 'saved' | 'error'
  error: Failure | null
  errors: Record<string, string>
  conflict: { message: string; version?: string } | null
}

export const entryContent = (entry: Entry): EntryContent => ({ title: entry.title, slug: entry.slug, data: entry.data, authorId: entry.authorId })

/** The server names a field's error by its path in the input (data.summary); the form knows the field by its handle. */
const fieldErrors = (details: Record<string, string>) => Object.fromEntries(Object.entries(details).map(([path, message]) => [path.replace(/^data\./, ''), message]))

const sameContent = (a: EntryContent, b: EntryContent) => a.title === b.title && a.slug === b.slug && a.authorId === b.authorId && JSON.stringify(a.data) === JSON.stringify(b.data)

/** One working-copy owner. Requests serialize and acknowledge only the edits they captured. */
export class EntrySession {
  private state: SessionState
  private listeners = new Set<() => void>()
  private queue: Promise<unknown> = Promise.resolve()
  private edit = 0
  private disposed = false
  private persist: (entry: Entry | null, values: EntryContent, options: SaveOptions) => Promise<Entry>

  constructor(entry: Entry | null, working: EntryContent, persist: (entry: Entry | null, values: EntryContent, options: SaveOptions) => Promise<Entry>) {
    this.persist = persist
    this.state = { entry, working, dirty: false, phase: 'idle', error: null, errors: {}, conflict: null }
  }

  get = () => this.state
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private emit(patch: Partial<SessionState>) {
    this.state = { ...this.state, ...patch }
    if (!this.disposed) this.listeners.forEach((listener) => listener())
  }

  update(patch: Partial<EntryContent>) {
    this.edit++
    const working = { ...this.state.working, ...patch }
    // Back to what's saved, or nothing changed at all: there's nothing to save, whatever asked.
    const dirty = !this.state.entry || !sameContent(working, entryContent(this.state.entry))
    this.emit({ working, dirty, phase: this.state.phase === 'saving' ? 'saving' : this.state.error ? 'error' : 'idle' })
  }

  private enqueue<T>(work: () => Promise<T>): Promise<T> {
    const task = this.queue.then(work)
    this.queue = task.catch(() => {})
    return task
  }

  private fail(error: unknown) {
    const failure = (error instanceof Error ? error : new Error(String(error))) as Failure
    this.emit({ phase: 'error', error: failure, errors: failure.type === 'invalid_input' ? fieldErrors(failure.details ?? {}) : {}, conflict: failure.type === 'conflict' ? { message: failure.message, version: failure.details?.version } : null })
  }

  save(options: SaveOptions = {}): Promise<Entry | null> {
    return this.enqueue(async () => {
      if (this.state.conflict && !options.expectedVersion) throw this.state.error
      if (!this.state.dirty && !options.publish) return this.state.entry
      const { entry, working } = this.state
      if (!working.title.trim()) {
        this.emit({ errors: { title: 'A title is required.' } })
        return null
      }
      const captured = this.edit
      this.emit({ phase: 'saving', error: null })
      try {
        const result = await this.persist(entry, working, options)
        this.emit({ entry: result, working: captured === this.edit ? entryContent(result) : this.state.working, dirty: captured !== this.edit, phase: 'saved', error: null, errors: {}, conflict: null })
        return result
      } catch (error) {
        this.fail(error)
        throw error
      }
    })
  }

  /** Explicit lifecycle replacement, used after the user resolves unsaved changes. */
  command(operation: (entry: Entry) => Promise<Entry>): Promise<Entry | null> {
    return this.enqueue(async () => {
      if (!this.state.entry) return null
      const captured = this.edit
      this.emit({ phase: 'saving', error: null })
      try {
        const result = await operation(this.state.entry)
        this.emit({ entry: result, working: captured === this.edit ? entryContent(result) : this.state.working, dirty: captured !== this.edit, phase: 'saved', error: null, errors: {}, conflict: null })
        return result
      } catch (error) { this.fail(error); throw error }
    })
  }

  /** Call after a confirmed reload, or when leaving after a successful deletion. */
  reset(entry: Entry | null = this.state.entry) {
    this.edit++
    this.emit({ entry, ...(entry ? { working: entryContent(entry) } : {}), dirty: false, phase: 'idle', error: null, errors: {}, conflict: null })
  }

  dispose() { this.disposed = true; this.listeners.clear() }
}
