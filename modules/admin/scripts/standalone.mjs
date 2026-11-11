// The stylesheet of the pages outside the admin (the installer, an app asking to connect), from the
// admin's own tokens: tokens.css says the values, theme.css the type and radius scales, standalone.css
// the page. Nothing is copied by hand, so those pages change with the admin.
//   import { standaloneCss } from './scripts/standalone.mjs'; standaloneCss('src/styles')
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const plain = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** What stands between the braces of the first rule that starts with `head`. */
function body(css, head) {
  const start = css.indexOf(head)
  if (start < 0) throw new Error(`No rule ${head}`)
  const open = css.indexOf('{', start)
  let depth = 1, i = open + 1
  for (; depth > 0; i++) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0
  return css.slice(open + 1, i - 1).trim()
}

const tight = (css) => css.replace(/\s*\n\s*/g, '').replace(/\s*([{};,])\s*/g, '$1').replace(/:\s+/g, ':').trim()

/** `%font%` stands where the typeface's address goes: whoever serves the page knows it. */
export function standaloneCss(styles) {
  const tokens = plain(readFileSync(join(styles, 'tokens.css'), 'utf8'))
  const theme = plain(readFileSync(join(styles, 'theme.css'), 'utf8'))
  const page = plain(readFileSync(join(styles, 'standalone.css'), 'utf8'))
  // The scales a page is set in: typeface, sizes and radii.
  const scale = body(theme, '@theme inline').split(';').map((line) => line.trim()).filter((line) => /^--(font|text|radius)-/.test(line)).join(';')
  const always = body(tokens, ':root {')
  const light = body(tokens, ':root, [data-theme="light"]')
  const dark = body(tokens, '[data-theme="dark"]')
  return [
    '@font-face{font-family:"Instrument Sans";src:url("%font%") format("woff2");font-weight:400 700;font-style:normal;font-display:swap}',
    tight(`:root{${always};${scale};${light}}`),
    tight(`@media (prefers-color-scheme:dark){:root{${dark}}}`),
    tight(page),
  ].join('\n').replace(/;;+/g, ';') + '\n'
}

/**
 * The few icons those pages show, as the admin draws them (src/lib/icon-data.ts): `{ name: '<svg …>' }`,
 * 16px, in the colour of the words around them.
 */
export function standaloneIcons(lib, names = ['eye', 'eye-off']) {
  const data = readFileSync(join(lib, 'icon-data.ts'), 'utf8')
  const icons = JSON.parse(data.slice(data.indexOf('= {') + 2, data.lastIndexOf('}') + 1))
  return Object.fromEntries(names.map((name) => {
    const [body, width, height] = icons[name] ?? (() => { throw new Error(`No icon ${name}`) })()
    return [name, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">${body}</svg>`]
  }))
}
