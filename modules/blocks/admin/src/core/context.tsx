import { useAbility } from '@letterncms/sdk'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { EditorStore } from './store'
import type { BlockNode, BlockTypeDef, Catalog } from './types'

/** What the editor is editing: an entry's blocks field, a template or a component. */
export interface DocRef {
  kind: 'entry' | 'template' | 'pattern'
  /** Entry id or template/pattern handle. */
  id: string
  /** Collections whose entries a template frames (for data hints and the sample entry). */
  collections?: string[]
  /** Component properties (for data hints inside a component). */
  props?: { handle: string; label?: string; type?: string }[]
}

export interface EditorContextValue {
  store: EditorStore
  types: Map<string, BlockTypeDef>
  catalog: Catalog
  /** Entry being edited (for previews); null for unsaved entries and patterns. */
  entryId: string | null
  fieldHandle: string
  /** Allowed block types for this field (empty = all). */
  allowed: string[]
  getValues: () => Record<string, any>
  title: string
  doc?: DocRef
  /** The editor is read-only (no permission to edit). */
  readOnly?: boolean
}

const Ctx = createContext<EditorContextValue | null>(null)

export function EditorProvider({ value, children }: { value: EditorContextValue; children: ReactNode }) {
  value.store.setReadOnly(!!value.readOnly)
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Block editor context missing')
  return ctx
}

export function useCatalog() {
  const q = useAbility<Catalog>('blocks/types', {}, { staleTime: 300_000 })
  const types = useMemo(() => new Map((q.data?.blocks ?? []).map((b) => [b.name, b])), [q.data])
  return { catalog: q.data, types, isLoading: q.isLoading, error: q.error, retry: () => void q.refetch() }
}

/** Components' titles by handle: an instance is named after its component (Header, Footer). */
export function useComponentTitles(): Map<string, string> {
  const q = useAbility<{ handle: string; title: string }[]>('patterns/list', {}, { staleTime: 60_000 })
  return useMemo(() => new Map((q.data ?? []).map((p) => [p.handle, p.title])), [q.data])
}

/** What a block is called: its layer name, its component's title, or its type's. */
export function blockName(node: BlockNode, types: Map<string, BlockTypeDef>, components: Map<string, string>): string {
  return node.label || (node.type === 'pattern' ? components.get(String(node.props?.ref ?? '')) : undefined) || types.get(node.type)?.title || node.type
}

/** A property of the design vocabulary: its CSS name, inspector group, kind, and the names it takes. */
export interface VocabProperty {
  css: string
  group: string
  kind: string
  tokens: string[]
  keywords?: string[]
  parts?: [number, number]
  negative?: boolean
}

export interface Vocabulary {
  properties: Record<string, VocabProperty>
  conditions: { breakpoints: Record<string, number>; containers: Record<string, number>; states: string[] }
  roles: { surface: Record<string, string>; palette: Record<string, string>; space: Record<string, string> }
  collections: { palettes: string[]; families: string[]; textStyles: string[] }
  descriptions: { families: Record<string, string>; textStyles: Record<string, string>; schemes: Record<string, string> }
  scales: Record<string, any>
}

type Fluid = { min: number; max: number; css: string }

/** A theme worked out (Lettern Design): what every name is on this site, for previews. */
export interface Resolved {
  name: string
  palettes: Record<string, { seed: string; shades: Record<string, string>; fill: string; on: string }>
  modes: { light: { background: string; foreground: string }; dark: { background: string; foreground: string } | null }
  schemes: Record<string, { background: string; foreground: string; text: Record<string, string>; mix: { muted: number; subtle: number; strong: number }; dark: boolean; self?: string }>
  families: Record<string, string>
  fontRoles: { body: string; heading: string; code: string }
  sizes: Record<string, Fluid & { leading: number; tracking: number }>
  space: Record<string, Fluid>
  spaceRoles: Record<string, string>
  textStyles: Record<string, { font: string; size: string; weight: string; leading: string; tracking: string; case: string; style: string }>
  weights: Record<string, number>
  radii: Record<string, string>
  durations: Record<string, number>
  containers: Record<string, string>
}

export interface DesignInfo {
  theme: Record<string, any>
  resolved: Resolved
  catalog: Vocabulary
  design: string
  findings: { level: 'error' | 'warning'; scheme: string; pair: string; ratio: number; needs: number }[]
  templates: Record<string, string>
  fontFiles: string[]
  stylesheet: string
  js: string
}

/** The site's design: its theme, what it resolves to and the vocabulary styles may use (empty while Site is off). */
export function useDesign() {
  const q = useAbility<DesignInfo>('design/get', {}, { staleTime: 60_000, retry: false })
  return useMemo(() => {
    const d = q.data
    return {
      available: !!d,
      theme: d?.theme,
      resolved: d?.resolved,
      catalog: d?.catalog,
      templates: d?.templates ?? {},
      /** The names a property takes: its keywords, then its tokens. */
      names: (property: string): string[] => {
        const p = d?.catalog.properties[property]
        return p ? [...(p.keywords ?? []), ...p.tokens.filter((t) => !(p.keywords ?? []).includes(t))] : []
      },
      property: (property: string): VocabProperty | undefined => d?.catalog.properties[property],
    }
  }, [q.data])
}

export type Design = ReturnType<typeof useDesign>
