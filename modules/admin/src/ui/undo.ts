import { useEffect, useRef, useState } from 'react'

/**
 * Undo and redo, the one way every editor of the admin has them: what a screen holds before each change is a step
 * back. Changes that follow each other closely and belong together (the letters of a word, a drag) are one step.
 * The block editor, Design and anything else that keeps a draft use this; a code editor's own text keeps
 * CodeMirror's, which knows the cursor, and offers the same `Undoable`.
 */
export interface Undoable {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

/** Changes closer together than this, of one group, are one step back. */
export const TOGETHER = 800

/** Steps kept back: past these the oldest go. */
const LIMIT = 200

export class UndoStack<T> {
  private past: T[] = []
  private future: T[] = []
  private at = 0
  private group = ''

  /**
   * `before` is what there was before a change: a step back, unless the change follows the last one closely in
   * the same `group` (typing in one block). Without a group every change is a step. A change made anew drops
   * what redo had.
   */
  push(before: T, group = '', now = Date.now()): void {
    if (this.past.length === 0 || !group || group !== this.group || now - this.at >= TOGETHER) {
      this.past.push(before)
      if (this.past.length > LIMIT) this.past.shift()
    }
    this.at = now
    this.group = group
    this.future = []
  }

  /** The step back from `current`, which redo then has; undefined when there is none. */
  undo(current: T): T | undefined {
    const target = this.past.pop()
    if (target === undefined) return undefined
    this.future.push(current)
    this.group = ''
    return target
  }

  /** The step forward again from `current`; undefined when there is none. */
  redo(current: T): T | undefined {
    const target = this.future.pop()
    if (target === undefined) return undefined
    this.past.push(current)
    this.group = ''
    return target
  }

  clear(): void {
    this.past = []
    this.future = []
    this.group = ''
  }

  get canUndo(): boolean {
    return this.past.length > 0
  }

  get canRedo(): boolean {
    return this.future.length > 0
  }
}

/**
 * Undo and redo for a value a screen holds as a draft: every change of `value` is a step, and going back or forward
 * hands a value to `apply`. Saving is no step: the value stays what it was.
 */
export function useUndo<T>(value: T | undefined, apply: (value: T) => void, same: (a: T, b: T) => boolean): Undoable {
  const stack = useRef(new UndoStack<T>())
  const last = useRef<T | undefined>(undefined)
  const moving = useRef(false)
  const [, redraw] = useState(0)

  useEffect(() => {
    const before = last.current
    last.current = value
    if (value === undefined || before === undefined || same(before, value)) return
    // A value that came from undo or redo is no new change.
    if (moving.current) {
      moving.current = false
      return
    }
    // A slider dragged or a value typed is one step: the screen's changes are of one group.
    stack.current.push(before, 'draft')
    redraw((n) => n + 1)
  }, [value, same])

  const move = (step: (current: T) => T | undefined) => {
    if (last.current === undefined) return
    const target = step(last.current)
    if (target === undefined) return
    moving.current = true
    apply(target)
    redraw((n) => n + 1)
  }

  return {
    undo: () => move((current) => stack.current.undo(current)),
    redo: () => move((current) => stack.current.redo(current)),
    canUndo: stack.current.canUndo,
    canRedo: stack.current.canRedo,
  }
}
