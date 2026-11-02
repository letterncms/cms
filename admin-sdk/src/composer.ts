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

/** One line of what `@` or `/` offer. What picking it does follows from what it has. */
export interface ComposerOption extends ContextItem {
  /** Said after its label. */
  detail?: string
  /** Picking it does this. */
  perform?: () => void
  /** Picking it writes this in the message. */
  insert?: string
  /** Picking it asks for this skill (`cms()->skills()`). Without any of these three, picking it attaches it as a `ContextItem`. */
  skill?: string
}

/**
 * Where `@` or `/` in a message look: one group of lines, by what is typed after
 * them. Plugins register theirs with `registry.composer.set(id, source)`, and need
 * nothing to be installed to do so: without a chat it is simply not asked.
 */
export interface ComposerSource {
  id: string
  trigger: '@' | '/'
  label: string
  order?: number
  search: (query: string) => ComposerOption[] | Promise<ComposerOption[]>
}
