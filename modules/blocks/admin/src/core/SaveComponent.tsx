import { invalidate, plural, run, t } from '@letterncms/sdk'
import { Dialog, Fields, toast } from '@letterncms/ui'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { EditorStore } from './store'
import * as tree from './tree'
import { newId, type BlockNode } from './types'

/** Lowercase, dash-separated, valid as a component or pattern handle (^[a-z0-9][a-z0-9_-]{0,63}$). */
export function componentHandle(title: string, taken: Set<string>, fallback = 'component'): string {
  const base = title.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 56) || fallback
  let handle = base
  for (let i = 2; taken.has(handle); i++) handle = `${base}-${i}`
  return handle
}

/** The categories a pattern is usually filed under; any other words make one too. */
export const PATTERN_CATEGORIES = ['Heroes', 'Text', 'Media', 'Features', 'People', 'Lists', 'Calls to Action', 'Pages']

/** A dialog of its own, outside the editor's tree: it opens from menus that close as it does. */
function mount(render: (close: () => void) => React.ReactNode) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const root = createRoot(host)
  const close = () => setTimeout(() => { root.unmount(); host.remove() }, 250)
  root.render(render(close))
}

function selected(store: EditorStore): BlockNode[] {
  return store.selection().map((id) => tree.find(store.get().nodes, id)).filter((n): n is BlockNode => !!n)
}

/**
 * Make the selected blocks a component: the selection becomes a reference to it, so this page changes
 * with the component, as every other page that uses it does.
 */
export function saveComponent(store: EditorStore) {
  const nodes = selected(store)
  if (nodes.length === 0) return

  mount((unmount) => {
    function ComponentDialog() {
      const [open, setOpen] = useState(true)
      const [values, setValues] = useState({ title: '', category: '', description: '' })
      const [busy, setBusy] = useState(false)
      const close = () => { setOpen(false); unmount() }
      const save = async () => {
        const title = values.title.trim()
        if (!title) return
        setBusy(true)
        try {
          const existing = await run<{ handle: string }[]>('components/list')
          const handle = componentHandle(title, new Set(existing.map((p) => p.handle)))
          await run('components/save', { handle, title, description: values.description.trim(), category: values.category.trim() || undefined, blocks: nodes })
          invalidate('components/')
          store.replaceSelection([{ id: newId(), type: 'component', props: { ref: handle } }])
          toast.success(t('“{title}” is now a component', { title }))
          close()
        } catch (e) {
          toast.error(e)
          setBusy(false)
        }
      }
      return (
        <Dialog open={open} onOpenChange={(o) => !o && close()} size="sm" title={t('Make a Component')}
          description={plural(nodes.length, '{count} block, the same on every page', '{count} blocks, the same on every page')}
          onSubmit={() => void save()} submitLabel={t('Make Component')} submitDisabled={!values.title.trim()} busy={busy}>
          <Fields
            fields={[
              { handle: 'title', type: 'text', label: t('Name'), required: true, autofocus: true, max: 120, placeholder: t('Pricing Card') },
              { handle: 'category', type: 'text', label: t('Category'), max: 60, placeholder: t('Components') },
              { handle: 'description', type: 'text', label: t('Description'), max: 500, placeholder: t('When to Use It') },
            ]}
            values={values}
            onChange={(handle, v) => setValues((current) => ({ ...current, [handle]: v ?? '' }))}
          />
        </Dialog>
      )
    }
    return <ComponentDialog />
  })
}

/** Save a copy of the selected blocks as a pattern, to start from on any page. The page keeps its blocks as they are. */
export function savePattern(store: EditorStore) {
  const nodes = selected(store)
  if (nodes.length === 0) return

  mount((unmount) => {
    function PatternDialog() {
      const [open, setOpen] = useState(true)
      const [values, setValues] = useState({ title: '', category: '', description: '' })
      const [busy, setBusy] = useState(false)
      const close = () => { setOpen(false); unmount() }
      const save = async () => {
        const title = values.title.trim()
        if (!title) return
        setBusy(true)
        try {
          const existing = await run<{ handle: string }[]>('patterns/list', { working: true })
          const handle = componentHandle(title, new Set(existing.map((p) => p.handle)), 'pattern')
          await run('patterns/save', { handle, title, description: values.description.trim(), category: values.category.trim() || undefined, blocks: nodes })
          invalidate('patterns/')
          toast.success(t('Saved “{title}” as a pattern', { title }))
          close()
        } catch (e) {
          toast.error(e)
          setBusy(false)
        }
      }
      return (
        <Dialog open={open} onOpenChange={(o) => !o && close()} size="sm" title={t('Save as Pattern')}
          description={plural(nodes.length, '{count} block to start from on any page', '{count} blocks to start from on any page')}
          onSubmit={() => void save()} submitLabel={t('Save Pattern')} submitDisabled={!values.title.trim()} busy={busy}>
          <Fields
            fields={[
              { handle: 'title', type: 'text', label: t('Name'), required: true, autofocus: true, max: 120, placeholder: t('Hero With Photo') },
              { handle: 'category', type: 'text', label: t('Category'), max: 60, placeholder: t('Heroes'), suggestions: PATTERN_CATEGORIES },
              { handle: 'description', type: 'text', label: t('Description'), max: 500, placeholder: t('When to Use It') },
            ]}
            values={values}
            onChange={(handle, v) => setValues((current) => ({ ...current, [handle]: v ?? '' }))}
          />
        </Dialog>
      )
    }
    return <PatternDialog />
  })
}
