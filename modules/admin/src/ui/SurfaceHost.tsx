import { lazy, Suspense } from 'react'
import type { SurfaceProps } from './Surface'
import { Widget } from './Widget'
import { ComponentBoundary } from './ComponentBoundary'

// Other CMS screens do not download the generation runtime until they need a surface.
const Renderer = lazy(() => import('./Surface').then((module) => ({ default: module.Surface })))

export function Surface(props: SurfaceProps) {
  return <ComponentBoundary key={props.document.id} label={props.document.title}><Suspense fallback={<Widget title={props.document.title} loading />}><Renderer {...props} /></Suspense></ComponentBoundary>
}
