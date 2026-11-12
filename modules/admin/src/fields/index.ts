import { registry } from '@letterncms/sdk'
import { AccentField, CodeField, ColorField, DateField, EmailField, IconField, JsonField, MarkdownField, NumberField, SelectField, SliderField, SlugField, TextField, TextareaField, ToggleField, UrlField } from './basic'
import { EntriesField, GroupField, MatrixField, RepeaterField, TagsField, UsersField } from './complex'
import { DateRangeField, GeoField, LinkValueField, TableField, TimeField } from './structured'
import { FieldsConfigField } from './FieldsEditor'
import { HandleField, MatrixTypesField } from './BuilderFields'
import { RichTextField } from './RichTextField'
import { LinkField } from './LinkField'
import { EaseField } from './EaseField'

/**
 * The field primitives every form is drawn with — one per core field type, plus the
 * blueprint editor and the easing curve. Fields that belong to one screen
 * (roles, the sidebar arrangement, the entry title) come with their modules.
 */
export function registerCoreFields() {
  const map = {
    text: TextField, textarea: TextareaField, richtext: RichTextField, markdown: MarkdownField, number: NumberField,
    toggle: ToggleField, select: SelectField, date: DateField, slug: SlugField, url: UrlField, email: EmailField,
    color: ColorField, entries: EntriesField, users: UsersField, tags: TagsField, code: CodeField, json: JsonField,
    icon: IconField, group: GroupField, repeater: RepeaterField, matrix: MatrixField,
    // `link` is the address picker (`{ type: 'url', component: 'link' }`); the link field type's value has its label with it.
    'link-value': LinkValueField, 'date-range': DateRangeField, time: TimeField, range: SliderField, table: TableField, geo: GeoField, fields: FieldsConfigField, 'matrix-types': MatrixTypesField, 'handle-input': HandleField, link: LinkField, ease: EaseField, accent: AccentField,
  }
  for (const [key, component] of Object.entries(map)) registry.fields.set(key, component)
}

