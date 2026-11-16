import { Link, t } from '@letterncms/sdk'
import { Notice } from '@letterncms/ui'
import { useMemo } from 'react'
import { splitClasses } from '../../../../tailwind/engine'
import { useEditorContext } from '../../core/context'
import { useEditor } from '../../core/store'
import { useStyling } from '../../core/styling'
import * as tree from '../../core/tree'
import type { BlockNode } from '../../core/types'
import { dataStates } from '../styleApi'
import { styleApi, useStyle, type StyleApi } from '../useStyle'
import { Border } from './Border'
import { Effects } from './Effects'
import { Fill } from './Fill'
import { InParent, Layout } from './Layout'
import { OtherStyles } from './more'
import { Position } from './Position'
import { Size } from './Size'
import { Spacing } from './Spacing'
import { StyleBar } from './StyleBar'
import { Transform } from './Transform'
import { Transition } from './Transition'
import { Typography } from './Typography'

export const STYLE_GROUPS = ['layout', 'position', 'size', 'spacing', 'typography', 'fill', 'border', 'effects', 'transform', 'transition'] as const

export interface StylePanelsProps {
  /** The classes being edited, at the layer being edited. */
  s: StyleApi
  /** The panels to show; all of them when left out. */
  groups?: readonly string[]
  /** Whether the element holds others: then it has a layout of its own. */
  container?: boolean
  /** What the element around it lays its children out as ("flex", "grid"), for the Stack Item or Grid Item panel. */
  parentDisplay?: string
  /** An image, a video or an embed: how it fits its box. */
  media?: boolean
  prose?: { on: boolean; onChange: (on: boolean) => void }
}

/**
 * The controls of the Design tab, for any list of classes: a block's, a site class's or an element's style.
 * Every CSS property an element can take, grouped like Framer's inspector, written as the classes people write.
 */
export function StylePanels({ s, groups = STYLE_GROUPS, container = true, parentDisplay, media, prose }: StylePanelsProps) {
  const has = (group: string) => groups.includes(group)
  return (
    <>
      {has('layout') && container && <Layout s={s} />}
      {parentDisplay && /flex|grid/.test(parentDisplay) && <InParent s={s} parentDisplay={parentDisplay} />}
      {has('position') && <Position s={s} />}
      {has('size') && <Size s={s} media={media} />}
      {has('spacing') && <Spacing s={s} />}
      {has('typography') && <Typography s={s} prose={prose} />}
      {has('fill') && <Fill s={s} />}
      {has('border') && <Border s={s} />}
      {has('effects') && <Effects s={s} />}
      {has('transform') && <Transform s={s} />}
      {has('transition') && <Transition s={s} />}
      {groups.length > 1 && <OtherStyles s={s} />}
    </>
  )
}

/** The Design tab: a block's classes, the layer of them being edited, and a control for everything they can set. */
export function DesignPanel({ node }: { node: BlockNode }) {
  const { types, store, readOnly } = useEditorContext()
  const styling = useStyling()
  const type = types.get(node.type)
  const s = useStyle(node)
  const state = useEditor(store, (st) => st.state)
  const parent = useEditor(store, (st) => tree.parentOf(st.nodes, node.id))
  const ancestors = useEditor(store, (st) => tree.ancestors(st.nodes, node.id))
  // What the parent lays its children out as, on every screen: its own display, or what its type is before any class.
  const parentDisplay = useMemo(() => {
    if (!parent) return undefined
    const own = styleApi(styling.engine, splitClasses(parent.class), s.screen, [], () => {}).value('display')
    return own ?? (parent.type === 'stack' || parent.type === 'columns' || parent.type === 'grid' ? 'flex' : undefined)
  }, [parent, styling.engine, s.screen])
  // Page Content without its own box lends its blocks to the layout around it: only what they inherit from it applies.
  const unwrapped = node.type === 'outlet' && !node.props?.wrap
  const groups = unwrapped ? ['typography'] : type?.styles?.length ? type.styles : STYLE_GROUPS

  if (node.type === 'component') {
    return <p className="m-0 p-4 text-xs text-muted">{t('Edit the component to change its shared design.')}</p>
  }

  return (
    <div>
      {/* A stylesheet Tailwind can't read leaves nothing to ask what a class does: the classes stay, the controls wait. */}
      {!styling.engine && !styling.loading && (
        <div className="border-b border-border px-4 py-3">
          <Notice tone="warning" title={t('The site’s stylesheet could not be read')} action={<Link to="/styling" className="shrink-0 text-xs text-text">{t('Open Styling')}</Link>} />
        </div>
      )}
      {/* Held at the top while the panels scroll under it: what the element wears and the state being styled stay in sight. */}
      <div className="sticky top-0 z-raised bg-surface">
        <StyleBar s={s} site={styling.classes} source={styling.source} disabled={readOnly} state={{ classes: s.classes, engine: styling.engine, state, onState: store.setStyleState, states: dataStates(node, ancestors) }} />
      </div>
      <StylePanels
        s={s}
        groups={groups}
        container={!!type?.children || node.type === 'repeat'}
        parentDisplay={unwrapped ? undefined : parentDisplay}
        media={['image', 'video', 'embed'].includes(node.type)}
        prose={type?.fields?.some((f) => f.handle === 'prose') ? { on: !!node.props?.prose, onChange: (on) => store.updateProps(node.id, { prose: on || undefined }, `inspector:${node.id}:prose`) } : undefined}
      />
    </div>
  )
}
