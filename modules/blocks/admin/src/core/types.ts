import type { FieldDef } from '@letterncms/sdk'

export interface LogicAction {
  do: string
  [key: string]: any
}

export interface LogicMap {
  data?: Record<string, unknown>
  /** An Alpine component registered in custom.js, used instead of data. */
  component?: string
  init?: LogicAction[]
  on?: { event: string; mods?: string[]; key?: string; actions: LogicAction[] }[]
  show?: string
  transition?: string
  states?: Record<string, string>
  text?: string
  attrs?: Record<string, string>
  model?: string
  target?: string[]
  push?: boolean
  merge?: string
  behaviors?: { scroll?: { threshold?: number; hide?: boolean }; spy?: { offset?: number }; group?: boolean; menu?: Record<string, never>; carousel?: Record<string, never>; marquee?: { speed?: number; reverse?: boolean; pause?: boolean } }
}

export interface MotionStep {
  target?: string
  mask?: boolean
  from?: Record<string, number | string>
  to?: Record<string, number | string>
  duration?: number
  delay?: number
  ease?: string
  stagger?: number
  at?: number
}

export interface MotionDef {
  id: string
  name?: string
  /** scroll: `pin` holds the element for that much scrolling ("150vh"), `scrub` lets the steps trail the scroll by about that many seconds. */
  trigger: { type: string; start?: string; end?: string; once?: boolean; node?: string; pin?: string; scrub?: number }
  on?: string[]
  steps: MotionStep[]
  repeat?: number
  yoyo?: boolean
  hold?: number
}

export interface BlockNode {
  id: string
  type: string
  props: Record<string, any>
  children?: BlockNode[]
  anchor?: string
  /** Its Tailwind classes: "flex gap-4 md:grid-cols-3 hover:bg-primary/50". */
  class?: string
  label?: string
  hidden?: boolean
  attrs?: Record<string, string>
  bind?: Record<string, string>
  logic?: LogicMap
  motion?: MotionDef[]
  /** A script of the site mounted on the element: { module: "tilt", props: { max: 8 }, when: "visible" }. */
  behavior?: { module: string; props?: Record<string, unknown>; when?: 'load' | 'visible' | 'idle' }
  /** Scripts and styles of the site the block brings to its page. */
  code?: { scripts?: string[]; styles?: string[] }
  /** The name the element is kept by across pages when navigation swaps them. */
  persist?: string
}

export interface BlockTypeDef {
  name: string
  title: string
  icon: string
  category: string
  description?: string
  keywords?: string[]
  fields?: FieldDef[]
  children?: boolean | string[]
  styles?: string[]
  inline?: string[]
  defaults?: Record<string, any>
  template?: Partial<BlockNode>[]
  parent?: string
  variants?: string[]
  example?: Record<string, any>
  package?: string
  html?: string
}

export interface DataSourceDef {
  name: string
  label: string
  description?: string
  fields: FieldDef[]
  item: Record<string, string>
}

export interface Catalog {
  blocks: BlockTypeDef[]
  /** The inserter's groups, in order and in the user's language. */
  categories?: { name: string; label: string }[]
  sources: DataSourceDef[]
  motion: { triggers: string[]; properties: Record<string, 'number' | 'length' | 'css'> }
  logic: { events: string[]; mods: string[]; actions: string[]; transitions: string[]; merges: string[] }
}

/** Where the caret should land after an edit. */
export interface FocusRequest {
  id: string
  prop?: string
  index?: number
  at: 'start' | 'end' | number
  nonce: number
}

export const TEXT_TYPES = ['paragraph', 'heading', 'quote', 'list', 'callout']

export function newId(): string {
  return 'b' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4)
}
