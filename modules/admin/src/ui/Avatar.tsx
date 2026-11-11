import { cn } from './cn'

/** Initials sit on a film of ink over the page, solid so stacked avatars don't show through: a step stronger in dark mode, where the page is close to the desk. */
const tone = 'bg-fill'
/** The letters' size in a circle of `size`: the widest pair (MW) keeps a little air inside it. */
const letterSize = (size: number) => size >= 28 ? 12.5 : size >= 24 ? 11 : size >= 20 ? 9 : Math.max(7, Math.round(size * 0.45))

/**
 * A person: their picture, or their initials. Circles at 20, 24 or 32. Two letters at most, whatever was handed in:
 * a third would run over the circle's edge. `single` shows the first one only, for a circle that is partly covered.
 */
export function Avatar({ name, initials, src, size = 24, single, className }: { name: string; initials?: string; src?: string | null; size?: number; single?: boolean; className?: string }) {
  const letters = [...(initials ?? name.split(/\s+/).map((p) => p[0]).join('').toUpperCase())].slice(0, single ? 1 : 2).join('')
  return src ? (
    // An outline, not a shadow, so the hairline draws over the picture's own edge.
    <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className={cn('shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/6 dark:outline-white/8', className)} />
  ) : (
    <span
      title={name}
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold leading-none text-text', tone, className)}
      style={{ width: size, height: size, fontSize: letterSize(size) }}
    >
      {letters}
    </span>
  )
}

export function AvatarStack({ people, max = 4, size = 22 }: { people: { name: string; initials?: string; avatar?: string | null }[]; max?: number; size?: number }) {
  const shown = people.slice(0, max)
  return (
    <div className="flex -space-x-1">
      {/* Each circle lies 4px under the next one and its ring: one letter stays clear of that, two would be cut. */}
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} initials={p.initials} src={p.avatar} size={size} single className="ring-2 ring-bg" />
      ))}
      {people.length > max && (
        // As wide as its number: a pill once it has two digits, never a circle with the digits cut. Set like the circles' letters, so it sits on their line.
        <span title={people.slice(max).map((p) => p.name).join(', ')} className={cn('inline-flex shrink-0 items-center justify-center rounded-full px-1 font-semibold leading-none tabular-nums text-muted ring-2 ring-bg', tone)} style={{ minWidth: size, height: size, fontSize: letterSize(size) }}>
          +{people.length - max}
        </span>
      )}
    </div>
  )
}
