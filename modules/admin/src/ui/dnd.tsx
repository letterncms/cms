import { DndContext as Base, type Announcements, type DndContextProps, type Over } from '@dnd-kit/core'
import { t } from '@letterncms/sdk'

/** Where something is among its siblings, when it is dragged in a sortable list: "3 of 7". */
function place(over: Over | null): { position: number; total: number } | null {
  const sortable = over?.data.current?.sortable as { index?: number; items?: unknown[] } | undefined
  return sortable && typeof sortable.index === 'number' && Array.isArray(sortable.items) ? { position: sortable.index + 1, total: sortable.items.length } : null
}

/**
 * What a screen reader hears while something is dragged, in the admin's language. dnd-kit's own words are
 * English only and name items by their ids; these say what happened and, in a list, the position.
 */
export function dragAnnouncements(): Announcements {
  return {
    onDragStart: () => t('Picked up.'),
    onDragOver: ({ over }) => {
      const at = place(over)
      return at ? t('Position {position} of {total}.', at) : over ? t('Over a place to drop.') : t('Not over a place to drop.')
    },
    onDragEnd: ({ over }) => {
      const at = place(over)
      return at ? t('Dropped at position {position} of {total}.', at) : over ? t('Dropped.') : t('Dropped where it was.')
    },
    onDragCancel: () => t('Cancelled. It is back where it was.'),
  }
}

/** How to drag with the keyboard, read out when a handle gets the focus. */
export const dragInstructions = () => ({ draggable: t('Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel.') })

/**
 * dnd-kit's `DndContext`, speaking the admin's language. Every module gets this one through the shared
 * `@dnd-kit/core` (see entries/dnd-core.ts), so no drag in the admin announces itself in English.
 * What a caller passes in `accessibility` still wins.
 */
export function DndContext({ accessibility, ...props }: DndContextProps) {
  return <Base {...props} accessibility={{ announcements: dragAnnouncements(), screenReaderInstructions: dragInstructions(), ...accessibility }} />
}
