import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mix, paint, palette, sitePalette, PRESETS } from '../../media/map/style.ts'

const lum = (c: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const theme = (vars: Record<string, string>) => (name: string) => vars[name] ?? ''

test('Site Colors keep names readable on the land, on a page, in a coloured band and in the dark', () => {
  const page = sitePalette(theme({ '--color-background': '#ffffff', '--color-surface': '#f3f6f3', '--color-foreground': '#0e1c17', '--color-muted': '#475850', '--color-primary': '#0f5a43' }))
  // A red band whose text is cream: its surface is cream too.
  const band = sitePalette(theme({ '--color-background': '#d9452b', '--color-surface': '#fbefe4', '--color-foreground': '#fbefe4', '--color-primary': '#fbefe4' }))
  const dark = sitePalette(theme({ '--color-background': '#0b1411', '--color-surface': '#111d18', '--color-foreground': '#e8f0eb', '--color-primary': '#74d4aa' }))

  for (const p of [page, band, dark]) {
    assert.ok(contrast(p.label, p.land) >= 4.5, `names ${p.label} on ${p.land}`)
    assert.ok(contrast(p.road, p.land) >= 1.08, `roads ${p.road} on ${p.land}`)
    assert.ok(contrast(p.water, p.land) >= 1.12, `water ${p.water} on ${p.land}`)
    assert.ok(contrast(p.park, p.land) >= 1.05, `parks ${p.park} on ${p.land}`)
  }
  assert.ok(lum(dark.land) < 0.05, 'a dark map stays dark')
})

test('a preset with a palette paints every layer; colours of the site go over any preset', () => {
  const style = {
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#eee' } },
      { id: 'water', type: 'fill', 'source-layer': 'water', paint: { 'fill-color': '#ccc' } },
      { id: 'landcover_wood', type: 'fill', 'source-layer': 'landcover', paint: { 'fill-color': '#ccc' } },
      { id: 'highway_motorway_inner', type: 'line', 'source-layer': 'transportation', paint: { 'line-color': '#fff' } },
      { id: 'highway_major_casing', type: 'line', 'source-layer': 'transportation', paint: { 'line-color': '#ddd' } },
      { id: 'label_city', type: 'symbol', 'source-layer': 'place', layout: { 'text-field': '{name:latin}' }, paint: { 'text-color': '#333' } },
      { id: 'highway-shield-non-us', type: 'symbol', 'source-layer': 'transportation_name', layout: { 'icon-image': 'road_{ref_length}', 'text-field': '{ref}' } },
    ],
  }
  const blueprint = palette('blueprint', {}, theme({}))
  assert.equal(blueprint.full, true)
  const painted = paint(style, blueprint.palette, 'nl', true).layers
  const p = PRESETS.blueprint.palette!
  assert.equal(painted[0].paint!['background-color'], p.land)
  assert.equal(painted[1].paint!['fill-color'], p.water)
  assert.equal(painted[2].paint!['fill-color'], p.park)
  assert.equal(painted[3].paint!['line-color'], mix(p.road, p.label, 0.06))
  assert.equal(painted[5].paint!['text-color'], p.label)
  // Names in the page's language where the map has them.
  assert.deepEqual(painted[5].layout!['text-field'], ['coalesce', ['get', 'name:nl'], ['get', 'name:latin'], ['get', 'name']])
  // Road numbers on shields drawn in another style's colours step aside.
  assert.equal(painted[6].layout!.visibility, 'none')

  // Streets keeps its own look; a water colour of the site's own goes over it, and nothing else changes.
  const streets = palette('streets', { water: '#123456' }, theme({}))
  assert.equal(streets.full, false)
  const over = paint(style, streets.palette, '', false).layers
  assert.equal(over[1].paint!['fill-color'], '#123456')
  assert.equal(over[0].paint!['background-color'], '#eee')
  assert.equal(over[3].paint!['line-color'], '#fff')
  assert.equal(over[6].layout!.visibility, undefined)
  assert.equal(palette('light', {}, theme({})).palette, null)
})
