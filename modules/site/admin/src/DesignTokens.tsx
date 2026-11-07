import { can, queryClient, run, t, useAbility, useTab, type FieldDef } from '@letterncms/sdk'
import { EmptyState, Fields, Icon, IconButton, Menu, SaveBar, ScreenSidebar, Segmented, SidebarRow, Spinner, Tooltip, Topbar, cn, confirm, copyText, deviceWidths, prompt, toast, useScreenSidebar, type MenuItemDef } from '@letterncms/ui'
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Disclosure, Group, css, px, variable } from './design-parts'
import { fallbackOf, fontStack, withFallback } from './fields'
import { FieldEditor, fieldVars, specimenPart, type FieldSchema, type FieldValues } from './form-fields'
import { applyDraft, showPart } from './specimen'

interface Token {
  path: string
  group: string
  name: string
  value: any
  dark: any
  type?: string
  description?: string
}

/** A token being edited; `from` is its saved path (absent for new tokens). */
interface DraftToken extends Token {
  from?: string
}

type Declarations = Record<string, string | number>
type Buttons = Record<string, Record<string, Declarations>>
type Font = { family: string; src: string; weight?: string; style?: string; preload?: boolean }

interface ThemeInfo {
  tokens: Token[]
  breakpoints: Record<string, string>
  fonts: Font[]
  styles: Record<string, Declarations>
  prose: Record<string, Declarations>
  buttons: Buttons
  fields: FieldValues
  fieldStyles: FieldSchema
  controlSizes: Record<string, Record<string, string | string[]>>
  transition: { type: string; duration: number }
  elements: string[]
  css: string
  js: string
}

/** Everything the Save button writes: tokens, the style sections and custom code. */
interface Draft {
  tokens: DraftToken[]
  styles: Record<string, Declarations>
  prose: Record<string, Declarations>
  buttons: Buttons
  fields: FieldValues
  transition: { type: string; duration: number }
  css: string
  js: string
}

const SECTIONS = ['color', 'type', 'space', 'sizes', 'shape', 'motion', 'elements', 'prose', 'buttons', 'fields', 'code'] as const
type SectionKey = (typeof SECTIONS)[number]

function sections(): { group: string; items: { value: SectionKey; label: string; icon: string }[] }[] {
  return [
    {
      group: t('Tokens'),
      items: [
        { value: 'color', label: t('Colors'), icon: 'palette' },
        { value: 'type', label: t('Typography'), icon: 'typography' },
        { value: 'space', label: t('Spacing'), icon: 'spacing' },
        { value: 'sizes', label: t('Sizes'), icon: 'ruler' },
        { value: 'shape', label: t('Shape'), icon: 'radius' },
        { value: 'motion', label: t('Motion'), icon: 'speed' },
      ],
    },
    {
      group: t('Styles'),
      items: [
        { value: 'elements', label: t('Elements'), icon: 'paragraph' },
        { value: 'prose', label: t('Prose'), icon: 'article' },
        { value: 'buttons', label: t('Buttons'), icon: 'button' },
        { value: 'fields', label: t('Form Fields'), icon: 'form-input' },
        { value: 'code', label: t('Custom Code'), icon: 'code' },
      ],
    },
  ]
}

/** The title of the dialog that adds a token to a group. */
function newTitle(group: string): string {
  const titles: Record<string, string> = {
    color: t('New Color'), font: t('New Font Family'), text: t('New Text Size'), weight: t('New Weight'), leading: t('New Line Height'), tracking: t('New Letter Spacing'),
    space: t('New Spacing'), container: t('New Container'), breakpoint: t('New Breakpoint'), radius: t('New Radius'), shadow: t('New Shadow'), duration: t('New Duration'), ease: t('New Easing'),
  }
  return titles[group] ?? t('New Token')
}

const WIDTHS = { desktop: '100%', tablet: `${deviceWidths.tablet}px`, phone: `${deviceWidths.phone}px` } as const
type Viewport = keyof typeof WIDTHS

/**
 * The site at the chosen screen's width. Desktop takes the room there is, but never less
 * than the site's desktop width: with less room it is scaled down, so it keeps its desktop
 * layout. Tablet and phone draw at their width (scaled down only when the room is smaller).
 */
function Preview({ viewport, desktop, children }: { viewport: Viewport; desktop: number; children: (style: CSSProperties) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setRoom({ width: el.clientWidth, height: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const width = viewport === 'desktop' ? Math.max(room.width, desktop) : parseFloat(WIDTHS[viewport])
  const scale = room.width ? Math.min(1, room.width / width) : 1
  return (
    <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
      {room.width > 0 && children({ position: 'absolute', top: 0, left: Math.max(0, (room.width - width * scale) / 2), width, height: room.height / scale, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' })}
    </div>
  )
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

function initial(data: ThemeInfo): Draft {
  return {
    tokens: data.tokens.map((token) => ({ ...token, from: token.path })),
    styles: data.styles ?? {},
    prose: data.prose ?? {},
    buttons: data.buttons ?? {},
    fields: data.fields ?? {},
    transition: data.transition ?? { type: 'none', duration: 0.3 },
    css: data.css ?? '',
    js: data.js ?? '',
  }
}

/** Rename a token in the draft and point its references (token values, element and button styles) at the new name. */
function retarget(draft: Draft, from: string, to: string): Draft {
  const pattern = new RegExp(`token:${from.replace(/[.-]/g, '\\$&')}(?![a-z0-9-])`, 'g')
  const swap = <T,>(value: T): T => JSON.parse(JSON.stringify(value ?? null).replace(pattern, `token:${to}`))
  return {
    ...draft,
    styles: swap(draft.styles),
    prose: swap(draft.prose),
    buttons: swap(draft.buttons),
    fields: swap(draft.fields),
    tokens: draft.tokens.map((token) => (token.path === from ? { ...token, path: to, name: to.split('.')[1] } : { ...token, value: swap(token.value), dark: swap(token.dark) })),
  }
}

/** The design/update input that turns `base` into `draft` (renames keep a token's place and references). */
function changes(base: Draft, draft: Draft) {
  const saved = new Map(base.tokens.map((token) => [token.path, token]))
  const kept = new Set(draft.tokens.map((token) => token.from).filter(Boolean))
  const input: Record<string, any> = { tokens: {}, dark: {}, rename: {}, remove: base.tokens.filter((token) => !kept.has(token.path)).map((token) => token.path) }
  for (const token of draft.tokens) {
    const was = token.from ? saved.get(token.from) : undefined
    if (was && was.path !== token.path) input.rename[was.path] = token.path
    if (!was || !same(was.value, token.value)) input.tokens[token.path] = token.value
    if (!was || !same(was.dark || null, token.dark || null)) input.dark[token.path] = token.dark || null
  }
  for (const key of ['styles', 'prose', 'buttons', 'fields', 'transition'] as const) {
    if (!same(base[key], draft[key])) input[key] = draft[key]
  }
  return input
}

/**
 * The design system editor: tokens, fonts, element and button styles, motion and
 * custom code, with the real site beside it. Every edit previews live (the server
 * compiles the draft) and is written to content/design on save.
 */
export default function DesignTokens() {
  const theme = useAbility<ThemeInfo>('design/get', {}, { refetchOnWindowFocus: false, retry: false })
  const base = useMemo(() => (theme.data ? initial(theme.data) : null), [theme.data])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [section, setSection] = useTab(SECTIONS)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const sidebar = useScreenSidebar()
  const [compiled, setCompiled] = useState<string | null>(null)
  const [buttonOpen, setButtonOpen] = useState<string | null>(null)
  const [fieldOpen, setFieldOpen] = useState<string | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)

  const current = draft ?? base
  const dirty = !!draft && !!base && !same(draft, base)
  const update = (fn: (d: Draft) => Draft) => base && setDraft((d) => fn(d ?? base))


  // Live preview, part 1: the server compiles the whole draft (elements, buttons, transitions, custom CSS).
  const input = useMemo(() => (dirty && base && draft ? { ...changes(base, draft), css: draft.css } : null), [dirty, base, draft])
  useEffect(() => {
    if (!input) return setCompiled(null)
    let current = true
    const timer = setTimeout(() => {
      run<{ css: string }>('design/preview', input).then((r) => current && setCompiled(r.css), () => {})
    }, 150)
    return () => {
      current = false
      clearTimeout(timer)
    }
  }, [input])

  // Part 2: token values as custom properties, applied instantly while a value is dragged.
  const vars = useMemo(() => (current?.tokens ?? []).map((token) => `${variable(token.group, token.name)}:${css(token.group, mode === 'dark' && token.dark ? token.dark : token.value)}`).join(';'), [current, mode])

  // Part 3: the form fields' own values, as their custom properties.
  const draftVars = dirty ? [vars, fieldVars(theme.data?.fieldStyles ?? {}, current?.fields ?? {})].filter(Boolean).join(';') : ''
  const preview = { compiled, vars: draftVars, mode }
  const inject = () => applyDraft(frame.current?.contentDocument, preview)
  // Buttons and fields show beside their controls every variant and every kind of field, in each state,
  // drawn by the site: the part being edited is scrolled to and marked, and nothing else moves.
  const page = section === 'fields' || section === 'buttons' || section === 'sizes' || section === 'prose' ? `/__specimen/${section}` : '/'
  const part = section === 'fields' ? specimenPart(fieldOpen) : section === 'buttons' ? buttonOpen : null
  useEffect(() => showPart(frame.current?.contentDocument, part, true), [part])
  useEffect(inject)

  // The site's fonts, so specimens here show them.
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = (theme.data?.fonts ?? []).map((font) => `@font-face{font-family:"${font.family}";src:url("${/^(https:\/\/|\/)/.test(font.src) ? font.src : `/_cms/fonts/${font.src.split('/').pop()}`}") format("woff2");font-weight:${font.weight ?? '400'};font-style:${font.style ?? 'normal'};font-display:swap}`).join('\n')
    document.head.appendChild(style)
    return () => style.remove()
  }, [theme.data?.fonts])

  const save = async () => {
    if (!dirty || busy || !base || !draft) return
    setBusy(true)
    setFailed(null)
    try {
      const change = changes(base, draft)
      const tokensChanged = Object.keys(change.tokens).length + Object.keys(change.dark).length + Object.keys(change.rename).length + change.remove.length > 0 || ['styles', 'prose', 'buttons', 'fields', 'transition'].some((key) => key in change)
      if (tokensChanged) await run('design/update', change)
      if (draft.css !== base.css || draft.js !== base.js) await run('design/code', { css: draft.css, ...(can('site.code') ? { js: draft.js } : {}) })
      await queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('design/') })
      setDraft(null)
      frame.current?.contentWindow?.location.reload()
    } catch (e) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (theme.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!theme.data || !current) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: t('Design System'), icon: 'palette' }]} />
        <EmptyState icon="palette" title={t('The design system could not be loaded')} description={theme.error?.message} />
      </div>
    )
  }

  const tokens = current.tokens
  const byGroup = (group: string) => tokens.filter((token) => token.group === group)
  const setToken = (token: DraftToken, patch: Partial<DraftToken>) => update((d) => ({ ...d, tokens: d.tokens.map((x) => (x.path === token.path ? { ...x, ...patch } : x)) }))
  const removeToken = (token: DraftToken) => update((d) => ({ ...d, tokens: d.tokens.filter((x) => x.path !== token.path) }))
  const tokenName = async (title: string, group: string, name = '') => {
    const asked = await prompt({ title, description: name ? t('Blocks that use token:{path} keep the old name.', { path: `${group}.${name}` }) : undefined, fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: group === 'color' ? 'brand' : 'md' }], values: { name }, confirm: name ? t('Rename') : t('Add') })
    const next = String(asked?.name ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+/, '')
    if (!next || next === name) return null
    if (tokens.some((x) => x.path === `${group}.${next}`)) {
      toast.error(t('“{name}” already exists', { name: next }))
      return null
    }
    return next
  }
  const add = async (group: string, value: any) => {
    const name = await tokenName(newTitle(group), group)
    if (name) update((d) => ({ ...d, tokens: [...d.tokens, { path: `${group}.${name}`, group, name, value, dark: null }] }))
  }
  const rename = async (token: DraftToken) => {
    const name = await tokenName(t('Rename Token'), token.group, token.name)
    if (name) update((d) => retarget(d, token.path, `${token.group}.${name}`))
  }
  const actions = { rename, remove: removeToken }
  /** A control size token, made when first set and removed when cleared (its default applies again). */
  const setControl = (path: string, next: unknown) => update((d) => {
    const empty = next === null || next === undefined || next === ''
    const exists = d.tokens.some((x) => x.path === path)
    if (empty) return { ...d, tokens: d.tokens.filter((x) => x.path !== path) }
    if (exists) return { ...d, tokens: d.tokens.map((x) => (x.path === path ? { ...x, value: next } : x)) }
    return { ...d, tokens: [...d.tokens, { path, group: 'control', name: path.split('.')[1], value: next, dark: null }] }
  })
  /** A token's value as a field drawn with Fields: one control, one width, in every group (sizes bring their fluid switch into the room the others leave). */
  const value = (token: DraftToken, field: Partial<FieldDef>, key: 'value' | 'dark' = 'value') => (
    <Fields bare className={cn('flex min-w-0 flex-1', !['site-size', 'blocks-color'].includes(String(field.component)) && 'pr-8')} fields={[{ handle: `${token.path}:${key}`, type: 'text', label: token.name, size: 'sm', mono: true, ...field }]} values={{ [`${token.path}:${key}`]: token[key] }} onChange={(_, v) => setToken(token, { [key]: key === 'dark' ? v || null : v ?? token[key] })} />
  )
  /** The inspector's value control for a token: a number with its unit. */
  const number = (unit: string, extra: Partial<FieldDef> = {}): Partial<FieldDef> => ({ component: 'blocks-value', unit, ...extra })
  // Samples use the site's values (in the previewed mode), never the admin's own variables.
  const siteVars = Object.fromEntries(tokens.map((token) => [variable(token.group, token.name), css(token.group, mode === 'dark' && token.dark ? token.dark : token.value)])) as CSSProperties
  const durationEase = css('ease', byGroup('ease')[0]?.value ?? 'cubic-bezier(0.2, 0.8, 0.2, 1)')
  const families = [...new Set((theme.data.fonts ?? []).map((font) => font.family))]
  const refreshFonts = () => { void theme.refetch(); frame.current?.contentWindow?.location.reload() }
  // The fonts the site serves, for the font tokens' pickers: added there (from Google Fonts, or a .woff2 file) and removed there when no token uses them.
  const siteFonts = families.map((family) => ({ family, styles: styles((theme.data.fonts ?? []).filter((font) => font.family === family)), used: byGroup('font').some((token) => fontStack(token.value)[0] === family) }))
  const addFont = async (kind: string): Promise<string | null> => {
    try {
      if (kind === 'google') {
        const asked = await prompt({ title: t('Add a Google Font'), description: t('Its files are downloaded to your site.'), fields: [{ handle: 'family', type: 'text', label: t('Name'), placeholder: 'Inter Tight', autofocus: true }], confirm: t('Add') })
        const family = String(asked?.family ?? '').trim()
        if (!family) return null
        await run('design/fonts-import', { family })
        toast.success(t('{family} added', { family }))
        refreshFonts()
        return family
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
      const asked = await prompt({ title: t('Upload Font'), fields: [{ handle: 'family', type: 'text', label: t('Family Name'), autofocus: true }], values: { family: name.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, '').replace(/[-_]/g, ' ') }, confirm: t('Upload') })
      const family = String(asked?.family ?? '').trim()
      if (!family) return null
      await run('design/fonts-upload', { family, name, data, weight: /variable/i.test(name) ? '100 900' : '400', style: /italic/i.test(name) ? 'italic' : 'normal' })
      toast.success(t('{family} uploaded', { family }))
      refreshFonts()
      return family
    } catch (e) {
      toast.error(e)
      return null
    }
  }
  const removeFont = async (family: string) => {
    if (!(await confirm({ title: t('Remove {family}?', { family }), description: t('Its files are deleted from your site.'), confirm: t('Remove'), danger: true }))) return
    try {
      await run('design/update', { fonts: (theme.data.fonts ?? []).filter((font) => font.family !== family) })
      refreshFonts()
    } catch (e) {
      toast.error(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar
        crumbs={[{ label: t('Design System'), icon: 'palette' }, { label: sections().flatMap((g) => g.items).find((item) => item.value === section)?.label ?? '' }]}
        actions={
          <Tooltip content={t('Open Site')}>
            <IconButton icon="external" label={t('Open Site')} onClick={() => window.open('/', '_blank', 'noopener')} />
          </Tooltip>
        }
      />
      {/* The sections are rows under Design System in the sidebar: no column of their own, and the sidebar stays the one it was. */}
      <ScreenSidebar title={t('Design System')} backTo="/" backLabel={t('Dashboard')} nested>
        <nav aria-label={t('Design System')} className={sidebar.nested ? 'space-y-px' : 'px-2 pb-4'}>
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
      <SaveBar dirty={dirty} saving={busy} error={failed} onSave={() => void save()} onDiscard={() => { setDraft(null); setFailed(null) }} />
      {/* On a phone the panel takes the screen; the site is a tab away (Open Site). */}
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,460px)_minmax(0,1fr)]">
        <div key={section} className="overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r">
          {section === 'color' && (
            <Group title={t('Colors')} onAdd={() => add('color', '#000000')}>
              <div className="flex h-7 items-center gap-2 text-2xs text-faint">
                <span className="min-w-0 flex-1">{t('Name')}</span>
                <span className={cn(COLOR, 'flex items-center gap-1')}><Icon name="sun" size={11} />{t('Light')}</span>
                <span className={cn(COLOR, 'flex items-center gap-1')}><Icon name="moon" size={11} />{t('Dark')}</span>
                <span className="w-6 shrink-0" />
              </div>
              {byGroup('color').map((token) => (
                <Row key={token.from ?? token.path} token={token} {...actions} wide>
                  <div className={COLOR}>{value(token, { type: 'color', component: 'blocks-color' })}</div>
                  <div className={COLOR}>{value(token, { type: 'color', component: 'blocks-color', placeholder: t('Same') }, 'dark')}</div>
                </Row>
              ))}
            </Group>
          )}

          {section === 'type' && (
            <>
              {/* Fonts are the roles the site uses (sans, display, mono…); each picks, or adds, the font it uses. */}
              <Group title={t('Fonts')} onAdd={() => add('font', [...(families[0] ? [families[0]] : []), 'ui-sans-serif', 'system-ui', 'sans-serif'])}>
                {byGroup('font').map((token) => (
                  <Row
                    key={token.from ?? token.path}
                    token={token}
                    {...actions}
                    sample={<span className="block max-w-7 overflow-hidden whitespace-nowrap text-center text-[17px] leading-none text-ink" style={{ fontFamily: css('font', token.value) }}>Aa</span>}
                    extra={[
                      { separator: true, label: '' },
                      { heading: true, label: t('Fallback') },
                      ...(['sans', 'serif', 'mono'] as const).map((kind) => ({ label: { sans: t('Sans'), serif: t('Serif'), mono: t('Mono') }[kind], checked: fallbackOf(fontStack(token.value)) === kind, onSelect: () => setToken(token, { value: withFallback(token.value, kind) }) })),
                    ]}
                  >
                    {value(token, { component: 'site-font-stack', fonts: siteFonts, onAdd: addFont, onRemove: removeFont })}
                  </Row>
                ))}
              </Group>
              <Group title={t('Type Scale')} onAdd={() => add('text', { min: '1rem', max: '1.25rem' })}>
                {byGroup('text').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} below={<p className="m-0 truncate pb-2.5 leading-[1.1] tracking-[-0.01em] text-ink" style={{ fontSize: css('text', token.value), fontFamily: css('font', byGroup('font').find((x) => x.name === 'display')?.value ?? byGroup('font')[0]?.value) }}>{t('Ship It')}</p>}>
                    {value(token, { component: 'site-size' })}
                  </Row>
                ))}
              </Group>
              <Group title={t('Weights')} onAdd={() => add('weight', '600')}>
                {byGroup('weight').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="text-base text-ink" style={{ fontWeight: Number(token.value) || 400 }}>Ag</span>}>
                    {value(token, number('', { step: 100, min: 100, max: 900 }))}
                  </Row>
                ))}
              </Group>
              <Group title={t('Line Heights')} onAdd={() => add('leading', '1.5')}>
                {byGroup('leading').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="flex w-4 flex-col" style={{ gap: `${Math.max(1, (Number(token.value) - 0.8) * 6)}px` }}>{[0, 1, 2].map((i) => <span key={i} className={cn('h-0.5 rounded-full bg-muted', i === 2 && 'w-2/3')} />)}</span>}>
                    {value(token, number('', { step: 0.05, min: 0 }))}
                  </Row>
                ))}
              </Group>
              <Group title={t('Letter Spacing')} onAdd={() => add('tracking', '0em')}>
                {byGroup('tracking').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="text-xs font-medium text-ink" style={{ letterSpacing: css('tracking', token.value) }}>Aa</span>}>
                    {value(token, number('em', { units: ['em', 'px'], step: 0.005 }))}
                  </Row>
                ))}
              </Group>
            </>
          )}

          {section === 'space' && (
            <>
              <Group title={t('Spacing')} onAdd={() => add('space', '1rem')}>
                {byGroup('space').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} after={<Bar value={token.value} of={byGroup('space')} />}>
                    {value(token, { component: 'site-size' })}
                  </Row>
                ))}
              </Group>
              <Group title={t('Containers')} onAdd={() => add('container', '72rem')}>
                {byGroup('container').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} after={<Bar value={token.value} of={byGroup('container')} />}>
                    {value(token, { component: 'site-size' })}
                  </Row>
                ))}
              </Group>
              <Group title={t('Breakpoints')} onAdd={() => add('breakpoint', '768px')}>
                {byGroup('breakpoint').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} after={<Bar value={token.value} of={byGroup('breakpoint')} />}>
                    {value(token, number('px', { units: ['px', 'rem', 'em'], min: 0 }))}
                  </Row>
                ))}
              </Group>
            </>
          )}

          {section === 'shape' && (
            <>
              <Group title={t('Radius')} onAdd={() => add('radius', '0.5rem')}>
                {byGroup('radius').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted" style={{ borderTopLeftRadius: `min(${css('radius', token.value)}, 20px)` }} />}>
                    {value(token, number('px', { units: ['px', 'rem', '%'], min: 0 }))}
                  </Row>
                ))}
              </Group>
              <Group title={t('Shadows')} onAdd={() => add('shadow', '0 4px 16px -4px rgb(0 0 0 / 0.12)')}>
                {byGroup('shadow').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="size-5 shrink-0 rounded-[5px] border border-border bg-bg" style={{ boxShadow: css('shadow', token.value) }} />}>
                    {value(token, { component: 'site-shadow' })}
                  </Row>
                ))}
              </Group>
            </>
          )}

          {section === 'motion' && (
            <>
              <Group title={t('Page Transition')}>
                <Setting label={t('Effect')}>
                  <Fields bare className="flex min-w-0 flex-1" fields={[{ handle: 'type', type: 'select', label: t('Effect'), size: 'sm', required: true, options: { none: t('None'), fade: t('Fade'), slide: t('Slide'), scale: t('Scale') } }]} values={current.transition} onChange={(_, v) => update((d) => ({ ...d, transition: { ...d.transition, type: String(v ?? 'none') } }))} />
                </Setting>
                {current.transition.type !== 'none' && (
                  <Setting label={t('Duration')}>
                    <Fields bare className="flex min-w-0 flex-1" fields={[{ handle: 'duration', type: 'text', component: 'blocks-value', label: t('Duration'), unit: 'ms', units: ['ms'], step: 10, min: 50, max: 2000 }]} values={{ duration: `${Math.round(current.transition.duration * 1000)}ms` }} onChange={(_, v) => update((d) => ({ ...d, transition: { ...d.transition, duration: seconds(v, d.transition.duration) } }))} />
                  </Setting>
                )}
              </Group>
              <Group title={t('Durations')} onAdd={() => add('duration', '300ms')}>
                {byGroup('duration').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions} sample={<span className="relative h-3 w-6"><span className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-muted transition-transform group-hover:translate-x-4" style={{ transitionDuration: css('duration', token.value), transitionTimingFunction: durationEase }} /></span>}>
                    {value(token, number('ms', { units: ['ms'], step: 10, min: 0 }))}
                  </Row>
                ))}
              </Group>
              <Group title={t('Easing')} onAdd={() => add('ease', 'cubic-bezier(0.2, 0.8, 0.2, 1)')}>
                {byGroup('ease').map((token) => (
                  <Row key={token.from ?? token.path} token={token} {...actions}>
                    {value(token, { component: 'ease' })}
                  </Row>
                ))}
              </Group>
            </>
          )}

          {section === 'elements' && (
            <>
              <StyleList title={t('Elements')} options={theme.data.elements ?? []} tokens={tokens} vars={siteVars} value={current.styles} onChange={(styles) => update((d) => ({ ...d, styles }))} />
            </>
          )}

          {section === 'prose' && <Prose value={current.prose} options={theme.data.elements ?? []} tokens={tokens} vars={siteVars} onChange={(prose) => update((d) => ({ ...d, prose }))} />}

          {section === 'sizes' && <ControlSizeTable defaults={theme.data.controlSizes ?? {}} tokens={tokens} onSet={setControl} />}
          {section === 'buttons' && <ButtonVariants value={current.buttons} tokens={tokens} open={buttonOpen} onOpen={setButtonOpen} onChange={(buttons) => update((d) => ({ ...d, buttons }))} />}
          {section === 'fields' && <FieldEditor schema={theme.data.fieldStyles ?? {}} value={current.fields} tokens={tokens} dark={mode === 'dark'} open={fieldOpen} onOpen={setFieldOpen} onChange={(fields) => update((d) => ({ ...d, fields }))} />}

          {section === 'code' && <Code css={current.css} js={current.js} onChange={(code) => update((d) => ({ ...d, ...code }))} />}
        </div>

        <div className="flex min-w-0 flex-col bg-sunken max-md:hidden">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3">
            <Segmented size="xs" value={viewport} onChange={setViewport} options={[{ value: 'desktop', icon: 'desktop', title: t('Desktop') }, { value: 'tablet', icon: 'tablet', title: t('Tablet') }, { value: 'phone', icon: 'phone', title: t('Phone') }]} />
            {viewport !== 'desktop' && <span className="font-mono text-2xs text-faint">{WIDTHS[viewport]}</span>}
            <span className="flex-1" />
            <Segmented size="xs" value={mode} onChange={setMode} options={[{ value: 'light', icon: 'sun', title: t('Light') }, { value: 'dark', icon: 'moon', title: t('Dark') }]} />
          </div>
          <Preview viewport={viewport} desktop={page === '/' ? px(theme.data.breakpoints?.lg) || 1024 : 0}>
            {(style) => <iframe key={page} ref={frame} src={page} title={page === '/' ? t('Site Preview') : t('Specimen')} className={cn('border-0 bg-bg', viewport !== 'desktop' && 'border-x border-border')} style={style} onLoad={() => { inject(); showPart(frame.current?.contentDocument, part, false) }} />}
          </Preview>
        </div>
      </div>
    </div>
  )
}

/** The width of a color column (light, dark). */
const COLOR = 'w-[108px] shrink-0 max-sm:w-[92px]'

/** A duration typed in the inspector's control (`250ms`, `0.3s`) in seconds, as the page transition stores it. */
function seconds(value: unknown, fallback: number): number {
  const m = String(value ?? '').trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/)
  if (!m) return fallback
  const n = m[2] === 's' ? Number(m[1]) : Number(m[1]) / 1000
  return Math.min(2, Math.max(0.05, Math.round(n * 1000) / 1000))
}

/**
 * One token: an optional sample, its name (click to copy `token:group.name`), its
 * value control — the same width in every group — and a menu. `below` adds a
 * specimen line, `after` a visual after the value; `wide` gives the value the row
 * (colors, with a column for each mode).
 */
function Row({ token, sample, after, below, wide, rename, remove, extra, children }: { token: DraftToken; sample?: ReactNode; after?: ReactNode; below?: ReactNode; wide?: boolean; rename: (token: DraftToken) => void; remove: (token: DraftToken) => void; extra?: MenuItemDef[]; children: ReactNode }) {
  const reference = `token:${token.path}`
  const copy = () => void copyText(reference, { copied: t('Copied {reference}', { reference }) })
  return (
    <div className="group border-b border-border last:border-b-0">
      <div className="flex min-h-9 items-center gap-2 py-1">
        {sample !== undefined && <span className="grid w-7 shrink-0 place-items-center">{sample}</span>}
        <Tooltip content={<span className="font-mono">{reference}</span>}>
          <button type="button" onClick={copy} title={token.name} className={cn('h-6 truncate rounded-xs text-left text-xs text-text hover:text-ink', wide ? 'min-w-0 flex-1' : sample !== undefined ? 'w-[84px] shrink-0 max-sm:w-16' : 'w-[120px] shrink-0 max-sm:w-20')}>
            {token.name}
          </button>
        </Tooltip>
        {/* On a phone the value takes the row; the bar beside it waits for a wider screen. */}
        {wide ? children : <div className="flex w-60 min-w-0 shrink max-lg:w-52 max-sm:w-auto max-sm:flex-1">{children}</div>}
        {!wide && <span className="flex min-w-0 flex-1 items-center max-sm:hidden">{after}</span>}
        <Menu
          trigger={<IconButton icon="more" label={t('Token Actions')} size="xs" className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100" />}
          items={[
            { label: t('Copy Reference'), icon: 'copy', onSelect: copy },
            { label: t('Rename…'), icon: 'edit', onSelect: () => rename(token) },
            ...(extra ?? []),
            { separator: true, label: '' },
            { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => remove(token) },
          ]}
        />
      </div>
      {below}
    </div>
  )
}

/** A row of a setting that is not a token, in a token row's columns. */
function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-2 border-b border-border py-1 last:border-b-0">
      <span className="w-[120px] shrink-0 truncate text-xs text-text">{label}</span>
      <div className="flex w-60 min-w-0 shrink pr-8 max-lg:w-52">{children}</div>
      <span className="min-w-0 flex-1 max-sm:hidden" />
      <span className="size-6 shrink-0" />
    </div>
  )
}

/** A length as a bar, relative to the largest in its group. */
function Bar({ value, of }: { value: any; of: Token[] }) {
  const max = Math.max(...of.map((token) => px(token.value)), 1)
  if (px(value) <= 0) return null
  return <span className="h-1.5 min-w-px rounded-full bg-border-strong" style={{ width: `${(px(value) / max) * 100}%` }} />
}

/** The weights a family's files cover, short: 400, 400–700, 100–900; and Italic when it has italics. */
function styles(files: Font[]): string {
  const weights = files.flatMap((font) => String(font.weight ?? '400').split(/\s+/).map(Number)).filter((n) => n > 0)
  const low = Math.min(...weights)
  const high = Math.max(...weights)
  const range = weights.length === 0 ? '400' : low === high ? String(low) : `${low}–${high}`
  return files.some((font) => font.style === 'italic') ? `${range} · ${t('Italic')}` : range
}

/** What people call the elements the design system styles. */
function elementLabel(selector: string): string {
  const names: Record<string, string> = {
    html: t('Page'), body: t('Body'), h1: t('Heading 1'), h2: t('Heading 2'), h3: t('Heading 3'), h4: t('Heading 4'), h5: t('Heading 5'), h6: t('Heading 6'),
    p: t('Paragraph'), a: t('Link'), 'a:hover': t('Link on Hover'), small: t('Small Text'), strong: t('Bold Text'), em: t('Italic Text'), mark: t('Highlight'),
    code: t('Code'), kbd: t('Keyboard Key'), pre: t('Code Block'), blockquote: t('Quote'), hr: t('Divider'), ul: t('Bulleted List'), ol: t('Numbered List'),
    li: t('List Item'), img: t('Image'), figcaption: t('Caption'), table: t('Table'), th: t('Table Header'), td: t('Table Cell'),
    '::selection': t('Selected Text'), ':focus-visible': t('Focus Ring'),
    'h1 em': t('Italic in Heading 1'), 'h2 em': t('Italic in Heading 2'), 'h3 em': t('Italic in Heading 3'), 'h1 strong': t('Bold in Heading 1'), 'h2 strong': t('Bold in Heading 2'),
  }
  return names[selector] ?? selector
}

/** Short element-style keys from earlier versions, as the compiler reads them (DesignCompiler::SHORT). */
const SHORT: Record<string, string> = { font: 'fontFamily', size: 'fontSize', weight: 'fontWeight', leading: 'lineHeight', tracking: 'letterSpacing', transform: 'textTransform', decoration: 'textDecoration', underlineOffset: 'textUnderlineOffset', wrap: 'textWrap', style: 'fontStyle', features: 'fontFeatureSettings', background: 'backgroundColor', radius: 'borderRadius' }
const UNITLESS = new Set(['fontWeight', 'lineHeight', 'opacity', 'zIndex'])

/** Declarations with their keys spelled out (short keys from earlier versions become camelCase properties). */
function longhand(declarations: Declarations | undefined): Declarations {
  return Object.fromEntries(Object.entries(declarations ?? {}).map(([key, v]) => [SHORT[key] ?? key, v]))
}

/** Declarations as React styles, roughly as the compiler writes them (tokens → var()). */
function style(declarations: Declarations | undefined): CSSProperties {
  return Object.fromEntries(Object.entries(longhand(declarations)).map(([prop, v]) => [prop, typeof v === 'number' && !UNITLESS.has(prop) && v !== 0 ? `${v}px` : css('', v)]))
}

/** The controls for type: font, size, weight, spacing and color, each offering the site's tokens. */
function textFields(tokens: Token[]): FieldDef[] {
  const of = (group: string) => tokens.filter((token) => token.group === group)
  return [
    { handle: 'fontFamily', type: 'select', size: 'sm', label: t('Font'), placeholder: t('Inherit'), options: of('font').map((token) => ({ value: `token:${token.path}`, label: token.name })) },
    { handle: 'fontSize', type: 'text', component: 'blocks-value', label: t('Size'), group: 'text', placeholder: t('Inherit'), unit: 'rem', units: ['rem', 'px', 'em', '%'], step: 0.125 },
    { handle: 'fontWeight', type: 'select', size: 'sm', label: t('Weight'), placeholder: t('Inherit'), options: [...of('weight').map((token) => ({ value: `token:${token.path}`, label: `${token.name} · ${token.value}` })), ...['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((w) => ({ value: w, label: w }))] },
    { handle: 'lineHeight', type: 'text', component: 'blocks-value', label: t('Line Height'), group: 'leading', unit: '', step: 0.05, placeholder: t('Inherit') },
    { handle: 'letterSpacing', type: 'text', component: 'blocks-value', label: t('Letter Spacing'), group: 'tracking', unit: 'em', units: ['em', 'px'], step: 0.005, placeholder: '0' },
    { handle: 'color', type: 'color', component: 'blocks-color', label: t('Color'), placeholder: t('Inherit') },
  ]
}

/** The controls for a box: fill, border, corners and padding. */
function boxFields(): FieldDef[] {
  return [
    { handle: 'backgroundColor', type: 'color', component: 'blocks-color', label: t('Fill'), placeholder: t('None') },
    {
      handle: 'border', type: 'group', component: 'blocks-group', label: t('Border'),
      fields: [
        { handle: 'borderWidth', type: 'text', component: 'blocks-value', label: t('Border Width'), placeholder: '0', min: 0, className: '!flex-none w-[64px]' },
        { handle: 'borderColor', type: 'color', component: 'blocks-color', label: t('Border Color'), placeholder: t('None') },
      ],
    },
    { handle: 'borderRadius', type: 'text', component: 'blocks-value', label: t('Radius'), group: 'radius', unit: 'px', units: ['px', 'rem', '%'], min: 0, placeholder: '0' },
    {
      handle: 'padding', type: 'group', component: 'blocks-group', label: t('Padding'),
      fields: [
        { handle: 'paddingBlock', type: 'text', component: 'blocks-value', label: t('Vertical Padding'), group: 'space', prefixIcon: 'b-arrows-out-line-vertical', unit: 'rem', placeholder: '0', min: 0 },
        { handle: 'paddingInline', type: 'text', component: 'blocks-value', label: t('Horizontal Padding'), group: 'space', prefixIcon: 'b-arrows-out-line-horizontal', unit: 'rem', placeholder: '0', min: 0 },
      ],
    },
    {
      handle: 'margin', type: 'group', component: 'blocks-group', label: t('Margin'),
      fields: [
        { handle: 'marginTop', type: 'text', component: 'blocks-value', label: t('Top Margin'), group: 'space', prefix: 'T', unit: 'rem', units: ['rem', 'em', 'px'], placeholder: '0' },
        { handle: 'marginBottom', type: 'text', component: 'blocks-value', label: t('Bottom Margin'), group: 'space', prefix: 'B', unit: 'rem', units: ['rem', 'em', 'px'], placeholder: '0' },
      ],
    },
  ]
}

/**
 * Declarations edited with controls: each field's handle is the property it sets (a
 * group's sub-fields are). Any other property is added below with its own control; a
 * row's ⋯ menu resets or removes it.
 */
function StyleControls({ value, onChange, fields }: { value: Declarations | undefined; onChange: (next: Declarations) => void; fields: FieldDef[] }) {
  return <Fields bare fields={[{ handle: 'style', type: 'json', component: 'blocks-more', label: t('Style'), controls: fields }]} values={{ style: longhand(value) }} onChange={(_, next) => onChange((next ?? {}) as Declarations)} />
}

/** Elements (or prose elements) and their styles: a specimen each, its controls a click away. */
function StyleList({ title, value, onChange, options, tokens, vars }: { title: string; value: Record<string, Declarations>; onChange: (v: Record<string, Declarations>) => void; options: string[]; tokens: Token[]; vars: CSSProperties }) {
  const [open, setOpen] = useState<string | null>(null)
  const free = options.filter((option) => !(option in value))
  const fields = [...textFields(tokens), ...boxFields()]
  return (
    <Group title={title} action={<Menu trigger={<IconButton icon="plus" label={t('Add Element')} size="xs" />} items={free.map((option) => ({ label: elementLabel(option), onSelect: () => { onChange({ ...value, [option]: {} }); setOpen(option) } }))} className="max-h-72 overflow-auto" />}>
      {Object.keys(value).length === 0 && <p className="m-0 py-3 text-xs text-faint">{t('No element styles')}</p>}
      {Object.entries(value).map(([element, declarations]) => (
        <Disclosure
          key={element}
          open={open === element}
          onToggle={() => setOpen(open === element ? null : element)}
          label={elementLabel(element)}
          // A specimen on the site's own background, in the site's text color unless the element sets its own.
          aside={<span aria-hidden="true" className="grid h-6 w-9 shrink-0 place-items-center rounded-xs" style={{ ...vars, background: 'var(--color-background)', color: 'var(--color-foreground)' }}><span className="px-0.5" style={{ ...style(declarations), fontSize: 15, lineHeight: 1.2, margin: 0, paddingBlock: 0 }}>Aa</span></span>}
          menu={<Menu trigger={<IconButton icon="more" label={t('Element Actions')} size="xs" className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100" />} items={[{ label: t('Remove'), icon: 'trash', danger: true, onSelect: () => onChange(Object.fromEntries(Object.entries(value).filter(([k]) => k !== element))) }]} />}
        >
          <StyleControls value={declarations} fields={fields} onChange={(next) => onChange({ ...value, [element]: next })} />
        </Disclosure>
      ))}
    </Group>
  )
}

/** The flow of prose, between its blocks whatever they are: key, label, the reset's default. */
const PROSE_SPACING = (): [string, string, string][] => [
  ['blocks', t('Between Blocks'), '1.1em'],
  ['headings', t('Before Headings'), '1.8em'],
  ['afterHeadings', t('After Headings'), '0.6em'],
  ['items', t('Between List Items'), '0.35em'],
]

/**
 * Long-form text, in any block styled as prose: the spacing between its blocks (custom
 * ones too), then how each element looks there. An element's top margin replaces the
 * spacing before it.
 */
function Prose({ value, onChange, options, tokens, vars }: { value: Record<string, Declarations>; onChange: (v: Record<string, Declarations>) => void; options: string[]; tokens: Token[]; vars: CSSProperties }) {
  const { spacing = {}, ...elements } = value
  const write = (nextSpacing: Declarations, nextElements: Record<string, Declarations>) => onChange({ ...(Object.keys(nextSpacing).length ? { spacing: nextSpacing } : {}), ...nextElements })
  return (
    <>
      <Group title={t('Spacing')}>
        {PROSE_SPACING().map(([key, label, fallback]) => (
          <Setting key={key} label={label}>
            <Fields
              bare
              className="flex min-w-0 flex-1"
              fields={[{ handle: key, type: 'text', component: 'blocks-value', label, group: 'space', unit: 'em', units: ['em', 'rem', 'px'], step: 0.05, min: 0, placeholder: fallback }]}
              values={{ [key]: spacing[key] ?? null }}
              onChange={(_, v) => {
                const next: Declarations = { ...spacing }
                if (v === null || v === undefined || v === '') delete next[key]
                else next[key] = v as string
                write(next, elements)
              }}
            />
          </Setting>
        ))}
      </Group>
      <StyleList title={t('Elements')} options={options} tokens={tokens} vars={vars} value={elements} onChange={(next) => write(spacing, next)} />
    </>
  )
}

/**
 * The size scale of everything people click or type in (`control` tokens): each size's height,
 * padding and text size. A button and a field of the same size line up.
 */
function ControlSizeTable({ defaults, tokens, onSet }: { defaults: Record<string, Record<string, string | string[]>>; tokens: Token[]; onSet: (path: string, value: unknown) => void }) {
  const sizes: [string, string][] = [['sm', t('Small')], ['md', t('Medium')], ['lg', t('Large')]]
  const columns: [string, string, Partial<FieldDef>][] = [
    ['height', t('Height'), { unit: 'rem', units: ['rem', 'px'], step: 0.125, min: 0 }],
    ['padding', t('Padding'), { unit: 'rem', units: ['rem', 'px', 'em'], step: 0.125, min: 0, group: 'space' }],
    ['text', t('Text'), { unit: 'rem', units: ['rem', 'px'], step: 0.0625, min: 0, group: 'text' }],
  ]
  const shown = (fallback: string | string[] | undefined) => {
    const first = Array.isArray(fallback) ? fallback.find((item) => !item.startsWith('token:') || tokens.some((token) => `token:${token.path}` === item)) : fallback
    return String(first ?? '').replace(/^token:[a-z]+\./, '')
  }
  return (
    <Group title={t('Sizes')}>
      <div className="grid grid-cols-[52px_repeat(3,minmax(0,1fr))] items-center gap-x-2 gap-y-1.5 py-2">
        <span />
        {columns.map(([key, label]) => <span key={key} className="text-2xs text-faint">{label}</span>)}
        {sizes.map(([size, label]) => (
          <Fragment key={size}>
            <span className="text-xs text-text">{label}</span>
            {columns.map(([key, columnLabel, extra]) => {
              const path = `control.${size}-${key}`
              const token = tokens.find((x) => x.path === path)
              return (
                <Fields key={key} bare fields={[{ handle: path, type: 'text', component: 'blocks-value', label: `${label} ${columnLabel}`, placeholder: shown(defaults[size]?.[key]), ...extra } as FieldDef]} values={{ [path]: token?.value ?? null }} onChange={(_, v) => onSet(path, v)} />
              )
            })}
          </Fragment>
        ))}
      </div>
    </Group>
  )
}

/** Button variants (Primary, Secondary…) used by every Button block: each opens on its controls, state by state; the specimen above shows them. */
function ButtonVariants({ value, onChange, tokens, open, onOpen }: { value: Buttons; onChange: (v: Buttons) => void; tokens: Token[]; open: string | null; onOpen: (name: string | null) => void }) {
  const [state, setState] = useState<'base' | 'hover' | 'active' | 'focus-visible'>('base')
  const add = async () => {
    const asked = await prompt({ title: t('New Button Variant'), fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'outline', mono: true, autofocus: true }], confirm: t('Add') })
    const name = String(asked?.name ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (name && !(name in value)) {
      onChange({ ...value, [name]: { base: {}, hover: {} } })
      onOpen(name)
    }
  }
  // A variant is its states, and the background it's made for (`surface`, for the preview); one saved as plain declarations is its base state.
  const split = (variant: Record<string, unknown>) => {
    const { surface, ...rest } = variant
    const states = (['base', 'hover', 'active', 'focus-visible'].some((key) => key in rest) ? rest : { base: rest }) as Record<string, Declarations>
    return { surface: typeof surface === 'string' ? surface : undefined, states }
  }
  const write = (name: string, surface: string | undefined, states: Record<string, Declarations>) => onChange({ ...value, [name]: { ...states, ...(surface ? { surface } : {}) } as Record<string, Declarations> })
  const label = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  // A variant is a look: how big a button is comes from the control sizes it shares with fields.
  const fields = [...boxFields().filter((f) => f.handle !== 'padding' && f.handle !== 'margin'), ...textFields(tokens).filter((f) => ['fontWeight', 'letterSpacing', 'color'].includes(f.handle)).map((f) => (f.handle === 'color' ? { ...f, label: t('Text') } : f)), { handle: 'boxShadow', type: 'text', component: 'blocks-shadows', label: t('Shadow'), group: 'shadow' } as FieldDef, { handle: 'opacity', type: 'text', component: 'blocks-value', label: t('Opacity'), percent: true, step: 0.05, min: 0, max: 1, placeholder: '100' } as FieldDef]

  return (
    <Group title={t('Button Variants')} onAdd={add}>
      {Object.keys(value).length === 0 && <p className="m-0 py-3 text-xs text-faint">{t('No variants')}</p>}
      {Object.entries(value).map(([name, variant]) => (
        <Disclosure
          key={name}
          open={open === name}
          onToggle={() => onOpen(open === name ? null : name)}
          label={label(name)}
          menu={<Menu trigger={<IconButton icon="more" label={t('Variant Actions')} size="xs" className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100" />} items={[{ label: t('Delete'), icon: 'trash', danger: true, onSelect: () => onChange(Object.fromEntries(Object.entries(value).filter(([k]) => k !== name))) }]} />}
        >
          {/* The end keeps the place of the style rows' ⋯, so this lines up with them. */}
          <div className="mb-2 flex items-center gap-1">
            <Fields layout="inline" className="min-w-0 flex-1" fields={[{ handle: 'surface', type: 'color', component: 'blocks-color', label: t('Shown On'), placeholder: t('Page Background') }]} values={{ surface: split(variant).surface ?? null }} onChange={(_, v) => write(name, (v as string | null) || undefined, split(variant).states)} />
            <span className="size-6 shrink-0" />
          </div>
          <div className="mb-2">
            <Segmented size="xs" block aria-label={t('State')} value={state} onChange={setState} options={[{ value: 'base', label: t('Default') }, { value: 'hover', label: t('Hover') }, { value: 'active', label: t('Pressed') }, { value: 'focus-visible', label: t('Focus') }]} />
          </div>
          <StyleControls key={state} value={split(variant).states[state]} fields={fields} onChange={(next) => write(name, split(variant).surface, { ...split(variant).states, [state]: next })} />
        </Disclosure>
      ))}
    </Group>
  )
}

/** Custom CSS and JavaScript (content/design/custom.css|js), saved with everything else. */
function Code({ css, js, onChange }: { css: string; js: string; onChange: (code: { css?: string; js?: string }) => void }) {
  const allowed = can('site.code')
  const field = (handle: 'css' | 'js', label: string, placeholder: string, value: string) => (
    <Group title={label}>
      <div className="py-2.5">
        <Fields bare fields={[{ handle, type: 'code', label, rows: 14, placeholder }]} values={{ [handle]: value }} onChange={(_, v) => onChange({ [handle]: v ?? '' })} disabled={!allowed} />
      </div>
    </Group>
  )
  return (
    <>
      {field('css', t('Custom CSS'), '.cms-prose figure { margin-block: 2rem; }', css)}
      {field('js', t('Custom JavaScript'), "document.addEventListener('cms:alpine', (e) => …)", js)}
      {!allowed && <p className="m-0 text-2xs text-warning">{t('Editing code needs the “Edit custom CSS and JavaScript” permission.')}</p>}
    </>
  )
}
