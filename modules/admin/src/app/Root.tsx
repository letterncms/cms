import { QueryClientProvider } from '@tanstack/react-query'
import { boot, loadManifest, navigate, onManifest, onUnauthorized, queryClient, request, setManifest, t, useLocation, type Manifest } from '@letterncms/sdk'
import { useCallback, useEffect, useState } from 'react'
import { registerCoreFields } from '../fields'
import { AuthScreen } from '../screens/auth/AuthScreen'
import { Button, Icon, Spinner, Toaster, TooltipProvider } from '../ui'
import { App, screenReady } from './App'
import { followManifest, reportFailed, syncModules } from './modules'

type State = 'loading' | 'guest' | 'ready' | 'error'

/** The page brings the signed-in user's manifest along; it is only good for the first start. */
let embedded: Manifest | undefined = boot.manifest
let following = false

export function Root() {
  const [state, setState] = useState<State>('loading')
  const [error, setError] = useState<string>('')
  const { path } = useLocation()

  const start = useCallback(async () => {
    setState('loading')
    // Field components first: every form, sign-in included, is drawn with them.
    registerCoreFields()
    try {
      let manifest = embedded
      embedded = undefined
      if (!manifest) {
        const session = await request<{ authenticated: boolean }>('GET', 'auth/session')
        if (!session.authenticated) {
          setState('guest')
          return
        }
      }
      // Signed in on the way to an OAuth consent screen (MCP clients): go back there.
      const next = new URLSearchParams(window.location.search).get('next')
      if (next && next.startsWith('/oauth/authorize?')) {
        window.location.assign(next)
        return
      }
      // Every screen comes from a module, the admin's own ones included.
      if (manifest) setManifest(manifest)
      else manifest = await loadManifest()
      reportFailed(await syncModules(manifest))
      // From here on the admin follows the manifest: packages turned on or off apply without a reload.
      if (!following) {
        following = true
        onManifest(followManifest)
      }
      // Signed in, the sign-in and reset pages have nothing left to show.
      if (/^\/(login|reset)\/?$/.test(window.location.pathname.slice(boot.base.length))) navigate('/', { replace: true })
      await screenReady(window.location.pathname.slice(boot.base.length) || '/', window.location.search)
      setState('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setState('error')
    }
  }, [])

  useEffect(() => {
    void start()
    onUnauthorized(() => {
      queryClient.clear()
      setState('guest')
    })
  }, [start])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {state === 'loading' && <Booting />}
        {state === 'guest' && <AuthScreen path={path} onAuthenticated={start} />}
        {state === 'error' && (
          <div className="grid h-screen place-items-center bg-bg p-6">
            <div className="flex max-w-sm flex-col items-center text-center">
              <Icon name="warning" size={18} className="mb-3 text-muted" />
              <p className="m-0 text-sm font-medium text-ink">{t('The admin could not start')}</p>
              <p className="m-0 mt-1 text-sm text-muted">{error}</p>
              <Button size="sm" className="mt-4" onClick={() => void start()}>
                {t('Try Again')}
              </Button>
            </div>
          </div>
        )}
        {state === 'ready' && <App />}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

/**
 * While the admin starts: the frame it is about to draw (signed in, the sidebar's
 * place), and a spinner only if starting takes long enough to notice.
 */
function Booting() {
  const signedIn = !!boot.manifest
  const sidebar = localStorage.getItem('cms.sidebar') !== 'collapsed' && window.matchMedia('(min-width: 768px)').matches
  return (
    <div className="flex h-screen bg-bg">
      {signedIn && sidebar && <div className="w-[248px] shrink-0 border-r border-border bg-surface" />}
      <div className="cms-appear-late grid flex-1 place-items-center text-faint">
        <Spinner size={18} />
      </div>
    </div>
  )
}
