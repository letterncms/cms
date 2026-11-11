import type { MotionDef } from '../core/types'

/** Block workspace events for selection and rendered previews. */
type Events = {
  'preview-motion': { node: string; motion: MotionDef }
  /** Bring a block into view: in the middle, or at the `top` when a sheet covers the rest. */
  'scroll-to': { node: string; top?: boolean }
  /** Select a block and open its inspector, as clicking it on the page does. */
  inspect: { node: string }
}

const target = new EventTarget()

export const bus = {
  emit<K extends keyof Events>(name: K, detail: Events[K]) {
    target.dispatchEvent(new CustomEvent(name, { detail }))
  },
  on<K extends keyof Events>(name: K, fn: (detail: Events[K]) => void): () => void {
    const handler = (e: Event) => fn((e as CustomEvent).detail)
    target.addEventListener(name, handler)
    return () => target.removeEventListener(name, handler)
  },
}
