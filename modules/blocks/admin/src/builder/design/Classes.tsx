import { t } from '@letterncms/sdk'
import { IconButton, Pressable, cn, copyText } from '@letterncms/ui'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { parseClass, splitClasses, type Engine } from '../../../../tailwind/engine'
import { Section, Swatch } from '../controls'
import { broken, lightDark, onLayer, searchClasses, writable } from '../styleApi'
import type { StyleApi } from '../useStyle'

/* An element's classes as classes, for whoever writes Tailwind: one chip per class, a field that completes what
   is typed, Backspace takes the last one off. The controls above write the same list, so it is always what
   they did; a list pasted from anywhere just works. Folded until it is wanted. */

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
  const taken = useMemo(() => new Set(exclude), [exclude])
  const typed = query.trim()
  const options = useMemo(() => (engine && focused && typed && !/\s/.test(typed) ? searchClasses(engine, site, typed, taken).slice(0, LIMIT) : []), [engine, focused, typed, site, taken])
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
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && options.length) {
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
      setQuery('')
      onDone?.()
    } else if (e.key === 'Backspace' && query === '' && onBackspace) {
      e.preventDefault()
      onBackspace()
    }
  }
  const id = useMemo(() => `cms-classes-${Math.random().toString(36).slice(2)}`, [])
  return (
    <div className="min-w-20 flex-1">
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
          setActive(0)
          const box = e.target.getBoundingClientRect()
          setUp(window.innerHeight - box.bottom < 300 && box.top > 300)
        }}
        onKeyDown={onKey}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          // What was typed and left is taken, as a tag field does; an edit left empty takes the class off.
          if (typed) take(splitClasses(typed))
          else if (onEmpty) onEmpty()
          else onDone?.()
        }}
        className="h-6 w-full min-w-0 rounded-xs bg-transparent px-1 font-mono text-xs text-text outline-none placeholder:font-sans placeholder:text-faint"
      />
      {options.length > 0 && (
        <div id={id} role="listbox" aria-label={label} className={cn('absolute inset-x-0 z-raised overflow-hidden rounded-md border border-border-float bg-float p-1 shadow-pop', up ? 'bottom-full mb-1' : 'top-full mt-1')}>
          {engine && options.map((name, i) => {
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
                <span className="min-w-0 flex-1 truncate text-right text-2xs text-faint">{site.includes(name) ? t('Style') : about.text}</span>
              </Pressable>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** The class list as chips: a chip opens to be changed where it stands, its × takes it off. */
export function ClassChips({ s, site, disabled }: { s: StyleApi; site: string[]; disabled?: boolean }) {
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
  // One field, as a tag field is: it shows the focus of the field typed in.
  const [focus, setFocus] = useState(false)
  return (
    <div className={cn('cms-input relative flex !h-auto min-h-8 flex-wrap items-center gap-1 !p-1', disabled && 'opacity-60')} data-focus={focus || undefined} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} data-class-chips>
      {s.classes.map((raw) => editing === raw && !disabled ? (
        <ClassField key={raw} engine={engine} site={site} exclude={s.classes.filter((name) => name !== raw)} initial={raw} label={t('Class')} onAdd={(names) => add(names, raw)} onEmpty={() => { remove(raw); setEditing(null) }} onDone={() => setEditing(null)} />
      ) : (
        <span key={raw} className={cn('inline-flex h-6 max-w-full items-center rounded-xs bg-active pl-1.5 font-mono text-xs text-ink', disabled && 'pr-1.5', broken(engine, raw) && 'underline decoration-danger decoration-wavy underline-offset-2')}>
          {disabled ? <span className="truncate">{raw}</span> : (
            <>
              <Pressable compact onClick={() => setEditing(raw)} aria-label={t('Change {name}', { name: raw })} className="min-w-0 truncate rounded-xs text-left">{raw}</Pressable>
              <IconButton icon="close" size="xs" label={t('Remove {name}', { name: raw })} onClick={() => remove(raw)} className="!size-5 shrink-0 text-faint hover:text-ink" />
            </>
          )}
        </span>
      ))}
      {!disabled && <ClassField engine={engine} site={site} exclude={s.classes} label={t('Add Class')} onAdd={(names) => add(names)} onBackspace={() => s.classes.length && remove(s.classes[s.classes.length - 1])} />}
    </div>
  )
}

/** The Classes section at the end of the Design tab: folded until it is wanted. */
export function ClassesSection({ s, site, disabled }: { s: StyleApi; site: string[]; disabled?: boolean }) {
  return (
    <Section
      title={t('Classes')}
      open={false}
      empty={s.classes.length === 0}
      fields
      actions={s.classes.length > 0 ? <IconButton icon="copy" size="xs" label={t('Copy Classes')} onClick={() => void copyText(s.classes.join(' '), { copied: t('Classes copied') })} /> : undefined}
    >
      <ClassChips s={s} site={site} disabled={disabled} />
    </Section>
  )
}
