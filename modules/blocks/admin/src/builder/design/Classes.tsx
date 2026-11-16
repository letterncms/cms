import { t } from '@letterncms/sdk'
import { IconButton, Menu, Pressable, cn, type MenuItemDef } from '@letterncms/ui'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { parseClass, splitClasses, type Engine } from '../../../../tailwind/engine'
import { Swatch } from '../controls'
import { broken, lightDark, onLayer, searchClasses, writable } from '../styleApi'
import type { StyleApi } from '../useStyle'

/* An element's classes, as written, in one field: one chip per class, the site's own first, a field that completes
   Tailwind's and the site's as they are typed (↓ lists the site's own), Backspace takes the last one off.
   The controls write the same list, so it is always what they did; a list pasted from anywhere just works. A class
   of the site's has its own chip, which opens what can be done with it. */

/** A utility without its important mark. */
const bare = (utility: string) => utility.replace(/^!|!$/g, '')

/** What a class sets, in one line, and the colour it is when it is one. */
function describe(engine: Engine, name: string): { text: string; color?: string } {
  const declarations = (engine.declarations(bare(parseClass(name).utility)) ?? []).filter((d) => !d.property.startsWith('--'))
  const color = declarations.find((d) => /(^|-)color$|^fill$|^stroke$/.test(d.property) && !/^(inherit|currentcolor|transparent)$/i.test(d.value))
  return { text: declarations.slice(0, 2).map((d) => `${d.property}: ${engine.resolve(d.value)}`).join('; '), color: color && lightDark(engine.resolve(color.value)).light }
}

const LIMIT = 8

/**
 * A field that takes class names: typing lists the site's and Tailwind's classes that fit, Enter, Tab or a space
 * takes the one pointed at or what was typed, several pasted at once are taken together.
 */
function ClassField({ engine, site, exclude, onAdd, onBackspace, onEmpty, initial, onDone, label }: { engine: Engine | null; site: string[]; exclude: string[]; onAdd: (names: string[]) => void; onBackspace?: () => void; onEmpty?: () => void; initial?: string; onDone?: () => void; label: string }) {
  const [query, setQuery] = useState(initial ?? '')
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(!!initial)
  // The list comes with what is typed, or with ↓ for the site's own: a press in the field is only a place to type.
  const [browsing, setBrowsing] = useState(false)
  const taken = useMemo(() => new Set(exclude), [exclude])
  const typed = query.trim()
  // Asked for (↓), the site's own classes to choose from; typed into, every class that fits, in groups: Tailwind's first
  // (what is typed is most often one of them), then the site's own, then its schemes.
  const groups = useMemo((): [string, string[]][] => {
    if (!engine || !focused || /\s/.test(typed) || (!typed && !browsing)) return []
    const q = typed.toLowerCase()
    const own = site.filter((name) => !taken.has(name) && (!q || name.toLowerCase().includes(q)))
    return ([
      [t('Tailwind'), q ? searchClasses(engine, [], typed, taken).slice(0, LIMIT) : []],
      [t('Site Classes'), own.filter((name) => !name.startsWith('scheme-'))],
      [t('Schemes'), own.filter((name) => name.startsWith('scheme-'))],
    ] as [string, string[]][]).filter(([, names]) => names.length > 0)
  }, [engine, focused, typed, browsing, site, taken])
  const options = useMemo(() => groups.flatMap(([, names]) => names), [groups])
  // Near the bottom of the panel the list opens upward, where it has room.
  const [up, setUp] = useState(false)
  const take = (names: string[]) => {
    const good = names.filter((name) => writable(name) && !broken(engine, name))
    if (good.length) onAdd(good)
    setQuery('')
    setActive(0)
    onDone?.()
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && !options.length && !typed) {
      e.preventDefault()
      setBrowsing(true)
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && options.length) {
      e.preventDefault()
      setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (e.key === 'Enter' || (e.key === 'Tab' && options.length && typed) || (e.key === ' ' && typed)) {
      if (!typed) {
        if (e.key === 'Enter' && onEmpty) {
          e.preventDefault()
          onEmpty()
        }
        return
      }
      e.preventDefault()
      take(/\s/.test(typed) ? splitClasses(typed) : [options[active] ?? typed])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setBrowsing(false)
      setQuery('')
      onDone?.()
    } else if (e.key === 'Backspace' && query === '' && onBackspace) {
      e.preventDefault()
      onBackspace()
    }
  }
  const id = useMemo(() => `cms-classes-${Math.random().toString(36).slice(2)}`, [])
  return (
    // A chip being changed keeps its place and its size, its text's width; the field's own input takes the rest of the line.
    <div className={initial === undefined ? 'min-w-20 flex-1' : 'flex-none'} style={initial === undefined ? undefined : { width: `${Math.max(query.length, 4) + 2}ch` }}>
      <input
        autoFocus={!!initial}
        value={query}
        disabled={!engine}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        role="combobox"
        aria-label={label}
        aria-expanded={options.length > 0}
        aria-controls={id}
        aria-activedescendant={options.length ? `${id}-${active}` : undefined}
        placeholder={initial === undefined ? t('Add Class') : undefined}
        onChange={(e) => {
          setQuery(e.target.value)
          if (!e.target.value) setBrowsing(false)
          setActive(0)
          const box = e.target.getBoundingClientRect()
          setUp(window.innerHeight - box.bottom < 300 && box.top > 300)
        }}
        onKeyDown={onKey}
        onFocus={(e) => {
          setFocused(true)
          const box = e.target.getBoundingClientRect()
          setUp(window.innerHeight - box.bottom < 300 && box.top > 300)
        }}
        onBlur={() => {
          setFocused(false)
          setBrowsing(false)
          // What was typed and left is taken, as a tag field does; an edit left empty takes the class off.
          if (typed) take(splitClasses(typed))
          else if (onEmpty) onEmpty()
          else onDone?.()
        }}
        className={cn('h-6 w-full min-w-0 rounded-xs px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint', initial === undefined ? 'bg-transparent' : 'bg-active px-1.5')}
      />
      {options.length > 0 && (
        <div id={id} role="listbox" aria-label={label} className={cn('absolute inset-x-0 z-raised max-h-64 overflow-y-auto overscroll-contain rounded-md border border-border-float bg-float p-1 shadow-pop', up ? 'bottom-full mb-1' : 'top-full mt-1')}>
          {engine && groups.map(([heading, names]) => (
            <div key={heading} role="group" aria-label={heading}>
              <div className="cms-label flex h-7 items-center px-2">{heading}</div>
              {names.map((name) => {
                const i = options.indexOf(name)
                const about = describe(engine, name)
                return (
                  <Pressable
                    compact
                    key={name}
                    id={`${id}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    tabIndex={-1}
                    // Chosen before the field loses the focus.
                    onPointerDown={(e) => { e.preventDefault(); take([name]) }}
                    onMouseEnter={() => setActive(i)}
                    className={cn('flex min-h-7 w-full items-center gap-2 rounded-xs px-2 py-1 text-left', i === active && 'bg-hover')}
                  >
                    {about.color && <Swatch color={about.color} className="!size-3.5" />}
                    <span className="shrink-0 font-mono text-xs text-ink">{name}</span>
                    {!site.includes(name) && <span className="min-w-0 flex-1 truncate text-right text-2xs text-faint">{about.text}</span>}
                  </Pressable>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The class list as chips in one field: a chip opens to be changed where it stands (a class of the site's opens
 * `siteMenu`), its × takes it off. A press anywhere in the field is a press in its input.
 */
export function ClassChips({ s, site, disabled, siteMenu }: { s: StyleApi; site: string[]; disabled?: boolean; siteMenu?: (raw: string) => MenuItemDef[] }) {
  const engine = s.engine
  const [editing, setEditing] = useState<string | null>(null)
  const add = (names: string[], replacing?: string) => {
    if (!engine) return
    let next = replacing ? s.classes.filter((raw) => raw !== replacing) : s.classes
    for (const name of names) {
      const cls = replacing ? name : onLayer(name, s.variants)
      const { variants, utility } = parseClass(cls)
      // A utility takes the place of the one it would fight with on its layer (p-6 for p-4); a style of the site stands beside them.
      const group = site.includes(bare(utility)) ? null : engine.group(utility)
      next = group ? engine.put(next, variants, group, utility) : [...next.filter((other) => other !== cls), cls]
    }
    s.apply(engine.sort(next), 'classes')
  }
  const remove = (raw: string) => s.apply(s.classes.filter((name) => name !== raw), 'classes')
  // One field, as a tag field is: it shows the focus of the field typed in, and a press on it is one in its input.
  const [focus, setFocus] = useState(false)
  const own = (raw: string) => site.includes(bare(parseClass(raw).utility))
  // Set in the state and screen being styled, as a field's label says it: the accent; worn from another, plain.
  const here = (raw: string) => {
    const { variants } = parseClass(raw)
    return variants.length === s.variants.length && variants.every((variant) => s.variants.includes(variant))
  }
  const shown = [...s.classes.filter(own), ...s.classes.filter((raw) => !own(raw))]
  return (
    <div
      className={cn('cms-input relative flex !h-auto min-h-7 cursor-text flex-wrap items-center gap-0.5 !rounded-sm !p-0.5', disabled && 'opacity-60')}
      data-focus={focus || undefined}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onPointerDown={(e) => {
        if (e.target !== e.currentTarget) return
        e.preventDefault()
        e.currentTarget.querySelector<HTMLInputElement>('input[aria-label]:last-of-type')?.focus()
      }}
      data-class-chips
    >
      {/* The site's own classes first, named looks; then Tailwind's, as written. */}
      {shown.map((raw) => editing === raw && !disabled ? (
        <ClassField key={raw} engine={engine} site={site} exclude={s.classes.filter((name) => name !== raw)} initial={raw} label={t('Class')} onAdd={(names) => add(names, raw)} onEmpty={() => { remove(raw); setEditing(null) }} onDone={() => setEditing(null)} />
      ) : (
        // A class of the site's reads as a name, on a chip of its own (raised, its menu says what it is); Tailwind's as code.
        // Either is tinted while it is set in the state and screen being styled.
        <span key={raw} className={cn('inline-flex h-6 max-w-full items-center rounded-xs pl-1.5 text-xs text-ink', own(raw) ? 'font-medium shadow-edge' : 'font-mono', here(raw) ? 'bg-focus-soft' : own(raw) ? 'bg-bg' : 'bg-active', disabled && 'pr-1.5', broken(engine, raw) && 'underline decoration-danger decoration-wavy underline-offset-2')}>
          {disabled ? <span className="truncate">{raw}</span> : (
            <>
              {own(raw) && siteMenu
                ? <Menu align="start" trigger={<Pressable compact aria-label={t('{name} Actions', { name: raw })} className="min-w-0 truncate rounded-xs text-left">{raw}</Pressable>} items={siteMenu(raw)} />
                : <Pressable compact onClick={() => setEditing(raw)} aria-label={t('Change {name}', { name: raw })} className="min-w-0 truncate rounded-xs text-left">{raw}</Pressable>}
              <IconButton icon="close" size="xs" label={t('Remove {name}', { name: raw })} onClick={() => remove(raw)} className="!size-5 shrink-0 text-faint hover:text-ink" />
            </>
          )}
        </span>
      ))}
      {!disabled && <ClassField engine={engine} site={site} exclude={s.classes} label={t('Add Class')} onAdd={(names) => add(names)} onBackspace={() => shown.length && remove(shown[shown.length - 1])} />}
    </div>
  )
}
