// Lines that CSS animates (load, scroll and loop triggers): the words of a block share a turn (--i) with the
// others on their line, counted once the text is laid out, again once the fonts are in, and again when its width
// changes. Until then the words wait, but never for long: a rule plays them after a moment if this never comes,
// and without a script they go word by word.
import { lines } from './layout'

const watched = new WeakSet<Element>()
let resizes: ResizeObserver | null = null

/** Every block measured first, then every word written: one layout, however many blocks. */
function lay(blocks: HTMLElement[]): void {
  const counted = blocks.map((block) => {
    const words = [...block.querySelectorAll<HTMLElement>('.cms-w__i')]
    return { block, words, turns: lines(words) }
  })
  for (const { block, words, turns } of counted) {
    // A word keeps its turn while its line stays the same: a loop goes on where it was.
    words.forEach((word, i) => word.style.getPropertyValue('--i') !== String(turns[i]) && word.style.setProperty('--i', String(turns[i])))
    const count = String((turns.length ? turns[turns.length - 1] : -1) + 1)
    if (block.dataset.cmsLines !== count) block.dataset.cmsLines = count
  }
}

export function start(): void {
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-cms-lines]')]
  if (!blocks.length) return
  resizes ??= new ResizeObserver((entries) => lay(entries.map((entry) => entry.target as HTMLElement)))
  lay(blocks)
  for (const block of blocks) {
    if (!watched.has(block)) {
      watched.add(block)
      resizes.observe(block)
    }
  }
  // A web font arriving moves the words: counted again once they are in.
  void document.fonts?.ready.then(() => lay(blocks.filter((block) => block.isConnected)))
}
