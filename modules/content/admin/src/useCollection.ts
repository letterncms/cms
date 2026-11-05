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
  schema: Record<string, unknown>
}

export function useCollection(handle: string) {
  const manifest = useManifest()
  const summary = manifest.collections.find((c) => c.handle === handle)
  const query = useAbility<CollectionDef>('collections/get', { handle }, { staleTime: 60_000 })
  return { summary, collection: query.data, isLoading: query.isLoading, error: query.error }
}
