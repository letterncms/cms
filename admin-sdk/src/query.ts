import { QueryClient, useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { CmsError, run } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: (count, error) => !(error instanceof CmsError && [401, 403, 404, 422].includes(error.status)) && count < 2,
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
})

/** Query keys are [ability, input] so mutations can invalidate by ability prefix. */
export function abilityKey(ability: string, input?: Record<string, unknown>) {
  return input === undefined ? [ability] : [ability, input]
}

/** Prepare a screen's data using the same cache as useAbility; cached data opens immediately. */
export function prefetchAbility<T = any>(ability: string, input: Record<string, unknown> = {}): Promise<T> {
  return queryClient.ensureQueryData<T>({ queryKey: abilityKey(ability, input), queryFn: () => run<T>(ability, input) })
}

/** Read data through a (read-only) ability. */
export function useAbility<T = any>(
  ability: string,
  input: Record<string, unknown> = {},
  options: Omit<UseQueryOptions<T, CmsError>, 'queryKey' | 'queryFn'> = {},
) {
  return useQuery<T, CmsError>({ queryKey: abilityKey(ability, input), queryFn: () => run<T>(ability, input), ...options })
}

/**
 * Change data through an ability. `invalidates` lists ability prefixes whose
 * cached results become stale, e.g. ['entries/'].
 */
export function useAction<T = any, I extends Record<string, unknown> = Record<string, unknown>>(
  ability: string,
  options: { invalidates?: string[]; onSuccess?: (data: T, input: I) => void; onError?: (error: CmsError) => void } = {},
) {
  return useMutation<T, CmsError, I>({
    mutationFn: (input: I) => run<T>(ability, input),
    onSuccess: (data, input) => {
      invalidate(...(options.invalidates ?? []))
      options.onSuccess?.(data, input)
    },
    onError: options.onError,
  })
}

export function invalidate(...prefixes: string[]) {
  if (prefixes.length === 0) return
  void queryClient.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && prefixes.some((p) => (q.queryKey[0] as string).startsWith(p)),
  })
}
