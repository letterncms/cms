import { useEffect, useRef, useState } from 'react'

/** Changes that follow each other this closely are one step back: the letters of a value, a drag. */
const TOGETHER = 700

/**
 * Undo and redo for what a screen holds as a draft, as the editor has them: every change of `value` is a step,
 * and going back or forward hands a value to `apply`. Saving is no step: the value stays what it was.
 */
export function useHistory<T>(value: T | undefined, apply: (value: T) => void, same: (a: T, b: T) => boolean) {
  const steps = useRef<{ past: T[]; future: T[]; at: number }>({ past: [], future: [], at: 0 })
  const last = useRef<T | undefined>(undefined)
  const moving = useRef(false)
  const [, redraw] = useState(0)

  useEffect(() => {
    const before = last.current
    last.current = value
    if (value === undefined || before === undefined || same(before, value)) return
    if (moving.current) {
      moving.current = false
      return
    }
    const now = Date.now()
    if (now - steps.current.at > TOGETHER || steps.current.past.length === 0) steps.current.past.push(before)
    steps.current.at = now
    steps.current.future = []
    redraw((n) => n + 1)
  }, [value, same])

  const move = (from: T[], to: T[]) => {
    const target = from.pop()
    if (target === undefined || last.current === undefined) return
    to.push(last.current)
    steps.current.at = 0
    moving.current = true
    apply(target)
    redraw((n) => n + 1)
  }

  return {
    undo: () => move(steps.current.past, steps.current.future),
    redo: () => move(steps.current.future, steps.current.past),
    canUndo: steps.current.past.length > 0,
    canRedo: steps.current.future.length > 0,
  }
}
