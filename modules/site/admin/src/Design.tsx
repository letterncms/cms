import { CmsError, can, invalidate, navigate, run, t, useAbility } from '@letterncms/sdk'
import { IconButton, Notice, QueryError, SaveBar, Segmented, Spinner, Tooltip, Topbar, UndoRedo, VersionsButton, cn, confirm, prompt, toast, useTheme, useUndo } from '@letterncms/ui'
import { Stylesheet, StylingProvider, loadTailwindTheme, themeDefaults, useStyling, type StylingSource } from '@letterncms/blocks'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { arrangementOf, type Arrangement, type Editing } from './parts'
import { SitePreview, useDraftCompile, type Viewport } from './preview'
import { Classes, stylePath, stylesPlace } from './classes'
import { keyframesOf } from './fields'
import { Colors, Effects, Layout, Motion, Typography, type Face, type FontTools, type Transition } from './theme'

/** What `styling/get` says: the stylesheet, the settings beside it and the published CSS. */
interface Info {
  css: string
  fonts: Face[]
  transition: Transition
  arrangement: Arrangement
  js: string
  stylesheet: string
}

/**
 * What Save writes. One draft: the stylesheet's text, which every control rewrites where the value stands
 * (so comments and hand-written CSS stay), the page transition and how Classes lists the styles. A part that was
 * not changed is not in it.
 */
interface Draft {
  css?: string
  transition?: Transition
  arrangement?: Arrangement
}

const EMPTY: Draft = {}

const SECTIONS = ['colors', 'typography', 'layout', 'effects', 'motion', 'classes'] as const
type SectionKey = (typeof SECTIONS)[number]

/** What each section is called: the sidebar names them the same (SiteModule::DESIGN). */
const sectionLabel = (key: SectionKey) => ({ colors: t('Colors'), typography: t('Typography'), layout: t('Layout'), effects: t('Effects'), motion: t('Motion'), classes: t('Classes') })[key]

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/** Where each place of the panel was scrolled when it was left: back there, it is where it was left. */
const scrolled = new Map<string, number>()

/** What one step back or forward returns to: the stylesheet, the page transition and how Classes lists the styles. */
interface State {
  css: string
  transition: Transition
  arrangement: Arrangement
}
const sameState = (a: State, b: State) => a.css === b.css && same(a.transition, b.transition) && same(a.arrangement, b.arrangement)

/**
 * /design/<section>: the design of the site, section by section (each a row of the design's sidebar), beside the
 * site as it looks with the draft. Its theme (every value of Tailwind's and the site's own) and its classes are its
 * Tailwind stylesheet: every edit rewrites the draft and shows on the page at once (Tailwind compiles it here),
 * and Save writes it to content/styling, where the server compiles the site's CSS. One screen draws every section,
 * so a change not yet saved goes along from one section to the next.
 */
export default function Design({ params }: { params: Record<string, string> }) {
  const info = useAbility<Info>('styling/get', {}, { refetchOnWindowFocus: false, retry: false })
  const source = useAbility<StylingSource>('styling/source', {}, { refetchOnWindowFocus: false, retry: false, staleTime: 60_000 })
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [first, ...rest] = (params['*'] ?? '').split('/').filter(Boolean)
  const section = SECTIONS.includes(first as SectionKey) ? (first as SectionKey) : null
  // The design opens on its first section.
  useEffect(() => {
    if (!section) navigate('/design/colors', { replace: true })
  }, [section])
  // A class or a group that is no longer there (deleted, discarded, renamed elsewhere): the list of classes.
  const gone = section === 'classes' && rest.length > 0 && !!info.data && stylesPlace(new Stylesheet(draft.css ?? info.data.css), rest) === null
  useEffect(() => {
    if (gone) navigate(stylePath(), { replace: true })
  }, [gone])
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
  const frame = useRef<HTMLIFrameElement>(null)

  const base = info.data
  const css = draft.css ?? base?.css
  const transition = draft.transition ?? base?.transition
  const savedArrangement = useMemo(() => arrangementOf(base?.arrangement), [base?.arrangement])
  const arrangement = draft.arrangement ?? savedArrangement
  const dirty = !!base && ((draft.css !== undefined && draft.css !== base.css) || (draft.transition !== undefined && !same(draft.transition, base.transition)) || (draft.arrangement !== undefined && !same(draft.arrangement, savedArrangement)))
  const readOnly = !can('settings.manage')

  const sheet = useMemo(() => new Stylesheet(css ?? ''), [css])
  const savedSheet = useMemo(() => new Stylesheet(base?.css ?? ''), [base?.css])
  const compile = useDraftCompile(source.data, css)
  // A theme with a dark value follows the visitor's light or dark mode: the preview can show either.
  const dark = useMemo(() => sheet.variables().some((variable) => variable.value.startsWith('light-dark(')) || /color-scheme\s*:\s*light\s+dark\b/.test(sheet.css), [sheet])
  // Every value the theme has before the site names its own: Tailwind's, then the CMS's.
  const [tailwind, setTailwind] = useState<string | null>(null)
  useEffect(() => { void loadTailwindTheme().then(setTailwind) }, [])
  // A place of the panel opens where it was left, or at its top.
  const list = useRef<HTMLDivElement>(null)
  const place = params['*'] ?? ''
  const shown = useRef(place)
  if (shown.current !== place) {
    // Noted while the place is still on screen, whether or not its last scroll was heard.
    if (list.current) scrolled.set(shown.current, list.current.scrollTop)
    shown.current = place
  }
  const ready = !!info.data && !!source.data && tailwind !== null
  useLayoutEffect(() => {
    if (ready && list.current) list.current.scrollTop = scrolled.get(place) ?? 0
  }, [place, ready])
  // Every change is a step back, as in the editor: the stylesheet, the transition and the arrangement together.
  const state = useMemo(() => (css !== undefined && transition ? { css, transition, arrangement } : undefined), [css, transition, arrangement])
  const history = useUndo<State>(state, (next) => setDraft({ css: next.css, transition: next.transition, arrangement: next.arrangement }), sameState)
  // A version from the history opens in the draft, to look at and save, or to undo.
  const openVersion = async (id: string) => {
    try {
      const { snapshot } = await run<{ snapshot: State }>('revisions/get', { id })
      setDraft({ css: snapshot.css, transition: snapshot.transition, arrangement: arrangementOf(snapshot.arrangement) })
    } catch (e) {
      toast.error(e)
    }
  }
  const kernel = source.data?.files.cms
  const defaults = useMemo(() => {
    const out = new Map<string, string>()
    for (const variable of [...themeDefaults(tailwind ?? ''), ...themeDefaults(kernel ?? '')]) out.set(variable.name, variable.value)
    return out
  }, [tailwind, kernel])
  const palette = useMemo(() => new Set(themeDefaults(tailwind ?? '').filter((variable) => variable.name.startsWith('--color-')).map((variable) => variable.name)), [tailwind])
  const keyframes = useMemo(() => keyframesOf(tailwind ?? '', css ?? ''), [tailwind, css])

  // The site's fonts, so samples here are drawn in them.
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = (base?.fonts ?? []).map((font) => `@font-face{font-family:"${font.family}";src:url("${/^(https:\/\/|\/)/.test(font.src) ? font.src : `/_cms/fonts/${font.src.split('/').pop()}`}") format("woff2");font-weight:${font.weight ?? '400'};font-style:${font.style ?? 'normal'};font-display:swap}`).join('\n')
    document.head.appendChild(style)
    return () => style.remove()
  }, [base?.fonts])

  if (!section || info.isLoading || source.isLoading || tailwind === null) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!base || !source.data || css === undefined || !transition) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: sectionLabel(section) }]} />
        <QueryError title={t('Couldn’t load the design')} onRetry={() => { void info.refetch(); void source.refetch() }} retrying={info.isRefetching || source.isRefetching} />
      </div>
    )
  }

  const edit: Editing = {
    sheet,
    saved: savedSheet,
    // From the newest draft, not the one this render saw: two changes in one go both count.
    change: (change) => !readOnly && setDraft((d) => ({ ...d, css: change(new Stylesheet(d.css ?? base.css)).css })),
    arrangement,
    savedArrangement,
    arrange: (change) => !readOnly && setDraft((d) => ({ ...d, arrangement: change(d.arrangement ?? savedArrangement) })),
    readOnly,
    defaults,
    palette,
    keyframes,
    mode: dark ? mode : 'light',
  }
  const samples = { compiler: compile.compiler, device: previewing ? 'phone' as const : viewport }
  // A group of styles, or a style, says its own name with the way back up: "‹ Buttons", "‹ Primary".
  const sub = section === 'classes' ? stylesPlace(sheet, rest) : null

  const refresh = () => {
    invalidate('styling/', 'revisions/')
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
      if (draft.arrangement !== undefined && !same(draft.arrangement, savedArrangement)) input.arrangement = draft.arrangement
      if (Object.keys(input).length > 0) await run('styling/update', input)
      // The stylesheet on screen is the saved one before the draft lets go of it, so nothing jumps back.
      await Promise.all([info.refetch(), source.refetch()])
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
      {section === 'effects' && <Effects edit={edit} />}
      {section === 'motion' && <Motion edit={edit} transition={transition} saved={base.transition} onTransition={(next) => !readOnly && setDraft((d) => ({ ...d, transition: next }))} />}
      {/* Each group of classes opens with its own search. */}
      {section === 'classes' && <Classes key={rest[0] ?? ''} edit={edit} samples={samples} path={rest} />}
    </>
  )

  return (
    <div className="flex h-full flex-col">
      <Topbar
        divided
        crumbs={sub ?? [{ label: sectionLabel(section) }]}
        actions={
          <>
            <span className="md:hidden"><Tooltip content={t('Preview')}><IconButton icon="eye" label={t('Preview')} title={undefined} active={previewing} aria-pressed={previewing} onClick={() => setPreviewing(!previewing)} /></Tooltip></span>
            {/* As the editor has them: a step back and forward, and the versions the site saved. */}
            {!readOnly && <>
              <UndoRedo history={history} />
              <span className="max-sm:hidden"><VersionsButton of={{ kind: 'styling', subject: 'theme' }} onOpen={(version) => void openVersion(version.id)} /></span>
            </>}
            {/* A phone is its own width: the other screens are for a window with room to draw them. */}
            <span className="max-md:hidden"><Segmented size="xs" aria-label={t('Screen')} value={viewport} onChange={setViewport} options={[{ value: 'desktop', icon: 'desktop', title: t('Desktop') }, { value: 'tablet', icon: 'tablet', title: t('Tablet') }, { value: 'phone', icon: 'phone', title: t('Phone') }]} /></span>
            {dark && <Segmented size="xs" className="max-sm:hidden" aria-label={t('Color Mode')} value={mode} onChange={setMode} options={[{ value: 'light', icon: 'sun', title: t('Light') }, { value: 'dark', icon: 'moon', title: t('Dark') }]} />}
            <Tooltip content={t('Open Site')}>
              <IconButton icon="external" label={t('Open Site')} title={undefined} onClick={() => window.open('/', '_blank', 'noopener')} className="max-md:hidden" />
            </Tooltip>
          </>
        }
      />
      <SaveBar within="/design" dirty={dirty} saving={busy} error={failed ? (failed.refused ? t('The stylesheet was not saved') : failed.message) : null} onSave={() => void save()} onDiscard={() => { setDraft(EMPTY); setFailed(null) }} />
      {/* Everything inside reads the draft, as Tailwind last could read it: the pickers offer its colours, the controls ask its theme what a class does. */}
      <StylingProvider source={compile.source ?? source.data}>
      {/* The panel beside the site, as WordPress's styles are: its sections first, each opening in its place with the way back.
          On a phone the panel takes the screen, and the preview does when asked for: the same draft, drawn by the site. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
        <div className={cn('flex min-h-0 flex-col border-border md:border-r', previewing && 'max-md:hidden')}>
          <div ref={list} onScroll={(e) => scrolled.set(place, e.currentTarget.scrollTop)} className="min-h-0 flex-1 overflow-y-auto px-4 pb-16 pt-2">
            {failed?.refused && <Notice tone="danger" className="mb-3 mt-1" title={t('Tailwind refused the stylesheet')} onDismiss={() => setFailed(null)}>{failed.message}</Notice>}
            {body}
          </div>
        </div>

        <div className={cn('flex min-w-0 flex-col bg-sunken', !previewing && 'max-md:hidden')}>
          <Preview frame={frame} compile={compile} published={base.stylesheet} viewport={previewing ? 'phone' : viewport} mode={dark ? mode : null} />
        </div>
      </div>
      </StylingProvider>
    </div>
  )
}


/** The preview, never narrower on a desktop than the site's own desktop: its `lg` screen, as the draft's theme has it. */
function Preview(props: Omit<Parameters<typeof SitePreview>[0], 'desktop'>) {
  const { breakpoints } = useStyling()
  return <SitePreview {...props} desktop={breakpoints.find((size) => size.name === 'lg')?.width ?? 1024} />
}
