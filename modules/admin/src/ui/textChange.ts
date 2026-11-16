/**
 * The one change from what is there to what comes: only what differs between their common start and end. A text
 * replaced from outside (Discard, a format) then keeps the cursor and the scroll where they were.
 */
export function difference(current: string, next: string): { from: number; to: number; insert: string } | null {
  if (current === next) return null
  let start = 0
  const shortest = Math.min(current.length, next.length)
  while (start < shortest && current.charCodeAt(start) === next.charCodeAt(start)) start++
  let end = 0
  while (end < shortest - start && current.charCodeAt(current.length - 1 - end) === next.charCodeAt(next.length - 1 - end)) end++
  return { from: start, to: current.length - end, insert: next.slice(start, next.length - end) }
}
