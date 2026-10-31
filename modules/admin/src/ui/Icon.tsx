import { registry } from '@letterncms/sdk'
import { memo, type SVGProps } from 'react'
import { ICONS } from '../lib/icon-data'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Semantic name (see icons.json), a registered plugin icon, or "svg:<path data>". */
  name: string
  size?: number
}

/** All iconography goes through here, so the icon set can be swapped in one place. */
export const Icon = memo(function Icon({ name, size = 16, className, children: _ignored, ...props }: IconProps) {
  const data = ICONS[name]
  const custom = data ? null : registry.icons.get(name)
  const [body, w, h] = data ?? (custom ? [custom, 256, 256] : ICONS.circle)

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
})
