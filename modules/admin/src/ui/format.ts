/**
 * Code formatted the way most editors do it, with Prettier: loaded with the first file formatted, not with the admin,
 * and only the parsers that file needs. Prettier's own defaults, so code written elsewhere comes back as it would there.
 */

type Plugin = { default?: unknown } | unknown

const parsers: Record<string, { parser: string; plugins: () => Promise<Plugin[]> }> = {
  javascript: { parser: 'babel', plugins: () => Promise.all([import('prettier/plugins/babel'), import('prettier/plugins/estree')]) },
  typescript: { parser: 'typescript', plugins: () => Promise.all([import('prettier/plugins/typescript'), import('prettier/plugins/estree')]) },
  json: { parser: 'json', plugins: () => Promise.all([import('prettier/plugins/babel'), import('prettier/plugins/estree')]) },
  css: { parser: 'css', plugins: () => Promise.all([import('prettier/plugins/postcss')]) },
  html: { parser: 'html', plugins: () => Promise.all([import('prettier/plugins/html'), import('prettier/plugins/postcss'), import('prettier/plugins/babel'), import('prettier/plugins/estree')]) },
}
const aliases: Record<string, string> = { js: 'javascript', ts: 'typescript', tailwind: 'css' }

/** Whether code of this language can be formatted. */
export function formats(language: string | undefined): boolean {
  return !!language && !!parsers[aliases[language] ?? language]
}

/**
 * The code formatted, or Prettier's error when it can't read it (a brace never closed): its message names the line.
 * A language it doesn't know comes back as it was.
 */
export async function formatCode(code: string, language: string | undefined): Promise<string> {
  const entry = language ? parsers[aliases[language] ?? language] : undefined
  if (!entry || code.trim() === '') return code
  const [prettier, plugins] = await Promise.all([import('prettier/standalone'), entry.plugins()])
  return prettier.format(code, { parser: entry.parser, plugins: plugins as never[] })
}
