import { t as translate } from '@letterncms/sdk'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Menu, type MenuItemDef } from './Menu'

export interface SegmentOption<T extends string> {
  value: T
  label?: string
  icon?: string
  title?: string
  /** A count after the label, such as the records a filter shows. */
  count?: number
}

/**
 * Compact segmented control (lenses, breakpoints, alignment…). With no value, the
 * `placeholder` option (the default that applies) shows lighter than a chosen one. `fit` keeps the
 * options on one line, shrinking them (and truncating their labels) to the room there is: for a narrow panel.
 */
export function Segmented<T extends string>({ value, onChange, options, size = 'sm', block, fit, className, placeholder, id, disabled, 'aria-label': ariaLabel }: { value: T; onChange: (v: T) => void; options: SegmentOption<T>[]; size?: 'xs' | 'sm'; block?: boolean; fit?: boolean; className?: string; placeholder?: T; id?: string; disabled?: boolean; 'aria-label'?: string }) {
  const implied = !options.some((o) => o.value === value) ? placeholder : undefined
  const tabStop = options.find((o) => o.value === value || o.value === implied)?.value ?? options[0]?.value
  return (
    // A track pressed into the page with the chosen option lying on it, like a slip of paper.
    <div id={id} role="radiogroup" aria-label={ariaLabel} aria-disabled={disabled || undefined} className={cn('min-w-0 max-w-full items-center gap-0.5 bg-active p-0.5', fit ? 'flex-nowrap' : 'flex-wrap', size === 'xs' ? 'rounded-sm' : 'rounded-md', block ? 'flex w-full' : 'inline-flex', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title ?? o.label}
          aria-label={o.title ?? o.label}
          tabIndex={tabStop === o.value ? 0 : -1}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          onKeyDown={(event) => {
            const index = options.findIndex((option) => option.value === o.value)
            const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % options.length
              : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index - 1 + options.length) % options.length
              : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null
            if (next === null) return
            event.preventDefault()
            onChange(options[next].value)
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
          }}
          className={cn(
            'cms-touch-y inline-flex min-w-0 max-w-full items-center justify-center gap-1.5 font-medium transition-colors duration-base ease-out disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-offset-0',
            fit ? 'flex-[1_1_auto]' : block && 'flex-[1_0_auto]',
            // On a touch screen the track is taller and every option 44px tall to hit (`cms-touch-y`: never over its neighbour).
            size === 'xs' ? 'min-h-5 rounded-xs text-xs [@media(pointer:coarse)]:min-h-7' : 'min-h-6 rounded-xs text-sm [@media(pointer:coarse)]:min-h-8',
            // One padding per option: an icon alone is a square, a label that must fit gives up some room.
            !o.label && !block ? (size === 'xs' ? 'w-6 px-0' : 'w-7 px-0') : fit && o.label ? 'px-1.5' : size === 'xs' ? 'px-2' : 'px-2.5',
            value === o.value ? 'bg-thumb text-ink shadow-raise' : implied === o.value ? 'bg-float/55 text-text' : 'text-muted hover:text-text',
          )}
        >
          {o.icon && <Icon name={o.icon} size={size === 'xs' ? 14 : 16} className="shrink-0" />}
          {o.label && <span className={cn('min-w-0', fit ? 'truncate' : '[overflow-wrap:anywhere]')}>{o.label}</span>}
          {o.count !== undefined && <span className="text-xs font-normal tabular-nums text-faint">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

/**
 * A row of tabs. `fit` (a narrow panel's header): when the labels don't fit, the tabs move
 * closer together, and past that the row scrolls sideways; a tab always shows its label. A tab with a
 * `menu` shows a chevron while it is the chosen one, and choosing it again opens the menu (a saved view's Rename, Delete).
 */
export function Tabs<T extends string>({ value, onChange, tabs, className, id, bordered = true, size = 'sm', fit }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; icon?: string; count?: number; indicator?: boolean; menu?: (MenuItemDef | false | null | undefined)[] }[]; className?: string; id?: string; bordered?: boolean; size?: 'xs' | 'sm'; fit?: boolean }) {
  const row = useRef<HTMLDivElement>(null)
  // The width the labels need at the usual spacing; below it the tabs sit closer.
  const [needs, setNeeds] = useState<number | null>(null)
  const labels = tabs.map((tab) => tab.label).join('\n')
  useLayoutEffect(() => setNeeds(null), [labels])
  useLayoutEffect(() => {
    const el = row.current
    if (!fit || !el) return
    const check = () => setNeeds((current) => current === null ? (el.scrollWidth > el.clientWidth + 1 ? el.scrollWidth : null) : el.clientWidth >= current ? null : current)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [fit, labels, needs === null])
  const compact = fit && needs !== null
  // Which ends have tabs scrolled out of sight: that end fades, so the row reads as one that scrolls.
  const [hidden, setHidden] = useState({ start: false, end: false })
  useLayoutEffect(() => {
    const el = row.current
    if (!el) return
    const check = () => setHidden((current) => {
      const start = el.scrollLeft > 1
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
      return current.start === start && current.end === end ? current : { start, end }
    })
    check()
    el.addEventListener('scroll', check, { passive: true })
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => { el.removeEventListener('scroll', check); observer.disconnect() }
  }, [labels, compact])
  // The chosen tab is never one of the hidden ones.
  useLayoutEffect(() => {
    row.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value, compact])
  const fade = hidden.start && hidden.end ? '[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]'
    : hidden.start ? '[mask-image:linear-gradient(to_right,transparent,black_24px)]'
    : hidden.end ? '[mask-image:linear-gradient(to_left,transparent,black_24px)]' : undefined
  return (
    // Many plugin tabs scroll sideways rather than wrapping their labels. The rule is an inset shadow the active underline covers, so nothing overflows vertically.
    // A page's tabs sit 20px apart on their hairline; unbordered ones (in a panel's own header row) 16px, or 12px where that doesn't fit.
    // The row clips what reaches outside it, so on a touch screen a tab is 44px tall itself.
    <div ref={row} role="tablist" className={cn('flex min-h-9 items-stretch overflow-x-auto overflow-y-hidden [scrollbar-width:none] [@media(pointer:coarse)]:min-h-11', bordered ? 'gap-5 shadow-rule' : compact ? 'gap-3' : 'gap-4', fade, className)}>
      {tabs.map((t, index) => {
        const menu = value === t.value && t.menu?.some(Boolean) ? t.menu : undefined
        const tab = (
          <button
            key={t.value}
            id={id ? `${id}-${t.value}` : undefined}
            aria-controls={id ? `${id}-${t.value}-panel` : undefined}
            role="tab"
            type="button"
            aria-selected={value === t.value}
            tabIndex={value === t.value ? 0 : -1}
            onClick={menu ? undefined : () => onChange(t.value)}
            onKeyDown={(e) => {
              const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length
                : e.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length
                : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null
              if (next === null) return
              e.preventDefault()
              onChange(tabs[next].value)
              e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
            }}
            className={cn('flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap font-medium outline-offset-[-2px] transition-[color,box-shadow] duration-base ease-out', size === 'xs' ? 'text-xs' : 'text-sm', value === t.value ? 'text-ink shadow-underline' : 'text-muted hover:text-text')}
          >
            {t.label}
            {t.indicator && <><span className="size-1.5 shrink-0 rounded-full bg-signal" aria-hidden /><span className="sr-only">{translate('Unsaved changes')}</span></>}
            {t.count !== undefined && <span className="text-xs font-normal tabular-nums text-faint">{t.count}</span>}
            {menu && <Icon name="chevron-down" size={14} className="-ml-0.5 shrink-0 text-faint" />}
          </button>
        )
        if (menu) return <Menu key={t.value} align="start" trigger={tab} items={menu} />
        return tab
      })}
    </div>
  )
}
