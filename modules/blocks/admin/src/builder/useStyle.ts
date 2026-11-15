import { useMemo } from 'react'
import { splitClasses } from '../../../tailwind/engine'
import { useEditorContext } from '../core/context'
import { useEditor } from '../core/store'
import { screenFor, useStyling } from '../core/styling'
import type { BlockNode } from '../core/types'
import { styleApi, type StyleApi } from './styleApi'

export { styleApi }
export type { StyleApi, ValueStatus } from './styleApi'

/**
 * A block's classes for the screen the canvas shows and the state being edited, as the Design tab's controls
 * read and write them: what wins in CSS at that width, a state falling back to the same without it.
 */
export function useStyle(node: BlockNode): StyleApi {
  const { store } = useEditorContext()
  const { engine, breakpoints } = useStyling()
  const device = useEditor(store, (s) => s.device)
  const width = useEditor(store, (s) => s.canvasWidth)
  const state = useEditor(store, (s) => s.state)
  const screen = useMemo(() => screenFor(device, width, breakpoints), [device, width, breakpoints])
  return useMemo(
    () => styleApi(engine, splitClasses(node.class), screen, state, (classes, group) => store.updateNode(node.id, { class: classes.join(' ') || undefined }, `style:${node.id}:${group ?? ''}`)),
    [engine, node.class, node.id, screen, state, store],
  )
}
