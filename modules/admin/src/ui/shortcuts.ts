import { useEffect, useRef } from 'react'

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

/** Global keyboard shortcut; ignores plain keys while typing. */
export function useShortcut(combo: string, handler: (e: KeyboardEvent) => void, enabled = true) {
  const ref = useRef(handler)
  ref.current = handler

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
