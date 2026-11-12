// The stylesheet of the pages outside the admin is made of the admin's own tokens, and of nothing else.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { standaloneCss, standaloneIcons } from '../scripts/standalone.mjs'

const styles = fileURLToPath(new URL('../src/styles', import.meta.url))
const css = standaloneCss(styles)
const page = readFileSync(`${styles}/standalone.css`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

test('the page styles name tokens, never a colour of their own', () => {
  assert.equal(page.match(/#[0-9a-f]{3,8}\b/i), null)
  assert.equal(page.match(/\brgb\(/), null)
})

test('every token the page uses is defined, in light and in dark', () => {
  const [, root, dark] = css.split('\n')
  assert.match(dark, /^@media \(prefers-color-scheme:dark\)\{:root\{/)
  for (const name of new Set(page.match(/var\((--[\w-]+)/g).map((use) => use.slice(4)))) {
    assert.ok(root.includes(`${name}:`), `${name} is not defined`)
  }
  // What makes a page dark: the layers, the ink and the text on them. (Yellow is yellow in both.)
  for (const name of ['--cms-sunken', '--cms-bg', '--cms-ink', '--cms-ink-contrast', '--cms-text', '--cms-muted', '--cms-border', '--cms-border-strong', '--cms-focus', '--cms-danger']) assert.ok(dark.includes(`${name}:`), `${name} has no dark value`)
})

test('the values are the admin\u2019s: tokens.css and theme.css, as they are', () => {
  const tokens = readFileSync(`${styles}/tokens.css`, 'utf8')
  const ink = tokens.match(/--cms-ink: (#\w+);/)[1]
  assert.ok(css.includes(`--cms-ink:${ink}`))
  assert.ok(css.includes('--font-sans:"Instrument Sans"'))
  assert.ok(!css.includes('data-theme'))
  assert.ok(css.includes('url("%font%")'))
})

test('the pages get the admin\u2019s own icons, as markup', () => {
  const icons = standaloneIcons(fileURLToPath(new URL('../src/lib', import.meta.url)))
  assert.deepEqual(Object.keys(icons), ['eye', 'eye-off', 'check'])
  for (const svg of Object.values(icons)) assert.match(svg, /^<svg [^>]*fill="currentColor"[^>]*><path /)
  assert.throws(() => standaloneIcons(fileURLToPath(new URL('../src/lib', import.meta.url)), ['no-such-icon']))
})
