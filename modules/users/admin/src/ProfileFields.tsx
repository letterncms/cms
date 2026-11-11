import { invalidate, loadManifest, run, useAbility } from '@letterncms/sdk'
import { useRef, useState } from 'react'
import { FieldsEditor, SaveBar, Spinner, useTabDirty, type RawField } from '@letterncms/ui'

/** The Profile Fields tab of Users: the fields every profile has, in the same editor as collections. Saved from the bar. */
export default function ProfileFields() {
  const source = useAbility<{ fields: RawField[] }>('user-fields/get', {}, { refetchOnWindowFocus: false })
  const [fields, setFields] = useState<RawField[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState<string | null>(null)
  const busy = useRef(false)
  // Changed and changed back is no change.
  const dirty = fields !== null && JSON.stringify(fields) !== JSON.stringify(source.data?.fields ?? [])
  useTabDirty(dirty)

  const save = async () => {
    if (!fields || !dirty || busy.current) return
    busy.current = true
    setSaving(true)
    setFailed(null)
    try {
      await run('user-fields/save', { fields })
      invalidate('users/', 'user-fields/')
      await loadManifest()
      setFields(null)
    } catch (e) {
      setFailed(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
      busy.current = false
    }
  }

  return (
    <>
      {!source.data ? <div className="grid place-items-center py-10 text-faint"><Spinner /></div> : (
        <div className="mx-auto w-full max-w-[640px] pb-24">
          <FieldsEditor fields={fields ?? source.data.fields ?? []} onChange={setFields} />
        </div>
      )}
      <SaveBar dirty={dirty} saving={saving} error={failed} onSave={() => void save()} onDiscard={() => { setFields(null); setFailed(null) }} />
    </>
  )
}
