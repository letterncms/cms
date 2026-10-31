import { t } from '@letterncms/sdk'
import { Component, type ReactNode } from 'react'
import { Button } from './Button'
import { WidgetMessage } from './Widget'

/** A plugin failure stays local, wherever its component is embedded. */
export class ComponentBoundary extends Component<{ label: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error(`[cms] component “${this.props.label}” crashed`, error) }
  render() {
    if (!this.state.error) return this.props.children
    return <WidgetMessage icon="warning" title={t('{widget} ran into a problem', { widget: this.props.label })} action={<Button size="xs" onClick={() => this.setState({ error: null })}>{t('Try Again')}</Button>} />
  }
}
