import { t } from '@letterncms/sdk'
import { Icon, Popover, cn, Pressable, Tooltip, revealSelected } from '@letterncms/ui'
import { useState, type ReactElement } from 'react'
import type { ThemeToken, TokenGroup } from '../../../../tailwind/engine'
import { useStyling, useThemeTokens } from '../../core/styling'
import { spacingChoices } from '../styleApi'

/* The theme's values in the inspector: every control whose property has them (colour, spacing, radius, type,
   shadow, width, curve) offers them in the same list and shows a chosen one as a chip with its name. A control
   holds a theme value as the variable itself, `var(--color-primary)`: the class it becomes is `bg-primary`. */

/** The token a value is (`var(--radius-lg)`, or a colour mixed with an opacity), if any. */
export function useTokenOf() {
  return useThemeTokens().find
}

/** A name typed where a group's tokens go ("lg" in a radius, "gutter" in a padding) becomes that token. A number is a number. */
export function useTypedToken(group?: string) {
  const tokens = useThemeTokens()
  return (typed: string): string | null => {
    const name = typed.trim()
    if (!group || !/^[a-z][a-z0-9-]*$/i.test(name)) return null
    return tokens.of(group as TokenGroup).find((token) => token.name === name)?.ref ?? null
  }
}

/** The chip a theme value shows as: the token's name, as its class ends ("primary", "lg"), and an opacity. */
export function TokenChip({ token, alpha, className }: { token: ThemeToken; alpha?: string; className?: string }) {
  return (
    <Tooltip content={`${token.variable} · ${token.value}`}>
      <span className={cn('inline-flex min-w-0 items-center gap-1 truncate rounded-xs bg-active px-1.5 leading-5 text-ink', className)}>
        <span className="truncate">{token.name}</span>
        {alpha && <span className="text-muted">/{alpha}</span>}
      </span>
    </Tooltip>
  )
}

const chip = (on: boolean) => cn('h-6 min-w-0 rounded-xs px-1.5 text-2xs tabular-nums', on ? 'bg-signal text-signal-ink' : 'bg-sunken text-text hover:bg-hover')

/** The spacing scale as chips, in pixels as the spacing control shows them, then the theme's named spaces (and Auto). */
export function SpacingChips({ value, onPick, auto }: { value?: string | null; onPick: (value: string) => void; auto?: boolean }) {
  const { engine } = useStyling()
  const choices = spacingChoices(engine, useThemeTokens().of('spacing'))
  const same = (a: string) => a === value || (a === '0px' && value === '0')
  const pick = (choice: { value: string; label: string; title: string }) => <Tooltip key={choice.value} content={choice.title}><Pressable compact onClick={() => onPick(choice.value)} className={chip(same(choice.value))}>{choice.label}</Pressable></Tooltip>
  return (
    <div className="space-y-2">
      {choices.scale.length > 0 && (
        <div>
          <div className="cms-label mb-1">{t('Scale||series of steps')}</div>
          <div className="grid grid-cols-6 gap-1">{choices.scale.map(pick)}</div>
        </div>
      )}
      {(choices.named.length > 0 || auto) && (
        <div>
          <div className="cms-label mb-1">{t('Theme')}</div>
          <div className="flex flex-wrap gap-1">
            {choices.named.map(pick)}
            {auto && <Pressable compact onClick={() => onPick('auto')} className={chip(value === 'auto')}>{t('Auto')}</Pressable>}
          </div>
        </div>
      )}
    </div>
  )
}

/** The list of a group's tokens; picking one calls `onPick` with its variable. `detach` puts the token's own value in its place. */
export function TokenList({ group, value, onPick, detach }: { group: TokenGroup; value?: string | null; onPick: (v: string) => void; detach?: () => void }) {
  const tokens = useThemeTokens()
  const list = tokens.of(group)
  const current = tokens.find(value)?.token.variable ?? null
  if (group === 'spacing') return <div className="p-2"><SpacingChips value={value} onPick={onPick} /></div>
  return (
    <div>
      <div ref={revealSelected} className="max-h-60 overflow-y-auto">
        {list.map((token) => (
          <Pressable compact key={token.variable}
            data-selected={current === token.variable || undefined}
            onClick={() => onPick(token.ref)}
            className={cn('flex h-7 w-full items-center gap-2 rounded-xs px-2 text-left text-xs hover:bg-hover', current === token.variable && 'bg-active')}
          >
            {group === 'shadow' && <span className="size-3.5 shrink-0 rounded-xs bg-bg" style={{ boxShadow: token.value }} />}
            {group === 'radius' && <span className="size-3.5 shrink-0 border-l-[1.5px] border-t-[1.5px] border-muted" style={{ borderTopLeftRadius: token.value }} />}
            <span className="min-w-0 truncate text-text">{token.name}</span>
            <span className="ml-auto max-w-[45%] shrink-0 truncate font-mono text-2xs text-faint">{token.value}</span>
            {current === token.variable && <Icon name="check" size={12} className="shrink-0 text-focus" />}
          </Pressable>
        ))}
      </div>
      {current && detach && (
        <Pressable compact onClick={detach} className="mt-1 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-2 text-xs text-muted hover:bg-hover hover:text-text">
          <Icon name="unlink" size={12} />
          {t('Detach')}
        </Pressable>
      )}
    </div>
  )
}

/**
 * The token button of a value: a small diamond that opens the group's token list. It takes no room until its
 * field is pointed at or holds the focus, unless a token is chosen (`active`): the value keeps the field's width.
 */
export function TokenButton({ group, value, onPick, active, className, trigger }: { group: string; value?: string | null; onPick: (v: string | null) => void; active?: boolean; className?: string; trigger?: ReactElement }) {
  const [open, setOpen] = useState(false)
  const tokens = useThemeTokens()
  const { engine } = useStyling()
  const kind = group as TokenGroup
  // The spacing scale is there with any theme; another group only when the theme names values of it.
  if (!engine || (kind !== 'spacing' && !tokens.of(kind).length)) return null
  const pick = (v: string | null) => {
    onPick(v)
    setOpen(false)
  }
  const detach = () => pick(tokens.find(value)?.token.value ?? null)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-60 !p-1"
      trigger={
        trigger ?? (
          <Tooltip content={t('Theme Values')}>
          <Pressable compact className={cn('size-5 shrink-0 place-items-center rounded-xs text-faint hover:bg-hover hover:text-ink', active || open ? 'grid text-ink' : 'hidden group-hover/value:grid group-focus-within/value:grid [@media(hover:none)]:grid', className)}
            aria-label={t('Theme Values')}
          >
            <Icon name="symbol" size={10} />
          </Pressable>
          </Tooltip>
        )
      }
    >
      <TokenList group={kind} value={value} onPick={pick} detach={detach} />
    </Popover>
  )
}
