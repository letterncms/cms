/** The same height, corners and type scale for fields and the actions beside them. */
export const controlSizes = {
  xs: 'h-6 rounded-xs text-xs',
  sm: 'h-7 rounded-sm text-sm',
  md: 'h-8 rounded-md text-sm',
  lg: 'h-10 rounded-lg text-base',
} as const

export type ControlSize = keyof typeof controlSizes
