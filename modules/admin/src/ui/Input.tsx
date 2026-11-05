import { forwardRef, useLayoutEffect, useRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from './cn'
import { Icon } from './Icon'

/** `.cms-input` (app.css) draws the field: border, hover, focus, invalid, disabled, quiet, and white slips on the desk. */
const base = 'cms-input w-full'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  invalid?: boolean
  suffix?: React.ReactNode
  /** `quiet`: no border until hovered or focused — for inline edits in a table or a toolbar. */
  appearance?: 'default' | 'quiet'
}

// xs is the inspector density; md the forms'.
const heights = { xs: 'h-6 rounded-xs text-xs', sm: 'h-7 rounded-sm text-sm', md: 'h-8 rounded-md text-sm', lg: 'h-10 rounded-lg text-base' }
const padding = { xs: ['pl-1.5', 'pr-1.5', 'pl-6', 'left-1.5'], sm: ['pl-2', 'pr-2', 'pl-7', 'left-2'], md: ['pl-2.5', 'pr-2.5', 'pl-[30px]', 'left-2.5'], lg: ['pl-3', 'pr-3', 'pl-9', 'left-3'] }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ icon, size = 'md', invalid, suffix, appearance = 'default', className, ...props }, ref) {
  const [left, right, withIcon, iconAt] = padding[size]
  return (
    // As wide as its place, also in a row beside other controls, unless the caller gives it a width.
    <div className={cn('relative flex min-w-0 items-center', !/(^|\s)([\w-]+:)*!?w-/.test(className ?? '') && 'w-full', className)}>
      {icon && <Icon name={icon} size={size === 'xs' ? 12 : 14} className={cn('pointer-events-none absolute z-[1] text-faint', iconAt)} />}
      <input ref={ref} aria-invalid={invalid || undefined} className={cn(base, appearance === 'quiet' && 'cms-input-quiet', heights[size], icon ? withIcon : left, suffix ? 'pr-16' : right)} {...props} />
      {suffix && <div className="absolute right-2 flex items-center gap-1 text-xs text-faint">{suffix}</div>}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
  /** `plain`: shared sizing and focus, document typography from the caller. `quiet`: no border until hovered or focused. */
  appearance?: 'default' | 'plain' | 'quiet'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, appearance = 'default', className, onInput, ...props }, forwarded) {
  const inner = useRef<HTMLTextAreaElement | null>(null)
  const grow = () => {
    const el = inner.current
    if (!el || !el.clientWidth) return
    el.style.height = 'auto'
    const style = getComputedStyle(el)
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
    el.style.height = `${el.scrollHeight + border}px`
  }
  useLayoutEffect(grow, [props.value])
  useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    // Hidden chats and responsive layouts need a fresh measurement when their width changes.
    let width = el.clientWidth
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === width) return
      width = el.clientWidth
      grow()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
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
      className={cn(appearance === 'plain' ? 'w-full min-h-0 resize-none rounded-none border-0 bg-transparent p-0 outline-none' : cn(base, appearance === 'quiet' && 'cms-input-quiet', 'block min-h-[72px] rounded-md px-2.5 py-[7px] leading-[20px] resize-none'), className)}
      {...props}
    />
  )
})
