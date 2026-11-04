import { navigate, useLocation } from '@letterncms/sdk'
import { useEffect } from 'react'

/** Profile Fields are a tab of Users now; the old address leads there. */
export default function UserBlueprint() {
  useEffect(() => navigate('/users?tab=fields', { replace: true }), [])
  return null
}

/** The visitor accounts settings are the Sign-Up tab of Users now; their old page leads there. */
export function SignUpSettings() {
  const { query } = useLocation()
  useEffect(() => navigate(`/users?tab=sign-up${query.field ? `&field=${encodeURIComponent(query.field)}` : ''}`, { replace: true }), [query.field])
  return null
}
