import { CmsError, can, invalidate, run, setQuery, t, timeAgo, useAbility, useLocation } from '@letterncms/sdk'
import { Button, Icon, IconButton, Notice, Popover, Pressable, QueryError, SaveBar, Segmented, Spinner, Tooltip, Topbar, cn, confirm, prompt, toast, useShortcut, useTheme } from '@letterncms/ui'
import { Stylesheet, StylingProvider, lightDark, loadTailwindTheme, themeDefaults, useStyling, type StylingSource } from '@letterncms/blocks'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useHistory } from './history'
import { type Editing } from './parts'
import { SitePreview, useDraftCompile, type Viewport } from './preview'
import { Styles, styleTitle } from './styles'
import { keyframesOf } from './fields'
import { Colors, Effects, Layout, Motion, Typography, type Face, type FontTools, type Transition } from './theme'

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
 * (so comments and hand-written CSS stay), and the page transition. A part that was not changed is not in it.
 */
interface Draft {
  css?: string
  transition?: Transition
}

const EMPTY: Draft = {}

const SECTIONS = ['colors', 'typography', 'layout', 'effects', 'motion', 'styles'] as const
type SectionKey = (typeof SECTIONS)[number]

/** The sections, in the order a design is made: its values, then the looks made of them. */
function sections(): { value: SectionKey; label: string; icon: string }[] {
  return [
    { value: 'colors', label: t('Colors'), icon: 'palette' },
    { value: 'typography', label: t('Typography'), icon: 'typography' },
    { value: 'layout', label: t('Layout'), icon: 'ruler' },
    { value: 'effects', label: t('Effects'), icon: 'shadow' },
    { value: 'motion', label: t('Motion'), icon: 'speed' },
    { value: 'styles', label: t('Styles'), icon: 'symbol' },
  ]
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

/** Where the list of styles was scrolled when a style opened: back from it, the list is where it was left. */
const scrolled = { styles: 0 }

/** What one step back or forward returns to: the stylesheet and the page transition. */
interface State {
  css: string
  transition: Transition
}
const sameState = (a: State, b: State) => a.css === b.css && same(a.transition, b.transition)

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
  // A style named in the address opens under Styles, wherever the address says the page is. Without a section, the site alone.
  const section: SectionKey | null = query.style ? 'styles' : SECTIONS.includes(query.tab as SectionKey) ? (query.tab as SectionKey) : null
  const setSection = (next: SectionKey) => setQuery({ tab: next, style: null })
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
  const dirty = !!base && ((draft.css !== undefined && draft.css !== base.css) || (draft.transition !== undefined && !same(draft.transition, base.transition)))
  const readOnly = !can('settings.manage')

  const sheet = useMemo(() => new Stylesheet(css ?? ''), [css])
  const savedSheet = useMemo(() => new Stylesheet(base?.css ?? ''), [base?.css])
  const compile = useDraftCompile(source.data, css)
  // A theme with a dark value follows the visitor's light or dark mode: the preview can show either.
  const dark = useMemo(() => sheet.variables().some((variable) => variable.value.startsWith('light-dark(')) || /color-scheme\s*:\s*light\s+dark\b/.test(sheet.css), [sheet])
  // Every value the theme has before the site names its own: Tailwind's, then the CMS's.
  const [tailwind, setTailwind] = useState<string | null>(null)
  useEffect(() => { void loadTailwindTheme().then(setTailwind) }, [])
  // Every place of the panel opens at its top; only the list of styles, back from a style, is where it was left.
  const list = useRef<HTMLDivElement>(null)
  const place = `${section}:${query.style ?? ''}`
  const shown = useRef(place)
  if (shown.current !== place) {
    // Noted while the list is still on screen, whether or not its last scroll was heard.
    if (list.current && shown.current === 'styles:') scrolled.styles = list.current.scrollTop
    shown.current = place
  }
  const ready = !!info.data && !!source.data && tailwind !== null
  useLayoutEffect(() => {
    if (ready && list.current) list.current.scrollTop = place === 'styles:' ? scrolled.styles : 0
  }, [place, ready])
  // Every change is a step back, as in the editor: the stylesheet and the transition together.
  const state = useMemo(() => (css !== undefined && transition ? { css, transition } : undefined), [css, transition])
  const history = useHistory<State>(state, (next) => setDraft({ css: next.css, transition: next.transition }), sameState)
  useShortcut('mod+z', history.undo, history.canUndo && !readOnly, t('Undo'))
  useShortcut('mod+shift+z', history.redo, history.canRedo && !readOnly, t('Redo'))
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
    saved: savedSheet,
    // From the newest draft, not the one this render saw: two changes in one go both count.
    change: (change) => !readOnly && setDraft((d) => ({ ...d, css: change(new Stylesheet(d.css ?? base.css)).css })),
    readOnly,
    defaults,
    palette,
    keyframes,
    mode: dark ? mode : 'light',
  }
  const samples = { compiler: compile.compiler, device: previewing ? 'phone' as const : viewport }
  // A style open under Styles is the last crumb: the one bar says where the page is.
  const open = section === 'styles' && query.style ? styleTitle(sheet, query.style) : null

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
      {section === 'styles' && <Styles edit={edit} samples={samples} />}
    </>
  )

  const current = sections().find((item) => item.value === section)
  return (
    <div className="flex h-full flex-col">
      <Topbar
        divided
        crumbs={[
          { label: t('Styling'), icon: 'theme', to: section ? '/styling' : undefined },
          ...(current ? [{ label: current.label, to: open ? `/styling?tab=${current.value}` : undefined }] : []),
          ...(open ? [{ label: open }] : []),
        ]}
        actions={
          <>
            <Button variant="ghost" icon="eye" aria-pressed={previewing} onClick={() => setPreviewing(!previewing)} className="md:hidden">{t('Preview')}</Button>
            {/* As the editor has them: a step back and forward, and the versions the site saved. */}
            {!readOnly && <>
              <Tooltip content={t('Undo')} shortcut="mod+z"><IconButton icon="undo" label={t('Undo')} title={undefined} disabled={!history.canUndo} onClick={history.undo} /></Tooltip>
              <Tooltip content={t('Redo')} shortcut="mod+shift+z"><IconButton icon="redo" label={t('Redo')} title={undefined} disabled={!history.canRedo} onClick={history.redo} /></Tooltip>
              <span className="max-sm:hidden"><Versions onOpen={(version) => setDraft({ css: version.css, transition: version.transition })} /></span>
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
      <SaveBar dirty={dirty} saving={busy} error={failed ? (failed.refused ? t('The stylesheet was not saved') : failed.message) : null} onSave={() => void save()} onDiscard={() => { setDraft(EMPTY); setFailed(null) }} />
      {/* Everything inside reads the draft, as Tailwind last could read it: the pickers offer its colours, the controls ask its theme what a class does. */}
      <StylingProvider source={compile.source ?? source.data}>
      {/* The panel beside the site, as WordPress's styles are: its sections first, each opening in its place with the way back.
          On a phone the panel takes the screen, and the preview does when asked for: the same draft, drawn by the site. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
        <div className={cn('flex min-h-0 flex-col border-border md:border-r', previewing && 'max-md:hidden')}>
          {current && !open && (
            <div className="flex h-12 shrink-0 items-center gap-1 px-2">
              <Tooltip content={t('Back to {label}', { label: t('Styling') })}><IconButton icon="chevron-left" label={t('Back to {label}', { label: t('Styling') })} title={undefined} onClick={() => setQuery({ tab: null, style: null })} /></Tooltip>
              <h2 className="m-0 truncate text-sm font-semibold text-ink">{current.label}</h2>
            </div>
          )}
          <div ref={list} onScroll={(e) => { if (place === 'styles:') scrolled.styles = e.currentTarget.scrollTop }} className={cn('min-h-0 flex-1 overflow-y-auto px-4 pb-16', !current && 'pt-4')}>
            {failed?.refused && <Notice tone="danger" className="mb-3 mt-1" title={t('Tailwind refused the stylesheet')} onDismiss={() => setFailed(null)}>{failed.message}</Notice>}
            {current ? body : <Overview edit={edit} onOpen={setSection} />}
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

/**
 * Where Styling opens: the site's look at a glance (its type in its first font, on its background, with its
 * main colours), then each section, opening in the panel's place.
 */
function Overview({ edit, onOpen }: { edit: Editing; onOpen: (section: SectionKey) => void }) {
  const { engine } = useStyling()
  const value = (name: string) => edit.sheet.variable(name) ?? edit.defaults.get(name)
  const drawn = (name: string) => {
    const raw = value(name)
    if (!raw) return undefined
    const sides = lightDark(engine ? engine.resolve(raw) : raw)
    return edit.mode === 'dark' ? sides.dark ?? sides.light : sides.light
  }
  const font = value('--font-display') ?? value('--font-serif') ?? value('--font-sans')
  const dots = ['--color-primary', '--color-accent', '--color-foreground'].map(drawn).filter((color): color is string => !!color).slice(0, 2)
  return (
    <>
      <div aria-hidden className="relative mb-6 flex aspect-[16/10] items-center justify-center gap-6 overflow-hidden rounded-lg" style={{ background: drawn('--color-background') ?? 'white' }}>
        <span className="leading-none" style={{ fontFamily: font, fontSize: 88, color: drawn('--color-foreground') }}>Aa</span>
        {dots.length > 0 && <span className="flex flex-col gap-3">{dots.map((color, i) => <span key={i} className="relative size-10 rounded-full" style={{ background: color }}><span className="cms-swatch-edge" /></span>)}</span>}
        <span className="cms-swatch-edge" />
      </div>
      <nav aria-label={t('Styling')} className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {sections().map((item) => (
          <Pressable key={item.value} inset onClick={() => onOpen(item.value)} className="flex h-12 w-full items-center gap-3 px-3 text-left text-sm text-text transition-colors duration-base hover:bg-hover">
            <Icon name={item.icon} size={18} className="shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <Icon name="chevron-right" size={14} className="shrink-0 text-faint" />
          </Pressable>
        ))}
      </nav>
    </>
  )
}

/** The versions the site saved, newest first: one opens in the draft, to look at and save, or to undo. */
function Versions({ onOpen }: { onOpen: (version: State) => void }) {
  const [open, setOpen] = useState(false)
  const list = useAbility<{ id: string; at: string; user: string | null; current: boolean }[]>('styling-versions/list', {}, { enabled: open })
  const pick = async (id: string) => {
    try {
      onOpen(await run<State>('styling-versions/get', { id }))
      setOpen(false)
    } catch (e) {
      toast.error(e)
    }
  }
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-72 !p-1"
      trigger={<span><Tooltip content={t('Versions')}><IconButton icon="history" label={t('Versions')} title={undefined} active={open} /></Tooltip></span>}
    >
      <div className="cms-label px-2 pb-1 pt-1.5">{t('Versions')}</div>
      {list.isPending ? <div className="grid h-16 place-items-center text-faint"><Spinner size={14} /></div>
        : list.isError ? <QueryError compact onRetry={() => void list.refetch()} retrying={list.isRefetching} />
        : list.data.length === 0 ? <p className="m-0 px-2 py-2 text-sm text-muted">{t('No versions yet')}</p>
        : (
          <div className="max-h-80 space-y-px overflow-y-auto">
            {list.data.map((version) => (
              <Pressable key={version.id} compact disabled={version.current} onClick={() => void pick(version.id)} className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm enabled:hover:bg-hover">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-text">{timeAgo(version.at)}</span>
                  {version.user && <span className="block truncate text-xs text-muted">{version.user}</span>}
                </span>
                {version.current && <span className="shrink-0 text-xs text-muted">{t('Current')}</span>}
              </Pressable>
            ))}
          </div>
        )}
    </Popover>
  )
}

/** The preview, never narrower on a desktop than the site's own desktop: its `lg` screen, as the draft's theme has it. */
function Preview(props: Omit<Parameters<typeof SitePreview>[0], 'desktop'>) {
  const { breakpoints } = useStyling()
  return <SitePreview {...props} desktop={breakpoints.find((size) => size.name === 'lg')?.width ?? 1024} />
}
