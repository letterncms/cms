import { registry } from '@letterncms/sdk'
import { CodeField, ColorField, DateField, EmailField, IconField, JsonField, MarkdownField, NumberField, SelectField, SlugField, TextField, TextareaField, ToggleField, UrlField } from './basic'
import { EntriesField, GroupField, RepeaterField, TagsField, UsersField } from './complex'
import { FieldsConfigField } from './FieldsEditor'
import { RichTextField } from './RichTextField'
import { CommandQueryField } from './CommandQueryField'
import { LinkField } from './LinkField'

/**
 * The field primitives every form is drawn with — one per core field type, plus the
 * blueprint editor and the palette's query box. Fields that belong to one screen
 * (roles, the sidebar arrangement, the entry title) come with their modules.
 */
export function registerCoreFields() {
  const map = {
    text: TextField, textarea: TextareaField, richtext: RichTextField, markdown: MarkdownField, number: NumberField,
    toggle: ToggleField, select: SelectField, date: DateField, slug: SlugField, url: UrlField, email: EmailField,
    color: ColorField, entries: EntriesField, users: UsersField, tags: TagsField, code: CodeField, json: JsonField,
    icon: IconField, group: GroupField, repeater: RepeaterField, fields: FieldsConfigField, 'command-query': CommandQueryField, link: LinkField,
  }
  for (const [key, component] of Object.entries(map)) {
    if (!registry.fields.get(key)) registry.fields.set(key, component as any)
  }
}

