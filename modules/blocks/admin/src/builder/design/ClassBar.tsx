import { can, invalidate, navigate, run, t } from '@letterncms/sdk'
import { Button, Icon, IconButton, Menu, Popover, cn, copyText, prompt, toast } from '@letterncms/ui'
import { useMemo, useState, type KeyboardEvent, type ReactElement } from 'react'
import { parseClass, splitClasses, withVariants, type Engine } from '../../../../tailwind/engine'
import { Stylesheet } from '../../../../tailwind/stylesheet'
import type { StylingSource } from '../../core/styling'
import { Swatch } from '../controls'
import { broken, lightDark, onLayer, searchClasses, splitSiteClasses, writable } from '../styleApi'
import type { StyleApi } from '../useStyle'

/* An element's classes, as classes: the site's own as chips, any class added by its name, and the whole
   list as text. The controls below write the same list, so what they do is always in sight here, and a
   list pasted from anywhere just works. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/** What a class sets, in one line, and the colour it is when it is one. */
function describe(engine: Engine, name: string): { text: string; color?: string } {
  const declarations = (engine.declarations(bare(parseClass(name).utility)) ?? []).filter((d) => !d.property.startsWith('--'))
  const color = declarations.find((d) => /(^|-)color$|^fill$|^stroke$/.test(d.property) && !/^(inherit|currentcolor|transparent)$/i.test(d.value))
  return { text: declarations.slice(0, 2).map((d) => `${d.property}: ${engine.resolve(d.value)}`).join('; '), color: color && lightDark(engine.resolve(color.value)).light }
}

/**
 * Add a class by its name: typing searches the site's classes and Tailwind's, Enter adds the one pointed at,
 * or whatever was typed. Several names typed or pasted with spaces between are added together.
 */
export function ClassCombobox({ engine, site, exclude, onAdd, trigger, disabled }: { engine: Engine | null; site: string[]; exclude?: string[]; onAdd: (names: string[]) => void; trigger?: ReactElement; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const taken = useMemo(() => new Set(exclude ?? []), [exclude])
  const several = /\s/.test(query.trim())
  const options = useMemo(() => (engine && open && !several ? searchClasses(engine, site, query, taken) : []), [engine, open, several, site, query, taken])
  const add = (names: string[]) => {
    const good = names.filter((name) => writable(name) && !broken(engine, name))
    if (!good.length) return
    onAdd(good)
    setQuery('')
    setActive(0)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, Math.min(options.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      add(several ? splitClasses(query) : [options[active] ?? query.trim()].filter(Boolean))
    }
  }
  return (
    <Popover
      open={open}
      onOpenChange={(next) => { setOpen(next); setQuery(''); setActive(0) }}
      align="start"
      className="flex w-72 flex-col overflow-hidden !p-0"
      trigger={trigger ?? <Button variant="ghost" size="xs" icon="plus" disabled={disabled || !engine} className="!px-1.5 !font-normal !text-muted hover:!text-ink">{t('Add Class')}</Button>}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <Icon name="search" size={14} className="shrink-0 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKey}
          spellCheck={false}
          autoComplete="off"
          placeholder={t('Search Classes')}
          aria-label={t('Search Classes')}
          className="h-full min-w-0 flex-1 bg-transparent font-mono text-sm text-text outline-none"
        />
      </div>
      <div role="listbox" aria-label={t('Add Class')} className="max-h-72 overflow-y-auto overscroll-contain p-1">
        {options.length === 0 && !several && <p className="m-0 px-2 py-3 text-sm text-muted">{query.trim() ? t('No matches') : t('Type a class name')}</p>}
        {several && <p className="m-0 px-2 py-3 text-sm text-muted">{t('Press Enter to add these classes')}</p>}
        {engine && options.map((name, i) => {
          const about = describe(engine, name)
          return (
            <Button key={name} variant="ghost" role="option" aria-selected={i === active} tabIndex={-1} onMouseEnter={() => setActive(i)} onClick={() => add([name])} data-active={i === active || undefined} className="!h-auto min-h-7 w-full !justify-start !gap-2 !rounded-xs !px-2 !py-1 text-left !font-normal">
              {about.color && <Swatch color={about.color} className="!size-3.5" />}
              <span className="shrink-0 font-mono text-xs text-ink">{name}</span>
              <span className="min-w-0 flex-1 truncate text-right text-2xs text-faint">{site.includes(name) ? t('Site Class') : about.text}</span>
            </Button>
          )
        })}
      </div>
    </Popover>
  )
}

const OPEN = 'cms.blocks.classes.open'
const remembered = () => {
  try {
    return localStorage.getItem(OPEN) === '1'
  } catch {
    return false
  }
}

/**
 * The whole class list as text. What is typed is the list, as typed: nothing is sorted or dropped under the
 * caret, and a name Tailwind can't read is underlined where it stands.
 */
export function ClassText({ s, disabled }: { s: StyleApi; disabled?: boolean }) {
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? s.classes.join(' ')
  // The words lie over the field once more, in the same type and wrapping, unseen: only their underlines show.
  const box = 'col-start-1 row-start-1 m-0 min-h-14 w-full whitespace-pre-wrap break-words rounded-sm px-2 py-1.5 font-mono text-xs leading-5'
  return (
    <div className="grid">
      <textarea
        value={text}
        disabled={disabled || !s.engine}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        aria-label={t('Classes')}
        onChange={(e) => {
          setDraft(e.target.value)
          s.apply(splitClasses(e.target.value), 'classes')
        }}
        onBlur={() => setDraft(null)}
        className={cn(box, 'cms-input resize-none overflow-hidden text-text')}
      />
      <div aria-hidden className={cn(box, 'pointer-events-none border border-transparent text-transparent')}>
        {text.split(/(\s+)/).map((part, i) => (/^\s*$/.test(part) ? part : <span key={i} className={broken(s.engine, part) ? 'underline decoration-danger decoration-wavy underline-offset-2' : undefined}>{part}</span>))}
        {/* A last line break is a line of its own in the field. */}
        {'\u200b'}
      </div>
    </div>
  )
}

export interface ClassBarProps {
  s: StyleApi
  /** The site's own classes, by name. */
  site: string[]
  /** The site's stylesheet, where a class made here is written. Without it nothing is made or detached. */
  source?: StylingSource
  /** The theme's screen sizes: a class is made of the styles that hold on every screen. */
  breakpoints?: string[]
  disabled?: boolean
}

/** The class bar, the first thing in the Design tab: the element's site classes, Add Class, and the list as text. */
export function ClassBar({ s, site, source, breakpoints = [], disabled }: ClassBarProps) {
  const engine = s.engine
  const [open, setOpenState] = useState(remembered)
  const setOpen = (next: boolean) => {
    setOpenState(next)
    try {
      localStorage.setItem(OPEN, next ? '1' : '0')
    } catch {
      // Private mode: remembered for this session only.
    }
  }
  const parts = splitSiteClasses(engine, s.classes, site)
  const manages = can('settings.manage') && !!source && !!engine && !disabled
  // What a class is made of: the styles on every screen, in every state. A size's own stay on the element.
  const sized = (raw: string) => parseClass(raw).variants.some((variant) => breakpoints.includes(variant) || /^(max|min)-/.test(variant))
  const moving = parts.utilities.filter((raw) => !sized(raw))

  const add = (names: string[]) => {
    if (!engine) return
    let next = s.classes
    for (const name of names) {
      const cls = onLayer(name, s.variants)
      const { variants, utility } = parseClass(cls)
      // A utility takes the place of the one it would fight with on its layer (p-6 for p-4); a class of the site stands beside them.
      const group = site.includes(bare(utility)) ? null : engine.group(utility)
      next = group ? engine.put(next, variants, group, utility) : [...next.filter((other) => other !== cls), cls]
    }
    s.apply(engine.sort(next), 'classes')
  }

  const create = async () => {
    if (!engine || !source) return
    const values = await prompt({
      title: t('Create Class from Styles'),
      fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'card', mono: true, required: true }],
      confirm: t('Create Class'),
    })
    const name = String(values?.name ?? '').trim().toLowerCase().replace(/[\s_]+/g, '-')
    if (!name) return
    if (!/^[a-z][a-z0-9-]*$/.test(name)) return void toast.error(t('A class name is lowercase letters, numbers and hyphens, and starts with a letter.'))
    if (site.includes(name) || engine.valid(name)) return void toast.error(t('There is already a class “{name}”.', { name }))
    try {
      await run('styling/update', { css: new Stylesheet(source.css).setUtility(name, engine.sort(moving)).css })
      invalidate('styling/')
      s.apply([...parts.site, name, ...parts.utilities.filter(sized)], 'classes')
      toast.success(t('Class “{name}” created', { name }))
    } catch (error) {
      toast.error(error)
    }
  }

  /** The class off, and what it applies in its place, under the variants the class stood under. */
  const detach = (raw: string) => {
    if (!engine || !source) return
    const { variants, utility } = parseClass(raw)
    const rule = new Stylesheet(source.css).utilities().find((entry) => entry.name === bare(utility))
    const applied = (rule?.classes ?? []).map((name) => withVariants(variants, name))
    s.apply(engine.sort([...new Set([...s.classes.filter((name) => name !== raw), ...applied])]), 'classes')
  }

  return (
    <div className="space-y-1 border-b border-border px-4 py-3" data-class-bar>
      <div className="flex items-start gap-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {parts.site.map((raw) => {
            const own = site.includes(bare(parseClass(raw).utility))
            return (
              <Menu
                key={raw}
                align="start"
                trigger={
                  <Button variant="ghost" size="xs" disabled={disabled} className={cn('max-w-full !gap-1 !rounded-sm !bg-active !px-1.5 font-mono !font-normal !text-ink', broken(engine, raw) && 'underline decoration-danger decoration-wavy underline-offset-2')}>
                    <span className="truncate">{raw}</span>
                    <Icon name="chevron-down" size={10} className="shrink-0 text-faint" />
                  </Button>
                }
                items={[
                  own && manages && { label: t('Edit Class'), icon: 'edit', onSelect: () => navigate(`/styling?class=${encodeURIComponent(bare(parseClass(raw).utility))}`) },
                  own && !!source && { label: t('Detach'), icon: 'unlink', onSelect: () => detach(raw) },
                  { label: t('Remove Class'), icon: 'trash', danger: true, onSelect: () => s.apply(s.classes.filter((name) => name !== raw), 'classes') },
                ]}
              />
            )
          })}
          <ClassCombobox engine={engine} site={site} exclude={s.classes} onAdd={add} disabled={disabled} />
        </div>
        <Menu
          align="end"
          trigger={<IconButton icon="more" size="sm" label={t('Class Actions')} />}
          items={[
            manages && { label: t('Create Class from Styles…'), icon: 'symbol', disabled: moving.length === 0, onSelect: () => void create() },
            { label: t('Copy Classes'), icon: 'copy', disabled: s.classes.length === 0, onSelect: () => void copyText(s.classes.join(' '), { copied: t('Classes copied') }) },
          ]}
        />
      </div>
      <Button variant="ghost" size="xs" aria-expanded={open} onClick={() => setOpen(!open)} className="-ml-1.5 !gap-1 !px-1.5 !font-normal !text-muted hover:!text-ink">
        <Icon name="chevron-down" size={10} className={cn('shrink-0 transition-[rotate] duration-fast', !open && '-rotate-90')} />
        {t('Classes')}
        {s.classes.length > 0 && <span className="tabular-nums text-faint">{s.classes.length}</span>}
      </Button>
      {open && <ClassText s={s} disabled={disabled} />}
    </div>
  )
}
