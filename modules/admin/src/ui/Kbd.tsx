import { cn } from './cn'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/** Keyboard shortcut. "mod" renders ⌘ on macOS and Ctrl elsewhere. */
export function Kbd({ keys, className }: { keys: string; className?: string }) {
  const parts = keys.split('+').map((k) => ({ mod: isMac ? '⌘' : 'Ctrl', shift: '⇧', alt: isMac ? '⌥' : 'Alt', enter: '↵', esc: 'Esc' })[k.toLowerCase()] ?? k.toUpperCase())
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {parts.map((p, i) => (
        <kbd key={i} className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs border border-border bg-surface px-1 font-sans text-2xs text-muted">
          {p}
        </kbd>
      ))}
    </span>
  )
}
