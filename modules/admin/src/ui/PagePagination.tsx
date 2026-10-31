import { t } from '@letterncms/sdk'
import { IconButton } from './Button'

export function PagePagination({ page, pages, total, perPage, onPage }: { page: number; pages: number; total?: number; perPage?: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null
  return <nav aria-label={t('Pagination')} className="mt-3 flex items-center justify-end gap-1 text-xs text-muted">
    <span className="mr-2 tabular-nums">{total !== undefined && perPage ? t('{from}–{to} of {total}', { from: (page - 1) * perPage + 1, to: Math.min(total, page * perPage), total }) : t('Page {page} of {pages}', { page, pages })}</span>
    <IconButton icon="chevron-left" label={t('Previous Page')} size="xs" disabled={page <= 1} onClick={() => onPage(page - 1)} />
    <IconButton icon="chevron-right" label={t('Next Page')} size="xs" disabled={page >= pages} onClick={() => onPage(page + 1)} />
  </nav>
}
