import { isActive, t } from '@letterncms/sdk'
import { Kbd, Widget } from '@letterncms/ui'

/** Home-screen widget: the keys worth knowing. */
export default function Shortcuts() {
  const keys: [string, string][] = [
    [t('Search and Commands'), 'mod+k'],
    ...(isActive('letterncms/assistant') ? [[t('Ask the assistant'), 'mod+j'] as [string, string]] : []),
    [t('New Entry in a List'), 'c'],
    [t('Save'), 'mod+s'],
    [t('Publish'), 'mod+shift+p'],
    [t('Toggle Sidebar'), 'mod+\\'],
  ]

  return (
    <Widget>
      <ul className="m-0 list-none p-0">
        {keys.map(([label, combo]) => (
          <li key={label} className="flex h-8 items-center justify-between gap-3 text-sm text-text">
            {label}
            <Kbd keys={combo} />
          </li>
        ))}
      </ul>
    </Widget>
  )
}
