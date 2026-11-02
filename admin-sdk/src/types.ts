import type { ReactNode } from 'react'

export interface SurfaceComponentInfo {
  id: string
  label: string
  description: string
  props: Record<string, unknown>
  children: boolean
}

/** Versioned data, never generated JSX, HTML, CSS or executable code. */
export interface SurfaceDocument {
  version: 1
  id: string
  title: string
  spec: { root: string; elements: Record<string, SurfaceElement> }
}

export interface SurfaceElement {
  type: string
  props: Record<string, unknown>
  children?: string[]
  on?: Record<string, { action: string; params?: Record<string, unknown> }>
}

export interface SurfaceAction {
  node: string
  name: string
}

/** Renderers own their interactions; the host sends action identifiers to the server. */
export interface SurfaceComponentProps<P = Record<string, unknown>> {
  props: P
  children?: ReactNode
  disabled: boolean
  onAction: (name: string) => void
}

/** The product's display name, links and images, from brand/brand.json. */
export interface BrandInfo {
  name: string
  domain: string
  product_url: string
  docs_url: string
  github_url: string
  support_email: string
  mark: string
  wordmark: string
}

export interface Boot {
  base: string
  api: string
  version: string
  brand: BrandInfo
  site: { name: string; url: string }
  /** The name of this site's XSRF cookie. */
  xsrfCookie?: string
  /** The admin's language, the languages it speaks (code → name) and its strings in that language. */
  locale?: string
  languages?: Record<string, string>
  messages?: Record<string, string>
  /** The signed-in user's manifest, sent along with the page so the admin starts without waiting for it. */
  manifest?: Manifest
}

export interface FieldDef {
  handle: string
  /** Control identity assigned by Fields; nested controls include their value path. */
  id?: string
  describedBy?: string
  type: string
  label: string
  instructions?: string
  required?: boolean
  default?: unknown
  width?: 'full' | 'half' | 'third' | 'two-thirds'
  section?: string
  /** Render with this admin component instead of the type's own (e.g. a json value with a custom editor). */
  component?: string
  /** Presentation options the core components understand: an icon in the input, its size, autofill, monospace, `display` (segmented, checkbox). */
  icon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  placeholder?: string
  autofocus?: boolean
  autocomplete?: string
  inputmode?: 'numeric' | 'text'
  mono?: boolean
  display?: string
  /** text: `blur` saves on blur/Enter instead of on every keystroke. */
  commit?: 'change' | 'blur'
  /** select segmented: fill the row. */
  block?: boolean
  /** Inline rows: where the value comes from (`own` here, or `inherited`) and how to clear it. */
  status?: 'own' | 'inherited'
  reset?: () => void
  /** select: hand values back as numbers. */
  numeric?: boolean
  /** Extra classes for the field's wrapper (e.g. a width in a toolbar). */
  className?: string
  [option: string]: unknown
}

export interface FieldTypeDef {
  key: string
  label: string
  icon: string
  description: string
  group: string
  component: string
  config: FieldDef[]
}

export interface CollectionSummary {
  handle: string
  title: string
  singular: string
  /** The create button's label in the user's language ("New Page", "Nieuw bericht"). */
  newLabel: string
  icon: string
  structure: 'list' | 'tree' | 'dated'
  defaultView?: 'table' | 'grid' | 'calendar'
  routable: boolean
  driver: 'database' | 'files'
  can: { create: boolean; edit: boolean; publish: boolean; delete: boolean }
}

export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  /** The section it is listed in: of the sidebar, or of the settings sidebar. */
  section: string
  /** A keyboard shortcut that opens it, shown with its label (e.g. `mod+j`). */
  shortcut?: string | null
  badge?: string | number | null
}

/** The main sidebar as arranged for this user: items in sections; hidden ones are under More. `personal` when they pinned their own. */
export interface Sidebar extends Arrangement {
  personal: boolean
}

/** A group of an arranged part of the admin (a sidebar section, a home column): item ids in order. An empty label has no heading. */
export interface ArrangedSection {
  id: string
  label: string
  items: string[]
}

/** How the sidebar or the home screen is arranged — by a person (a preference) or as the site's default (the `sidebar` and `dashboard` values of the `admin` settings). */
export interface Arrangement {
  sections: ArrangedSection[]
  hidden: string[]
}

/** A home-screen widget as registered in PHP (`$admin->widget()`); its component is `registry.widgets.get(id)`. */
export interface WidgetInfo {
  id: string
  label: string
  description: string
  icon: string
  column: 'main' | 'side'
  /** On everyone's home screen until they rearrange it. */
  enabled: boolean
  /** The package it comes from (its label). */
  source: string
}

export interface Manifest {
  /** Trusted components for declarative, contextual admin surfaces. */
  components?: SurfaceComponentInfo[]
  cms: { version: string; lockedDown: boolean; debug: boolean }
  brand: BrandInfo
  site: { name: string; url: string; locales: string[]; defaultLocale: string; timezone: string }
  user: User & { grants: string[]; preferences: Record<string, unknown> }
  collections: CollectionSummary[]
  globals: ({ handle: string; title: string; icon: string } & RecordTimestamps)[]
  fieldTypes: FieldTypeDef[]
  settings: { namespace: string; label: string; icon: string; description: string; package: string | null }[]
  packages: { active: string[]; pending: Record<string, string> }
  /** Every screen the user may open: the sidebar's in its order (those under More included), then the settings sidebar's. */
  nav: NavItem[]
  sidebar: Sidebar
  /** The settings sidebar: its sections with the ids of their items. */
  settingsNav: ArrangedSection[]
  modules: { id: string; url: string; package: string | null }[]
  styles: string[]
  /** Home-screen widgets the user may add: shown in the gallery with their description and the package they come from. */
  widgets: WidgetInfo[]
  /** The home screen's columns with the ids of the widgets the user sees. */
  dashboard: ArrangedSection[]
  /** The home screen as arranged for this user (hidden = in the gallery); `personal` when they arranged their own. */
  home?: { layout: Arrangement; personal: boolean; problems?: Record<string, string> }
  commands: { id: string; label: string; icon: string; group: string; path?: string; ability?: string; input?: Record<string, unknown>; keywords?: string[] }[]
  /** The language the manifest's labels are in. */
  locale?: string
  /** Values modules share with every admin user, by settings namespace (see useConfig). */
  config?: Record<string, Record<string, unknown>>
}

/** Standard overview metadata. Unknown or inapplicable dates are null. */
export interface RecordTimestamps {
  publishedAt: string | null
  updatedAt: string | null
}

export interface User extends RecordTimestamps {
  id: string
  name: string
  email: string
  avatar: string | null
  initials: string
  roles: string[]
  super: boolean
  locale: string | null
  /** `active`, `invited` (made by a plugin, no password yet) or `suspended`. */
  status: string
  /** No way into the admin: an account of the public site. */
  visitor: boolean
  twoFactor: boolean
  lastLoginAt: string | null
  createdAt: string | null
  /** Profile values for the fields in content/users.yaml. */
  data: Record<string, any>
}

export type EntryStatus = 'draft' | 'published'
export type DisplayStatus = 'draft' | 'published' | 'changed' | 'scheduled'

/** Safe identity used by content, history and people pickers. */
export interface PersonSummary {
  id: string
  name: string
  initials: string
  avatar: string | null
}

export type EntryCapabilities = CollectionSummary['can']

/** Editorial values; publication timing and structure use explicit commands. */
export interface EntryContent {
  title: string
  slug: string
  data: Record<string, any>
  authorId: string | null
}

export interface EntrySummary extends RecordTimestamps {
  id: string
  collection: string
  locale: string
  title: string
  slug: string
  uri: string | null
  status: EntryStatus
  displayStatus: DisplayStatus
  parentId: string | null
  position: number
  authorId: string | null
  author: PersonSummary | null
  /** Opaque persisted content version for mutation preconditions. */
  version: string
}

export interface Entry extends EntrySummary {
  hasDraft: boolean
  data: Record<string, any>
  originId: string | null
  createdAt: string | null
  translations?: Record<string, string>
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  perPage?: number
  pages: number
}

/** Props every field component receives. */
export interface FieldProps<T = any> {
  field: FieldDef
  value: T
  onChange: (value: T) => void
  error?: string
  disabled?: boolean
  context: FieldContext
}

export interface FieldContext {
  /** Path to the containing group/repeater value; the field handle is appended by Fields. */
  path?: string[]
  errors?: Record<string, string>
  entry?: Entry
  collection?: string
  locale?: string
  /** Current (unsaved) entry title. */
  title?: string
  /** All current values of the form (for conditional UIs). */
  values?: Record<string, any>
  /** Imported fields from the saved blueprint, when configuring a blueprint. */
  blueprintFields?: FieldDef[]
  /** Nesting level when fields are edited inside other fields (blueprint sub-fields). */
  depth?: number
}

/** Shared content and mutation capabilities available to entry extensions. */
export interface EntryPanelProps {
  /** Complete working snapshot, including editorial metadata, for previews. */
  content: EntryContent
  entry: Entry | null
  collection: { handle: string; title: string; singular: string; body?: string; route?: string; structure?: 'list' | 'tree' | 'dated'; resolvedFields: FieldDef[] }
  values: Record<string, any>
  title: string
  setValue: (handle: string, value: any) => void
  save: () => Promise<void>
  reload: () => void | Promise<void>
  editable: boolean
  can: EntryCapabilities
  errors: Record<string, string>
}

/** One body editor workspace. Selection never changes the content or persistence model. */
export interface EntryEditorProps extends EntryPanelProps {
  setTitle: (title: string) => void
  /** The explicitly configured main-content field. */
  bodyField: FieldDef
  /** Additional entry.body panels after the main content. */
  footer: ReactNode
  /** Host-owned record details, history and plugin tabs. */
  sidebar: ReactNode
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  /** A place in the screen's top bar for the editor's own few tools, to `createPortal` into. */
  toolbar: Element | null
  /** The list of entries this editor came from. */
  listPath: string
}
