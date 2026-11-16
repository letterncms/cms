/* Two texts compared line by line, as a code review compares them: what both keep, what only the first has, what
   only the second brings. TextDiff draws it. */

/** Past this many cells of the comparison table the middle is shown as replaced whole. */
const LIMIT = 4_000_000

export type Line = { kind: 'same' | 'del' | 'add'; text: string; a?: number; b?: number }

/** The lines of `now` and `then`, in order: kept, taken away (only in `now`), brought (only in `then`). */
export function diffLines(now: string, then: string): Line[] {
  const a = now.split('\n')
  const b = then.split('\n')
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length, endB = b.length
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB-- }
  const out: Line[] = []
  for (let i = 0; i < start; i++) out.push({ kind: 'same', text: a[i], a: i + 1, b: i + 1 })
  const midA = a.slice(start, endA), midB = b.slice(start, endB)
  const m = midA.length, n = midB.length
  if (m * n > LIMIT) {
    midA.forEach((text, i) => out.push({ kind: 'del', text, a: start + i + 1 }))
    midB.forEach((text, j) => out.push({ kind: 'add', text, b: start + j + 1 }))
  } else {
    // The longest run of lines both share, by a table of common lengths; what is not in it differs.
    const table = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1))
    for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) table[i][j] = midA[i] === midB[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    let i = 0, j = 0
    while (i < m || j < n) {
      if (i < m && j < n && midA[i] === midB[j]) { out.push({ kind: 'same', text: midA[i], a: start + i + 1, b: start + j + 1 }); i++; j++ }
      else if (j < n && (i >= m || table[i][j + 1] >= table[i + 1][j])) { out.push({ kind: 'add', text: midB[j], b: start + j + 1 }); j++ }
      else { out.push({ kind: 'del', text: midA[i], a: start + i + 1 }); i++ }
    }
  }
  for (let k = 0; k < a.length - endA; k++) out.push({ kind: 'same', text: a[endA + k], a: endA + k + 1, b: endB + k + 1 })
  return out
}

/** Whether two texts differ in more than where their lines end. */
export const textsDiffer = (now: string, then: string) => now.replace(/\s+$/, '') !== then.replace(/\s+$/, '')

