import { useMemo } from 'react'
import { splitClasses } from '../../../tailwind/engine'
import { useEditorContext } from '../core/context'
import { useEditor } from '../core/store'
import { useStyling } from '../core/styling'
import type { BlockNode } from '../core/types'
import { styleApi, type StyleApi } from './styleApi'

export { styleApi }
export type { StyleApi, ValueStatus } from './styleApi'

/**
 * A block's classes at the layer being edited (a screen size and a state), as the Design tab's controls
 * read and write them. Values cascade as Tailwind's do: a state falls back to the same sizes without it,
 * a size to the sizes below it and to every screen.
 */
export function useStyle(node: BlockNode): StyleApi {
  const { store } = useEditorContext()
  const { engine, breakpoints } = useStyling()
  const breakpoint = useEditor(store, (s) => s.breakpoint)
  const state = useEditor(store, (s) => s.state)
  const names = useMemo(() => breakpoints.map((size) => size.name), [breakpoints])
  // A size the theme no longer has (the stylesheet changed) is no layer to write to.
  const size = names.includes(breakpoint) ? breakpoint : ''
  return useMemo(
    () => styleApi(engine, splitClasses(node.class), names, size, state, (classes, group) => store.updateNode(node.id, { class: classes.join(' ') || undefined }, `style:${node.id}:${group ?? ''}`)),
    [engine, node.class, node.id, names, size, state, store],
  )
}
