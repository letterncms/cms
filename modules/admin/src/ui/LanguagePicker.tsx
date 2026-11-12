import { t } from '@letterncms/sdk'
import { Button } from './Button'
import { Icon } from './Icon'
import { nativeName } from './language'
import { Menu, type MenuItemDef } from './Menu'

export interface LanguageChoice {
  code: string
  /** Quieter words beside its name: "Draft". */
  note?: string
}

/**
 * The one way to switch a screen to another language: the language on view by name, and a
 * menu of every one there is. It stands in the top bar, before the screen's actions, on a
 * list, a global and an entry alike; `more` adds what a screen can do besides (start a translation).
 */
export function LanguagePicker({ value, languages, onChange, more = [], loading }: { value: string; languages: (string | LanguageChoice)[]; onChange: (code: string) => void; more?: (MenuItemDef | false | null | undefined)[]; loading?: boolean }) {
  const list = languages.map((l) => (typeof l === 'string' ? { code: l } : l))
  return (
    <Menu
      trigger={(
        <Button variant="ghost" size="sm" icon="translate" className="max-sm:px-1.5" loading={loading} title={t('Language')}>
          {/* A phone's bar keeps its room for the screen's name: the icon alone, the language in its menu. */}
          <span className="max-sm:sr-only">{nativeName(value)}</span>
          <Icon name="chevron-down" size={12} className="-mr-0.5 shrink-0 text-faint max-sm:hidden" />
        </Button>
      )}
      items={[
        { label: t('Languages'), heading: true },
        ...list.map((l) => ({ label: nativeName(l.code), hint: l.note, checked: l.code === value, onSelect: () => l.code !== value && onChange(l.code) })),
        ...(more.some(Boolean) ? [{ separator: true, label: '' }, ...more] : []),
      ]}
    />
  )
}
