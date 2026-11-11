import { Link, type LinkProps } from '@letterncms/sdk'
import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode, type Ref } from 'react'
import { cn } from './cn'

interface Common {
  /** On, or the place on view: `data-active`, for the control's own look (`data-active:bg-active`). On a button it is `aria-pressed` too, unless the control says what it is another way (`role`, `aria-selected`…). */
  active?: boolean
  /** The focus line inside the control's edge: a row, a tab, a cell, anything that reaches its container's edges. */
  inset?: boolean
  /** Without the 44px hit area on a touch screen: only where neighbours stand closer than that and the control is big enough itself. */
  compact?: boolean
  className?: string
  children?: ReactNode
}

export type PressableProps =
  | (Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: undefined })
  | (Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & { to: string })

/**
 * Something to press that draws itself: a colour plane, a box of the spacing control, a card that opens,
 * a piece of canvas chrome. It is the control without a look: a `<button type="button">` (or, with `to`,
 * a link to a place of the admin) that has what every control of the kit has, and nothing to see:
 * the focus line, 44px to hit on a touch screen, `disabled`, and `data-active` to style from.
 * What it looks like is the caller's `className`. A labelled button is `Button`, an icon `IconButton`:
 * this is for the ones that are neither. Never a raw `<button>` in a module.
 */
export const Pressable = forwardRef<HTMLButtonElement | HTMLAnchorElement, PressableProps>(function Pressable({ active, inset, compact, className, children, ...props }, ref) {
  // `cms-pressable` (app.css) is what a control needs and nothing to see: the focus line, words that start at the
  // start, no selection. It sits under the utilities, so whatever the caller's className says wins over it.
  const look = cn('cms-pressable', !compact && 'cms-touch', className)
  if (props.to !== undefined) {
    const { to, ...link } = props
    // The SDK's link hands what it is given to its `<a>`, the ref included.
    const anchor = { ref, ...link } as Omit<LinkProps, 'to'>
    return <Link to={to} data-active={active || undefined} data-inset={inset || undefined} aria-current={active ? 'page' : undefined} className={look} {...anchor}>{children}</Link>
  }
  const { to: _, type = 'button', ...button } = props
  // Pressed, for a control that says nothing else about what it is.
  const pressed = active !== undefined && button.role === undefined && button['aria-selected'] === undefined && button['aria-checked'] === undefined && button['aria-expanded'] === undefined ? active : undefined
  return <button ref={ref as Ref<HTMLButtonElement>} type={type} data-active={active || undefined} data-inset={inset || undefined} aria-pressed={pressed} className={look} {...button}>{children}</button>
})
