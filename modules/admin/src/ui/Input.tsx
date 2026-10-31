import { forwardRef, useLayoutEffect, useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

const base =
  'w-full rounded-sm border border-border-strong bg-bg text-text placeholder:text-faint transition-[border-color,box-shadow] duration-120 cms-focus-ring disabled:opacity-50 disabled:bg-sunken aria-[invalid=true]:border-danger'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  invalid?: boolean
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, size = 'md', invalid, suffix, className, ...props }, ref) {
  // xs is the inspector density.
  const height = { xs: 'h-6 text-2xs', sm: 'h-7 text-sm', md: 'h-8 text-sm', lg: 'h-10 text-base' }[size]
  return (
    <div className={cn('relative flex items-center', className)}>
      {icon && <Icon name={icon} size={size === 'xs' ? 12 : 14} className={cn('pointer-events-none absolute text-faint', size === 'xs' ? 'left-1.5' : 'left-2.5')} />}
      <input ref={ref} aria-invalid={invalid || undefined} className={cn(base, height, icon ? (size === 'xs' ? 'pl-6' : 'pl-8') : size === 'xs' ? 'pl-1.5' : 'pl-2.5', suffix ? 'pr-16' : size === 'xs' ? 'pr-1.5' : 'pr-2.5')} {...props} />
      {suffix && <div className="absolute right-1.5 flex items-center gap-1 text-xs text-faint">{suffix}</div>}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  autoGrow?: boolean
  /** Keep shared sizing/focus behavior while the caller supplies document typography. */
  appearance?: 'default' | 'plain'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, autoGrow = true, appearance = 'default', className, onInput, ...props }, forwarded) {
  const inner = useRef<HTMLTextAreaElement | null>(null)
  const grow = () => {
    const el = inner.current
    if (!el || !autoGrow || !el.clientWidth) return
    el.style.height = 'auto'
    const style = getComputedStyle(el)
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
    el.style.height = `${el.scrollHeight + border}px`
  }
  useLayoutEffect(grow, [props.value, autoGrow])
  useLayoutEffect(() => {
    const el = inner.current
    if (!el || !autoGrow) return
    // Hidden chats and responsive layouts need a fresh measurement when their width changes.
    let width = el.clientWidth
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return
      width = el.clientWidth
      grow()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [autoGrow])
  return (
    <textarea
      ref={(el) => {
        inner.current = el
        if (typeof forwarded === 'function') forwarded(el)
        else if (forwarded) forwarded.current = el
      }}
      aria-invalid={invalid || undefined}
      onInput={(e) => {
        grow()
        onInput?.(e)
      }}
      className={cn(appearance === 'plain' ? 'w-full min-h-0 resize-none rounded-none border-0 bg-transparent p-0 outline-none' : `${base} min-h-16 resize-y px-2.5 py-1.5 leading-[20px]`, className)}
      {...props}
    />
  )
})
