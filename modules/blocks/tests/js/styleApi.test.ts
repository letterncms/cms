import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, registerHooks } from 'node:module'
import { test } from 'node:test'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { Engine } from '../../tailwind/engine.ts'

// The admin's sources import each other without an extension, as its bundler resolves them: here Node is told the same.
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (error) {
      if (!specifier.startsWith('.')) throw error
      return next(`${specifier}.ts`, context)
    }
  },
})
const { GRADIENT_MARKERS, broken, colorGroups, dataStates, lightDark, searchClasses, spacingChoices, gradientOf, gradientUtilities, inner, layerUsed, onLayer, partUtility, plain, splitSiteClasses, styleApi, usedVariants } = await import('../../admin/src/builder/styleApi.ts')

const index = readFileSync(createRequire(import.meta.url).resolve('tailwindcss/index.css'), 'utf8')
const css = `@import "tailwindcss";
@theme { --color-primary: #111616; --spacing-gutter: clamp(1rem, 4vw, 2rem); }
@utility btn-primary { @apply bg-primary px-4; }`
const engine = new Engine(await __unstable__loadDesignSystem(css, { base: '/', loadStylesheet: async (id: string, base: string) => ({ path: id, base, content: index }) }))
const sizes = ['sm', 'md', 'lg']

/** An api over a list that keeps what is written to it. */
function edit(classes: string[], breakpoint = '', state: string[] = []) {
  const box = { classes }
  const api = () => styleApi(engine, box.classes, sizes, breakpoint, state, (next: string[]) => { box.classes = next })
  return { box, api }
}

test('a control reads the nearest layer that sets a property', () => {
  const { api } = edit(['p-4', 'sm:p-6', 'hover:bg-primary/50', 'text-xl', 'leading-tight', 'w-1/2', '-translate-x-full'], 'md')
  assert.equal(api().value('padding'), '24px')
  assert.equal(api().status('padding'), 'inherited')
  assert.equal(api().status('margin'), 'none')
  assert.equal(api().value('width'), '50%')
  assert.equal(api().value('--tw-translate-x'), '-100%')
  assert.equal(api().value('fontSize'), 'var(--text-xl)')
  // text-xl only reads the line height leading-tight sets.
  assert.equal(api().value('lineHeight'), 'var(--leading-tight)')
  assert.equal(edit(['hover:bg-primary/50'], '', ['hover']).api().value('backgroundColor'), 'color-mix(in oklab, var(--color-primary) 50%, transparent)')
})

test('a control writes the class people would', () => {
  const { box, api } = edit(['flex', 'size-10'])
  api().write({ padding: '16px', color: 'var(--color-primary)', display: 'grid' })
  assert.deepEqual(new Set(box.classes), new Set(['grid', 'size-10', 'p-4', 'text-primary']))
  api().set('width', '100%')
  assert.deepEqual(new Set(box.classes), new Set(['grid', 'h-10', 'w-full', 'p-4', 'text-primary']))
  api().set('padding', null)
  assert.ok(!box.classes.includes('p-4'))
  const md = edit(['p-4'], 'md', ['hover'])
  md.api().set('padding', '13px')
  assert.deepEqual(md.box.classes, ['p-4', 'md:hover:p-[13px]'])
  assert.equal(md.api().status('padding'), 'own')
})

test('nothing is read or written without the stylesheet', () => {
  let written = false
  const api = styleApi(null, ['p-4'], [], '', [], () => { written = true })
  assert.equal(api.value('padding'), undefined)
  assert.equal(api.status('padding'), 'none')
  api.set('padding', '8px')
  api.swap('--tw-blur', 'blur-sm')
  api.put('p-0', 'p-2')
  assert.deepEqual(api.own(), [])
  assert.equal(written, false)
})

test('the parts of a composed property are utilities of their own', () => {
  const { box, api } = edit(['border', 'border-dashed', 'transition', 'duration-200', 'blur-sm', 'brightness-50'])
  assert.equal(api().value('borderWidth'), '1px')
  assert.equal(api().value('--tw-border-style'), 'dashed')
  api().swap('border-width', partUtility(engine, 'border', '2px', 'px'))
  assert.ok(box.classes.includes('border-2') && box.classes.includes('border-dashed') && !box.classes.includes('border'))
  api().swap('--tw-duration', partUtility(engine, 'duration', '0.3s', 'ms'))
  assert.ok(box.classes.includes('duration-300') && box.classes.includes('transition') && !box.classes.includes('duration-200'))
  assert.equal(inner(api().value('--tw-brightness')), '50%')
  api().swap('--tw-blur', null)
  assert.ok(!box.classes.includes('blur-sm') && box.classes.includes('brightness-50'))
  // A ring's shadow starts with a part of its own and is still what the ring is.
  assert.match(edit(['ring-2']).api().value('--tw-ring-shadow') ?? '', /calc\(2px \+/)
  assert.equal(edit(['text-shadow-sm']).api().value('textShadow')?.includes('--tw-'), false)
  api().edit((draft) => {
    draft.swap('--tw-brightness', null)
    draft.write({ opacity: null, gap: '8px' })
    draft.swap('--tw-ease', partUtility(engine, 'ease', 'var(--ease-out)', 'number'))
  })
  assert.ok(!box.classes.includes('brightness-50') && box.classes.includes('gap-2') && box.classes.includes('ease-out') && box.classes.includes('border-2'))
})

test('a value becomes the step of its scale', () => {
  assert.equal(partUtility(engine, 'translate-x', '16px', 'spacing'), 'translate-x-4')
  assert.equal(partUtility(engine, 'translate-x', '-10px', 'spacing'), '-translate-x-2.5')
  assert.equal(partUtility(engine, 'translate-x', '13px', 'spacing'), 'translate-x-[13px]')
  assert.equal(partUtility(engine, 'translate-y', '-50%', 'spacing'), '-translate-y-1/2')
  assert.equal(partUtility(engine, 'p', 'var(--spacing-gutter)', 'spacing'), 'p-gutter')
  assert.equal(partUtility(engine, 'border', '1px', 'px'), 'border')
  assert.equal(partUtility(engine, 'border-t', '2px', 'px'), 'border-t-2')
  assert.equal(partUtility(engine, 'rotate', '-45deg', 'deg'), '-rotate-45')
  assert.equal(partUtility(engine, 'rotate', '0.5turn', 'deg'), 'rotate-[0.5turn]')
  assert.equal(partUtility(engine, 'scale', '1.05', 'percent'), 'scale-105')
  assert.equal(partUtility(engine, 'opacity', '50%', 'percent'), 'opacity-50')
  assert.equal(partUtility(engine, 'border', 'var(--color-primary)', 'number'), 'border-primary')
  assert.equal(partUtility(engine, 'border', 'currentColor', 'number'), 'border-current')
  assert.equal(partUtility(engine, 'shadow', '0 8px 24px -8px rgb(0 0 0 / 18%)', 'number'), 'shadow-[0_8px_24px_-8px_rgb(0_0_0_/_18%)]')
  assert.equal(partUtility(engine, 'from', 'color-mix(in oklab, var(--color-primary) 50%, transparent)', 'number'), 'from-primary/50')
  assert.equal(plain('calc(calc(1 / 2 * 100%) * -1)'), '-50%')
})

test('a gradient is classes where Tailwind has them', () => {
  const linear = { kind: 'linear' as const, angle: '90deg', stops: [{ color: 'var(--color-primary)', at: '' }, { color: '#ffffff', at: '50%' }, { color: 'transparent', at: '' }] }
  assert.deepEqual(gradientUtilities(engine, linear), ['bg-linear-to-r', 'from-primary', 'via-[#ffffff]', 'via-50%', 'to-transparent'])
  assert.deepEqual(gradientUtilities(engine, { ...linear, angle: '45deg', stops: linear.stops.slice(0, 2) }), ['bg-linear-45', 'from-primary', 'to-[#ffffff]', 'to-50%'])
  assert.deepEqual(gradientUtilities(engine, { kind: 'radial', angle: 'circle', stops: [{ color: 'red', at: '' }, { color: 'blue', at: '' }] }), ['bg-[radial-gradient(circle,_red,_blue)]'])
  const { box, api } = edit(['bg-none', 'p-4'])
  api().swap(GRADIENT_MARKERS, gradientUtilities(engine, linear))
  assert.ok(!box.classes.includes('bg-none') && box.classes.includes('p-4'))
  assert.equal(gradientOf(api().value), 'linear-gradient(90deg, var(--color-primary), #ffffff 50%, transparent)')
  assert.equal(gradientOf(edit(['p-4']).api().value), undefined)
})

test('the layer bar knows where an element has classes', () => {
  const classes = ['p-4', 'md:hover:p-6', 'data-open:flex', 'btn-primary', 'card']
  assert.deepEqual([...usedVariants(classes)].sort(), ['data-open', 'hover', 'md'])
  assert.ok(layerUsed(classes, ['hover', 'md']) && !layerUsed(classes, ['md']))
  assert.equal(onLayer('flex', ['md', 'hover']), 'md:hover:flex')
  assert.equal(onLayer('lg:flex', ['md']), 'lg:flex')
  assert.deepEqual(splitSiteClasses(engine, classes, ['btn-primary']), { site: ['btn-primary', 'card'], utilities: ['p-4', 'md:hover:p-6', 'data-open:flex'] })
})

test('the class search finds the site\'s classes first, then Tailwind\'s', () => {
  const found = searchClasses(engine, ['btn-primary'], 'pr', new Set())
  assert.equal(found[0], 'btn-primary')
  assert.ok(found.includes('prose') || found.some((name: string) => name.startsWith('pr')))
  assert.deepEqual(searchClasses(engine, ['btn-primary'], '', new Set(['btn-primary'])), [])
  // What was typed is a class when Tailwind reads it, also where no list holds it.
  assert.equal(searchClasses(engine, [], 'md:p-[13px]', new Set())[0], 'md:p-[13px]')
  assert.equal(searchClasses(engine, [], 'zzcard', new Set()).at(-1), 'zzcard')
  assert.ok(!searchClasses(engine, [], 'md:nope', new Set()).includes('md:nope'))
  assert.ok(broken(engine, 'md:nope') && broken(engine, 'a"b') && !broken(engine, 'card') && !broken(engine, 'hover:bg-primary/50') && !broken(null, 'md:nope'))
})

test('the states of a block and of the blocks around it are named', () => {
  const block = { id: 'a', type: 'box', props: {}, logic: { states: { open: 'open' }, behaviors: { scroll: { hide: true } } }, bind: { 'state:active': 'item.active', text: 'item.title' } }
  const around = [{ id: 'b', type: 'box', props: {}, logic: { states: { open: 'open', wide: 'wide' } } }, { id: 'c', type: 'box', props: {} }]
  assert.deepEqual(dataStates(block, around), { own: ['open', 'active', 'scrolled', 'hidden'], inherited: ['open', 'wide'] })
})

test('the colour picker lists the site\'s names before the palette', () => {
  const groups = colorGroups(engine.tokens('color'))
  assert.deepEqual(groups.own.map((token: { name: string }) => token.name), ['primary', 'black', 'white'])
  assert.equal(groups.families.find((family: { name: string }) => family.name === 'red')?.shades.length, 11)
  assert.deepEqual(lightDark('light-dark(#fff, rgb(0 0 0 / 50%))'), { light: '#fff', dark: 'rgb(0 0 0 / 50%)' })
  assert.deepEqual(lightDark('#fff'), { light: '#fff' })
})

test('the spacing chips are the common steps and the theme\'s named spaces', () => {
  const choices = spacingChoices(engine, engine.tokens('spacing'))
  assert.deepEqual(choices.map((choice: { label: string }) => choice.label), ['0', '1', '2', '3', '4', '6', '8', '12', '16', '24', 'gutter'])
  assert.equal(choices[4].value, '16px')
  assert.equal(choices.at(-1).value, 'var(--spacing-gutter)')
  assert.deepEqual(spacingChoices(null, []), [])
})
