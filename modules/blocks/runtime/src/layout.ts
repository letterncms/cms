// Which line each word is on, as the text is laid out now: words that share a top share a line. Every word is
// measured before anything is written, so asking costs one layout. The motion runtime (lines played by a script)
// and the lines chunk (lines CSS animates) both count this way.
export function lines(words: Element[]): number[] {
  const tops = words.map((word) => Math.round((word.parentElement ?? word).getBoundingClientRect().top))
  let line = -1
  let top = NaN
  return tops.map((at) => {
    if (!(Math.abs(at - top) < 2)) {
      line++
      top = at
    }
    return line
  })
}
