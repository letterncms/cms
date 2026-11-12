import { can, events, getManifest, loadManifest, registry, run, t } from '@letterncms/sdk'
import { toast } from '../ui'
import { getThemePreference, setThemePreference, type ThemePreference } from '../ui/theme'
import { openSettings, SETTINGS_SHORTCUT } from './sidebarStore'

// What the admin's frame can do, for `/` in the chat (and ⌘K, which opens it there).
registry.commands.set('admin-customize-sidebar', { label: t('Customize Sidebar…'), icon: 'sidebar', keywords: ['pin', 'unpin', 'reorder', 'navigation', 'menu', 'more'], perform: () => events.emit('sidebar.customize') })
registry.commands.set('admin-settings', { label: t('Open Settings'), icon: 'settings', keywords: ['preferences', 'configure'], shortcut: SETTINGS_SHORTCUT, perform: openSettings })
registry.commands.set('admin-shortcuts', { label: t('Keyboard Shortcuts'), icon: 'command', keywords: ['keys', 'help'], shortcut: '?', perform: () => events.emit('shortcuts.open') })

// Only what would change something: the other theme, and the system's unless it is followed already.
const resolved = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
const themes: [ThemePreference, string, string, () => boolean][] = [
  ['light', 'sun', t('Switch to Light Mode'), () => resolved() !== 'light'],
  ['dark', 'moon', t('Switch to Dark Mode'), () => resolved() !== 'dark'],
  ['system', 'monitor', t('Match System Appearance'), () => getThemePreference() !== 'system'],
]
for (const [scheme, icon, label, when] of themes) {
  registry.commands.set(`admin-theme-${scheme}`, { label, icon, keywords: ['theme', scheme, 'mode', 'appearance'], when, perform: () => setThemePreference(scheme) })
}

registry.commands.set('admin-migrate', {
  label: t('Update the Database'), icon: 'database', keywords: ['run', 'pending', 'upgrades', 'migrations', 'update'],
  when: () => can('packages.manage') && Object.keys(getManifest().packages?.pending ?? {}).length > 0,
  perform: () => void run('packages/migrate').then(() => loadManifest()).then(() => toast.success(t('Database is up to date')), toast.error),
})
