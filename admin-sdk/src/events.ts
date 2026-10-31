type Handler<T = any> = (payload: T) => void
const handlers = new Map<string, Set<Handler>>()

/** Tiny event bus for loose coupling between the theme and plugin modules. */
export const events = {
  on<T = any>(name: string, handler: Handler<T>): () => void {
    if (!handlers.has(name)) handlers.set(name, new Set())
    handlers.get(name)!.add(handler)
    return () => handlers.get(name)?.delete(handler)
  },
  emit<T = any>(name: string, payload?: T) {
    handlers.get(name)?.forEach((h) => h(payload))
  },
}
