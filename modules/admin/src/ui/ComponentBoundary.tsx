import { t } from '@letterncms/sdk'
import { Component, type ReactNode } from 'react'
import { QueryError } from './QueryError'

/** A plugin failure stays local, wherever its component is embedded. */
export class ComponentBoundary extends Component<{ label: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error(`[cms] component “${this.props.label}” crashed`, error) }
  render() {
    if (!this.state.error) return this.props.children
    return <QueryError compact message={t('{widget} ran into a problem', { widget: this.props.label })} onRetry={() => this.setState({ error: null })} />
  }
}
