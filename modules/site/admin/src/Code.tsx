import { CmsError, can, invalidate, run, t, useAbility } from '@letterncms/sdk'
import { Fields, Notice, Page, QueryError, SaveBar, Spinner } from '@letterncms/ui'
import { Stylesheet, balanced } from '@letterncms/blocks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CodeFiles } from './code-files'
import { Group } from './parts'

/* The site's own code, for whoever writes it: CSS no section of Styling shows, the JavaScript on every page, and
   the scripts, stylesheets and libraries blocks load by name. Styling is the design; this is what a developer adds. */

interface Info {
  css: string
  js: string
}

interface Draft {
  css?: string
  js?: string
  files: Record<string, string>
}

const EMPTY: Draft = { files: {} }

/**
 * The site's own CSS: what the stylesheet holds that no section of Styling shows (a variable of another kind, a rule
 * of another selector, a variant of its own, plain CSS). What is typed is the draft once its braces close.
 */
function CustomCss({ css, onChange, disabled }: { css: string; onChange: (css: string) => void; disabled: boolean }) {
  const sheet = useMemo(() => new Stylesheet(css), [css])
  const written = useMemo(() => sheet.extra(), [sheet])
  const [text, setText] = useState(written)
  // Written elsewhere (Discard, Save): the field follows, unless it holds what is being typed.
  const typed = useRef(written)
  useEffect(() => {
    if (written !== typed.current) {
      typed.current = written
      setText(written)
    }
  }, [written])
  return (
    <Group title={t('CSS')}>
      <div className="pt-2">
        <Fields
          bare
          fields={[{ handle: 'css', type: 'code', label: t('CSS'), rows: 16, language: 'tailwind', placeholder: '.hero-title { text-wrap: balance; }' }]}
          values={{ css: text }}
          disabled={disabled}
          onChange={(_, value) => {
            const next = String(value ?? '')
            setText(next)
            if (!balanced(next)) return
            // What the stylesheet will say it holds: the field keeps what was typed while they agree.
            const written = sheet.setExtra(next)
            typed.current = written.extra()
            onChange(written.css)
          }}
        />
      </div>
    </Group>
  )
}

export default function Code() {
  const info = useAbility<Info>('styling/get', {}, { refetchOnWindowFocus: false, retry: false })
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<{ message: string; refused: boolean } | null>(null)
  const base = info.data
  const dirty = !!base && ((draft.css !== undefined && draft.css !== base.css) || (draft.js !== undefined && draft.js !== base.js) || Object.keys(draft.files).length > 0)

  if (info.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!base) return <Page crumbs={[{ label: t('Code'), icon: 'code' }]}><QueryError title={t('Couldn’t load the code')} onRetry={() => void info.refetch()} retrying={info.isRefetching} /></Page>

  const save = async () => {
    if (!dirty || busy) return
    setBusy(true)
    setFailed(null)
    try {
      if (draft.css !== undefined && draft.css !== base.css) await run('styling/update', { css: draft.css })
      if (draft.js !== undefined && draft.js !== base.js) await run('styling-code/set-custom', { js: draft.js })
      for (const [path, contents] of Object.entries(draft.files)) await run('styling-code/save', { path, contents })
      await info.refetch()
      invalidate('styling/', 'styling-code/')
      setDraft(EMPTY)
    } catch (e) {
      // What Tailwind refuses is the CSS's to correct: its own words, and the draft stays.
      setFailed({ message: e instanceof Error ? e.message : String(e), refused: e instanceof CmsError && e.type === 'invalid_input' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page crumbs={[{ label: t('Code'), icon: 'code' }]} width="narrow">
      <SaveBar dirty={dirty} saving={busy} error={failed ? (failed.refused ? t('The CSS was not saved') : failed.message) : null} onSave={() => void save()} onDiscard={() => { setDraft(EMPTY); setFailed(null) }} />
      <div>
        {failed?.refused && <Notice tone="danger" className="mb-3" title={t('Tailwind refused the CSS')} onDismiss={() => setFailed(null)}>{failed.message}</Notice>}
        <CustomCss css={draft.css ?? base.css} disabled={!can('settings.manage')} onChange={(css) => setDraft((d) => ({ ...d, css }))} />
        <CodeFiles
          js={draft.js ?? base.js}
          onJs={(js) => setDraft((d) => ({ ...d, js }))}
          edits={draft.files}
          onEdit={(path, contents) => setDraft((d) => ({ ...d, files: contents === null ? Object.fromEntries(Object.entries(d.files).filter(([key]) => key !== path)) : { ...d.files, [path]: contents } }))}
        />
      </div>
    </Page>
  )
}
