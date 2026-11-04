import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'publish'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  loading?: boolean
  children?: ReactNode
}

// Fills are solid mixes, not films, so a button reads the same on the sheet, the desk and a float.
const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-ink-contrast shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] dark:shadow-none hover:bg-[color-mix(in_srgb,var(--cms-ink)_88%,var(--cms-bg))] active:bg-[color-mix(in_srgb,var(--cms-ink)_80%,var(--cms-bg))]',
  // A sheet of its own: a hairline ring and the slightest lift.
  secondary: 'bg-float text-text shadow-[0_0_0_1px_var(--cms-border-strong),var(--cms-shadow-raise)] hover:bg-sunken active:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_7%)] dark:hover:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_5.5%)] dark:active:bg-[color-mix(in_srgb,var(--cms-float),var(--cms-ink)_9%)]',
  ghost: 'bg-transparent text-text hover:bg-hover active:bg-active',
  // The last step of a destructive confirm, nothing else.
  danger: 'bg-danger text-white dark:text-ink-contrast hover:bg-[color-mix(in_srgb,var(--cms-danger)_90%,var(--cms-signal-ink))] active:bg-[color-mix(in_srgb,var(--cms-danger)_82%,var(--cms-signal-ink))]',
  // The brand's yellow is for going live: Publish, Publish site, Go live.
  publish: 'bg-signal text-signal-ink hover:bg-[color-mix(in_srgb,var(--cms-signal)_92%,var(--cms-signal-ink))] active:bg-[color-mix(in_srgb,var(--cms-signal)_86%,var(--cms-signal-ink))]',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 gap-1 text-xs rounded-xs',
  sm: 'h-7 px-2.5 gap-1.5 text-sm rounded-sm',
  md: 'h-8 px-3 gap-1.5 text-sm rounded-md',
  lg: 'h-10 px-4 gap-2 text-base rounded-lg',
}

const iconSizes: Record<ButtonSize, number> = { xs: 14, sm: 16, md: 16, lg: 16 }

/** A ghost button's icon is a quieter tone of its label (muted beside text, a paler red beside danger) and comes up to it on hover. */
const quietIcon = 'text-[color-mix(in_srgb,currentColor_72%,transparent)] transition-colors duration-120 group-hover/button:text-current'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'sm', icon, iconRight, loading, disabled, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-variant={variant}
      disabled={disabled || loading}
      className={cn(
        'group/button inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,color,opacity,box-shadow] duration-120 ease-out disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        // Pressed (a toggle that is on, the place on view): the same pressed fill on every variant, winning over its resting fill.
        'aria-pressed:bg-active! aria-pressed:text-ink! data-active:bg-active! data-active:text-ink!',
        variants[variant],
        sizes[size],
        loading && !icon && 'relative',
        className,
      )}
      {...props}
    >
      {loading && icon ? <Spinner size={iconSizes[size]} /> : icon ? <Icon name={icon} size={iconSizes[size]} className={cn('shrink-0', variant === 'ghost' && quietIcon)} /> : null}
      {loading && !icon ? (
        // Without an icon to stand in for, the spinner covers the label: the button keeps its width.
        <>
          <span className="invisible contents">
            {children}
            {iconRight && <Icon name={iconRight} size={size === 'xs' ? 12 : 14} className="-mr-0.5 shrink-0 opacity-60" />}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner size={iconSizes[size]} />
          </span>
        </>
      ) : (
        <>
          {children}
          {iconRight && <Icon name={iconRight} size={size === 'xs' ? 12 : 14} className="-mr-0.5 shrink-0 opacity-60" />}
        </>
      )}
    </button>
  )
})

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'iconRight'> {
  icon: string
  label: string
  active?: boolean
}

/** Square icon-only button. `label` is required for accessibility (and shown as tooltip). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'sm', variant = 'ghost', active, className, loading, ...props },
  ref,
) {
  const square = { xs: 'size-6', sm: 'size-7', md: 'size-8', lg: 'size-10' }[size]
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      aria-label={label}
      title={label}
      loading={loading}
      data-active={active || undefined}
      className={cn(square, '!px-0', variant === 'ghost' && !active && 'text-muted hover:text-ink', className)}
      {...props}
    >
      {!loading && <Icon name={icon} size={iconSizes[size]} />}
    </Button>
  )
})
