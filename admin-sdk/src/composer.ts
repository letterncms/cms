import type { FieldDef } from './types'

/**
 * Something a message can carry: the page on view, a block selected on it, a file
 * picked with @. Screens offer them (`useScreenContext`), sources find them
 * (`registry.composer`), and whatever works alongside the admin reads them when
 * they are needed.
 */
export interface ContextItem {
  /** Tells one from the next. */
  id: string
  label: string
  icon?: string
  /** The sort of thing it is, such as `entry` or `file`. */
  kind?: string
  /** An admin path to open it at. */
  to?: string
  /** What it says, read only when a message goes out. */
  read?: () => unknown | Promise<unknown>
}

/** An ability run from a thread (`/`): what is already chosen, and its input's schema for what still has to be asked. */
export interface ComposerCommand {
  ability: string
  /** Chosen with the line: `{collection: 'pages'}` for New Page. */
  input?: Record<string, unknown>
  /** The ability's input schema; what it requires and isn't chosen is asked for. */
  schema?: Record<string, unknown>
  /** Ask only for what is required (a line that chose the rest). */
  required?: boolean
  /** Asks before it runs, whatever it needs. */
  destructive?: boolean
  /** Instead of a schema: the fields to ask with, and what they hold now (a settings page's). */
  load?: () => Promise<{ fields: FieldDef[]; values?: Record<string, unknown> }>
  /** The answers go in the input under this key (`values`), rather than spread over it. */
  into?: string
  /** The input is a view action's: templates (`{values.x}`) filled with this scope and the answers. */
  scope?: Record<string, unknown>
  /** What its button says (Run, or Save for a loaded form). */
  confirm?: string
}

/** One line of what `@` or `/` offer. What picking it does follows from what it has. */
export interface ComposerOption extends ContextItem {
  /** Said after its label. */
  detail?: string
  /** A heading of its own among its source's lines (the abilities of one plugin). */
  group?: string
  /** The key that does the same anywhere, shown at the end of its line (`mod+shift+,`). */
  shortcut?: string
  /** Picking it does this. */
  perform?: () => void
  /** Picking it writes this in the message. */
  insert?: string
  /** Picking it asks for this skill (`cms()->skills()`). */
  skill?: string
  /** Picking it runs this ability in the thread, asking first for what its input still needs. Without any of these four, picking it attaches it as a `ContextItem`. */
  command?: ComposerCommand
}

/**
 * Where `@` or `/` in a message look: one group of lines, by what is typed after
 * them. Plugins register theirs with `registry.composer.set(id, source)`. `@` (what a
 * message carries) is asked only when an agent answers in the thread; `/` always.
 */
export interface ComposerSource {
  trigger: '@' | '/'
  label: string
  order?: number
  search: (query: string) => ComposerOption[] | Promise<ComposerOption[]>
}
