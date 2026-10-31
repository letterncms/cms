/** A URL-safe slug from any text ("Über uns" → "uber-uns"). While typing, a trailing dash is kept. */
export function slugify(value: string, typing = false): string {
  const slug = value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
  return typing ? slug.replace(/^-+/, '') : slug.replace(/^-+|-+$/g, '')
}
