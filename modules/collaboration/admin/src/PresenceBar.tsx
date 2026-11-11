import { plural, run, t, useManifest, type Entry, type EntryPanelProps, type PersonSummary } from '@letterncms/sdk'
import { Avatar, Button, Notice, Tooltip, cn, toast } from '@letterncms/ui'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

type Person = PersonSummary & { editing: boolean; holder?: boolean }

interface Beat {
  others: Person[]
  /** Whether the person here holds the entry: the first to edit it does, until they stop or it is taken over. */
  holding?: boolean
  updatedAt?: string
  updatedBy?: { id: string; name: string } | null
}

const EVERY = 15_000
const TYPING_WINDOW = 60_000

/** What the last heartbeat said of each open entry, for the notice above the document; `was` remembers that the person here held it. */
const beats = new Map<string, Beat & { was?: boolean }>()
const listeners = new Set<() => void>()
const onBeat = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const keep = (id: string, beat: Beat | null) => {
  if (beat) beats.set(id, { ...beat, was: beat.holding || (beats.get(id)?.was && !beat.holding) })
  else beats.delete(id)
  listeners.forEach((l) => l())
}
/** Ask again now (after taking over): set by the bar while it is on view. */
const now = new Map<string, () => void>()

/** Entry toolbar: who else has this entry open, and a nudge when they saved newer changes. */
export function PresenceBar({ entry, reload }: { entry: Entry | null; reload: () => void }) {
  const manifest = useManifest()
  const [beat, setBeat] = useState<Beat>({ others: [] })
  const lastInput = useRef(0)
  const id = entry?.id

  useEffect(() => {
    if (!id) return
    // The first change says so at once, not with the next beat: whoever edits first holds the entry.
    const onInput = () => {
      const idle = Date.now() - lastInput.current >= TYPING_WINDOW
      lastInput.current = Date.now()
      if (idle) tick()
    }
    document.addEventListener('input', onInput, true)
    document.addEventListener('keydown', onInput, true)

    let alive = true
    function tick() {
      if (document.visibilityState === 'hidden') return
      run<Beat>('collaboration/presence', { entryId: id, editing: Date.now() - lastInput.current < TYPING_WINDOW })
        .then((b) => { if (alive) { setBeat(b); keep(id!, b) } })
        .catch(() => {})
    }
    now.set(id, tick)
    tick()
    const timer = window.setInterval(tick, EVERY)
    document.addEventListener('visibilitychange', tick)

    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('keydown', onInput, true)
      document.removeEventListener('visibilitychange', tick)
      now.delete(id)
      keep(id, null)
      void run('collaboration/presence', { entryId: id, leave: true }).catch(() => {})
    }
  }, [id])

  if (!entry) return null

  const newer = beat.updatedAt && entry.updatedAt && Date.parse(beat.updatedAt) > Date.parse(entry.updatedAt) && beat.updatedBy?.id !== manifest.user.id
  const editing = beat.others.filter((p) => p.editing)

  return (
    <div className="flex items-center gap-2">
      {newer && (
        <Tooltip content={t('Your unsaved edits will be replaced')}>
          <Button size="xs" variant="secondary" icon="refresh" onClick={reload}>
            {beat.updatedBy ? t('{name} saved · Reload', { name: beat.updatedBy.name }) : t('Someone saved · Reload')}
          </Button>
        </Tooltip>
      )}
      {beat.others.length > 0 && (
        <Tooltip content={beat.others.map((p) => (p.editing ? t('{name} is editing', { name: p.name }) : t('{name} is viewing', { name: p.name }))).join(' · ')}>
          <div className="flex -space-x-1.5" aria-label={plural(beat.others.length, '{count} other person here', '{count} other people here')}>
            {beat.others.slice(0, 4).map((p) => (
              <span key={p.id} className={cn('rounded-full ring-2', p.editing ? 'ring-ink' : 'ring-bg')}>
                <Avatar name={p.name} initials={p.initials} src={p.avatar} size={22} />
              </span>
            ))}
          </div>
        </Tooltip>
      )}
      {/* Not while the notice above the document says who holds it: once is enough. On a phone the bar has no room for words. */}
      {editing.length > 0 && !(beat.holding === false && beat.others.some((p) => p.holder)) && <span className="text-xs text-muted max-sm:hidden">{editing.length === 1 ? t('{name} is editing', { name: editing[0].name }) : t('{count} editing', { count: editing.length })}</span>}
    </div>
  )
}

/**
 * Above the document: someone else holds this entry. The editor is read-only meanwhile (`hold`), so two people
 * never save over each other; Take Over makes it yours, and tells them the same way.
 */
export function HoldNotice({ entry, can, hold, reload }: EntryPanelProps) {
  const id = entry?.id
  const beat = useSyncExternalStore(onBeat, () => (id ? beats.get(id) : undefined))
  const [taking, setTaking] = useState(false)
  const holder = beat && !beat.holding ? beat.others.find((p) => p.holder) : undefined
  // Only for someone who could edit it: anyone else is reading anyway.
  const held = !!holder && can.edit
  useEffect(() => { hold(held); return () => hold(false) }, [held, hold])
  if (!held || !id || !beat || !holder) return null

  const take = async () => {
    setTaking(true)
    try {
      await run('collaboration/take-over', { entryId: id })
      // What they saved meanwhile is what is edited from here on.
      if (beat.updatedAt && entry.updatedAt && Date.parse(beat.updatedAt) > Date.parse(entry.updatedAt)) await reload()
      now.get(id)?.()
    } catch (e) {
      toast.error(e)
    } finally {
      setTaking(false)
    }
  }

  return (
    <Notice className="m-3" icon="lock" action={<Button size="sm" loading={taking} onClick={() => void take()}>{t('Take Over')}</Button>}>
      {beat.was ? t('{name} took over editing.', { name: holder.name }) : t('{name} is editing.', { name: holder.name })}
    </Notice>
  )
}
