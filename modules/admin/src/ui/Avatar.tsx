import { cn } from './cn'

/** Initials sit on a film of ink over the page, solid so stacked avatars don't show through: a step stronger in dark mode, where the page is close to the desk. */
const tone = 'bg-fill'

/** A person: their picture, or their initials. Circles at 20, 24 or 32. */
export function Avatar({ name, initials, src, size = 24, className }: { name: string; initials?: string; src?: string | null; size?: number; className?: string }) {
  const letters = initials ?? name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return src ? (
    // An outline, not a shadow, so the hairline draws over the picture's own edge.
    <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className={cn('shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/6 dark:outline-white/8', className)} />
  ) : (
    <span
      title={name}
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none text-text', tone, className)}
      style={{ width: size, height: size, fontSize: size >= 28 ? 12.5 : size >= 24 ? 11.5 : size >= 20 ? 10 : Math.max(8, Math.round(size * 0.5)) }}
    >
      {letters}
    </span>
  )
}

export function AvatarStack({ people, max = 4, size = 22 }: { people: { name: string; initials?: string; avatar?: string | null }[]; max?: number; size?: number }) {
  const shown = people.slice(0, max)
  return (
    <div className="flex -space-x-1">
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} initials={p.initials} src={p.avatar} size={size} className="ring-2 ring-bg" />
      ))}
      {people.length > max && (
        <span className={cn('inline-flex items-center justify-center rounded-full text-2xs font-medium tabular-nums text-muted ring-2 ring-bg', tone)} style={{ width: size, height: size }}>
          +{people.length - max}
        </span>
      )}
    </div>
  )
}
