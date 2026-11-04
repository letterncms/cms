import { invalidate, Link, navigate, run, t } from '@letterncms/sdk'
import { Button, StatusDot, TableFrame, TableMeta, TableRow, cn, toast } from '@letterncms/ui'
import { useState } from 'react'
import { gridTemplate } from './EntriesTable'
import type { Column } from './listColumns'

export interface BuiltinPage {
  handle: string
  label: string
  path: string | null
  id: string | null
  status: 'standard' | 'draft' | 'customised' | 'conflict'
}

export interface BuiltinGroup {
  id: string
  label: string
  collection: string
  canCustomise: boolean
  pages: BuiltinPage[]
}

/**
 * The pages features bring with them (sign in, checkout), under the site's own pages and named after
 * what brought them, in the same columns as the pages above. They work as they are; Customize makes
 * one an entry like any page, which then opens like one.
 */
export function BuiltinPages({ groups, columns, urls, nested, tree }: { groups: BuiltinGroup[]; columns: Column[]; urls: string[]; nested?: boolean; tree?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null)
  const template = gridTemplate(columns, urls, nested, tree)

  const customize = async (group: BuiltinGroup, page: BuiltinPage) => {
    setBusy(`${group.id}/${page.handle}`)
    try {
      const { id } = await run<{ id: string }>('pages/customise', { group: group.id, handle: page.handle })
      invalidate('pages/builtin', 'entries/')
      navigate(`/content/${group.collection}/${id}`)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(null)
    }
  }

  const cell = (page: BuiltinPage, column: Column) => {
    if (column.id === 'uri') return page.path ? <span className="block truncate font-mono text-xs text-faint">{page.path}</span> : <span className="block truncate text-xs text-faint">{t('Shown inside other pages')}</span>
    if (column.id !== 'status') return null
    if (page.status === 'conflict') return <StatusDot status="warning" label={t('A page has this address')} className="whitespace-nowrap" />
    if (page.status === 'draft') return <StatusDot status="draft" />
    if (page.status === 'customised') return <StatusDot status="published" />
    // A standard page is live as it comes.
    return <StatusDot status="neutral" label={t('Standard')} />
  }

  return (
    <section className="mt-10" aria-label={t('Built-in Pages')}>
      <h2 className="m-0 mb-3 text-sm font-semibold text-ink">{t('Built-in Pages')}</h2>
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <div className="cms-label mb-1.5">{group.label}</div>
            <TableFrame template={template} label={group.label}>
              {group.pages.map((page) => {
                const key = `${group.id}/${page.handle}`
                return (
                  <TableRow key={page.handle} className={cn(busy === key && 'opacity-60')}>
                    {nested && <span role="none" className="max-sm:hidden" />}
                    <div role="cell" className="flex min-w-0 items-center max-sm:flex-1">
                      {page.id ? (
                        <Link to={`/content/${group.collection}/${page.id}`} className="min-w-0 truncate text-sm font-medium text-text no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus">{page.label}</Link>
                      ) : (
                        <span className="min-w-0 truncate text-sm font-medium text-text">{page.label}</span>
                      )}
                    </div>
                    <TableMeta>
                      {columns.map((column) => <div key={column.id} role="cell" className="flex min-w-0 items-center overflow-visible">{cell(page, column)}</div>)}
                    </TableMeta>
                    {/* Always in view: it is what a built-in page offers. */}
                    <div role="cell" className="relative z-10 flex min-w-0 items-center justify-end [&>*]:shrink-0">
                      {!page.id && page.status === 'standard' && group.canCustomise && (
                        <Button size="xs" variant="ghost" loading={busy === key} disabled={busy !== null} onClick={() => void customize(group, page)}>{t('Customize')}</Button>
                      )}
                    </div>
                  </TableRow>
                )
              })}
            </TableFrame>
          </div>
        ))}
      </div>
    </section>
  )
}
