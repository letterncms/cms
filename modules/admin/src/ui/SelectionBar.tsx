import { t } from '@letterncms/sdk'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'

/** Floats over the list while entries are selected, so nothing below moves: centered on the screen's own pane, not the window. */
export function SelectionBar({ count, children, onClear }: { count: number; children: ReactNode; onClear: () => void }) {
  const [last, setLast] = useState(count)
  const bar = useRef<HTMLDivElement>(null)
  const [pane, setPane] = useState<{ center: number; width: number } | null>(null)
  useEffect(() => {
    if (count > 0) setLast(count)
  }, [count])
  const open = count > 0

  useLayoutEffect(() => {
    const host = bar.current?.closest<HTMLElement>('[data-cms-screen]')
    if (!host) return
    const measure = () => { const rect = host.getBoundingClientRect(); setPane({ center: rect.left + rect.width / 2, width: rect.width }) }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    window.addEventListener('resize', measure)
    return () => { observer.disconnect(); window.removeEventListener('resize', measure) }
  }, [])

  return (
    <div
      ref={bar}
      role="toolbar"
      aria-label={t('Selection')}
      inert={!open}
      style={pane ? { left: pane.center, maxWidth: pane.width - 32 } : undefined}
      // A float at the bottom of the sheet, the shape of the save bar: what's selected, what to do with it, and a way out.
      className={cn(
        'fixed bottom-4 left-1/2 z-bar flex min-h-11 max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 gap-y-1 rounded-lg border border-border-float bg-float py-1.5 pl-4 pr-1.5 text-sm text-text shadow-pop transition-[opacity,translate] duration-move ease-out max-sm:bottom-[calc(8px+env(safe-area-inset-bottom))]',
        open ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0 duration-base',
      )}
    >
      <span className="mr-2 whitespace-nowrap font-medium tabular-nums text-ink">{t('{count} selected', { count: last })}</span>
      <span aria-hidden="true" className="mr-1 h-4 w-px bg-border" />
      {children}
      <IconButton icon="close" label={t('Clear Selection')} size="sm" className="ml-0.5" onClick={onClear} />
    </div>
  )
}
