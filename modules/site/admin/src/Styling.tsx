import { CmsError, can, invalidate, run, setQuery, t, useAbility, useLocation } from '@letterncms/sdk'
import { Button, Fields, IconButton, Notice, QueryError, SaveBar, ScreenSidebar, Segmented, SidebarRow, Spinner, Tooltip, Topbar, cn, confirm, prompt, toast, useScreenSidebar, useTheme } from '@letterncms/ui'
import { Stylesheet, StylingProvider, balanced, loadTailwindTheme, themeDefaults, useStyling, type StylingSource } from '@letterncms/blocks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CodeFiles } from './code-files'
import { Group, type Editing } from './parts'
import { SitePreview, WIDTHS, useDraftCompile, type Viewport } from './preview'
import { Buttons, SavedStyles, Text } from './rules'
import { Colors, Effects, Layout, Motion, Shape, Typography, type Face, type FontTools, type Transition } from './theme'

/** What `styling/get` says: the stylesheet, the settings beside it and the published CSS. */
interface Info {
  css: string
  fonts: Face[]
  transition: Transition
  js: string
  stylesheet: string
}

/**
 * What Save writes. One draft: the stylesheet's text, which every control rewrites where the value stands
 * (so comments and hand-written CSS stay), the page transition, custom.js and the scripts and styles typed here.
 * A part that was not changed is not in it.
 */
interface Draft {
  css?: string
  transition?: Transition
  js?: string
  files: Record<string, string>
}

const EMPTY: Draft = { files: {} }

const SECTIONS = ['colors', 'typography', 'layout', 'shape', 'effects', 'motion', 'text', 'buttons', 'styles', 'code'] as const
type SectionKey = (typeof SECTIONS)[number]

function sections(): { group: string; items: { value: SectionKey; label: string; icon: string }[] }[] {
  return [
    {
      group: t('Theme'),
      items: [
        { value: 'colors', label: t('Colors'), icon: 'palette' },
        { value: 'typography', label: t('Typography'), icon: 'typography' },
        { value: 'layout', label: t('Layout'), icon: 'ruler' },
        { value: 'shape', label: t('Shape'), icon: 'radius' },
        { value: 'effects', label: t('Effects'), icon: 'shadow' },
        { value: 'motion', label: t('Motion'), icon: 'speed' },
      ],
    },
    {
      group: t('Styles'),
      items: [
        { value: 'text', label: t('Text'), icon: 'paragraph' },
        { value: 'buttons', label: t('Buttons'), icon: 'button' },
        { value: 'styles', label: t('Saved Styles'), icon: 'symbol' },
        { value: 'code', label: t('Custom Code'), icon: 'code' },
      ],
    },
  ]
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/**
 * The site's styling: its Tailwind stylesheet as its theme (every value of Tailwind's and the site's own), its
 * text, its buttons and its other styles, with the real site beside it. Every edit rewrites the draft stylesheet
 * and shows on the page at once (Tailwind compiles the draft here); Save writes it to content/styling, and the
 * server compiles the site's CSS.
 */
export default function Styling() {
  const info = useAbility<Info>('styling/get', {}, { refetchOnWindowFocus: false, retry: false })
  const source = useAbility<StylingSource>('styling/source', {}, { refetchOnWindowFocus: false, retry: false, staleTime: 60_000 })
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const { query } = useLocation()
  // A style named in the address opens where it is: a button's under Buttons, any other under Saved Styles.
  const section: SectionKey = query.style ? (query.style.startsWith('btn-') ? 'buttons' : 'styles') : SECTIONS.includes(query.tab as SectionKey) ? (query.tab as SectionKey) : SECTIONS[0]
  const setSection = (next: SectionKey) => setQuery({ tab: next === SECTIONS[0] ? null : next, style: null, element: null })
  // The preview starts in the theme the admin is in: a dark admin opens on the site's dark colours, not on a white slab.
  const [mode, setMode] = useState<'light' | 'dark'>(useTheme() === 'dark' ? 'dark' : 'light')
  // A phone shows the list or the preview, never both: the bar's Preview button turns between them.
  const [asked, setPreviewing] = useState(false)
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const change = () => setNarrow(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  // Only a narrow window turns between the two, and it shows the site as a phone does.
  const previewing = asked && narrow
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<{ message: string; refused: boolean } | null>(null)
  const sidebar = useScreenSidebar()
  const frame = useRef<HTMLIFrameElement>(null)

  const base = info.data
  const css = draft.css ?? base?.css
  const transition = draft.transition ?? base?.transition
  const js = draft.js ?? base?.js ?? ''
  const dirty = !!base && ((draft.css !== undefined && draft.css !== base.css) || (draft.transition !== undefined && !same(draft.transition, base.transition)) || (draft.js !== undefined && draft.js !== base.js) || Object.keys(draft.files).length > 0)
  const readOnly = !can('settings.manage')

  const sheet = useMemo(() => new Stylesheet(css ?? ''), [css])
  const compile = useDraftCompile(source.data, css)
  // A theme with a dark value follows the visitor's light or dark mode: the preview can show either.
  const dark = useMemo(() => sheet.variables().some((variable) => variable.value.startsWith('light-dark(')) || /color-scheme\s*:\s*light\s+dark\b/.test(sheet.css), [sheet])
  // Every value the theme has before the site names its own: Tailwind's, then the CMS's.
  const [tailwind, setTailwind] = useState<string | null>(null)
  useEffect(() => { void loadTailwindTheme().then(setTailwind) }, [])
  const kernel = source.data?.files.cms
  const defaults = useMemo(() => {
    const out = new Map<string, string>()
    for (const variable of [...themeDefaults(tailwind ?? ''), ...themeDefaults(kernel ?? '')]) out.set(variable.name, variable.value)
    return out
  }, [tailwind, kernel])
  const palette = useMemo(() => new Set(themeDefaults(tailwind ?? '').filter((variable) => variable.name.startsWith('--color-')).map((variable) => variable.name)), [tailwind])

  // The site's fonts, so samples here are drawn in them.
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = (base?.fonts ?? []).map((font) => `@font-face{font-family:"${font.family}";src:url("${/^(https:\/\/|\/)/.test(font.src) ? font.src : `/_cms/fonts/${font.src.split('/').pop()}`}") format("woff2");font-weight:${font.weight ?? '400'};font-style:${font.style ?? 'normal'};font-display:swap}`).join('\n')
    document.head.appendChild(style)
    return () => style.remove()
  }, [base?.fonts])

  if (info.isLoading || source.isLoading || tailwind === null) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!base || !source.data || css === undefined || !transition) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: t('Styling'), icon: 'palette' }]} />
        <QueryError title={t('Couldn’t load the styling')} onRetry={() => { void info.refetch(); void source.refetch() }} retrying={info.isRefetching || source.isRefetching} />
      </div>
    )
  }

  const edit: Editing = {
    sheet,
    // From the newest draft, not the one this render saw: two changes in one go both count.
    change: (change) => !readOnly && setDraft((d) => ({ ...d, css: change(new Stylesheet(d.css ?? base.css)).css })),
    readOnly,
    defaults,
    palette,
    mode: dark ? mode : 'light',
  }
  const samples = { compiler: compile.compiler, device: previewing ? 'phone' as const : viewport }

  const refresh = () => {
    invalidate('styling/')
    frame.current?.contentWindow?.location.reload()
  }

  const save = async () => {
    if (!dirty || busy) return
    setBusy(true)
    setFailed(null)
    try {
      const input: Record<string, unknown> = {}
      if (draft.css !== undefined && draft.css !== base.css) input.css = draft.css
      if (draft.transition !== undefined && !same(draft.transition, base.transition)) input.transition = draft.transition
      if (Object.keys(input).length > 0) await run('styling/update', input)
      if (draft.js !== undefined && draft.js !== base.js) await run('styling-code/set-custom', { js: draft.js })
      for (const [path, contents] of Object.entries(draft.files)) await run('styling-code/save', { path, contents })
      // The stylesheet on screen is the saved one before the draft lets go of it, so nothing jumps back.
      await Promise.all([info.refetch(), source.refetch()])
      invalidate('styling-code/')
      setDraft(EMPTY)
      frame.current?.contentWindow?.location.reload()
    } catch (e) {
      // What Tailwind refuses is the stylesheet's to correct: its own words, and the draft stays.
      setFailed({ message: e instanceof Error ? e.message : String(e), refused: e instanceof CmsError && e.type === 'invalid_input' })
    } finally {
      setBusy(false)
    }
  }

  // Fonts are files of the site: added, removed and preloaded at once, like its scripts.
  const fonts: FontTools = {
    faces: base.fonts,
    add: async (kind) => {
      try {
        if (kind === 'google') {
          const answer = await prompt({ title: t('Add a Google Font'), fields: [{ handle: 'family', type: 'text', label: t('Name'), placeholder: 'Inter Tight', autofocus: true, required: true }], confirm: t('Add Font') })
          const family = String(answer?.family ?? '').trim()
          if (!family) return null
          const result = await run<{ fonts: Face[] }>('styling/fonts-import', { family })
          toast.success(t('{family} added', { family }))
          refresh()
          return { family, fallback: result.fonts.some((font) => !!font.fallback) }
        }
        const picked = await new Promise<File | null>((resolve) => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.woff2,font/woff2'
          input.onchange = () => resolve(input.files?.[0] ?? null)
          input.oncancel = () => resolve(null)
          input.click()
        })
        if (!picked) return null
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.readAsDataURL(picked)
        })
        const name = picked.name.replace(/\.woff2$/i, '')
        const answer = await prompt({ title: t('Upload Font'), fields: [{ handle: 'family', type: 'text', label: t('Family Name'), autofocus: true, required: true }], values: { family: name.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, '').replace(/[-_]/g, ' ') }, confirm: t('Upload Font') })
        const family = String(answer?.family ?? '').trim()
        if (!family) return null
        await run('styling/fonts-upload', { family, name, data, weight: /variable/i.test(name) ? '100 900' : '400', style: /italic/i.test(name) ? 'italic' : 'normal' })
        toast.success(t('{family} uploaded', { family }))
        refresh()
        return { family, fallback: false }
      } catch (e) {
        toast.error(e)
        return null
      }
    },
    remove: async (family) => {
      if (!(await confirm({ title: t('Remove {family}?', { family }), confirm: t('Remove Font'), danger: true }))) return
      try {
        await run('styling/update', { fonts: base.fonts.filter((font) => font.family !== family) })
        refresh()
      } catch (e) {
        toast.error(e)
      }
    },
    preload: async (family, on) => {
      // The upright face is the one the first screen is written in; a family with italics only has those.
      const upright = base.fonts.some((font) => font.family === family && font.style !== 'italic')
      try {
        await run('styling/update', { fonts: base.fonts.map((font) => (font.family === family ? { ...font, preload: on && (!upright || font.style !== 'italic') } : font)) })
        refresh()
      } catch (e) {
        toast.error(e)
      }
    },
  }

  const body = (
    <>
      {section === 'colors' && <Colors edit={edit} />}
      {section === 'typography' && <Typography edit={edit} fonts={fonts} />}
      {section === 'layout' && <Layout edit={edit} />}
      {section === 'shape' && <Shape edit={edit} />}
      {section === 'effects' && <Effects edit={edit} />}
      {section === 'motion' && <Motion edit={edit} transition={transition} onTransition={(next) => !readOnly && setDraft((d) => ({ ...d, transition: next }))} />}
      {section === 'text' && <Text edit={edit} samples={samples} />}
      {section === 'buttons' && <Buttons edit={edit} samples={samples} />}
      {section === 'styles' && <SavedStyles edit={edit} samples={samples} />}
      {section === 'code' && (
        <>
          <CustomCss edit={edit} />
          <CodeFiles
            js={js}
            onJs={(next) => setDraft((d) => ({ ...d, js: next }))}
            edits={draft.files}
            onEdit={(path, contents) => setDraft((d) => ({ ...d, files: contents === null ? Object.fromEntries(Object.entries(d.files).filter(([key]) => key !== path)) : { ...d.files, [path]: contents } }))}
          />
        </>
      )}
    </>
  )

  return (
    <div className="flex h-full flex-col">
      <Topbar
        crumbs={[{ label: t('Styling'), icon: 'palette' }, { label: sections().flatMap((g) => g.items).find((item) => item.value === section)?.label ?? '' }]}
        actions={
          <>
            <Button variant="ghost" icon="eye" aria-pressed={previewing} onClick={() => setPreviewing(!previewing)} className="md:hidden">{t('Preview')}</Button>
            <Tooltip content={t('Open Site')}>
              <IconButton icon="external" label={t('Open Site')} title={undefined} onClick={() => window.open('/', '_blank', 'noopener')} className="max-md:hidden" />
            </Tooltip>
          </>
        }
      />
      {/* The sections are rows under Styling in the sidebar: no column of their own, and the sidebar stays the one it was. */}
      <ScreenSidebar title={t('Styling')} backTo="/" backLabel={t('Dashboard')} nested>
        <nav aria-label={t('Styling')} className={sidebar.nested ? 'space-y-px' : 'px-2 pb-4'}>
          {sections().map((group, index) => (
            <div key={group.group} className={cn('space-y-px', index > 0 && (sidebar.nested ? 'mt-1' : 'mt-4'))}>
              {!sidebar.nested && <div className="cms-label flex h-7 items-center px-2">{group.group}</div>}
              {group.items.map((item) => (
                <SidebarRow key={item.value} label={item.label} icon={sidebar.nested ? undefined : item.icon} active={section === item.value} onClick={() => setSection(item.value)} />
              ))}
            </div>
          ))}
        </nav>
      </ScreenSidebar>
      <SaveBar dirty={dirty} saving={busy} error={failed ? (failed.refused ? t('The stylesheet was not saved') : failed.message) : null} onSave={() => void save()} onDiscard={() => { setDraft(EMPTY); setFailed(null) }} />
      {/* Everything inside reads the draft, as Tailwind last could read it: the pickers offer its colours, the controls ask its theme what a class does. */}
      <StylingProvider source={compile.source ?? source.data}>
      {/* On a phone the list takes the screen, and the preview does when asked for: the same draft, drawn by the site. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]">
        <div key={section} className={cn('overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r', previewing && 'max-md:hidden')}>
          {failed?.refused && <Notice tone="danger" className="mb-3 mt-1" title={t('Tailwind refused the stylesheet')} onDismiss={() => setFailed(null)}>{failed.message}</Notice>}
          {body}
        </div>

        <div className={cn('flex min-w-0 flex-col bg-sunken', !previewing && 'max-md:hidden')}>
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3">
            {/* A phone is its own width: the other screens are for a window with room to draw them. */}
            <span className="max-md:hidden"><Segmented size="xs" aria-label={t('Screen')} value={viewport} onChange={setViewport} options={[{ value: 'desktop', icon: 'desktop', title: t('Desktop') }, { value: 'tablet', icon: 'tablet', title: t('Tablet') }, { value: 'phone', icon: 'phone', title: t('Phone') }]} /></span>
            {viewport !== 'desktop' && <span className="font-mono text-2xs text-faint max-md:hidden">{WIDTHS[viewport]}</span>}
            <span className="flex-1" />
            {dark && <Segmented size="xs" aria-label={t('Color Mode')} value={mode} onChange={setMode} options={[{ value: 'light', icon: 'sun', title: t('Light') }, { value: 'dark', icon: 'moon', title: t('Dark') }]} />}
          </div>
          <Preview frame={frame} compile={compile} published={base.stylesheet} viewport={previewing ? 'phone' : viewport} mode={dark ? mode : null} bordered={viewport !== 'desktop' && !previewing} />
        </div>
      </div>
      </StylingProvider>
    </div>
  )
}

/**
 * The site's own CSS: what the stylesheet holds that no section shows (a variable of another kind, a rule of
 * another selector, a variant of its own, plain CSS). What is typed is the draft once its braces close.
 */
function CustomCss({ edit }: { edit: Editing }) {
  const written = useMemo(() => edit.sheet.extra(), [edit.sheet])
  const [text, setText] = useState(written)
  // Written elsewhere (a section, Discard, Save): the field follows, unless it holds what is being typed.
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
          fields={[{ handle: 'css', type: 'code', label: t('CSS'), rows: 14, language: 'tailwind', placeholder: '.hero-title { text-wrap: balance; }' }]}
          values={{ css: text }}
          disabled={edit.readOnly}
          onChange={(_, value) => {
            const next = String(value ?? '')
            setText(next)
            if (!balanced(next)) return
            // What the stylesheet will say it holds: the field keeps what was typed while they agree.
            typed.current = edit.sheet.setExtra(next).extra()
            edit.change((sheet) => sheet.setExtra(next))
          }}
        />
      </div>
    </Group>
  )
}

/** The preview, never narrower on a desktop than the site's own desktop: its `lg` screen, as the draft's theme has it. */
function Preview(props: Omit<Parameters<typeof SitePreview>[0], 'desktop'>) {
  const { breakpoints } = useStyling()
  return <SitePreview {...props} desktop={breakpoints.find((size) => size.name === 'lg')?.width ?? 1024} />
}
