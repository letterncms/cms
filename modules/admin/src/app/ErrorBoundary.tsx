import { t } from '@letterncms/sdk'
import { Component, type ReactNode } from 'react'
import { QueryError } from '../ui'

/** Keeps a failing screen (core or plugin) from taking down the whole admin. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[cms] screen crashed', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid h-full min-h-60 place-items-center p-6">
        <QueryError className="w-full max-w-md" message={t('Something went wrong')} onRetry={() => this.setState({ error: null })} />
      </div>
    )
  }
}
