import { t, useAbility } from '@letterncms/sdk'
import { Dialog, Pressable } from '@letterncms/ui'
import type { PatternDef } from './Inserter'
import { PatternPreview } from './PatternPreview'

/** The category of patterns a new page can start from (Patterns::PAGES). */
export const PAGE_PATTERNS = 'Pages'

/** Whether there are whole pages to start from. */
export function usePagePatterns(enabled: boolean): PatternDef[] {
  const list = useAbility<PatternDef[]>('patterns/list', { category: PAGE_PATTERNS }, { enabled, staleTime: 60_000 })
  return enabled ? list.data ?? [] : []
}

/** An empty page's choice of a whole page to start from: a copy of its blocks, to change from there. Blank is what it already is. */
export function StartFromPattern({ open, onOpenChange, patterns, onChoose }: { open: boolean; onOpenChange: (open: boolean) => void; patterns: PatternDef[]; onChoose: (pattern: PatternDef) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" title={t('Start From a Pattern')}>
      <div className="grid gap-4 sm:grid-cols-2">
        {patterns.map((pattern) => (
          <Pressable key={pattern.handle} onClick={() => onChoose(pattern)} className="block min-w-0 rounded-md p-1 text-left hover:bg-hover">
            <PatternPreview handle={pattern.handle} maxHeight={280} />
            <span className="mt-2 block truncate text-sm font-medium text-text">{pattern.title}</span>
            {pattern.description && <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{pattern.description}</span>}
          </Pressable>
        ))}
      </div>
    </Dialog>
  )
}
