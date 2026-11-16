import { t } from '@letterncms/sdk'
import { Icon, IconButton, Pressable, cn } from '@letterncms/ui'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { describe, type DocId } from './documents'

/* The files open above the editor, one tab each, as code editors have them: the one on view joined to the editor, a
   dot on what has unsaved changes, and a way to close each (a middle click too). A tab closed keeps its changes:
   Save or Discard still have them. */

export function EditorTabs({ tabs, active, dirty, onSelect, onClose }: { tabs: DocId[]; active: DocId | null; dirty: (id: DocId) => boolean; onSelect: (id: DocId) => void; onClose: (id: DocId) => void }) {
  const strip = useRef<HTMLDivElement>(null)
  // The tab on view is in view, however many are open.
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active, tabs.length])

  // Left and right move between tabs, as in any tab list.
  const move = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    const to = tabs[(index + step + tabs.length) % tabs.length]
    onSelect(to)
    requestAnimationFrame(() => strip.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(to)}"]`)?.focus())
  }

  return (
    <div ref={strip} role="tablist" aria-label={t('Open Files')} className="flex h-9 shrink-0 overflow-x-auto overflow-y-hidden border-b border-border bg-sunken">
      {tabs.map((id, index) => {
        const doc = describe(id)
        const on = id === active
        const changed = dirty(id)
        return (
          <div key={id} className={cn('cms-reveal-row group/tab relative flex shrink-0 items-center border-r border-border', on ? '-mb-px bg-bg text-ink' : 'text-muted hover:text-text')}>
            <Pressable
              compact
              role="tab"
              data-tab={id}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => onSelect(id)}
              onAuxClick={(event) => { if (event.button === 1) { event.preventDefault(); onClose(id) } }}
              onKeyDown={(event) => move(event, index)}
              className="flex h-full items-center gap-1.5 pl-3 pr-1 text-xs -outline-offset-2"
            >
              <Icon name={doc.icon} size={14} className="shrink-0 text-faint" />
              <span className="whitespace-nowrap">{doc.title}</span>
            </Pressable>
            {/* A dot while it has changes, the close button in its place when pointed at; without changes the tab on view always shows its close button. */}
            <span className="relative mr-1 size-6">
              {changed && <span role="img" aria-label={t('Unsaved changes')} className="absolute inset-0 m-auto size-2 rounded-full bg-focus group-focus-within/tab:hidden group-hover/tab:hidden" />}
              <span className={cn('absolute inset-0', changed ? 'hidden group-focus-within/tab:block group-hover/tab:block' : !on && 'cms-reveal')}>
                <IconButton icon="close" size="xs" label={t('Close {name}', { name: doc.title })} onClick={() => onClose(id)} />
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
