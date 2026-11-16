import { t } from '@letterncms/sdk'
import { IconButton } from './Button'
import { useShortcut, useShortcutLabel } from './shortcuts'
import type { Undoable } from './undo'

/**
 * Undo and Redo in an editor's top bar: the same two buttons, keys and words on every screen that edits.
 * `keys` says who hears ⌘Z: this (`listen`), an editor that handles its own and is only named here (`named`), or
 * one that handles and names them itself (`own`).
 */
export function UndoRedo({ history, keys = 'listen', group, disabled = false }: { history: Undoable; keys?: 'listen' | 'named' | 'own'; group?: string; disabled?: boolean }) {
  const listen = keys === 'listen' && !disabled
  useShortcut('mod+z', history.undo, listen && history.canUndo, t('Undo'), group)
  useShortcut('mod+shift+z', history.redo, listen && history.canRedo, t('Redo'), group)
  useShortcutLabel('mod+z', t('Undo'), group, keys === 'named' && !disabled)
  useShortcutLabel('mod+shift+z', t('Redo'), group, keys === 'named' && !disabled)
  return (
    <>
      <IconButton icon="undo" label={t('Undo')} shortcut="mod+z" disabled={disabled || !history.canUndo} onClick={history.undo} />
      <IconButton icon="redo" label={t('Redo')} shortcut="mod+shift+z" disabled={disabled || !history.canRedo} onClick={history.redo} />
    </>
  )
}
