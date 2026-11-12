import { useAbility, useManifest, type FieldDef } from '@letterncms/sdk'

export interface CollectionDef {
  handle: string
  title: string
  singular: string
  icon: string
  description?: string
  driver: 'database' | 'files'
  structure: 'list' | 'tree' | 'dated'
  default_view?: 'table' | 'grid' | 'calendar'
  default_columns?: string[] | null
  route?: string
  template?: string
  sort: string
  body?: string
  group?: 'content' | 'design'
  home?: string
  fields: FieldDef[]
  resolvedFields: FieldDef[]
  /** The other blueprints of a collection that has several, each with its fields. */
  resolvedBlueprints?: { handle: string; title: string; resolvedFields: FieldDef[] }[]
  /** Set by withBlueprint: the blueprint whose fields are in resolvedFields. */
  blueprint?: string
  schema: Record<string, unknown>
}

/** A collection with the fields of one of its blueprints in place of its own: what an entry made with it is edited by. */
export function withBlueprint(collection: CollectionDef, blueprint: string | null | undefined): CollectionDef {
  const named = blueprint ? collection.resolvedBlueprints?.find((b) => b.handle === blueprint) : undefined
  return named ? { ...collection, resolvedFields: named.resolvedFields, blueprint: named.handle } : collection
}

export function useCollection(handle: string) {
  const manifest = useManifest()
  const summary = manifest.collections.find((c) => c.handle === handle)
  const query = useAbility<CollectionDef>('collections/get', { handle }, { staleTime: 60_000 })
  return { summary, collection: query.data, isLoading: query.isLoading, error: query.error }
}
