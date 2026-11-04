import { cn } from './cn'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const names: Record<string, string> = {
  mod: isMac ? '⌘' : 'Ctrl',
  meta: isMac ? '⌘' : 'Win',
  ctrl: isMac ? '⌃' : 'Ctrl',
  shift: '⇧',
  alt: isMac ? '⌥' : 'Alt',
  enter: '↵',
  return: '↵',
  esc: 'Esc',
  escape: 'Esc',
  backspace: '⌫',
  delete: '⌫',
  tab: '⇥',
  space: 'Space',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
}

/** How a shortcut reads: "mod+shift+k" is ⌘⇧K on macOS and Ctrl⇧K elsewhere, backspace and delete are ⌫. */
export function shortcutKeys(keys: string): string[] {
  return keys.split('+').map((k) => names[k.toLowerCase()] ?? k.toUpperCase())
}

/**
 * Keyboard shortcut. "mod" renders ⌘ on macOS and Ctrl elsewhere.
 * `bare`: the keys as quiet text with no keycaps, as in a menu row.
 */
export function Kbd({ keys, bare, className }: { keys: string; bare?: boolean; className?: string }) {
  const parts = shortcutKeys(keys)
  if (bare) return <kbd className={cn('inline-flex shrink-0 items-center gap-0.5 font-sans text-2xs font-medium tracking-[0.04em] text-faint', className)}>{parts.map((p, i) => <span key={i}>{p}</span>)}</kbd>
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-0.5', className)}>
      {parts.map((p, i) => (
        <kbd key={i} className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs bg-active px-1 font-sans text-2xs font-medium text-muted">
          {p}
        </kbd>
      ))}
    </span>
  )
}
