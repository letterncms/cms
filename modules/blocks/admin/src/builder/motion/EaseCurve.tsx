/** Approximate cubic-bezier shapes of the vocabulary's easings, for previews (spring and bounce are linear() curves). */
const BEZIER: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1], in: [0.55, 0, 1, 0.45], out: [0.22, 1, 0.36, 1], 'in-out': [0.65, 0, 0.35, 1], expo: [0.19, 1, 0.22, 1],
  emphasized: [0.16, 1, 0.3, 1], swift: [0.32, 0.72, 0, 1], overshoot: [0.34, 1.56, 0.64, 1], anticipate: [0.7, -0.4, 0.3, 1.4],
  spring: [0.2, 1.5, 0.4, 0.95], bounce: [0.3, 1.3, 0.5, 1],
}

export function bezierOf(ease: string | undefined): [number, number, number, number] {
  return BEZIER[ease ?? 'out'] ?? BEZIER.out
}

export function EaseCurve({ value, size = 32, className }: { value?: string; size?: number; className?: string }) {
  const [x1, y1, x2, y2] = bezierOf(value)
  const p = (x: number, y: number) => `${4 + x * (size - 8)},${size - 4 - y * (size - 8)}`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className ?? 'shrink-0 rounded-xs bg-sunken text-focus'} aria-hidden>
      <path d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
