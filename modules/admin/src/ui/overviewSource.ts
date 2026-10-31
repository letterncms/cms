import { abilityKey, queryClient, run, type Page } from '@letterncms/sdk'
import { useQueries, useQuery } from '@tanstack/react-query'

/** Only source data varies by screen; loading every page belongs to the shared view. */
export interface OverviewSource {
  ability: string
  input?: Record<string, unknown>
  perPage?: number
}

const inputFor = (source: OverviewSource, page: number) => ({ ...source.input, page, perPage: source.perPage ?? 100 })

let active = 0
const waiting: (() => void)[] = []

/** Large calendars share a small request pool; leaving the view cancels queued reads. */
async function readPage<T>(ability: string, input: Record<string, unknown>, signal: AbortSignal): Promise<Page<T>> {
  if (active < 4) active++
  else await new Promise<void>((resolve) => waiting.push(resolve))
  try {
    signal.throwIfAborted()
    return await run<Page<T>>(ability, input)
  } finally {
    const next = waiting.shift()
    if (next) next()
    else active--
  }
}

/** Preload the same first page used by the calendar, without duplicating query keys. */
export function loadOverviewSource<T>(source: OverviewSource): Promise<Page<T>> {
  const input = inputFor(source, 1)
  return queryClient.ensureQueryData({ queryKey: abilityKey(source.ability, input), queryFn: ({ signal }) => readPage<T>(source.ability, input, signal) })
}

export function useOverviewSource<T>(source: OverviewSource | undefined, enabled: boolean) {
  const firstInput = source ? inputFor(source, 1) : {}
  const first = useQuery({
    queryKey: abilityKey(source?.ability ?? 'overview/none', firstInput),
    queryFn: ({ signal }) => readPage<T>(source!.ability, firstInput, signal), enabled: enabled && !!source,
  })
  const pages = first.data?.pages ?? Math.ceil((first.data?.total ?? 0) / (source?.perPage ?? 100))
  const rest = useQueries({ queries: Array.from({ length: enabled && source ? Math.max(0, pages - 1) : 0 }, (_, index) => {
    const input = inputFor(source!, index + 2)
    return { queryKey: abilityKey(source!.ability, input), queryFn: ({ signal }: { signal: AbortSignal }) => readPage<T>(source!.ability, input, signal) }
  }) })
  return {
    items: [...(first.data?.items ?? []), ...rest.flatMap((page) => page.data?.items ?? [])],
    loading: !!source && (first.isPending || rest.some((page) => page.isPending)),
    stale: first.isFetching || rest.some((page) => page.isFetching),
    error: first.isError || rest.some((page) => page.isError),
    retry: () => { void first.refetch(); rest.forEach((page) => void page.refetch()) },
  }
}
