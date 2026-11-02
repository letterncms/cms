import { registry } from '@letterncms/sdk'
import { memo, type SVGProps } from 'react'
import { ICONS } from '../lib/icon-data'
import { catalogBody, useIconCatalog } from '../lib/iconCatalog'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Semantic name (see icons.json), a registered plugin icon, or "svg:<path data>". */
  name: string
  size?: number
}

/** All iconography goes through here, so the icon set can be swapped in one place. */
export const Icon = memo(function Icon({ name, size = 16, className, children: _ignored, ...props }: IconProps) {
  const data = ICONS[name]
  const custom = data ? null : registry.icons.get(name)
  if (!data && !custom) return <CatalogIcon name={name} size={size} className={className} {...props} />
  const [body, w, h] = data ?? [custom!, 256, 256]
  return <Glyph body={body} w={w} h={h} size={size} className={className} {...props} />
})

/** Any other name is looked up in the full set, which loads on demand: the frame holds the place meanwhile. */
function CatalogIcon({ name, size, ...props }: Omit<IconProps, 'children'>) {
  const set = useIconCatalog()
  const body = set ? catalogBody(name, set) : ''
  if (body === undefined) {
    const [circle, w, h] = ICONS.circle
    return <Glyph body={circle} w={w} h={h} size={size} {...props} />
  }
  return <Glyph body={body} w={256} h={256} size={size} {...props} />
}

function Glyph({ body, w, h, size, className, ...props }: Omit<IconProps, 'name' | 'children'> & { body: string; w: number; h: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      dangerouslySetInnerHTML={{ __html: body }}
      {...props}
    />
  )
}
