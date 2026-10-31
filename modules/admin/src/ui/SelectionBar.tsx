import { t } from '@letterncms/sdk'
import { useEffect, useState, type ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'

/** Floats over the list while entries are selected, so nothing below moves. */
export function SelectionBar({ count, children, onClear }: { count: number; children: ReactNode; onClear: () => void }) {
  const [last, setLast] = useState(count)
  useEffect(() => {
    if (count > 0) setLast(count)
  }, [count])
  const open = count > 0

  return (
    <div
      role="toolbar"
      aria-label={t('Selection')}
      inert={!open}
      className={cn(
        '[&_button]:!text-ink-contrast/90 [&_button:hover]:!bg-ink-contrast/10',
        'fixed bottom-6 left-1/2 z-30 flex min-h-10 max-w-[calc(100vw-2rem)] flex-wrap justify-center gap-y-1 py-1 -translate-x-1/2 items-center gap-1 rounded-md bg-ink pl-3.5 pr-1.5 text-sm text-ink-contrast shadow-pop transition-[opacity,translate] duration-180 ease-out',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      <span className="mr-2 font-medium tabular-nums">{t('{count} selected', { count: last })}</span>
      <span className="mr-1 h-4 w-px bg-ink-contrast/15" />
      {children}
      <IconButton icon="close" label={t('Clear Selection')} size="xs" className="ml-1 !text-ink-contrast/70 hover:!bg-ink-contrast/10 hover:!text-ink-contrast" onClick={onClear} />
    </div>
  )
}
