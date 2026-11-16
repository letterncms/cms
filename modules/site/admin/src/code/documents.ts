import { CmsError, invalidate, run, t } from '@letterncms/sdk'
import { Stylesheet, balanced } from '@letterncms/blocks'
import { formatCode } from '@letterncms/ui'
import { useMemo, useState } from 'react'

/* What the Code screen edits, as documents: the site's own CSS and JavaScript, its scripts and stylesheets by path,
   and the libraries scripts import (read, not written). Each has what was saved and, once typed in, a draft; Save
   formats every draft and writes them together. */

export interface Info {
  css: string
  js: string
}

export interface Files {
  scripts: string[]
  styles: string[]
}

export interface Library {
  import: string
  package: string
  version: string
}

/** A document by its id: `css`, `js`, a file's path (`scripts/hero.js`), or a library (`library:gsap`). */
export type DocId = string

export const EXT = { scripts: 'js', styles: 'css' } as const
export type Kind = keyof typeof EXT

/** What a new file starts as: a script is a module a block can name as its behaviour. */
export const STARTER = { scripts: 'export function mount(el, props) {\n}\n', styles: '\n' }

export interface DocInfo {
  id: DocId
  title: string
  icon: string
  /** The editor's language; none for a library, which isn't written here. */
  language?: 'tailwind' | 'javascript' | 'css'
  library?: string
}

export const isFile = (id: DocId) => /^(scripts|styles)\//.test(id)

export function describe(id: DocId): DocInfo {
  if (id === 'css') return { id, title: t('Site CSS'), icon: 'braces', language: 'tailwind' }
  if (id === 'js') return { id, title: t('Site JavaScript'), icon: 'braces', language: 'javascript' }
  if (id.startsWith('library:')) return { id, title: id.slice(8), icon: 'box', library: id.slice(8) }
  return { id, title: id.split('/').pop() ?? id, icon: 'file', language: id.endsWith('.css') ? 'css' : 'javascript' }
}

/** What a language is called where the cursor's line is told. */
export const languageName = (language: DocInfo['language']) => (language === 'tailwind' ? t('Tailwind CSS') : language === 'css' ? 'CSS' : language === 'javascript' ? 'JavaScript' : '')

export interface SaveProblem {
  message: string
  /** Tailwind refused the CSS: its own words, for the CSS to be corrected. */
  refused: boolean
}

/**
 * The documents' drafts and what they were saved as. A file's saved contents arrive when its editor loads it
 * (`loaded`); the site's CSS and JavaScript come with `info`.
 */
export function useDocuments(info: Info | undefined, refetch: () => Promise<unknown>) {
  const [drafts, setDrafts] = useState<Record<DocId, string>>({})
  const [saved, setSaved] = useState<Record<DocId, string>>({})
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<SaveProblem | null>(null)

  // The site's CSS here is what its stylesheet holds that no section of the design shows: the rest is the design's.
  const extra = useMemo(() => (info ? new Stylesheet(info.css).extra() : undefined), [info?.css])
  const base = (id: DocId): string | undefined => (id === 'css' ? extra : id === 'js' ? info?.js : saved[id])
  const text = (id: DocId): string | undefined => drafts[id] ?? base(id)
  const isDirty = (id: DocId) => drafts[id] !== undefined && drafts[id] !== base(id)
  const dirtyIds = Object.keys(drafts).filter(isDirty)

  const edit = (id: DocId, contents: string) => setDrafts((all) => ({ ...all, [id]: contents }))
  const loaded = (id: DocId, contents: string) => setSaved((all) => (all[id] === contents ? all : { ...all, [id]: contents }))
  const forget = (id: DocId) => {
    setDrafts(({ [id]: _, ...rest }) => rest)
    setSaved(({ [id]: _, ...rest }) => rest)
  }
  const discard = () => {
    setDrafts({})
    setProblem(null)
  }

  /** A document's draft, formatted; what Prettier can't read stays as it is, and says where. */
  const format = async (id: DocId): Promise<{ text: string; mistake?: { message: string; line?: number; column?: number } }> => {
    const current = text(id) ?? ''
    try {
      return { text: await formatCode(current, describe(id).language) }
    } catch (error) {
      const message = error instanceof Error ? error.message.split('\n')[0] : String(error)
      const at = message.match(/\((\d+):(\d+)\)/)
      return { text: current, mistake: { message: message.replace(/\s*\(\d+:\d+\)\s*$/, ''), line: at ? Number(at[1]) : undefined, column: at ? Number(at[2]) : undefined } }
    }
  }

  /**
   * Every draft formatted, then written: the site's CSS, its JavaScript, then each file. What could not be formatted
   * is saved as written, and returned, so the screen can say where.
   */
  const save = async (): Promise<{ id: DocId; message: string; line?: number; column?: number }[] | null> => {
    if (!info || saving || dirtyIds.length === 0) return null
    setSaving(true)
    setProblem(null)
    const mistakes: { id: DocId; message: string; line?: number; column?: number }[] = []
    const written: Record<DocId, string> = {}
    for (const id of dirtyIds) {
      const result = await format(id)
      written[id] = result.text
      if (result.mistake) mistakes.push({ id, ...result.mistake })
    }
    // The formatted text is the draft from here: what failed to save is shown as it will be saved.
    setDrafts((all) => ({ ...all, ...written }))
    try {
      if (written.css !== undefined) {
        if (!balanced(written.css)) throw new CmsError(t('A brace in the site’s CSS is never closed.'), 'invalid_input')
        await run('styling/update', { css: new Stylesheet(info.css).setExtra(written.css).css })
      }
      if (written.js !== undefined) await run('styling-code/set-custom', { js: written.js })
      for (const [id, contents] of Object.entries(written)) if (isFile(id)) await run('styling-code/save', { path: id, contents })
      await refetch()
      invalidate('styling/', 'styling-code/')
      setSaved((all) => ({ ...all, ...Object.fromEntries(Object.entries(written).filter(([id]) => isFile(id))) }))
      setDrafts((all) => Object.fromEntries(Object.entries(all).filter(([id]) => !(id in written))))
      return mistakes
    } catch (error) {
      setProblem({ message: error instanceof Error ? error.message : String(error), refused: error instanceof CmsError && error.type === 'invalid_input' })
      return null
    } finally {
      setSaving(false)
    }
  }

  return { text, base, isDirty, dirtyIds, edit, loaded, forget, discard, format, save, saving, problem, clearProblem: () => setProblem(null) }
}

export type Documents = ReturnType<typeof useDocuments>
