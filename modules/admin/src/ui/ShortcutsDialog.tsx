import { registry, t, useManifestIfLoaded } from '@letterncms/sdk'
import { useSyncExternalStore } from 'react'
import { Dialog } from './Dialog'
import { Kbd } from './Kbd'
import { useShortcutList, type ShortcutInfo } from './shortcuts'

/** The key that opens the overlay, as `useShortcut` takes it and as it reads. */
export const SHORTCUTS_KEY = 'shift+?'

/**
 * Every key that does something on the screen on view: the shortcuts that say what they do
 * (`useShortcut` with a `label`), the registered commands that have one, and the places with a key
 * of their own. Nothing is listed by hand, so a key that works is a key that shows.
 */
export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const live = useShortcutList()
  const manifest = useManifestIfLoaded()
  useSyncExternalStore(registry.commands.subscribe, registry.commands.version)
  const all: ShortcutInfo[] = [
    ...live,
    ...registry.commands.all().filter((c) => c.shortcut).map((c) => ({ keys: c.shortcut!, label: c.label })),
    ...(manifest?.nav ?? []).filter((n) => n.shortcut).map((n) => ({ keys: n.shortcut!, label: n.label, group: t('Go To') })),
  ]
  const seen = new Set<string>()
  const groups = new Map<string, ShortcutInfo[]>()
  for (const info of all) {
    if (seen.has(info.keys)) continue
    seen.add(info.keys)
    const group = info.group ?? t('General')
    groups.set(group, [...(groups.get(group) ?? []), info])
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('Keyboard Shortcuts')} size="sm">
      <div className="flex flex-col gap-4">
        {[...groups].map(([group, items]) => (
          <section key={group} aria-label={group}>
            {groups.size > 1 && <h3 className="cms-label m-0 mb-1">{group}</h3>}
            <ul className="m-0 list-none p-0">
              {items.map((info) => (
                <li key={info.keys} className="flex min-h-8 items-center justify-between gap-3 text-sm text-text">
                  {info.label}
                  <Kbd keys={info.keys === SHORTCUTS_KEY ? '?' : info.keys} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
