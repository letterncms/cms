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

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-ink-contrast hover:bg-ink/88 active:bg-ink/80 border border-transparent',
  secondary: 'bg-bg text-text border border-border-strong hover:bg-hover active:bg-active',
  ghost: 'bg-transparent text-text border border-transparent hover:bg-hover active:bg-active',
  danger: 'bg-danger text-white border border-transparent hover:bg-danger/90',
  // Signal orange is reserved for going live.
  publish: 'bg-signal text-signal-ink border border-transparent hover:bg-signal/90 active:bg-signal/85',
}

const sizes: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 gap-1 text-xs rounded-xs',
  sm: 'h-7 px-2.5 gap-1.5 text-sm rounded-sm',
  md: 'h-8 px-3 gap-1.5 text-sm rounded-sm',
  lg: 'h-10 px-4 gap-2 text-base rounded-sm',
}

const iconSizes: Record<ButtonSize, number> = { xs: 13, sm: 14, md: 15, lg: 16 }

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'sm', icon, iconRight, loading, disabled, className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,color,opacity,box-shadow] duration-120 ease-out disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
        variants[variant],
        sizes[size],
        loading && !icon && 'relative',
        className,
      )}
      {...props}
    >
      {loading && icon ? <Spinner size={iconSizes[size]} /> : icon ? <Icon name={icon} size={iconSizes[size]} /> : null}
      {loading && !icon ? (
        // Without an icon to stand in for, the spinner covers the label: the button keeps its width.
        <>
          <span className="invisible contents">
            {children}
            {iconRight && <Icon name={iconRight} size={iconSizes[size]} className="-mr-0.5 opacity-60" />}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner size={iconSizes[size]} />
          </span>
        </>
      ) : (
        <>
          {children}
          {iconRight && <Icon name={iconRight} size={iconSizes[size]} className="-mr-0.5 opacity-60" />}
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
      className={cn(square, '!px-0', active && 'bg-active text-ink', variant === 'ghost' && !active && 'text-muted hover:text-text', className)}
      {...props}
    >
      {!loading && <Icon name={icon} size={iconSizes[size]} />}
    </Button>
  )
})
