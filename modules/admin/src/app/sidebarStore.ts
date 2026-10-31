import { abilityKey, boot, can, getManifest, loadManifest, navigate, queryClient, run, setManifest, t, type Manifest, type NavItem, type Sidebar } from '@letterncms/sdk'
import { confirm, toast } from '../ui'

/**
 * The sidebar people pin: items in sections, those that are `hidden` wait
 * under More. Changes show at once (the manifest is updated in place) and are
 * saved behind them as the person's `sidebar` preference.
 */

let saving: Promise<unknown> = Promise.resolve()

function stored(layout: Sidebar) {
  return { sections: layout.sections.map(({ id, items }) => ({ id, items })), hidden: layout.hidden }
}

export function arrange(next: Sidebar) {
  setManifest({ ...getManifest(), sidebar: { ...next, personal: true } })
  saving = saving
    .then(() => run('account/update', { preferences: { sidebar: stored(next) } }))
    .catch((e) => {
      toast.error(e)
      return loadManifest()
    })
}

export function isPinned(layout: Sidebar, id: string) {
  return !layout.hidden.includes(id)
}

export function setPinned(id: string, pinned: boolean) {
  const layout = getManifest().sidebar
  arrange({ ...layout, hidden: pinned ? layout.hidden.filter((h) => h !== id) : [...layout.hidden.filter((h) => h !== id), id] })
}

/** Unpin, with a way back. */
export function unpin(id: string) {
  const label = getManifest().nav.find((n) => n.id === id)?.label ?? id
  setPinned(id, false)
  toast(t('{label} moved to More', { label }), { duration: 6000, action: { label: t('Undo'), onClick: () => setPinned(id, true) } })
}

/** Put a section's items in a new order. */
export function reorder(section: string, items: string[]) {
  const layout = getManifest().sidebar
  arrange({ ...layout, sections: layout.sections.map((s) => (s.id === section ? { ...s, items } : s)) })
}

/**
 * Move a pinned item to another place among the pinned items of its section,
 * leaving the items under More where they are.
 */
export function movePinned(section: string, id: string, to: number) {
  const layout = getManifest().sidebar
  const items = layout.sections.find((s) => s.id === section)?.items ?? []
  const pinned = items.filter((i) => isPinned(layout, i) && i !== id)
  pinned.splice(Math.max(0, Math.min(to, pinned.length)), 0, id)
  let next = 0
  reorder(section, items.map((i) => (isPinned(layout, i) ? pinned[next++] : i)))
}

export async function resetToDefault() {
  await saving
  try {
    await run('account/update', { preferences: { sidebar: null } })
    await loadManifest()
    toast.success(t('Sidebar reset to the default'))
  } catch (e) {
    toast.error(e)
  }
}

export async function saveForEveryone() {
  if (!can('settings.manage')) return
  const ok = await confirm({ title: t('Make this everyone’s sidebar?'), description: t('People who pinned their own sidebar keep theirs.'), confirm: t('Save as Default') })
  if (!ok) return
  await saving
  try {
    await run('settings/update', { namespace: 'admin', values: { sidebar: stored(getManifest().sidebar) } })
    await run('account/update', { preferences: { sidebar: null } })
    // Settings → Admin shows the default too.
    void queryClient.invalidateQueries({ queryKey: abilityKey('settings/get', { namespace: 'admin' }) })
    await loadManifest()
    toast.success(t('Saved as the default sidebar'))
  } catch (e) {
    toast.error(e)
  }
}

/** The item a path belongs to: the one with the longest matching path (`/` only for itself). */
export function itemAt(nav: NavItem[], path: string): NavItem | undefined {
  let found: NavItem | undefined
  for (const item of nav) {
    const match = item.path === '/' ? path === '/' : path === item.path || path.startsWith(`${item.path}/`)
    if (match && (!found || item.path.length > found.path.length)) found = item
  }
  return found
}

export function settingsIds(manifest: Manifest): Set<string> {
  return new Set(manifest.settingsNav.flatMap((s) => s.items))
}

export function inSettings(manifest: Manifest, path: string): boolean {
  const item = itemAt(manifest.nav, path)
  return !!item && settingsIds(manifest).has(item.id)
}

/**
 * Opens settings, and in settings goes back. Not ⌘, — browsers keep that one for their
 * own settings, so a page never sees it.
 */
export const SETTINGS_SHORTCUT = 'mod+shift+,'

/** Where Back and the settings shortcut return to: the last screen of each side, for this visit. */
const last = { app: '/', settings: '' }

export function remember(manifest: Manifest, path: string, search: string) {
  if (inSettings(manifest, path)) last.settings = path + search
  else last.app = path + search
}

export function lastApp(): string {
  return last.app
}

export function openSettings() {
  const manifest = getManifest()
  const first = manifest.nav.find((n) => n.id === manifest.settingsNav[0]?.items[0])?.path
  const to = last.settings || first
  if (to) navigate(to)
}

export function leaveSettings() {
  navigate(last.app)
}

/** The settings shortcut: opens settings, and in settings goes back. */
export function toggleSettings() {
  const path = window.location.pathname.slice(boot.base.length) || '/'
  if (inSettings(getManifest(), path)) leaveSettings()
  else openSettings()
}
