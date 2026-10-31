import { cn } from './cn'

const palette = ['#E8E1D9', '#DCE6E1', '#E2E0EC', '#E9DEE1', '#DDE4EC', '#E6E4D6']

export function Avatar({ name, initials, src, size = 24, className }: { name: string; initials?: string; src?: string | null; size?: number; className?: string }) {
  const letters = initials ?? name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const color = palette[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length]
  return src ? (
    <img src={src} alt={name} width={size} height={size} className={cn('shrink-0 rounded-full object-cover', className)} />
  ) : (
    <span
      title={name}
      className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-[#3a3a36]', className)}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.4), background: color }}
    >
      {letters}
    </span>
  )
}

export function AvatarStack({ people, max = 4, size = 22 }: { people: { name: string; initials?: string; avatar?: string | null }[]; max?: number; size?: number }) {
  const shown = people.slice(0, max)
  return (
    <div className="flex -space-x-1.5">
      {shown.map((p, i) => (
        <Avatar key={i} name={p.name} initials={p.initials} src={p.avatar} size={size} className="ring-2 ring-bg" />
      ))}
      {people.length > max && (
        <span className="inline-flex items-center justify-center rounded-full bg-sunken text-2xs text-muted ring-2 ring-bg" style={{ width: size, height: size }}>
          +{people.length - max}
        </span>
      )}
    </div>
  )
}
