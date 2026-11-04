import { queryClient, run, t } from '@letterncms/sdk'
import { Fields, cn, toast } from '@letterncms/ui'
import { useState } from 'react'

/** A thread's name, changed in place: Enter keeps it, Esc leaves it as it was. */
export function Rename({ id, title, onDone, className }: { id: string; title: string; onDone: (named: string | null) => void; className?: string }) {
  const [value, setValue] = useState(title)
  const [saving, setSaving] = useState(false)
  const save = async () => {
    const named = value.trim()
    if (!named || named === title) return onDone(null)
    setSaving(true)
    try {
      await run('threads/rename', { id, title: named })
      void queryClient.invalidateQueries({ queryKey: ['threads/list'] })
      onDone(named)
    } catch (e) {
      toast.error(e)
      setSaving(false)
    }
  }
  return (
    <form className={cn('min-w-0 flex-1', className)} onSubmit={(e) => { e.preventDefault(); void save() }} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onDone(null) } }} onBlur={(e) => { if (!saving && !e.currentTarget.contains(e.relatedTarget as Node | null)) void save() }}>
      <Fields bare fields={[{ handle: 'title', type: 'text', label: t('Rename Chat'), size: 'sm', autofocus: true, max: 120 }]} values={{ title: value }} disabled={saving} onChange={(_, v) => setValue(String(v ?? ''))} />
    </form>
  )
}

