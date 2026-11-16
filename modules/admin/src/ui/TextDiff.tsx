import { t } from '@letterncms/sdk'
import { cn } from './cn'
import { diffLines, type Line } from './lineDiff'

/** Lines shown around each change, as a code review has them. */
const CONTEXT = 3

/**
 * Two versions of a text, line by line, as a code review shows them: what restoring takes away struck in red, what
 * it brings in green, a few lines around each change, and the lines between changes folded away.
 */
export function TextDiff({ now, then, className }: { now: string; then: string; className?: string }) {
  const lines = diffLines(now.replace(/\s+$/, ''), then.replace(/\s+$/, ''))
  const near = new Set<number>()
  lines.forEach((line, index) => {
    if (line.kind === 'same') return
    for (let k = Math.max(0, index - CONTEXT); k <= Math.min(lines.length - 1, index + CONTEXT); k++) near.add(k)
  })
  const rows: ({ line: Line; index: number } | { folded: number })[] = []
  let folded = 0
  lines.forEach((line, index) => {
    if (near.has(index)) {
      if (folded) rows.push({ folded })
      folded = 0
      rows.push({ line, index })
    } else folded++
  })
  if (folded && rows.length) rows.push({ folded })
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <div className="flex gap-4 border-b border-border bg-sunken px-3 py-2 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-xs bg-danger" />{t('Current')}</span>
        <span className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-xs bg-success" />{t('This Version')}</span>
      </div>
      <div role="table" aria-label={t('Changes')} className="max-h-[60vh] overflow-auto font-mono text-xs leading-5">
        {rows.map((row, k) => 'folded' in row ? (
          <div key={`f${k}`} role="row" className="border-y border-border/60 bg-sunken px-3 py-0.5 text-faint">
            <span role="cell">{row.folded === 1 ? t('1 unchanged line') : t('{count} unchanged lines', { count: row.folded })}</span>
          </div>
        ) : (
            <div key={row.index} role="row" className={cn('grid grid-cols-[3rem_3rem_1.25rem_minmax(0,1fr)]', row.line.kind === 'del' ? 'bg-danger-soft' : row.line.kind === 'add' ? 'bg-success-soft' : '')}>
              <span role="cell" className="select-none pr-2 text-right text-faint">{row.line.a ?? ''}</span>
              <span role="cell" className="select-none pr-2 text-right text-faint">{row.line.b ?? ''}</span>
              <span role="cell" aria-label={row.line.kind === 'del' ? t('Taken away') : row.line.kind === 'add' ? t('Brought back') : undefined} className={cn('select-none', row.line.kind === 'del' ? 'text-danger' : 'text-success')}>{row.line.kind === 'del' ? '−' : row.line.kind === 'add' ? '+' : ''}</span>
              <span role="cell" className="whitespace-pre-wrap break-all pr-3 text-text">{row.line.text || ' '}</span>
            </div>
        ))}
      </div>
    </div>
  )
}
