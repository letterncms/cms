import { queryClient, run, t, type SurfaceComponentProps } from '@letterncms/sdk'
import { Dialog, Spinner, confirm, toast } from '@letterncms/ui'
import { useEffect, useRef, useState } from 'react'

/**
 * Undoing a sync, from a button of the Sync screen: asks first, then puts back what it replaced a
 * piece at a time, so no host's time limit is ever near. Here (a sync this site received) or on a
 * connected site (`remote`: the last push to it).
 */
export default function SyncUndo({ props, close }: SurfaceComponentProps<{ id: string; remote?: string; site?: string }>) {
  const [undoing, setUndoing] = useState(false)
  const started = useRef(false)
  const site = props.site ?? ''

  useEffect(() => {
    if (started.current) return
    started.current = true
    void (async () => {
      const there = !!props.remote
      const ok = await confirm(there
        ? { title: t('Undo the last push to {site}?', { site }), description: t('{site} gets back what it had before that push, from the backup it made. Changes made there since are replaced too.', { site }), confirm: t('Undo Push'), danger: true }
        : { title: t('Undo this sync?'), description: t('This site gets back what it had before it, from the backup made just then. Changes made since are replaced too.'), confirm: t('Undo Sync'), danger: true })
      if (!ok) return close?.()
      setUndoing(true)
      try {
        while (!(await run<{ done: boolean }>('sync/undo', { id: props.id, ...(there ? { remote: props.remote } : {}) })).done);
        toast.success(there ? t('{site} is back as it was before the push.', { site }) : t('Undone. This site is as it was before that sync.'))
        void queryClient.invalidateQueries()
      } catch (e) {
        toast.error(e)
      } finally {
        close?.()
      }
    })()
  }, [])

  return undoing ? (
    <Dialog open onOpenChange={() => {}} size="sm" title={t('Undoing…')}>
      <div className="grid h-16 place-items-center"><Spinner /></div>
    </Dialog>
  ) : null
}
