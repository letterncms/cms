import { useEffect, useRef, useSyncExternalStore } from 'react'

const isMac = /Mac|iPhone|iPad/.test(navigator.platform)

const codes: Record<string, string> = { ',': 'Comma', '.': 'Period', '/': 'Slash', '\\': 'Backslash', ';': 'Semicolon', "'": 'Quote', '[': 'BracketLeft', ']': 'BracketRight', '-': 'Minus', '=': 'Equal', '`': 'Backquote' }

/** The physical key a character sits on (US layout), for when Shift or Option turn it into another character. */
function codeOf(key: string): string | undefined {
  if (/^[a-z]$/.test(key)) return `Key${key.toUpperCase()}`
  if (/^[0-9]$/.test(key)) return `Digit${key}`
  return codes[key]
}

/** Parse "mod+shift+k" and match a KeyboardEvent. Shift and Option change the character (⇧, gives <), so the key is matched by its position too. */
export function matches(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+')
  const key = parts.pop()!
  const code = codeOf(key)
  const mod = parts.includes('mod')
  const wantMeta = (mod && isMac) || parts.includes('meta')
  const wantCtrl = (mod && !isMac) || parts.includes('ctrl')
  return (
    (event.key.toLowerCase() === key || (code !== undefined && event.code === code)) &&
    event.metaKey === wantMeta &&
    event.ctrlKey === wantCtrl &&
    event.shiftKey === parts.includes('shift') &&
    event.altKey === parts.includes('alt')
  )
}

/** A shortcut that says what it does: listed in the overlay `?` opens, while it works. */
export interface ShortcutInfo { keys: string; label: string; group?: string }

const listed = new Map<symbol, ShortcutInfo>()
const listeners = new Set<() => void>()
let snapshot: ShortcutInfo[] = []
const changed = () => {
  // One line per key: what was mounted last is what the key does now.
  snapshot = [...new Map([...listed.values()].map((info) => [info.keys, info])).values()]
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }

/** The shortcuts that work on the screen on view and say what they do (see `useShortcut`'s `label`). */
export function useShortcutList(): ShortcutInfo[] {
  return useSyncExternalStore(subscribe, () => snapshot)
}

/**
 * Says what a key does, and nothing else: it is listed in the overlay `?` opens while `enabled`, and no key is
 * listened for. For keys that are handled somewhere this window's listener must not reach or take over: the
 * page builder's canvas, which is a document of its own, or a field that handles its own keys.
 *
 *   useShortcutLabel('mod+d', duplicateLabel, canvasGroup, !!selected)   // both translated, as any label
 */
export function useShortcutLabel(combo: string, label: string | undefined, group?: string, enabled = true) {
  useEffect(() => {
    if (!enabled || !label) return
    const id = Symbol(combo)
    listed.set(id, { keys: combo, label, group })
    changed()
    return () => { listed.delete(id); changed() }
  }, [combo, enabled, label, group])
}

/**
 * Global keyboard shortcut; ignores plain keys while typing. With a `label` (and a `group`, such as "Lists")
 * it is listed in the keyboard shortcuts overlay for as long as it is enabled: say what the key does there,
 * in Title Case, and the overlay is always true of the screen on view.
 */
export function useShortcut(combo: string, handler: (e: KeyboardEvent) => void, enabled = true, label?: string, group?: string) {
  const ref = useRef(handler)
  ref.current = handler

  useShortcutLabel(combo, label, group, enabled)

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
      if (typing && !combo.includes('mod') && !combo.includes('ctrl')) return
      if (matches(e, combo)) {
        e.preventDefault()
        ref.current(e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [combo, enabled])
}
