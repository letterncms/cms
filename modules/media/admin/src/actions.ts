import { invalidate, locale, plural, run, t } from '@letterncms/sdk'
import { confirm, toast } from '@letterncms/ui'
import type { MediaItem } from './upload'

/** What uses a file: an entry (with its collection, where it opens), a global set or the design. */
export interface MediaUse { kind: string; id: string; title: string; collection: string | null; locale: string | null }

/** Where something that uses a file opens, when it has a screen of its own. */
export const useHref = (use: MediaUse) => use.kind === 'entry' && use.collection ? `/content/${use.collection}/${use.id}` : use.kind === 'global' ? `/globals/${use.id}` : undefined

/** "Home, About and Contact", or the first three and how many more. */
function names(all: string[]): string {
  const unique = [...new Set(all)]
  const shown = unique.slice(0, 3)
  const list = new Intl.ListFormat(locale(), { type: unique.length > 3 ? 'unit' : 'conjunction' }).format(shown)
  return unique.length > 3 ? t('{names} and {count} more', { names: list, count: unique.length - 3 }) : list
}

/**
 * Delete files after asking, saying what still uses them: by name for one file, as a count for several.
 * Resolves with the ids that are gone.
 */
export async function deleteFiles(files: Pick<MediaItem, 'id' | 'name'>[]): Promise<string[]> {
  if (!files.length) return []
  let description: string | undefined
  try {
    if (files.length === 1) {
      const { usedBy } = await run<{ usedBy: MediaUse[] }>('media/get', { id: files[0].id })
      if (usedBy.length) description = t('It is used in {where} and will be missing there.', { where: names(usedBy.map((use) => use.title)) })
    } else {
      const { unused } = await run<{ unused: string[] }>('media/report')
      const used = files.filter((file) => !unused.includes(file.id)).length
      if (used) description = plural(used, '{count} of them is in use and will be missing there.', '{count} of them are in use and will be missing there.')
    }
  } catch (error) {
    toast.error(error)
    return []
  }
  const title = files.length === 1 ? t('Delete “{name}”?', { name: files[0].name }) : plural(files.length, 'Delete {count} file?', 'Delete {count} files?')
  if (!await confirm({ title, description, confirm: t('Delete'), danger: true })) return []
  // Asked with what uses them in view: the answer stands for those too.
  const results = await Promise.allSettled(files.map((file) => run('media/delete', { id: file.id, force: true })))
  const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
  if (failure) toast.error(failure.reason)
  invalidate('media/')
  return files.filter((_, i) => results[i].status === 'fulfilled').map((file) => file.id)
}
