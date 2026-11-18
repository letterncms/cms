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

test('the site’s own CSS is what no section of the design shows, and it is replaced as a whole', () => {
  const sheet = new Stylesheet(`@import "tailwindcss";
@import "cms";

@theme {
  --color-primary: #111;
  --color-*: initial;
  --text-lg--line-height: 1.4;
  --my-gap: 3px;
  @keyframes wiggle {
    50% { rotate: 3deg; }
  }
}

@layer base {
  h1 {
    @apply text-5xl;
  }
  /* A rule of the site's own. */
  li::marker {
    @apply text-muted;
  }
}

@utility card {
  @apply p-6;
}

@utility tab-* {
  tab-size: --value(integer);
}

@custom-variant scrolled (&[data-scrolled]);

.tide { color: red; }
`)
  assert.equal(sheet.extra(), `@theme {
  --text-lg--line-height: 1.4;
  --my-gap: 3px;
  @keyframes wiggle {
    50% { rotate: 3deg; }
  }
}

@layer base {
  /* A rule of the site's own. */
  li::marker {
    @apply text-muted;
  }
}

@utility tab-* {
  tab-size: --value(integer);
}

@custom-variant scrolled (&[data-scrolled]);

.tide { color: red; }`)

  const next = sheet.setExtra('.tide { color: blue; }')
  assert.equal(next.css, `@import "tailwindcss";
@import "cms";

@theme {
  --color-primary: #111;
  --color-*: initial;
}

@layer base {
  h1 {
    @apply text-5xl;
  }
}

@utility card {
  @apply p-6;
}

.tide { color: blue; }
`)
  assert.equal(next.extra(), '.tide { color: blue; }')
  // What is written back is read back the same, again and again.
  assert.equal(new Stylesheet(sheet.setExtra(sheet.extra()).css).extra(), sheet.extra())
  assert.equal(sheet.setExtra(sheet.extra()).setExtra(sheet.extra()).css, sheet.setExtra(sheet.extra()).css)
  // Nothing of its own: the stylesheet ends where the shown parts end.
  assert.equal(next.setExtra('').extra(), '')
})

test('built-in theme values are read from any @theme block', async () => {
  const { themeDefaults, balanced } = await import('../../tailwind/stylesheet.ts')
  assert.deepEqual(themeDefaults('@theme default { --color-red-500: oklch(63.7% 0.237 25.331); --text-xs: 0.75rem; --text-xs--line-height: calc(1 / 0.75); }'), [
    { name: '--color-red-500', value: 'oklch(63.7% 0.237 25.331)' },
    { name: '--text-xs', value: '0.75rem' },
    { name: '--text-xs--line-height', value: 'calc(1 / 0.75)' },
  ])
  assert.equal(balanced('.a { color: red; }'), true)
  assert.equal(balanced('.a { color: red;'), false)
  assert.equal(balanced('.a { content: "}"; }'), true)
  assert.equal(balanced('/* { */ .a {}'), true)
})

test('what stays of the site’s own CSS stays where it stands, and a cleared namespace opens the theme', () => {
  const sheet = new Stylesheet(`@import "tailwindcss";

@theme {
  --text-*: initial;
  --text-base: 1rem;
}

.a { color: red; }

@utility card {
  @apply p-6;
}
`)
  // Clearing a kind is what the sections follow, not CSS of the site's own.
  assert.equal(sheet.extra(), '.a { color: red; }')
  // One rule more: the clearing stays before the sizes it clears, and the rule before stays where it was.
  const more = sheet.setExtra(`${sheet.extra()}\n\n.b { color: blue; }`)
  assert.equal(more.css, `@import "tailwindcss";

@theme {
  --text-*: initial;
  --text-base: 1rem;
}

.a { color: red; }

@utility card {
  @apply p-6;
}

.b { color: blue; }
`)
  // Written as the site's own, a clearing goes to the start of the theme, where it clears what follows.
  const cleared = new Stylesheet('@import "tailwindcss";\n\n@theme {\n  --text-base: 1rem;\n}\n').setExtra('@theme {\n  --text-*: initial;\n}')
  assert.match(cleared.css, /@theme \{\n {2}--text-\*: initial;\n {2}--text-base: 1rem;\n\}/)
})

test('a class is written whole, with what it declares and what it applies', async () => {
  const sheet = new Stylesheet('@import "tailwindcss";\n\n@utility scheme-tide {\n  --scheme: var(--color-tide);\n  @apply scheme;\n}\n')
  assert.deepEqual(sheet.utilityProperties('scheme-tide'), [{ name: '--scheme', value: 'var(--color-tide)' }])
  const next = sheet.writeUtility('scheme-tide', [{ name: '--scheme', value: 'var(--color-clay)' }, { name: '--scheme-text', value: '#fff' }], ['scheme'])
  assert.equal(next.css, '@import "tailwindcss";\n\n@utility scheme-tide {\n  --scheme: var(--color-clay);\n  --scheme-text: #fff;\n  @apply scheme;\n}\n')
  assert.match(next.writeUtility('scheme-sun', [{ name: '--scheme', value: 'gold' }], ['scheme']).css, /@utility scheme-sun \{\n {2}--scheme: gold;\n {2}@apply scheme;\n\}\n$/)
  // What else the class holds stays where it stands: here what comes after the scheme it applies.
  const own = new Stylesheet('@utility scheme-photo {\n  --scheme: transparent;\n  @apply scheme;\n  --color-primary-foreground: #111;\n}\n')
  assert.equal(own.writeUtility('scheme-photo', [{ name: '--scheme', value: 'black' }], ['scheme']).css, '@utility scheme-photo {\n  --scheme: black;\n  @apply scheme;\n  --color-primary-foreground: #111;\n}\n')
})

test('long-form text is styled in the components layer, and the rest of that layer stays the site’s own CSS', () => {
  const sheet = new Stylesheet('@import "tailwindcss";\n\n@layer components {\n  .cms-prose {\n    --prose-blocks: 1.25em;\n  }\n  .cms-prose h2:where(:not(.cms-box, .cms-repeat)) {\n    @apply text-4xl;\n  }\n  .on-photo {\n    @apply text-white;\n  }\n}\n')
  assert.equal(sheet.property('.cms-prose', '--prose-blocks', 'components'), '1.25em')
  assert.deepEqual(sheet.elements('components').map((rule) => rule.name), ['.cms-prose', '.cms-prose h2:where(:not(.cms-box, .cms-repeat))', '.on-photo'])
  assert.equal(sheet.extra(), '@layer components {\n  .on-photo {\n    @apply text-white;\n  }\n}')
  const next = sheet.setElement('.cms-prose p:where(:not(.cms-box, .cms-repeat))', ['text-lg'], 'components').setExtra('')
  assert.match(next.css, /\.cms-prose p:where\(:not\(\.cms-box, \.cms-repeat\)\) \{\n {4}@apply text-lg;\n {2}\}/)
  assert.doesNotMatch(next.css, /on-photo/)
  assert.equal(next.property('.cms-prose', '--prose-blocks', 'components'), '1.25em')
})

test('a class is put in a group by the comment right before it, which goes and moves with it', () => {
  let sheet = new Stylesheet('@utility card {\n  @apply p-6;\n}\n\n/* A note. */\n@utility lede {\n  @apply text-xl;\n}\n')
  assert.equal(sheet.utilities()[0].group, undefined)
  sheet = sheet.setUtilityGroup('card', 'Cards')
  assert.equal(sheet.css, '/* group: Cards */\n@utility card {\n  @apply p-6;\n}\n\n/* A note. */\n@utility lede {\n  @apply text-xl;\n}\n')
  assert.equal(sheet.utilities()[0].group, 'Cards')
  // A comment of the site's own is no group, and stays where it is.
  assert.equal(sheet.utilities()[1].group, undefined)
  sheet = sheet.setUtilityGroup('lede', 'Text')
  assert.match(sheet.css, /\/\* A note\. \*\/\n\/\* group: Text \*\/\n@utility lede/)
  // Another group rewrites the comment; none takes it away.
  assert.equal(sheet.setUtilityGroup('card', 'Boxes').utilities()[0].group, 'Boxes')
  assert.equal(sheet.setUtilityGroup('card', null).css.startsWith('@utility card {'), true)
  // A duplicate is in the same group; a group renamed renames it for each of its classes.
  const twice = sheet.duplicateUtility('card', 'card-large')
  assert.deepEqual(twice.utilities().map((rule) => [rule.name, rule.group]), [['card', 'Cards'], ['card-large', 'Cards'], ['lede', 'Text']])
  assert.deepEqual(twice.renameGroup('Cards', 'Panels').utilities().map((rule) => rule.group), ['Panels', 'Panels', 'Text'])
  // Deleted, its comment goes with it: it never falls to the class after it.
  const gone = sheet.removeUtility('card')
  assert.doesNotMatch(gone.css, /Cards/)
  assert.equal(gone.utilities()[0].group, 'Text')
})

test('a group can stand with no class in it, on a line of its own, until a class joins it or it is deleted', () => {
  let sheet = new Stylesheet('/* group: Cards */\n@utility card {\n  @apply p-6;\n}\n')
  sheet = sheet.addGroup('Heroes')
  assert.equal(sheet.css, '/* group: Cards */\n@utility card {\n  @apply p-6;\n}\n\n/* group: Heroes */\n')
  assert.deepEqual(sheet.groups(), ['Cards', 'Heroes'])
  // A group the stylesheet names already is not added twice.
  assert.equal(sheet.addGroup('Cards').css, sheet.css)
  // A class added after it is in no group: the blank line sets the group's comment apart.
  sheet = sheet.setUtility('lede', ['text-xl'])
  assert.deepEqual(sheet.utilities().map((rule) => [rule.name, rule.group]), [['card', 'Cards'], ['lede', undefined]])
  sheet = sheet.setUtilityGroup('lede', 'Heroes')
  assert.equal(sheet.utilities()[1].group, 'Heroes')
  // Renamed, its comment and its classes follow; deleted, its comment goes and its classes stay, in none.
  const renamed = sheet.renameGroup('Heroes', 'Banners')
  assert.deepEqual(renamed.groups(), ['Cards', 'Banners'])
  assert.equal(renamed.utilities()[1].group, 'Banners')
  const deleted = sheet.renameGroup('Heroes', null)
  assert.deepEqual(deleted.groups(), ['Cards'])
  assert.equal(deleted.utilities()[1].group, undefined)
  assert.equal(new Stylesheet('@utility a {\n  @apply p-1;\n}\n').addGroup('Empty').renameGroup('Empty', null).css, '@utility a {\n  @apply p-1;\n}\n')
  // Into a group there is already, it joins it, with no second comment of its own.
  assert.deepEqual(sheet.addGroup('Spare').renameGroup('Spare', 'Cards').groups(), ['Cards', 'Heroes'])
  assert.equal(sheet.addGroup('Spare').renameGroup('Spare', 'Cards').css.match(/group: Cards/g)?.length, 1)
})

test('a form is styled part by part in the components layer; the --field-* properties of :root are the site’s own CSS', () => {
  const sheet = new Stylesheet('@import "tailwindcss";\n\n@layer base {\n  :root, [data-theme] {\n    --field-radius: 0;\n  }\n  ul {\n    @apply list-disc;\n  }\n}\n\n@layer components {\n  .cms-input {\n    @apply rounded-lg aria-invalid:border-danger;\n  }\n  select.cms-input {\n    --field-select-arrow-color: red;\n  }\n  .cms-field {\n    @apply label-inside;\n  }\n}\n')
  // The parts of a form and an element the site added are the design’s; what the kernel's properties once were is CSS of the site's own.
  assert.equal(sheet.extra(), '@layer base {\n  :root, [data-theme] {\n    --field-radius: 0;\n  }\n}')
  assert.deepEqual(sheet.elements('components').map((rule) => [rule.name, rule.classes]), [['.cms-input', ['rounded-lg', 'aria-invalid:border-danger']], ['select.cms-input', []], ['.cms-field', ['label-inside']]])
  assert.equal(sheet.property('select.cms-input', '--field-select-arrow-color', 'components'), 'red')
  // A value no class reaches lives beside the part's classes: setting one keeps them, and its rule.
  const next = sheet.setProperty('.cms-input', '--field-select-arrow-size', '0.5rem', 'components').setElement('select.cms-input', ['bg-white'], 'components')
  assert.deepEqual(next.elements('components').find((rule) => rule.name === '.cms-input')?.classes, ['rounded-lg', 'aria-invalid:border-danger'])
  assert.equal(next.property('select.cms-input', '--field-select-arrow-color', 'components'), 'red')
  assert.deepEqual(next.elements('components').find((rule) => rule.name === 'select.cms-input')?.classes, ['bg-white'])
})
