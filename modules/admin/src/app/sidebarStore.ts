import { boot, can, getManifest, loadManifest, navigate, run, setManifest, setPreference, t, type Arrangement, type Manifest, type Sidebar } from '@letterncms/sdk'
import { confirm, toast } from '../ui'
import { placeAt, roomAt, roomHome, SETTINGS } from '../ui/place'

/**
 * The sidebar people pin: the main sidebar's own rows, then what is pinned (`hidden`: what could be and is
 * not). Changes show at once (the manifest is updated in place) and are saved behind them as
 * the person's `sidebar` preference.
 */

let saving: Promise<unknown> = Promise.resolve()

/** A layout as it is saved: the sections' ids and items, and what is under More. */
interface Stored {
  sections: { id: string; items: string[] }[]
  hidden: string[]
}

function stored(layout: Stored): Stored {
  return { sections: layout.sections.map(({ id, items }) => ({ id, items })), hidden: layout.hidden }
}

/**
 * The site's default, as this person sees it (null while unknown): taken from the
 * sidebar while they follow it, or asked for by those who may change it. A sidebar
 * arranged back into it is the default again, not a copy of it.
 */
let siteDefault: Stored | null = null

/** The same items in the same places, among those this person may open. */
function sameLayout(a: Stored, b: Stored) {
  const nav = new Set(getManifest().nav.map((n) => n.id))
  const shape = (l: Stored) => JSON.stringify({
    sections: l.sections.map((s) => ({ id: s.id, items: s.items.filter((id) => nav.has(id)) })).filter((s) => s.items.length > 0),
    hidden: l.hidden.filter((id) => nav.has(id)).sort(),
  })
  return shape(a) === shape(b)
}

function noteDefault() {
  const current = getManifest().sidebar
  if (!current.personal) siteDefault = stored(current)
}

export function arrange(next: Sidebar) {
  noteDefault()
  const personal = !siteDefault || !sameLayout(next, siteDefault)
  setManifest({ ...getManifest(), sidebar: { ...next, personal } })
  saving = saving
    .then(() => setPreference('sidebar', personal ? stored(next) : null))
    .catch((e) => {
      toast.error(e)
      return loadManifest()
    })
}

/**
 * For those who may change it: the site's default, and whether it was changed from
 * what modules and plugins set up (`customized`).
 */
export async function loadSiteDefault(): Promise<{ customized: boolean } | null> {
  if (!can('settings.manage')) return null
  try {
    const result = await run<{ layout: Arrangement; customized: boolean }>('admin/arrangement', { of: 'sidebar' })
    const fetched = stored(result.layout)
    siteDefault = fetched
    // Arranged back into the default before it was known: it is the default again.
    const current = getManifest().sidebar
    if (current.personal && sameLayout(current, fetched)) arrange(current)
    return { customized: result.customized }
  } catch {
    return null
  }
}

/** The main sidebar's group of what is pinned from the rooms. */
export const PINNED = 'pinned'

/** Whether a screen of a room is pinned to the main sidebar. */
export function isPinned(layout: Sidebar, id: string) {
  return !layout.hidden.includes(id) && layout.sections.some((s) => s.id === PINNED && s.items.includes(id))
}

/** Pinned, it comes last among what is pinned; unpinned, it is in its room only. */
export function setPinned(id: string, pinned: boolean) {
  const layout = getManifest().sidebar
  const sections = layout.sections.some((s) => s.id === PINNED) ? layout.sections : [...layout.sections, { id: PINNED, label: t('Pinned'), items: [] }]
  arrange({
    ...layout,
    sections: sections.map((s) => (s.id === PINNED ? { ...s, items: pinned ? [...s.items.filter((i) => i !== id), id] : s.items } : s)),
    hidden: pinned ? layout.hidden.filter((h) => h !== id) : [...layout.hidden.filter((h) => h !== id), id],
  })
}

/** Unpin, with a way back: a room's screen stays in its room, any other waits under More. */
export function unpin(id: string) {
  const manifest = getManifest()
  const label = manifest.nav.find((n) => n.id === id)?.label ?? id
  const room = manifest.rooms.find((each) => each.sections.some((section) => section.items.includes(id)))
  setPinned(id, false)
  toast(room ? t('{label} unpinned', { label }) : t('{label} moved to More', { label }), { duration: 6000, action: { label: t('Undo'), onClick: () => setPinned(id, true) } })
}

/** Put what is pinned in a new order. */
export function reorder(items: string[]) {
  const layout = getManifest().sidebar
  arrange({ ...layout, sections: layout.sections.map((s) => (s.id === PINNED ? { ...s, items } : s)) })
}

/** Move a pinned item to another place among the pinned ones, leaving those not pinned where they are. */
export function movePinned(id: string, to: number) {
  const layout = getManifest().sidebar
  const items = layout.sections.find((s) => s.id === PINNED)?.items ?? []
  const pinned = items.filter((i) => isPinned(layout, i) && i !== id)
  pinned.splice(Math.max(0, Math.min(to, pinned.length)), 0, id)
  let next = 0
  reorder(items.map((i) => (isPinned(layout, i) ? pinned[next++] : i)))
}

export async function resetToDefault() {
  await saving
  try {
    await setPreference('sidebar', null)
    await loadManifest()
    noteDefault()
    toast.success(t('Sidebar reset to the default'))
  } catch (e) {
    toast.error(e)
  }
}

export async function saveForEveryone() {
  if (!can('settings.manage')) return
  const ok = await confirm({ title: t('Make this everyone’s sidebar?'), description: t('People who pinned their own sidebar keep theirs.'), confirm: t('Save for Everyone') })
  if (!ok) return
  await saving
  try {
    await run('settings/update', { namespace: 'admin', values: { sidebar: stored(getManifest().sidebar) } })
    await setPreference('sidebar', null)
    siteDefault = null
    await loadManifest()
    noteDefault()
    toast.success(t('Saved as the default sidebar'))
  } catch (e) {
    toast.error(e)
  }
}

/** Everyone's default back to what modules and plugins set up. */
export async function resetEveryonesDefault() {
  if (!can('settings.manage')) return false
  const ok = await confirm({ title: t('Reset everyone’s sidebar?'), description: t('People who pinned their own sidebar keep theirs.'), confirm: t('Reset') })
  if (!ok) return false
  await saving
  try {
    await run('settings/update', { namespace: 'admin', values: { sidebar: null } })
    siteDefault = null
    await loadManifest()
    noteDefault()
    toast.success(t('Default sidebar reset'))
    return true
  } catch (e) {
    toast.error(e)
    return false
  }
}

/**
 * Opens settings, and in settings goes back. Not ⌘, — browsers keep that one for their
 * own settings, so a page never sees it.
 */
export const SETTINGS_SHORTCUT = 'mod+shift+,'

/** The places of this visit, newest last, each with the room it is in: where a way out of a room returns to. */
const visits: { path: string; room?: string }[] = []

/** Only a place is remembered: a path on its way somewhere else (/settings opening its first page) is never a way back. */
export function remember(manifest: Manifest, path: string, search: string) {
  if (!placeAt(manifest.nav, path)) return
  const visit = { path: path + search, room: roomAt(manifest, path)?.id }
  if (visits[visits.length - 1]?.path === visit.path) return
  visits.push(visit)
  if (visits.length > 50) visits.shift()
}

/**
 * Where the way out of a room leads: the last place before it, exactly as it was left (a style in Design, a page in
 * Entries). Settings, opened beside who is signed in, return to wherever they were opened from; any other room to
 * the last place outside it and outside settings. Before there was one, the first screen of the main sidebar.
 */
export function wayOut(room: string | undefined): string {
  for (let i = visits.length - 1; i >= 0; i--) {
    const visit = visits[i]
    if (visit.room !== room && (room === SETTINGS || visit.room !== SETTINGS)) return visit.path
  }
  const manifest = getManifest()
  const screens = new Map(manifest.nav.filter((n) => !n.room).map((n) => [n.id, n.path]))
  const first = manifest.sidebar.sections.flatMap((s) => s.items).find((id) => screens.has(id) && !roomAt(manifest, screens.get(id)!))
  return (first && screens.get(first)) ?? '/'
}

export function openRoom(id: string) {
  const to = roomHome(getManifest(), id)
  if (to) navigate(to)
}

/** Out of the room the screen on view is in, back where it was entered from. */
export function leaveRoom() {
  navigate(wayOut(roomAt(getManifest(), currentPath())?.id))
}

const currentPath = () => window.location.pathname.slice(boot.base.length) || '/'

/** The settings shortcut: opens settings, and in settings goes back. */
export function toggleSettings() {
  if (roomAt(getManifest(), currentPath())?.id === SETTINGS) leaveRoom()
  else openRoom(SETTINGS)
}
