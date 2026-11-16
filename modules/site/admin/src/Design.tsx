import { t } from '@letterncms/sdk'
import { IconButton, Segmented, Tooltip, Topbar, cn } from '@letterncms/ui'
import { useState } from 'react'
import { SITE_FRAME, WIDTHS, type Viewport } from './preview'

/**
 * /design: where the design opens, on the site itself, as visitors see it. Its parts (Styling, Templates,
 * Components, Patterns, Code) are the design's sidebar; this is what they make. The site can be browsed in
 * its frame, at the width of each screen.
 */
export default function Design() {
  const [viewport, setViewport] = useState<Viewport>('desktop')

  return (
    <div className="flex h-full flex-col">
      <Topbar
        crumbs={[{ label: t('Design'), icon: 'palette' }]}
        actions={
          <>
            <span className="max-md:hidden">
              <Segmented size="xs" aria-label={t('Screen')} value={viewport} onChange={setViewport} options={[{ value: 'desktop', icon: 'desktop', title: t('Desktop') }, { value: 'tablet', icon: 'tablet', title: t('Tablet') }, { value: 'phone', icon: 'phone', title: t('Phone') }]} />
            </span>
            <Tooltip content={t('Open Site')}>
              <IconButton icon="external" label={t('Open Site')} title={undefined} onClick={() => window.open('/', '_blank', 'noopener')} />
            </Tooltip>
          </>
        }
      />
      <div className="flex min-h-0 flex-1 justify-center bg-sunken md:p-4">
        <iframe src="/" title={t('Site')} className={cn('h-full max-w-full transition-[width] duration-move', SITE_FRAME)} style={{ width: WIDTHS[viewport] }} />
      </div>
    </div>
  )
}
