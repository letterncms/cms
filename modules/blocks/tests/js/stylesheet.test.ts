import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Stylesheet } from '../../tailwind/stylesheet.ts'

const css = `@import "tailwindcss";
@import "cms";

/* The theme. */
@theme {
  --color-primary: light-dark(#111, #eee);
  --color-accent: #e4572e; /* warm */
  --font-display: "Instrument Serif", serif;
}

@layer base {
  h1 {
    @apply font-display text-5xl;
  }
  a:hover {
    @apply underline;
    text-decoration-thickness: 2px;
  }
}

@utility btn-primary {
  @apply bg-primary text-white hover:opacity-90;
}

@utility quiet-link {
  text-decoration-line: none;
}

.tide { --scheme: var(--color-primary); }
`

test('the theme, the classes and the elements are read from the CSS', () => {
  const sheet = new Stylesheet(css)
  assert.deepEqual(sheet.variables(), [
    { name: '--color-primary', value: 'light-dark(#111, #eee)' },
    { name: '--color-accent', value: '#e4572e' },
    { name: '--font-display', value: '"Instrument Serif", serif' },
  ])
  assert.deepEqual(sheet.utilities(), [
    { name: 'btn-primary', classes: ['bg-primary', 'text-white', 'hover:opacity-90'], custom: false },
    { name: 'quiet-link', classes: [], custom: true },
  ])
  assert.deepEqual(sheet.elements(), [
    { name: 'h1', classes: ['font-display', 'text-5xl'], custom: false },
    { name: 'a:hover', classes: ['underline'], custom: true },
  ])
})

test('a variable changes where it stands and a new one joins its kind', () => {
  const sheet = new Stylesheet(css)
  assert.ok(sheet.setVariable('--color-accent', '#ff0000').css.includes('  --color-accent: #ff0000; /* warm */\n'))
  assert.ok(sheet.setVariable('--color-muted', '#666').css.includes('  --color-accent: #e4572e; /* warm */\n  --color-muted: #666;\n  --font-display'))
  assert.ok(sheet.setVariable('--radius-card', '1rem').css.includes('  --font-display: "Instrument Serif", serif;\n  --radius-card: 1rem;\n}\n'))
  assert.equal(sheet.setVariable('--font-display', null).css, css.replace('  --font-display: "Instrument Serif", serif;\n', ''))
  assert.equal(new Stylesheet('@import "tailwindcss";\n').setVariable('--color-x', 'red').css, '@import "tailwindcss";\n\n@theme {\n  --color-x: red;\n}\n')
  assert.equal(sheet.setVariable('--color-primary', '#000').variable('--color-primary'), '#000')
})

test('a class is changed, added, renamed and removed without touching the rest', () => {
  const sheet = new Stylesheet(css)
  assert.equal(sheet.setUtility('btn-primary', ['bg-accent']).css, css.replace('@apply bg-primary text-white hover:opacity-90;', '@apply bg-accent;'))
  assert.ok(sheet.setUtility('quiet-link', ['no-underline']).css.includes('@utility quiet-link {\n  @apply no-underline;\n  text-decoration-line: none;\n}'))
  assert.ok(sheet.setUtility('card', ['rounded-lg', 'p-6']).css.endsWith('.tide { --scheme: var(--color-primary); }\n\n@utility card {\n  @apply rounded-lg p-6;\n}\n'))
  assert.equal(sheet.removeUtility('btn-primary').css, css.replace('@utility btn-primary {\n  @apply bg-primary text-white hover:opacity-90;\n}\n\n', ''))
  assert.deepEqual(sheet.renameUtility('btn-primary', 'btn').utilities().map((u) => u.name), ['btn', 'quiet-link'])
})

test('an element is changed, added and removed in the base layer', () => {
  const sheet = new Stylesheet(css)
  assert.ok(sheet.setElement('h1', ['text-6xl']).css.includes('  h1 {\n    @apply text-6xl;\n  }'))
  assert.ok(sheet.setElement('h2', ['text-3xl']).css.includes('    text-decoration-thickness: 2px;\n  }\n  h2 {\n    @apply text-3xl;\n  }\n}\n'))
  assert.deepEqual(sheet.setElement('h1', []).elements().map((e) => e.name), ['a:hover'])
  assert.deepEqual(sheet.setElement('a:hover', []).elements()[1], { name: 'a:hover', classes: [], custom: true })
  assert.equal(new Stylesheet('@import "tailwindcss";\n').setElement('body', ['bg-white']).css, '@import "tailwindcss";\n\n@layer base {\n  body {\n    @apply bg-white;\n  }\n}\n')
})

test('a variable is renamed with what belongs to it and what reads it', () => {
  const sheet = new Stylesheet('@theme {\n  --text-lead: 1.25rem;\n  --text-lead--line-height: 1.4;\n  --text-leading: 2rem;\n}\n.a { font-size: var(--text-lead); line-height: var(--text-lead--line-height, 1); width: var(--text-leading); }\n')
  assert.equal(sheet.renameVariable('--text-lead', '--text-intro').css, '@theme {\n  --text-intro: 1.25rem;\n  --text-intro--line-height: 1.4;\n  --text-leading: 2rem;\n}\n.a { font-size: var(--text-intro); line-height: var(--text-intro--line-height, 1); width: var(--text-leading); }\n')
  assert.equal(new Stylesheet(css).renameVariable('--color-primary', '--color-ink').css, css.replace('--color-primary: light', '--color-ink: light').replace('var(--color-primary)', 'var(--color-ink)'))
  assert.equal(sheet.renameVariable('--text-none', '--text-x').css, sheet.css)
})

test('a new variable can stand before the others of its kind', () => {
  const sheet = new Stylesheet(css)
  assert.ok(sheet.setVariable('--color-*', 'initial', 'first').css.includes('@theme {\n  --color-*: initial;\n  --color-primary: light-dark(#111, #eee);\n'))
  assert.equal(sheet.setVariable('--color-*', 'initial', 'first').variable('--color-*'), 'initial')
  assert.equal(sheet.setVariable('--color-*', 'initial', 'first').setVariable('--color-*', null).css, css)
  assert.ok(sheet.setVariable('--radius-*', 'initial', 'first').css.includes('serif;\n  --radius-*: initial;\n}'))
})

test('a class is duplicated whole, after the one it was made from', () => {
  const sheet = new Stylesheet(css)
  assert.ok(sheet.duplicateUtility('btn-primary', 'btn-copy').css.includes('@utility btn-primary {\n  @apply bg-primary text-white hover:opacity-90;\n}\n\n@utility btn-copy {\n  @apply bg-primary text-white hover:opacity-90;\n}\n\n@utility quiet-link'))
  assert.deepEqual(sheet.duplicateUtility('quiet-link', 'calm').utilities()[2], { name: 'calm', classes: [], custom: true })
  assert.equal(sheet.duplicateUtility('none', 'x').css, css)
})

test('a property of a base rule is read, set where it stands, added and taken out', () => {
  const sheet = new Stylesheet(css)
  assert.equal(sheet.property(':root', 'color-scheme'), undefined)
  assert.equal(sheet.property('a:hover', 'text-decoration-thickness'), '2px')
  const dark = sheet.setProperty(':root', 'color-scheme', 'light dark')
  assert.ok(dark.css.includes('@layer base {\n  :root {\n    color-scheme: light dark;\n  }\n  h1 {'))
  assert.equal(dark.property(':root', 'color-scheme'), 'light dark')
  assert.equal(dark.setProperty(':root', 'color-scheme', 'dark').property(':root', 'color-scheme'), 'dark')
  assert.equal(dark.setProperty(':root', 'color-scheme', null).css, css)
  assert.ok(sheet.setProperty('a:hover', 'color', 'red').css.includes('    text-decoration-thickness: 2px;\n    color: red;\n  }'))
  assert.ok(sheet.setProperty('a:hover', 'text-decoration-thickness', null).css.includes('  a:hover {\n    @apply underline;\n  }'))
  assert.equal(new Stylesheet('@import "tailwindcss";\n').setProperty(':root', 'color-scheme', 'light dark').css, '@import "tailwindcss";\n\n@layer base {\n  :root {\n    color-scheme: light dark;\n  }\n}\n')
})
