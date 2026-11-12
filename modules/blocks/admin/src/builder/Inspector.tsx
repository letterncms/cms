import { can, t } from '@letterncms/sdk'
import { Button, IconButton, Menu, PanelHeader, Tabs, copyText } from '@letterncms/ui'
import { Fragment, useId, useLayoutEffect, useRef, useState } from 'react'
import { blockName, useComponentTitles, useEditorContext } from '../core/context'
import { saveComponent } from '../core/SaveComponent'
import type { BlockNode } from '../core/types'
import { componentFits } from '../core/insert'
import { ContentPanel } from './content/ContentPanel'
import { DesignPanel } from './design/DesignPanel'
import { LogicPanel } from './logic/LogicPanel'
import { MotionPanel } from './motion/MotionPanel'
import { PanelFields } from './controls'

const tabIds = ['content', 'design', 'interact'] as const
type Tab = typeof tabIds[number]
const tabKey = 'cms.block.tab'

/** Where the inspector was scrolled to: a section and how far its top sat from the panel's top. */
interface Anchor {
  section?: string
  offset: number
  scrollTop: number
}

function anchorOf(panel: HTMLElement): Anchor | null {
  if (!panel.scrollTop) return null
  const top = panel.getBoundingClientRect().top
  const section = [...panel.querySelectorAll<HTMLElement>('[data-section]')].find((el) => el.getBoundingClientRect().bottom > top)
  return { section: section?.dataset.section, offset: section ? section.getBoundingClientRect().top - top : 0, scrollTop: panel.scrollTop }
}

/** Brings the anchored section back to the same place, or the same scroll when the block has no such section. */
function restore(panel: HTMLElement, anchor: Anchor) {
  const section = anchor.section && panel.querySelector(`[data-section="${CSS.escape(anchor.section)}"]`)
  if (section) panel.scrollTop += section.getBoundingClientRect().top - panel.getBoundingClientRect().top - anchor.offset
  else panel.scrollTop = anchor.scrollTop
}

function initialTab(): Tab {
  try {
    const saved = sessionStorage.getItem(tabKey)
    return tabIds.find((id) => id === saved) ?? 'content'
  } catch { return 'content' }
}

/** Shared block inspector: content first, with design and interactions available in the same frame. */
export function Inspector({ node, onBack, backLabel, onClose }: { node: BlockNode; onBack?: () => void; backLabel?: string; onClose?: () => void }) {
  const { store, types, allowed, readOnly } = useEditorContext()
  const type = types.get(node.type)
  const components = useComponentTitles()
  const [tab, setTab] = useState<Tab>(initialTab)
  const tabsId = `block-inspector-${useId()}`
  const [renaming, setRenaming] = useState(false)
  // The panels remount per block (see below). Blocks show different sections, so keep the
  // section in view where it was rather than the pixel offset. The old panels are measured
  // while rendering the new block, the last moment they are still on screen.
  const panel = useRef<HTMLFieldSetElement>(null)
  const shown = useRef(node.id)
  const anchor = useRef<Anchor | null>(null)
  if (shown.current !== node.id) {
    shown.current = node.id
    anchor.current = panel.current && anchorOf(panel.current)
  }
  useLayoutEffect(() => {
    if (panel.current && anchor.current) restore(panel.current, anchor.current)
    anchor.current = null
  }, [node.id])
  const choose = (next: Tab) => {
    try { sessionStorage.setItem(tabKey, next) } catch { /* Optional preference. */ }
    setTab(next)
  }
  const component = !readOnly && node.type !== 'component' && can('entries.components.create')

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col" data-blocks-inspector>
      {/* The first row lines up with the sheet's top bar: the way back, what is selected, and what to do with it. */}
      <PanelHeader bordered={false} onBack={onBack} backLabel={backLabel} onClose={onClose} icon={node.type === 'component' ? 'symbol' : type?.icon ?? 'square'} actions={
        <Menu
          align="end"
          trigger={<IconButton icon="more" label={t('Block Actions')} size="sm" />}
          items={[
            { label: t('Rename'), icon: 'edit', disabled: readOnly, onSelect: () => setRenaming(true) },
            { label: t('Duplicate'), icon: 'copy', shortcut: 'mod+d', disabled: readOnly, onSelect: () => store.duplicate(node.id) },
            component && {
              label: t('Make a Component'),
              icon: 'symbol',
              onSelect: () => {
                if (!store.selection().includes(node.id)) store.select(node.id)
                saveComponent(store, componentFits(store, types, allowed))
              },
            },
            // What scripts, animations and "Scroll To" know the block by.
            { label: t('Copy ID'), icon: 'hash', onSelect: () => void copyText(node.id, { copied: t('Copied {reference}', { reference: node.id }) }) },
            { separator: true, label: '' },
            { label: t('Delete'), icon: 'trash', shortcut: '⌫', danger: true, disabled: readOnly, onSelect: () => store.remove(node.id) },
          ]}
        />
      }>
        {renaming ? (
          <div className="min-w-0 flex-1 pl-1" onBlur={() => setRenaming(false)} onKeyUp={(e) => e.key === 'Escape' && (e.target as HTMLElement).blur()}>
            <PanelFields
              bare
              fields={[{ handle: 'label', type: 'text', size: 'sm', commit: 'blur', label: t('Name'), autofocus: true, placeholder: type?.title }]}
              values={{ label: node.label ?? '' }}
              onChange={(_, v: string) => store.updateNode(node.id, { label: v.trim() || undefined })}
            />
          </div>
        ) : (
          <Button variant="ghost" onDoubleClick={() => !readOnly && setRenaming(true)} className="min-w-0 flex-1 shrink !justify-start !bg-transparent !pl-1 !pr-0 text-left !font-medium !text-ink" title={readOnly ? undefined : t('Double-Click to Rename')}>
            <span className="truncate">{blockName(node, types, components)}</span>
          </Button>
        )}
      </PanelHeader>
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border pl-4 pr-3">
        <Tabs<Tab>
          id={tabsId}
          value={tab}
          onChange={choose}
          bordered={false}
          size="sm"
          className="h-full min-w-0 flex-1"
          tabs={tabIds.map((id) => ({ value: id, label: { content: t('Content'), design: t('Design'), interact: t('Interact') }[id] }))}
        />
      </div>
      <fieldset ref={panel} role="tabpanel" id={`${tabsId}-${tab}-panel`} aria-labelledby={`${tabsId}-${tab}`} disabled={readOnly} className="m-0 min-h-0 min-w-0 flex-1 overflow-y-auto border-0 p-0">
        {/* Keyed by block so panel state (chosen border side, open rows, drafts) starts fresh per selection. */}
        <Fragment key={node.id}>
          {tab === 'design' && <DesignPanel node={node} />}
          {tab === 'content' && <ContentPanel node={node} />}
          {tab === 'interact' && (
            <>
              <MotionPanel node={node} />
              <LogicPanel node={node} />
            </>
          )}
        </Fragment>
      </fieldset>
    </div>
  )
}
