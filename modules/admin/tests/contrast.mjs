// node --test modules/admin/tests/contrast.mjs
// A badge's words on its own wash read at 4.5:1 or more (WCAG AA), in light and in dark, wherever a badge
// stands: on the page, on the desk and on a float. Measured from tokens.css, so a token that drifts fails here.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const block = (head) => { const at = css.indexOf(head); return Object.fromEntries([...css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).matchAll(/(--cms-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])) }
const light = block(':root, [data-theme="light"]')
const themes = { light, dark: { ...light, ...block('[data-theme="dark"]') } }

/** A token's colour as [r, g, b, a]: a hex, `rgb(r g b / a)`, `var(--…)` or `color-mix(in srgb, A p%, B)`. */
function colour(value, tokens) {
  value = value.trim()
  const ref = value.match(/^var\((--[\w-]+)\)$/)
  if (ref) return colour(tokens[ref[1]], tokens)
  const hex = value.match(/^#([0-9a-f]{6})$/i)
  if (hex) return [...[0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)), 1]
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/)
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])]
  const mix = value.match(/^color-mix\(in srgb, (.+?)(?: ([\d.]+)%)?, (.+?)(?: ([\d.]+)%)?\)$/)
  if (mix) {
    const share = mix[2] !== undefined ? Number(mix[2]) / 100 : 1 - Number(mix[4]) / 100
    const a = colour(mix[1], tokens), b = colour(mix[3], tokens)
    return [0, 1, 2].map((i) => a[i] * share + b[i] * (1 - share)).concat(1)
  }
  throw new Error(`Not a colour this test reads: ${value}`)
}
const over = (top, under) => [0, 1, 2].map((i) => under[i] + top[3] * (top[i] - under[i])).concat(1)
const luminance = (c) => [0.2126, 0.7152, 0.0722].reduce((sum, weight, i) => { const v = c[i] / 255; return sum + weight * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) }, 0)
const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05) }

// As Badge.tsx pairs them: the words, then the wash they stand on.
const badges = { neutral: ['--cms-muted', '--cms-active'], success: ['--cms-on-success', '--cms-success-soft'], warning: ['--cms-on-warning', '--cms-warning-soft'], danger: ['--cms-on-danger', '--cms-danger-soft'], info: ['--cms-info', '--cms-focus-soft'] }

for (const [theme, tokens] of Object.entries(themes)) {
  for (const [tone, [words, wash]] of Object.entries(badges)) {
    test(`${theme}: a ${tone} badge reads at AA on the page, the desk and a float`, () => {
      for (const layer of ['--cms-bg', '--cms-surface', '--cms-float']) {
        const ground = over(colour(tokens[wash], tokens), colour(tokens[layer], tokens))
        const measured = ratio(over(colour(tokens[words], tokens), ground), ground)
        assert.ok(measured >= 4.5, `${tone} on ${layer} in ${theme} is ${measured.toFixed(2)}:1`)
      }
    })
  }
}

test('the dark info badge, as measured: 6.9:1 on the page, 7.5:1 on the desk, 6.3:1 on a float', () => {
  const tokens = themes.dark
  const at = (layer) => { const ground = over(colour(tokens['--cms-focus-soft'], tokens), colour(tokens[layer], tokens)); return Number(ratio(colour(tokens['--cms-info'], tokens), ground).toFixed(1)) }
  assert.deepEqual([at('--cms-bg'), at('--cms-surface'), at('--cms-float')], [6.9, 7.5, 6.3])
})
