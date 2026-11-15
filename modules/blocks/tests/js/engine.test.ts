import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { __unstable__loadDesignSystem } from 'tailwindcss'
import { ClassStyle, Engine, arbitrary, layerOf, parseClass } from '../../tailwind/engine.ts'

const index = readFileSync(createRequire(import.meta.url).resolve('tailwindcss/index.css'), 'utf8')
const css = `@import "tailwindcss";
@theme { --color-primary: #111616; --font-display: "Instrument Serif", serif; }
@utility btn { @apply inline-flex h-10 items-center px-4; &:hover { opacity: 0.9; } }`
const engine = new Engine(await __unstable__loadDesignSystem(css, { base: '/', loadStylesheet: async (id: string, base: string) => ({ path: id, base, content: index }) }))

test('a class is its variants and its utility', () => {
  assert.deepEqual(parseClass('md:[&>a]:hover:p-4'), { raw: 'md:[&>a]:hover:p-4', variants: ['md', '[&>a]', 'hover'], utility: 'p-4' })
  assert.deepEqual(parseClass('[mask-image:linear-gradient(black,transparent)]').variants, [])
  assert.equal(layerOf(['hover', 'md']), layerOf(['md', 'hover']))
})

test('utilities of one group replace each other', () => {
  assert.equal(engine.group('p-4'), engine.group('p-[13px]'))
  assert.equal(engine.group('flex'), engine.group('grid'))
  assert.equal(engine.group('text-sm'), engine.group('text-[13px]'))
  assert.notEqual(engine.group('text-sm'), engine.group('text-primary'))
  assert.notEqual(engine.group('translate-x-4'), engine.group('translate-y-4'))
  assert.notEqual(engine.group('px-4'), engine.group('pl-4'))
  assert.notEqual(engine.group('shadow-md'), engine.group('ring-2'))
  assert.notEqual(engine.group('border'), engine.group('border-dashed'))
  assert.equal(engine.group('border'), engine.group('border-2'))
  assert.equal(engine.group('not-a-class'), null)
})

test('writing a utility keeps the other layers', () => {
  const classes = ['p-4', 'md:p-6', 'hover:md:p-8', 'flex']
  const padding = engine.group('p-0')!
  assert.deepEqual(engine.put(classes, [], padding, 'p-2'), ['md:p-6', 'hover:md:p-8', 'flex', 'p-2'])
  assert.deepEqual(engine.put(classes, ['md', 'hover'], padding, null), ['p-4', 'md:p-6', 'flex'])
  assert.equal(engine.find(classes, ['md'], padding), 'md:p-6')
  assert.equal(engine.find(classes, ['lg'], padding), null)
})

test('what is typed becomes a step of the scale or the value itself', () => {
  assert.equal(engine.make('p', '4'), 'p-4')
  assert.equal(engine.make('p', '13px'), 'p-[13px]')
  assert.equal(engine.make('mt', '-4'), '-mt-4')
  assert.equal(engine.make('w', '1/2'), 'w-1/2')
  assert.equal(engine.make('bg', 'primary/50'), 'bg-primary/50')
  assert.equal(engine.make('grid-cols', 'repeat(3, 1fr)'), 'grid-cols-[repeat(3,_1fr)]')
  assert.equal(arbitrary('0 1px 0 red'), '0_1px_0_red')
})

test('a declaration finds the utility people write for it', () => {
  assert.equal(engine.utilityFor('display', 'flex'), 'flex')
  assert.equal(engine.utilityFor('padding', '1rem'), 'p-4')
  assert.equal(engine.utilityFor('position', 'sticky'), 'sticky')
  assert.equal(engine.utilityFor('font-size', '1.0625rem'), 'text-[1.0625rem]')
  assert.equal(engine.utilityFor('color', 'var(--color-primary)'), 'text-primary')
  assert.equal(engine.utilityFor('white-space', 'pre-line'), 'whitespace-pre-line')
  assert.equal(engine.utilityFor('anchor-name', '--menu'), '[anchor-name:--menu]')
  assert.equal(engine.utilityFor('line-height', '1.3'), 'leading-[1.3]')
  assert.equal(engine.utilityFor('opacity', '0.5'), 'opacity-[0.5]')
  assert.equal(engine.utilityFor('z-index', '15'), 'z-15')
  assert.equal(engine.utilityFor('aspect-ratio', '16/9'), 'aspect-16/9')
})

test('a control reads what a utility sets', () => {
  assert.equal(engine.value('p-4', 'padding'), '16px')
  assert.equal(engine.value('p-[13px]', 'padding'), '13px')
  assert.equal(engine.value('text-primary', 'color'), 'var(--color-primary)')
  assert.equal(engine.value('font-display', 'font-family'), 'var(--font-display)')
  assert.equal(engine.value('flex', 'display'), 'flex')
  assert.equal(engine.value('flex', 'color'), undefined)
  assert.equal(engine.utilityFor('padding', '16px'), 'p-4')
  assert.equal(engine.utilityFor('padding', engine.value('p-4', 'padding')!), 'p-4')
  assert.equal(engine.utilityFor('color', engine.value('text-primary/50', 'color')!), 'text-primary/50')
  assert.equal(engine.utilityFor('box-shadow', engine.value('shadow-md', 'box-shadow')!), 'shadow-md')
  assert.equal(engine.utilityFor('font-weight', 'var(--font-weight-semibold)'), 'font-semibold')
})

test('the theme lists its values by kind', () => {
  assert.deepEqual(engine.tokens('color').find((token) => token.name === 'primary'), { group: 'color', name: 'primary', variable: '--color-primary', ref: 'var(--color-primary)', value: '#111616' })
  assert.ok(engine.tokens('font').every((token) => !token.name.startsWith('weight')))
  assert.ok(engine.tokens('text').some((token) => token.name === '4xl') && engine.tokens('text').every((token) => !token.name.includes('line-height')))
  assert.ok(engine.tokens('weight').some((token) => token.name === 'semibold'))
})

test('a site class is a utility like any other', () => {
  assert.ok(engine.valid('md:btn'))
  assert.deepEqual(engine.declarations('btn')?.map((d) => d.property), ['display', 'height', 'align-items', 'padding-inline'])
  assert.deepEqual(engine.sort(['p-4', 'unknown', 'flex']), ['unknown', 'flex', 'p-4'])
})

test('controls read what wins at the screen being seen, and write where it takes effect', () => {
  const sizes = { sm: 640, md: 768, lg: 1024 }
  const desktop = { variant: '', width: 1280, sizes }
  const tablet = { variant: 'max-lg', width: 820, sizes }
  const phone = { variant: 'max-md', width: 390, sizes }
  const classes = ['flex', 'p-4', 'max-lg:p-6', 'hover:bg-primary', 'max-md:hover:p-8', 'max-md:hidden']
  const base = new ClassStyle(engine, classes, desktop, [])
  assert.deepEqual(base.find('padding'), { value: '16px', from: 'p-4', own: true })
  assert.equal(base.find('background-color'), undefined)
  const onTablet = new ClassStyle(engine, classes, tablet, [])
  assert.deepEqual(onTablet.find('padding'), { value: '24px', from: 'max-lg:p-6', own: true })
  assert.deepEqual(onTablet.find('display'), { value: 'flex', from: 'flex', own: false })
  const onPhone = new ClassStyle(engine, classes, phone, [])
  assert.deepEqual(onPhone.find('padding'), { value: '24px', from: 'max-lg:p-6', own: false })
  assert.deepEqual(onPhone.find('display'), { value: 'none', from: 'max-md:hidden', own: true })
  const hover = new ClassStyle(engine, classes, phone, ['hover'])
  assert.deepEqual(hover.find('padding'), { value: '32px', from: 'max-md:hover:p-8', own: true })
  assert.equal(hover.find('background-color')?.from, 'hover:bg-primary')
  assert.deepEqual(onTablet.set({ padding: '40px', display: 'grid' }), ['flex', 'p-4', 'hover:bg-primary', 'max-md:hover:p-8', 'max-md:hidden', 'max-lg:p-10', 'max-lg:grid'])
  assert.deepEqual(base.set({ padding: null, 'max-width': '13rem' }), ['flex', 'max-lg:p-6', 'hover:bg-primary', 'max-md:hover:p-8', 'max-md:hidden', 'max-w-52'])
  assert.deepEqual(onPhone.own(), ['display'])
  assert.equal(new ClassStyle(engine, ['translate-x-4', 'translate-y-2'], desktop, []).get('translate-y-0'), 'translate-y-2')
  assert.deepEqual(new ClassStyle(engine, ['translate-x-4', 'translate-y-2'], desktop, []).put('translate-x-0', '-translate-x-full'), ['translate-y-2', '-translate-x-full'])

  // Classes written mobile-first, as agents often do: seen on a desktop, md: is what wins there, and what changes.
  const mobile = ['grid', 'grid-cols-1', 'md:grid-cols-3']
  const seen = new ClassStyle(engine, mobile, desktop, [])
  assert.equal(seen.find('grid-template-columns')?.from, 'md:grid-cols-3')
  assert.equal(seen.find('grid-template-columns')?.own, false)
  assert.deepEqual(seen.set({ 'grid-template-columns': 'repeat(4, minmax(0, 1fr))' }), ['grid', 'grid-cols-1', 'md:grid-cols-4'])
  // On a phone the class for every screen is what wins: the phone's own is written beside it.
  assert.equal(new ClassStyle(engine, mobile, phone, []).find('grid-template-columns')?.from, 'grid-cols-1')
  assert.deepEqual(new ClassStyle(engine, mobile, phone, []).set({ 'grid-template-columns': 'repeat(2, minmax(0, 1fr))' }), ['grid', 'grid-cols-1', 'md:grid-cols-3', 'max-md:grid-cols-2'])
  // Arbitrary screens read too.
  assert.equal(new ClassStyle(engine, ['p-2', 'min-[900px]:p-4'], tablet, []).find('padding')?.from, 'p-2')
  assert.equal(new ClassStyle(engine, ['p-2', 'min-[900px]:p-4'], desktop, []).find('padding')?.from, 'min-[900px]:p-4')
})
