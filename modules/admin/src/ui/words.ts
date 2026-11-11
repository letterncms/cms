import { t } from '@letterncms/sdk'

/**
 * A name and what it stands for, in one line ("Author: Anna"), for a label read out or shown as one piece.
 * The separator is the language's: French sets a narrow no-break space before the colon.
 */
export function labelled(label: string, value: string): string {
  return t('{label}: {value}', { label, value })
}
