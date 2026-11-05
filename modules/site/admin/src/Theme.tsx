import { can, queryClient, run, t, useAbility, useTab, type FieldDef } from '@letterncms/sdk'
import { Button, EmptyState, Fields, IconButton, Menu, SaveBar, ScreenSidebar, Segmented, SidebarRow, Spinner, Tooltip, Topbar, cn, confirm, prompt, toast, useScreenSidebar } from '@letterncms/ui'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* The Design System screen: the site's theme (content/design/theme.json, Lettern Design).
   A theme is a few decisions; every color, size and step of the site follows from them,
   with contrast checked. Change one and the site beside it is rebuilt from the draft. */

type Theme = Record<string, any>

interface Resolved {
  palettes: Record<string, { seed: string; shades: Record<string, string>; fill: string; on: string }>
  schemes: Record<string, { background: string; foreground: string; mix: { muted: number } }>
  sizes: Record<string, { min: number; max: number }>
  space: Record<string, { min: number; max: number }>
  textStyles: Record<string, { font: string; size: string; weight: string; leading: string; tracking: string; case: string; style: string }>
  families: Record<string, string>
  weights: Record<string, number>
  radii: Record<string, string>
  durations: Record<string, number>
  containers: Record<string, string>
}

type Finding = { level: 'error' | 'warning'; scheme: string; pair: string; ratio: number; needs: number }

interface DesignInfo {
  theme: Theme
  resolved: Resolved
  findings: Finding[]
  design: string
  js: string
  catalog: { scales: Record<string, any>; collections: { textStyles: string[] }; descriptions: { textStyles: Record<string, string> } }
}

const SECTIONS = ['color', 'type', 'space', 'shape', 'motion', 'elements', 'agents', 'code'] as const
type SectionKey = (typeof SECTIONS)[number]

const sections = (): { value: SectionKey; label: string; icon: string }[] => [
  { value: 'color', label: t('Color'), icon: 'palette' },
  { value: 'type', label: t('Typography'), icon: 'typography' },
  { value: 'space', label: t('Space and Layout'), icon: 'spacing' },
  { value: 'shape', label: t('Shape and Components'), icon: 'radius' },
  { value: 'motion', label: t('Motion'), icon: 'speed' },
  { value: 'elements', label: t('Elements'), icon: 'paragraph' },
  { value: 'agents', label: t('Contrast and Agents'), icon: 'sparkle' },
  { value: 'code', label: t('Custom Code'), icon: 'code' },
]

const SPACES = ['0', '3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']
const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
const STATUS = ['success', 'warning', 'danger', 'info'] as const
const FAMILY_SLOTS = ['sans', 'serif', 'mono', 'display', 'condensed'] as const
const WIDTHS = { desktop: '100%', tablet: '768px', phone: '390px' } as const
type Viewport = keyof typeof WIDTHS

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
const options = (list: readonly string[], labels: Record<string, string> = {}) => list.map((v) => ({ value: v, label: labels[v] ?? v }))

/** Set a value at a path of the theme, dropping empty objects on the way back up. */
function setIn(theme: Theme, path: string[], value: unknown): Theme {
  const [key, ...rest] = path
  const next = { ...theme }
  if (rest.length) {
    const child = setIn(theme[key] && typeof theme[key] === 'object' && !Array.isArray(theme[key]) ? theme[key] : {}, rest, value)
    if (Object.keys(child).length) next[key] = child
    else delete next[key]
  } else if (value === undefined || value === null || value === '') delete next[key]
  else next[key] = value
  return next
}

const getIn = (theme: Theme, path: string[]): any => path.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), theme)

export default function ThemeScreen() {
  const info = useAbility<DesignInfo>('design/get', {}, { refetchOnWindowFocus: false, retry: false })
  const base = info.data?.theme ?? null
  const [draft, setDraft] = useState<Theme | null>(null)
  const [js, setJs] = useState<string | null>(null)
  const [section, setSection] = useTab(SECTIONS)
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ css: string; resolved: Resolved; findings: Finding[] } | null>(null)
  const [invalid, setInvalid] = useState<string | null>(null)
  const sidebar = useScreenSidebar()
  const frame = useRef<HTMLIFrameElement>(null)

  const theme = draft ?? base
  const dirty = (!!draft && !same(draft, base)) || (js !== null && js !== (info.data?.js ?? ''))
  const resolved = preview?.resolved ?? info.data?.resolved
  const findings = preview?.findings ?? info.data?.findings ?? []
  const set = (path: string[], value: unknown) => base && setDraft((d) => setIn(d ?? base, path, value))
  const get = (path: string[]) => (theme ? getIn(theme, path) : undefined)

  // The server builds the draft theme with the same engine the site uses: its stylesheet, values and contrast.
  useEffect(() => {
    if (!draft || same(draft, base)) {
      setPreview(null)
      setInvalid(null)
      return
    }
    let live = true
    const timer = setTimeout(() => {
      run<{ css: string; resolved: Resolved; findings: Finding[] }>('design/preview', { theme: draft, replace: true }).then(
        (r) => live && (setPreview(r), setInvalid(null)),
        (e) => live && setInvalid(e instanceof Error ? e.message : String(e)),
      )
    }, 160)
    return () => {
      live = false
      clearTimeout(timer)
    }
  }, [draft, base])

  const inject = () => {
    const doc = frame.current?.contentDocument
    if (!doc?.head) return
    const link = doc.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/_cms/site/design-"]')
    let style = doc.getElementById('cms-design-preview') as HTMLStyleElement | null
    if (preview) {
      if (!style) {
        style = doc.createElement('style')
        style.id = 'cms-design-preview'
        // In the stylesheet's place, so its cascade layers keep their order.
        link ? link.after(style) : doc.head.appendChild(style)
      }
      if (style.textContent !== preview.css) style.textContent = preview.css
      if (link) link.disabled = true
    } else {
      style?.remove()
      if (link) link.disabled = false
    }
    if (doc.documentElement.dataset.mode !== mode) doc.documentElement.dataset.mode = mode
  }
  useEffect(inject)

  const save = async () => {
    if (!dirty || busy || !theme) return
    setBusy(true)
    setFailed(null)
    try {
      if (draft && !same(draft, base)) {
        const r = await run<{ findings: Finding[] }>('design/update', { theme: draft, replace: true })
        const errors = r.findings.filter((f) => f.level === 'error').length
        if (errors) toast.error(t('Saved, but {n} color pairs miss their contrast. See Contrast and Agents.', { n: errors }))
      }
      if (js !== null && js !== (info.data?.js ?? '')) await run('design/code', { js })
      await queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && (q.queryKey[0].startsWith('design/') || q.queryKey[0] === 'blocks/types') })
      setDraft(null)
      setJs(null)
      frame.current?.contentWindow?.location.reload()
    } catch (e) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  if (info.isLoading) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  if (!info.data || !theme || !resolved) {
    return (
      <div className="flex h-full flex-col">
        <Topbar crumbs={[{ label: t('Design System'), icon: 'palette' }]} />
        <EmptyState icon="palette" title={t('The design system could not be loaded')} description={info.error?.message} />
      </div>
    )
  }

  const errors = findings.filter((f) => f.level === 'error')
  const families = [...new Set(((theme.font?.faces ?? []) as { family: string }[]).map((f) => f.family))]
  const palettes = Object.keys(resolved.palettes)
  const shades = palettes.flatMap((p) => SHADES.map((s) => `${p}-${s}`))
  const field = (path: string[], def: Partial<FieldDef>) => (
    <Fields bare className="flex min-w-0 flex-1" fields={[{ handle: path.join('.'), type: 'text', size: 'sm', label: def.label ?? path.at(-1), ...def } as FieldDef]} values={{ [path.join('.')]: get(path) }} onChange={(_, v) => set(path, v)} />
  )
  const pair = (path: string[], fallback: [number, number], unit: string, step = 1) => {
    const value = (get(path) as [number, number] | undefined) ?? fallback
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <NumberInput value={value[0]} step={step} unit={unit} label={t('Narrow')} onChange={(n) => set(path, [n, value[1]])} />
        <span className="text-2xs text-faint">→</span>
        <NumberInput value={value[1]} step={step} unit={unit} label={t('Wide')} onChange={(n) => set(path, [value[0], n])} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar
        crumbs={[{ label: t('Design System'), icon: 'palette' }, { label: sections().find((s) => s.value === section)?.label ?? '' }]}
        actions={
          <>
            {errors.length > 0 && <button type="button" onClick={() => setSection('agents')} className="mr-1 rounded-full bg-danger-soft px-2 py-0.5 text-2xs font-medium text-danger">{t('{n} contrast issues', { n: errors.length })}</button>}
            <Tooltip content={t('Open Site')}>
              <IconButton icon="external" label={t('Open Site')} onClick={() => window.open('/', '_blank', 'noopener')} />
            </Tooltip>
          </>
        }
      />
      <ScreenSidebar title={t('Design System')} backTo="/" backLabel={t('Dashboard')} nested>
        <nav aria-label={t('Design System')} className={sidebar.nested ? 'space-y-px' : 'px-2 pb-4'}>
          {sections().map((item) => (
            <SidebarRow key={item.value} label={item.label} icon={sidebar.nested ? undefined : item.icon} active={section === item.value} onClick={() => setSection(item.value)} />
          ))}
        </nav>
      </ScreenSidebar>
      <SaveBar dirty={dirty} saving={busy} error={failed ?? invalid} onSave={() => void save()} onDiscard={() => { setDraft(null); setJs(null); setFailed(null) }} />
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(340px,440px)_minmax(0,1fr)] xl:grid-cols-[minmax(380px,480px)_minmax(0,1fr)]">
        <div key={section} className="overflow-y-auto border-border px-4 pb-16 pt-2 md:border-r">
          {section === 'color' && (
            <>
              <Group title={t('Brand')} help={t('Your colors, exactly. Every palette below is made from them, and text on them is picked to stay readable.')}>
                <Setting label={t('Primary')}><SeedInput value={get(['color', 'primary'])} onChange={(v) => set(['color', 'primary'], v ?? get(['color', 'primary']))} /></Setting>
                <Setting label={t('Accent')}><SeedInput value={get(['color', 'accent'])} placeholder={t('Primary')} onChange={(v) => set(['color', 'accent'], v)} /></Setting>
                <Setting label={t('Secondary')}><SeedInput value={get(['color', 'secondary'])} placeholder={t('Dark neutral')} onChange={(v) => set(['color', 'secondary'], v)} /></Setting>
                <Setting label={t('Neutral')}><SeedInput value={get(['color', 'neutral'])} placeholder={t('From primary')} onChange={(v) => set(['color', 'neutral'], v)} /></Setting>
                {Object.entries((get(['color', 'palettes']) ?? {}) as Record<string, string>).map(([name, seed]) => (
                  <Setting key={name} label={name}>
                    <SeedInput value={seed} onChange={(v) => set(['color', 'palettes', name], v ?? seed)} />
                    <IconButton icon="trash" size="xs" label={t('Remove {name}', { name })} onClick={() => set(['color', 'palettes', name], undefined)} />
                  </Setting>
                ))}
                <Button size="sm" variant="ghost" icon="plus" onClick={async () => {
                  const asked = await prompt({ title: t('New Brand Color'), description: t('A palette like the others: blocks can use {name}, on-{name}, {name}-soft and {name}-text.'), fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: 'lime' }], confirm: t('Add') })
                  const name = String(asked?.name ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
                  if (!name || !/^[a-z]/.test(name)) return
                  if (palettes.includes(name)) return void toast.error(t('“{name}” already exists', { name }))
                  set(['color', 'palettes', name], '#7c3aed')
                }}>{t('Add a Brand Color')}</Button>
              </Group>
              <Group title={t('Status')}>
                {STATUS.map((name) => <Setting key={name} label={name}><SeedInput value={get(['color', name])} placeholder={t('Default')} onChange={(v) => set(['color', name], v)} /></Setting>)}
              </Group>
              <Group title={t('Modes')} help={t('The page’s background and text in each mode. Every other color of a scheme is mixed from these two, with its contrast kept.')}>
                <Setting label={t('Light Background')}>{field(['color', 'light', 'background'], { type: 'select', label: t('Light Background'), options: options(['white', ...shades]), placeholder: 'neutral-50' })}</Setting>
                <Setting label={t('Light Text')}>{field(['color', 'light', 'foreground'], { type: 'select', label: t('Light Text'), options: options(['black', ...shades]), placeholder: 'neutral-950' })}</Setting>
                <Setting label={t('Dark Mode')}>
                  <Segmented size="xs" value={get(['color', 'dark']) === false ? 'off' : 'on'} onChange={(v) => set(['color', 'dark'], v === 'off' ? false : undefined)} options={[{ value: 'on', label: t('On') }, { value: 'off', label: t('Off') }]} />
                </Setting>
                {get(['color', 'dark']) !== false && (
                  <>
                    <Setting label={t('Dark Background')}>{field(['color', 'dark', 'background'], { type: 'select', label: t('Dark Background'), options: options(['black', ...shades]), placeholder: 'neutral-950' })}</Setting>
                    <Setting label={t('Dark Text')}>{field(['color', 'dark', 'foreground'], { type: 'select', label: t('Dark Text'), options: options(['white', ...shades]), placeholder: 'neutral-50' })}</Setting>
                  </>
                )}
              </Group>
              <Group title={t('Palettes')}>
                {palettes.map((name) => {
                  const p = resolved.palettes[name]
                  return (
                    <div key={name} className="border-b border-border py-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-ink">{name}</span>
                        <span className="rounded-full px-2 py-0.5 text-2xs font-medium" style={{ background: p.fill, color: p.on }}>{t('Text on {name}', { name })}</span>
                      </div>
                      <div className="grid grid-cols-11 overflow-hidden rounded-sm">
                        {SHADES.map((s) => <span key={s} title={`${name}-${s} ${p.shades[s]}`} className="h-6" style={{ background: p.shades[s] }} />)}
                      </div>
                      {p.fill !== p.seed && <p className="m-0 mt-1 text-2xs text-faint">{t('Its fill is {fill}, a little {way} than {seed}, so text on it is readable.', { fill: p.fill, seed: p.seed, way: luminance(p.fill) < luminance(p.seed) ? t('darker') : t('lighter') })}</p>}
                    </div>
                  )
                })}
              </Group>
            </>
          )}

          {section === 'type' && (
            <>
              <Group title={t('Families')} help={t('Five slots every theme has. Upload or import a font below, then put it in a slot.')}>
                {FAMILY_SLOTS.map((slot) => (
                  <Setting key={slot} label={slot}>
                    {field(['font', slot], { type: 'select', label: slot, options: options(families), placeholder: slot === 'display' ? t('Same as sans') : slot === 'condensed' ? t('Same as display') : t('System') })}
                    <span className="w-20 shrink-0 truncate text-right text-sm text-ink" style={{ fontFamily: resolved.families[slot] }}>Ag</span>
                  </Setting>
                ))}
                <Setting label={t('Body')}>{field(['font', 'body'], { type: 'select', label: t('Body'), options: options(Object.keys(resolved.families)), placeholder: 'sans' })}</Setting>
                <Setting label={t('Headings')}>{field(['font', 'heading'], { type: 'select', label: t('Headings'), options: options(Object.keys(resolved.families)), placeholder: 'display' })}</Setting>
                <Setting label={t('Code')}>{field(['font', 'code'], { type: 'select', label: t('Code'), options: options(Object.keys(resolved.families)), placeholder: 'mono' })}</Setting>
              </Group>
              <Fonts faces={theme.font?.faces ?? []} onChanged={() => { void info.refetch(); frame.current?.contentWindow?.location.reload() }} onRemove={(family) => set(['font', 'faces'], (theme.font?.faces ?? []).filter((f: { family: string }) => f.family !== family))} />
              <Group title={t('Scale')} help={t('Body size and the ratio between steps, at a narrow and a wide screen. Headings grow more than body text as the screen widens.')}>
                <Setting label={t('Body Size')}>{pair(['type', 'base'], [16, 18], 'px')}</Setting>
                <Setting label={t('Ratio')}>{pair(['type', 'ratio'], [1.2, 1.25], '', 0.01)}</Setting>
                <Setting label={t('Body Leading')}><NumberInput value={get(['type', 'leading', 'body']) ?? 1.5} step={0.05} label={t('Body Leading')} onChange={(n) => set(['type', 'leading', 'body'], n)} /></Setting>
                <Setting label={t('Display Leading')}><NumberInput value={get(['type', 'leading', 'display']) ?? 1} step={0.05} label={t('Display Leading')} onChange={(n) => set(['type', 'leading', 'display'], n)} /></Setting>
                <Setting label={t('Display Tracking')}><NumberInput value={get(['type', 'tracking', 'display']) ?? -0.035} step={0.005} unit="em" label={t('Display Tracking')} onChange={(n) => set(['type', 'tracking', 'display'], n)} /></Setting>
                <Setting label={t('Heading Weight')}>{field(['type', 'weight'], { type: 'select', label: t('Heading Weight'), options: options(Object.keys(resolved.weights)), placeholder: 'semibold' })}</Setting>
              </Group>
              <Group title={t('Text Styles')} help={t('Size, family, weight, leading, tracking and case under one name. Blocks pick a text style first.')}>
                {Object.entries(resolved.textStyles).map(([name, s]) => (
                  <TextStyleRow key={name} name={name} style={s} resolved={resolved} custom={!(info.data!.catalog.collections.textStyles ?? []).includes(name) || !info.data!.catalog.descriptions.textStyles[name]} own={get(['type', 'styles', name]) ?? {}} onChange={(v) => set(['type', 'styles', name], v && Object.keys(v).length ? v : undefined)} scales={info.data!.catalog.scales} />
                ))}
                <Button size="sm" variant="ghost" icon="plus" onClick={async () => {
                  const asked = await prompt({ title: t('New Text Style'), fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, placeholder: 'price' }], confirm: t('Add') })
                  const name = String(asked?.name ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  if (name && /^[a-z]/.test(name) && !resolved.textStyles[name]) set(['type', 'styles', name], { font: 'body', size: 'xl', weight: 'medium' })
                }}>{t('Add a Text Style')}</Button>
              </Group>
            </>
          )}

          {section === 'space' && (
            <>
              <Group title={t('Space')} help={t('The md step at a narrow and a wide screen. Every step is a multiple of it; large steps shrink more on phones.')}>
                <Setting label={t('md')}>{pair(['space', 'base'], [16, 20], 'px')}</Setting>
                {SPACES.slice(1).map((s) => (
                  <div key={s} className="flex h-6 items-center gap-2 text-2xs">
                    <span className="w-10 font-mono text-muted">{s}</span>
                    <span className="h-1.5 rounded-full bg-focus/60" style={{ width: Math.min(260, resolved.space[s]?.max ?? 0) }} />
                    <span className="ml-auto font-mono text-faint">{Math.round(resolved.space[s]?.min ?? 0)}–{Math.round(resolved.space[s]?.max ?? 0)}px</span>
                  </div>
                ))}
              </Group>
              <Group title={t('Roles')}>
                {['gutter', 'section', 'section-sm', 'section-lg'].map((role) => (
                  <Setting key={role} label={role}>{field(['layout', role], { type: 'select', label: role, options: options(SPACES), placeholder: { gutter: 'xl', section: '4xl', 'section-sm': '3xl', 'section-lg': '5xl' }[role] })}</Setting>
                ))}
              </Group>
              <Group title={t('Flow')} help={t('The space between a container’s children, set once here. Prose is the rhythm of long text: more before headings, less after.')}>
                {['tight', 'normal', 'loose'].map((f) => <Setting key={f} label={f}>{field(['flow', f], { type: 'select', label: f, options: options(SPACES), placeholder: { tight: 'sm', normal: 'md', loose: 'xl' }[f] })}</Setting>)}
                {[['gap', t('Prose: Between'), 'md'], ['before', t('Prose: Before Headings'), '2xl'], ['after', t('Prose: After Headings'), 'xs'], ['media', t('Prose: Around Media'), 'xl']].map(([k, label, ph]) => (
                  <Setting key={k} label={label}>{field(['flow', 'prose', k], { type: 'select', label, options: options(SPACES), placeholder: ph })}</Setting>
                ))}
              </Group>
              <Group title={t('Containers')} help={t('Widths in rem.')}>
                {[['narrow', 40], ['text', 46], ['content', 72], ['wide', 90]].map(([k, d]) => (
                  <Setting key={k} label={String(k)}><NumberInput value={get(['layout', 'containers', String(k)]) ?? d} step={1} unit="rem" label={String(k)} onChange={(n) => set(['layout', 'containers', String(k)], n)} /></Setting>
                ))}
                <Setting label={t('Screens')}>{pair(['layout', 'viewport'], [360, 1440], 'px')}</Setting>
              </Group>
            </>
          )}

          {section === 'shape' && (
            <>
              <Group title={t('Shape')}>
                <Setting label={t('Radius')}><NumberInput value={get(['radius']) ?? 8} step={1} unit="px" label={t('Radius')} onChange={(n) => set(['radius'], n)} /></Setting>
                <div className="flex gap-2 py-2">{Object.entries(resolved.radii).filter(([k]) => k !== 'none').map(([k, v]) => <span key={k} title={`${k} ${v}`} className="size-7 border-l-2 border-t-2 border-muted" style={{ borderTopLeftRadius: v === '9999px' ? '14px' : v }} />)}</div>
                <Setting label={t('Shadow Depth')}><NumberInput value={get(['shadow', 'strength']) ?? 1} step={0.1} label={t('Shadow Depth')} onChange={(n) => set(['shadow', 'strength'], n)} /></Setting>
              </Group>
              <Group title={t('Buttons')}>
                <Setting label={t('Radius')}>{field(['recipes', 'button', 'radius'], { type: 'select', label: t('Radius'), options: options(Object.keys(resolved.radii)), placeholder: 'md' })}</Setting>
                <Setting label={t('Text Style')}>{field(['recipes', 'button', 'text'], { type: 'select', label: t('Text Style'), options: options(Object.keys(resolved.textStyles)), placeholder: 'label' })}</Setting>
                <Setting label={t('Weight')}>{field(['recipes', 'button', 'weight'], { type: 'select', label: t('Weight'), options: options(Object.keys(resolved.weights)), placeholder: 'medium' })}</Setting>
                <Setting label={t('Case')}>{field(['recipes', 'button', 'case'], { type: 'select', label: t('Case'), options: options(['none', 'uppercase', 'lowercase', 'capitalize']), placeholder: 'none' })}</Setting>
              </Group>
              <Group title={t('Cards')}>
                <Setting label={t('Radius')}>{field(['recipes', 'card', 'radius'], { type: 'select', label: t('Radius'), options: options(Object.keys(resolved.radii)), placeholder: 'lg' })}</Setting>
                <Setting label={t('Padding')}>{field(['recipes', 'card', 'padding'], { type: 'select', label: t('Padding'), options: options(SPACES), placeholder: 'lg' })}</Setting>
                <Setting label={t('Shadow')}>{field(['recipes', 'card', 'shadow'], { type: 'select', label: t('Shadow'), options: options(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']), placeholder: 'none' })}</Setting>
                <Setting label={t('Border')}><Segmented size="xs" value={get(['recipes', 'card', 'border']) === false ? 'off' : 'on'} onChange={(v) => set(['recipes', 'card', 'border'], v === 'off' ? false : undefined)} options={[{ value: 'on', label: t('On') }, { value: 'off', label: t('Off') }]} /></Setting>
              </Group>
              <Group title={t('Fields')}>
                <Setting label={t('Radius')}>{field(['recipes', 'field', 'radius'], { type: 'select', label: t('Radius'), options: options(Object.keys(resolved.radii)), placeholder: 'md' })}</Setting>
              </Group>
            </>
          )}

          {section === 'motion' && (
            <Group title={t('Motion')} help={t('Speed multiplies every duration: below 1 is snappier, above 1 calmer. Animations and transitions in blocks use these durations.')}>
              <Setting label={t('Speed')}><NumberInput value={get(['motion', 'speed']) ?? 1} step={0.05} label={t('Speed')} onChange={(n) => set(['motion', 'speed'], n)} /></Setting>
              <Setting label={t('Between Pages')}>{field(['motion', 'page'], { type: 'select', label: t('Between Pages'), options: options(['none', 'fade', 'slide', 'scale'], { none: t('None'), fade: t('Fade'), slide: t('Slide'), scale: t('Scale') }), placeholder: t('None') })}</Setting>
              {Object.entries(resolved.durations).map(([k, v]) => (
                <div key={k} className="group flex h-6 items-center gap-2 text-2xs">
                  <span className="w-14 font-mono text-muted">{k}</span>
                  <span className="relative h-2 flex-1"><span className="absolute left-0 top-0 size-2 rounded-full bg-focus/70 transition-transform group-hover:translate-x-40" style={{ transitionDuration: `${v}ms` }} /></span>
                  <span className="font-mono text-faint">{v}ms</span>
                </div>
              ))}
            </Group>
          )}

          {section === 'elements' && <Elements value={(get(['elements']) ?? {}) as Record<string, Record<string, any>>} onChange={(v) => set(['elements'], Object.keys(v).length ? v : undefined)} />}

          {section === 'agents' && (
            <>
              <Group title={t('Contrast')} help={t('Every text and border color of every scheme, measured. Fix a miss by choosing other anchors or seeds.')}>
                {findings.length === 0 && <p className="m-0 py-3 text-xs text-success">{t('Every role passes in every scheme.')}</p>}
                {findings.map((f, i) => (
                  <p key={i} className={cn('m-0 border-b border-border py-1.5 text-xs', f.level === 'error' ? 'text-danger' : 'text-muted')}>
                    <span className="font-medium">{f.scheme}</span> · {f.pair}: {f.ratio}:1 <span className="text-faint">({t('needs {n}:1', { n: f.needs })})</span>
                  </p>
                ))}
              </Group>
              <Group title={t('DESIGN.md')} help={t('The theme as the assistant and MCP clients read it (cms://site/design). It updates when you save.')}>
                <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md bg-sunken p-3 font-mono text-2xs leading-relaxed text-text">{info.data.design}</pre>
              </Group>
            </>
          )}

          {section === 'code' && (
            <Group title={t('Custom JavaScript')} help={t('An ES module on every page, for scripts and Alpine components. Anything visual belongs in the theme instead.')}>
              {can('site.code') ? (
                <Fields bare fields={[{ handle: 'js', type: 'code', language: 'javascript', label: t('custom.js'), rows: 18 }]} values={{ js: js ?? info.data.js ?? '' }} onChange={(_, v) => setJs(v ?? '')} />
              ) : (
                <p className="m-0 py-3 text-xs text-faint">{t('Only people who may edit code can change this.')}</p>
              )}
            </Group>
          )}
        </div>

        <div className="flex min-w-0 flex-col bg-sunken max-md:hidden">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-bg px-3">
            <Segmented size="xs" value={viewport} onChange={setViewport} options={[{ value: 'desktop', icon: 'desktop', title: t('Desktop') }, { value: 'tablet', icon: 'tablet', title: t('Tablet') }, { value: 'phone', icon: 'phone', title: t('Phone') }]} />
            {viewport !== 'desktop' && <span className="font-mono text-2xs text-faint">{WIDTHS[viewport]}</span>}
            <span className="flex-1" />
            {get(['color', 'dark']) !== false && <Segmented size="xs" value={mode} onChange={setMode} options={[{ value: 'light', icon: 'sun', title: t('Light') }, { value: 'dark', icon: 'moon', title: t('Dark') }]} />}
          </div>
          <Preview viewport={viewport}>
            {(style) => <iframe ref={frame} src="/" title={t('Site Preview')} className={cn('border-0 bg-bg', viewport !== 'desktop' && 'border-x border-border')} style={style} onLoad={inject} />}
          </Preview>
        </div>
      </div>
    </div>
  )
}

/** The site at a screen's width; desktop never narrower than 1024px (scaled down to fit). */
function Preview({ viewport, children }: { viewport: Viewport; children: (style: CSSProperties) => ReactNode }) {
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
  const width = viewport === 'desktop' ? Math.max(room.width, 1024) : parseFloat(WIDTHS[viewport])
  const scale = room.width ? Math.min(1, room.width / width) : 1
  return (
    <div ref={box} className="relative min-h-0 flex-1 overflow-hidden">
      {room.width > 0 && children({ position: 'absolute', top: 0, left: Math.max(0, (room.width - width * scale) / 2), width, height: room.height / scale, transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: 'top left' })}
    </div>
  )
}

function Group({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="border-b border-border pb-1.5 pt-3">
        <h3 className="m-0 text-xs font-semibold text-ink">{title}</h3>
        {help && <p className="m-0 mt-0.5 text-2xs leading-snug text-faint">{help}</p>}
      </div>
      <div className="pt-1">{children}</div>
    </section>
  )
}

function Setting({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-9 items-center gap-2 border-b border-border/60 py-1">
      <span className="w-32 shrink-0 truncate text-xs text-muted">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  )
}

/** A seed: one of the theme's decisions, the only place a raw color is typed. */
function SeedInput({ value, placeholder, onChange }: { value?: string; placeholder?: string; onChange: (v: string | undefined) => void }) {
  const [text, setText] = useState(value ?? '')
  useEffect(() => setText(value ?? ''), [value])
  const valid = (v: string) => /^#[0-9a-f]{6}$/i.test(v) || /^oklch\(.+\)$/i.test(v)
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <label className="relative size-7 shrink-0 overflow-hidden rounded-sm border border-border-strong" style={{ background: value ?? 'repeating-conic-gradient(var(--cms-sunken) 0 25%, var(--cms-bg) 0 50%) 0 0/8px 8px' }}>
        <input type="color" value={value && /^#/.test(value) ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('Pick a Color')} />
      </label>
      <input value={text} placeholder={placeholder} onChange={(e) => { setText(e.target.value); if (valid(e.target.value.trim())) onChange(e.target.value.trim()) }} onBlur={() => { if (!text.trim()) onChange(undefined); else if (!valid(text.trim())) setText(value ?? '') }} className="h-7 min-w-0 flex-1 rounded-sm bg-active/60 px-2 font-mono text-xs outline-none placeholder:text-faint focus:bg-active" />
    </div>
  )
}

function NumberInput({ value, step, unit, label, onChange }: { value: number; step: number; unit?: string; label: string; onChange: (n: number) => void }) {
  return (
    <label className="flex h-7 min-w-0 flex-1 items-center gap-1 rounded-sm bg-active/60 px-2 text-xs focus-within:bg-active">
      <input type="number" aria-label={label} value={value} step={step} onChange={(e) => e.target.value !== '' && onChange(Number(e.target.value))} className="min-w-0 flex-1 bg-transparent font-mono tabular-nums outline-none" />
      {unit && <span className="text-2xs text-faint">{unit}</span>}
    </label>
  )
}

function TextStyleRow({ name, style, resolved, custom, own, onChange, scales }: { name: string; style: Resolved['textStyles'][string]; resolved: Resolved; custom: boolean; own: Record<string, string>; onChange: (v: Record<string, string> | undefined) => void; scales: Record<string, any> }) {
  const [open, setOpen] = useState(false)
  const size = resolved.sizes[style.size]
  const set = (key: string, v: string | null) => onChange({ ...own, ...(v ? { [key]: v } : {}), ...(v ? {} : { [key]: undefined as unknown as string }) })
  const sel = (key: string, label: string, list: string[], placeholder: string) => (
    <Fields bare className="min-w-0 flex-1" fields={[{ handle: key, type: 'select', size: 'sm', label, options: options(list), placeholder }]} values={{ [key]: own[key] }} onChange={(_, v) => set(key, v)} />
  )
  return (
    <div className="border-b border-border py-2">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-baseline gap-3 text-left">
        <span className="w-24 shrink-0 truncate font-mono text-2xs text-muted">{name}</span>
        <span className="min-w-0 flex-1 truncate text-ink" style={{ fontFamily: resolved.families[style.font], fontWeight: resolved.weights[style.weight], fontSize: Math.min(36, size?.max ?? 16), textTransform: style.case as CSSProperties['textTransform'], fontStyle: style.style, lineHeight: 1.15 }}>{t('The quick brown fox')}</span>
        <span className="shrink-0 font-mono text-2xs text-faint">{Math.round(size?.min ?? 0)}–{Math.round(size?.max ?? 0)}px</span>
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {sel('font', t('Font'), ['body', 'heading', 'code', ...Object.keys(resolved.families)], style.font)}
          {sel('size', t('Size'), scales.sizes, style.size)}
          {sel('weight', t('Weight'), Object.keys(resolved.weights), style.weight)}
          {sel('leading', t('Line Height'), Object.keys(scales.leadings), style.leading || t('From size'))}
          {sel('tracking', t('Letter Spacing'), Object.keys(scales.trackings), style.tracking || t('From size'))}
          {sel('case', t('Case'), ['none', 'uppercase', 'lowercase', 'capitalize'], style.case)}
          {custom && <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(undefined)}>{t('Remove')}</Button>}
        </div>
      )}
    </div>
  )
}

/** Element defaults: each element's style in the vocabulary, as property and name rows. */
function Elements({ value, onChange }: { value: Record<string, Record<string, any>>; onChange: (v: Record<string, Record<string, any>>) => void }) {
  const ELEMENTS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'small', 'strong', 'em', 'blockquote', 'code', 'ul', 'ol', 'li', 'hr', 'figcaption', 'table', 'th', 'td', 'label', 'h1 em', 'h2 em']
  const [open, setOpen] = useState<string | null>(null)
  return (
    <Group title={t('Elements')} help={t('How plain HTML elements look before any block style: a text style for headings, a color for links. Values are names of the vocabulary.')}>
      {Object.entries(value).map(([selector, style]) => (
        <div key={selector} className="border-b border-border py-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOpen(open === selector ? null : selector)} className="min-w-0 flex-1 truncate text-left font-mono text-xs text-ink">{selector}</button>
            <span className="truncate text-2xs text-faint">{Object.keys(flat(style)).join(', ')}</span>
            <IconButton icon="trash" size="xs" label={t('Remove {name}', { name: selector })} onClick={() => { const { [selector]: _, ...rest } = value; onChange(rest) }} />
          </div>
          {open === selector && <Rows style={flat(style)} onChange={(next) => onChange({ ...value, [selector]: next })} />}
        </div>
      ))}
      <Menu trigger={<Button size="sm" variant="ghost" icon="plus">{t('Style an Element')}</Button>} items={ELEMENTS.filter((e) => !value[e]).map((e) => ({ label: e, onSelect: () => { onChange({ ...value, [e]: {} }); setOpen(e) } }))} />
    </Group>
  )
}

const flat = (style: Record<string, any>) => Object.fromEntries(Object.entries(style ?? {}).filter(([, v]) => typeof v === 'string'))

function Rows({ style, onChange }: { style: Record<string, string>; onChange: (next: Record<string, string>) => void }) {
  const PROPS = ['text', 'color', 'fontFamily', 'fontWeight', 'fontStyle', 'textTransform', 'textDecorationLine', 'textDecorationColor', 'textUnderlineOffset', 'letterSpacing', 'lineHeight', 'backgroundColor', 'paddingBlock', 'paddingInline', 'borderRadius', 'borderWidth', 'borderColor', 'listStyleType']
  const fieldFor = (prop: string): FieldDef => (/color/i.test(prop) ? { handle: prop, type: 'color', component: 'blocks-color', label: prop } : { handle: prop, type: 'text', component: 'blocks-token', label: prop })
  return (
    <div className="mt-2 space-y-1">
      {Object.keys(style).map((prop) => (
        <div key={prop} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate font-mono text-2xs text-muted">{prop}</span>
          <Fields bare className="min-w-0 flex-1" fields={[fieldFor(prop)]} values={style} onChange={(_, v) => { const next = { ...style }; if (v) next[prop] = v; else delete next[prop]; onChange(next) }} />
        </div>
      ))}
      <Menu trigger={<Button size="xs" variant="ghost" icon="plus">{t('Add a Property')}</Button>} items={PROPS.filter((p) => !(p in style)).map((p) => ({ label: p, onSelect: () => onChange({ ...style, [p]: p === 'text' ? 'body' : /color/i.test(p) ? 'foreground' : '' }) }))} />
    </div>
  )
}

function Fonts({ faces, onChanged, onRemove }: { faces: { family: string; weight?: string; style?: string }[]; onChanged: () => void; onRemove: (family: string) => void }) {
  const [family, setFamily] = useState('')
  const [busy, setBusy] = useState(false)
  const families = useMemo(() => [...new Set(faces.map((f) => f.family))], [faces])
  const importFamily = async () => {
    const name = family.trim()
    if (!name) return
    setBusy(true)
    try {
      await run('design/fonts-import', { family: name })
      toast.success(t('{family} added: put it in a slot above', { family: name }))
      setFamily('')
      onChanged()
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }
  const upload = async (file: File) => {
    const data = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
    const name = file.name.replace(/\.woff2$/i, '')
    const asked = await prompt({ title: t('Upload Font'), fields: [{ handle: 'family', type: 'text', label: t('Family Name'), autofocus: true }], values: { family: name.replace(/[-_](regular|bold|variable|italic|\d+).*$/i, '').replace(/[-_]/g, ' ') }, confirm: t('Upload') })
    const fam = String(asked?.family ?? '').trim()
    if (!fam) return
    try {
      await run('design/fonts-upload', { family: fam, name, data, weight: /variable/i.test(name) ? '100 900' : '400', style: /italic/i.test(name) ? 'italic' : 'normal' })
      toast.success(t('{family} uploaded', { family: fam }))
      onChanged()
    } catch (e) {
      toast.error(e)
    }
  }
  return (
    <Group title={t('Font Files')} help={t('Served from this site: visitors never connect to Google.')}>
      {families.length === 0 && <p className="m-0 py-3 text-xs text-faint">{t('None yet. The site uses system fonts.')}</p>}
      {families.map((name) => (
        <div key={name} className="flex items-center gap-3 border-b border-border py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-sunken text-lg text-ink" style={{ fontFamily: `"${name}"` }}>Aa</span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm text-ink" style={{ fontFamily: `"${name}"` }}>{name}</p>
            <p className="m-0 truncate text-2xs text-faint">{faces.filter((f) => f.family === name).map((f) => `${f.weight ?? '400'}${f.style === 'italic' ? ' italic' : ''}`).join(' · ')}</p>
          </div>
          <IconButton icon="trash" size="xs" label={t('Remove {family}', { family: name })} onClick={async () => { if (await confirm({ title: t('Remove {family}?', { family: name }), description: t('Slots that use it fall back to the system font.'), confirm: t('Remove'), danger: true })) onRemove(name) }} />
        </div>
      ))}
      <form className="flex items-center gap-2 py-2.5" onSubmit={(e) => { e.preventDefault(); void importFamily() }}>
        <Fields bare className="min-w-0 flex-1" fields={[{ handle: 'family', type: 'text', label: t('Google Font'), size: 'sm', placeholder: t('Google Font, like Inter Tight'), icon: 'search' }]} values={{ family }} onChange={(_, v) => setFamily(v ?? '')} />
        <Button type="submit" size="sm" loading={busy} disabled={!family.trim()}>{t('Add')}</Button>
      </form>
      <Fields bare fields={[{ handle: 'file', type: 'json', component: 'site-file', label: t('Font File'), placeholder: t('Drop a .woff2 file or choose one'), accept: '.woff2,font/woff2' }]} values={{}} onChange={(_, file) => file && void upload(file)} />
    </Group>
  )
}

/** Relative luminance of a hex color, for saying which way a fill moved. */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
