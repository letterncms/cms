import { t, type FieldDef } from '@letterncms/sdk'
import { type MenuItemDef } from '@letterncms/ui'
import { InspectorSection, PanelFields, Specimen, StyleBar, StylePanels, Stylesheet, parseClass, screenFor, shownInState, styleApi, useSpecimenSheet, useStyling, type Device } from '@letterncms/blocks'
import { useMemo, useState } from 'react'
import type { Editing } from '../parts'
import { TEXT_GROUPS, type Part, type PartValue, type Style } from './catalog'
import { bare, classesOf, fallbackOf, partValue, setPart, writeClasses } from './model'

/** What a sample of the site is drawn with: the draft's compiler, and the screen the page is seen at. */
export interface Samples {
  compiler: { build: (candidates: string[]) => string } | null
  device: Device
}

const words = (text: string) => text.split(/\s+/).filter(Boolean)

/** The classes of the page's text, for a sample's frame: what `body` applies does not reach into a shadow root by itself. */
const pageClasses = (sheet: Stylesheet) => sheet.elements().find((rule) => rule.name === 'body')?.classes.join(' ') ?? ''

/**
 * One style, whatever it is written as, edited as a block is: its sample in the state being styled, as the canvas
 * stands over a block's Design tab, then the same bar (the state and its classes, with its ⋯), the sections of what it
 * draws that no class reaches, and a control for everything a class can set, for the screen the preview shows.
 */
export function StyleEditor({ edit, samples, style, menu }: { edit: Editing; samples: Samples; style: Style; menu?: MenuItemDef[] }) {
  const styling = useStyling()
  const [state, setState] = useState<string[]>([])
  const screen = useMemo(() => screenFor(samples.device, 1280, styling.breakpoints), [samples.device, styling.breakpoints])
  const classes = classesOf(edit.sheet, style)
  // Without the right to change the styling the controls show what is set and write nothing.
  const s = styleApi(styling.engine, classes, screen, state, edit.readOnly ? () => {} : (next) => edit.change((sheet) => writeClasses(sheet, style, next)))
  const page = pageClasses(edit.sheet)
  // The sample in the state being styled (Hover, Pressed, Focus), as the canvas shows a block in it.
  const shown = shownInState(classes, state)
  const sample = style.sample({ state, shown, classes })
  const sheet = useSpecimenSheet(samples.compiler, [...words(page), ...classes.map((raw) => bare(parseClass(raw).utility)), ...classes, ...shown, ...words(sample.className ?? '')])
  return (
    // The inspector's sections bring their own gutter: they reach the column's edges, as they do in the builder.
    <div className="-mx-4 -mt-2">
      <div className="border-b border-border">
        <Specimen sheet={sheet} node={sample} page={page} mode={edit.mode} align="center" auto className="min-h-32" />
      </div>
      <div className="border-b border-border">
        <StyleBar s={s} site={styling.classes} source={styling.source} disabled={edit.readOnly} state={{ classes, engine: styling.engine, state, onState: setState, primary: style.states }} menu={menu} saveAs={false} />
      </div>
      {/* Read only, the controls show what is set and take no input. */}
      <div inert={edit.readOnly}>
        {(style.parts ?? []).map((part) => <PartSection key={part.title} edit={edit} style={style} part={part} />)}
        <StylePanels s={s} groups={style.groups ?? TEXT_GROUPS} />
      </div>
    </div>
  )
}

/** A section of what a style draws that no class reaches, value by value, each with the way back to the site's. */
function PartSection({ edit, style, part }: { edit: Editing; style: Style; part: Part }) {
  const { source } = useStyling()
  const kernel = useMemo(() => new Stylesheet(source?.files.cms ?? ''), [source?.files.cms])
  const values = Object.fromEntries(part.values.map((value) => [value.handle, partValue(edit.sheet, style, value) ?? plainValue(fallbackOf(edit.sheet, kernel, style, value))]))
  const changed = (value: PartValue) => JSON.stringify(partValue(edit.sheet, style, value)) !== JSON.stringify(partValue(edit.saved, style, value))
  const own = part.values.some((value) => (value.read ? value.read(edit.sheet) !== 'above' : partValue(edit.sheet, style, value) !== null))
  return (
    <InspectorSection title={part.title} empty={!own}>
      <PanelFields
        fields={part.values.map((value) => ({ type: 'text', size: 'sm', placeholder: t('Default'), ...value.field, handle: value.handle, label: value.label, status: changed(value) ? 'own' : undefined, reset: () => edit.change((sheet) => setPart(sheet, style, value, partValue(edit.saved, style, value))) }) as FieldDef)}
        values={values}
        onChange={(handle, next) => {
          const value = part.values.find((each) => each.handle === handle)
          if (value) edit.change((sheet) => setPart(sheet, style, value, next))
        }}
      />
    </InspectorSection>
  )
}

/**
 * What the kernel sets, as a field shows it: one value (a colour or size of the theme, a length, a word). One made of
 * other properties (`var(--field-background)`, a `color-mix()`) is no value to read: the field says Default.
 */
const plainValue = (value: string | undefined) => (value && /^(var\(--(?!field-)[\w-]+\)|-?[\d.]+[a-z%]*|#[0-9a-f]{3,8}|[a-z-]+)$/i.test(value.trim()) ? value : null)
