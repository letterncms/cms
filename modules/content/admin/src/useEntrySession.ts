import { blockNavigation, invalidate, run, t, type Entry, type EntryContent, type EntryCapabilities } from '@letterncms/sdk'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { EntrySession, type SaveOptions } from './entrySession'

/** `held`: someone else holds the entry; nothing is changed or saved from here until they let go or it is taken over. */
export function useEntrySession(initial: Entry | null, defaults: EntryContent, collection: string, locale: string, autosave: number, capabilities: EntryCapabilities, held = false, blueprint: string | null = null) {
  const mounted = useRef(true)
  const creationPath = useRef(window.location.pathname)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const [session] = useState(() => new EntrySession(initial, defaults, async (entry, values, options) => {
    const result = entry && !capabilities.edit && options.publish
      ? await run<Entry>('entries/publish', { id: entry.id, ...(options.at ? { at: options.at } : {}), expectedVersion: options.expectedVersion ?? entry.version })
      : entry
      ? await run<Entry>('entries/update', { id: entry.id, ...values, publish: !!options.publish, ...(options.at ? { at: options.at } : {}), expectedVersion: options.expectedVersion ?? entry.version })
      : await run<Entry>('entries/create', { collection, locale, ...(blueprint ? { blueprint } : {}), ...values, slug: values.slug || undefined, status: options.publish ? 'published' : 'draft', ...(options.at ? { at: options.at } : {}) })
    if (!entry && mounted.current && window.location.pathname === creationPath.current)
      // The router's own state stays, so Back and Forward still know where they are.
      window.history.replaceState(window.history.state, '', `${window.__CMS__.base}/content/${collection}/${result.id}${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`)
    invalidate('entries/', 'revisions/', 'content/', 'collections/overview')
    return result
  }))
  const state = useSyncExternalStore(session.subscribe, session.get)
  const editable = !held && (state.entry ? capabilities.edit : capabilities.create)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cancel = () => clearTimeout(timer.current)
  useEffect(() => {
    cancel()
    if (editable && autosave > 0 && state.dirty && state.phase !== 'saving' && !state.error && !state.conflict && state.working.title.trim()) {
      timer.current = setTimeout(() => void session.save().catch(() => {}), autosave)
    }
    return cancel
  }, [session, state, autosave, editable])
  useEffect(() => blockNavigation(() => session.get().dirty || session.get().phase === 'saving' ? t('Discard unsaved changes?') : null), [session])
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (session.get().dirty || session.get().phase === 'saving') event.preventDefault() }
    window.addEventListener('beforeunload', unload)
    return () => window.removeEventListener('beforeunload', unload)
  }, [session])
  const save = (options: SaveOptions = {}) => { cancel(); return !held && (editable || options.publish) ? session.save(options) : Promise.resolve(state.entry) }
  return { ...state, session, editable, save, update: (patch: Partial<EntryContent>) => { if (editable) session.update(patch) }, cancel }
}
