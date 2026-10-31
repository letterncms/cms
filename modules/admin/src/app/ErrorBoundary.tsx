import { t } from '@letterncms/sdk'
import { Component, type ReactNode } from 'react'
import { Button, EmptyState } from '../ui'

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
      <EmptyState
        icon="warning"
        title={t('Something went wrong')}
        description={this.state.error.message}
        action={
          <Button size="sm" onClick={() => this.setState({ error: null })}>
            {t('Try Again')}
          </Button>
        }
        className="h-full min-h-60"
      />
    )
  }
}
