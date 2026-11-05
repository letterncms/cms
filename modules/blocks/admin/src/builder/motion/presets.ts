import { t } from '@letterncms/sdk'
import type { MotionDef, MotionStep } from '../../core/types'

export interface Preset {
  name: string
  group: 'appear' | 'scroll' | 'hover' | 'loop' | 'load' | 'event'
  text?: boolean
  make: () => Omit<MotionDef, 'id'>
}

export const groupLabel = (group: Preset['group']) => ({ appear: t('Appear'), scroll: t('Scroll'), hover: t('Hover and Press'), loop: t('Loop'), load: t('Page Load'), event: t('On Event') })[group]

const ease = 'out'

/** One-click starting points, in the theme's durations and easings; everything stays editable afterwards. */
export const presets = (): Preset[] => [
  { name: t('Fade In'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { opacity: '0' }, duration: 'slow', ease }] }) },
  { name: t('Fade Up'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { opacity: '0', y: 'xl' }, duration: 'slower', ease: 'expo' }] }) },
  { name: t('Slide in from Left'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { opacity: '0', x: '-2xl' }, duration: 'slower', ease: 'expo' }] }) },
  { name: t('Scale In'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { opacity: '0', scale: '90' }, duration: 'slow', ease: 'emphasized' }] }) },
  { name: t('Blur In'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { opacity: '0', blur: 'lg', y: 'sm' }, duration: 'slower', ease }] }) },
  { name: t('Reveal (Wipe Up)'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'self', from: { clipPath: 'hidden-down' }, to: { clipPath: 'visible' }, duration: 'slowest', ease: 'expo' }] }) },
  { name: t('Children one by one'), group: 'appear', make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'children', from: { opacity: '0', y: 'lg' }, duration: 'slow', ease, stagger: 'fastest' }] }) },
  { name: t('Words Rise'), group: 'appear', text: true, make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'words', from: { opacity: '0', y: 'md' }, duration: 'slow', ease, stagger: 'fastest' }] }) },
  { name: t('Words Slide Up (Masked)'), group: 'appear', text: true, make: () => ({ trigger: { type: 'appear' }, steps: [{ target: 'words', mask: true, from: { y: 'full' }, duration: 'slower', ease: 'expo', stagger: 'fastest' }] }) },

  { name: t('Parallax'), group: 'scroll', make: () => ({ trigger: { type: 'scroll', start: 'top bottom', end: 'bottom top' }, steps: [{ target: 'self', from: { y: '-3xl' }, to: { y: '3xl' }, ease: 'linear', duration: 'base' }] }) },
  { name: t('Zoom While Scrolling'), group: 'scroll', make: () => ({ trigger: { type: 'scroll', start: 'top bottom', end: 'center center' }, steps: [{ target: 'self', from: { scale: '90', borderRadius: '2xl' }, to: { scale: '100', borderRadius: 'none' }, ease: 'linear', duration: 'base' }] }) },
  { name: t('Fade Through'), group: 'scroll', make: () => ({ trigger: { type: 'scroll', start: 'top 90%', end: 'top 40%' }, steps: [{ target: 'self', from: { opacity: '0', y: '2xl' }, to: { opacity: '100', y: '0' }, ease: 'linear', duration: 'base' }] }) },
  { name: t('Highlight Words'), group: 'scroll', text: true, make: () => ({ trigger: { type: 'scroll', start: 'top 80%', end: 'bottom 50%' }, steps: [{ target: 'words', from: { opacity: '20' }, to: { opacity: '100' }, ease: 'linear', duration: 'base', stagger: 'faster' }] }) },
  { name: t('Rotate While Scrolling'), group: 'scroll', make: () => ({ trigger: { type: 'scroll' }, steps: [{ target: 'self', from: { rotate: '-6' }, to: { rotate: '6' }, ease: 'linear', duration: 'base' }] }) },
  { name: t('Slide Sideways'), group: 'scroll', make: () => ({ trigger: { type: 'scroll' }, steps: [{ target: 'self', from: { x: 'vw-10' }, to: { x: '-vw-10' }, ease: 'linear', duration: 'base' }] }) },

  { name: t('Lift'), group: 'hover', make: () => ({ trigger: { type: 'hover' }, steps: [{ target: 'self', to: { y: '-2xs' }, duration: 'fast', ease }] }) },
  { name: t('Grow'), group: 'hover', make: () => ({ trigger: { type: 'hover' }, steps: [{ target: 'self', to: { scale: '105' }, duration: 'fast', ease }] }) },
  { name: t('Zoom Image Inside'), group: 'hover', make: () => ({ trigger: { type: 'hover' }, steps: [{ target: 'children', to: { scale: '105' }, duration: 'slow', ease: 'emphasized' }] }) },
  { name: t('Press'), group: 'hover', make: () => ({ trigger: { type: 'press' }, steps: [{ target: 'self', to: { scale: '95' }, duration: 'fastest', ease: 'swift' }] }) },

  { name: t('Float'), group: 'loop', make: () => ({ trigger: { type: 'loop' }, repeat: -1, yoyo: true, steps: [{ target: 'self', to: { y: '-xs' }, duration: 'glacial', ease: 'in-out' }] }) },
  { name: t('Spin'), group: 'loop', make: () => ({ trigger: { type: 'loop' }, repeat: -1, steps: [{ target: 'self', to: { rotate: '180' }, duration: 'glacial', ease: 'linear' }] }) },
  { name: t('Pulse'), group: 'loop', make: () => ({ trigger: { type: 'loop' }, repeat: -1, yoyo: true, steps: [{ target: 'self', to: { scale: '105' }, duration: 'slowest', ease: 'in-out' }] }) },

  { name: t('Intro: Fade Up'), group: 'load', make: () => ({ trigger: { type: 'load' }, steps: [{ target: 'self', from: { opacity: '0', y: 'lg' }, duration: 'slower', ease: 'expo', delay: 'faster' }] }) },
  { name: t('Intro: Words'), group: 'load', text: true, make: () => ({ trigger: { type: 'load' }, steps: [{ target: 'words', mask: true, from: { y: 'full' }, duration: 'slower', ease: 'expo', stagger: 'fastest' }] }) },
  { name: t('Intro: Children'), group: 'load', make: () => ({ trigger: { type: 'load' }, steps: [{ target: 'children', from: { opacity: '0', y: 'md' }, duration: 'slow', ease, stagger: 'faster' }] }) },

  { name: t('Open (Fade and Scale)'), group: 'event', make: () => ({ trigger: { type: 'event' }, steps: [{ target: 'self', from: { opacity: '0', scale: '95' }, duration: 'fast', ease: 'swift' }] }) },
  { name: t('Slide in Panel'), group: 'event', make: () => ({ trigger: { type: 'event' }, steps: [{ target: 'self', from: { x: 'full' }, duration: 'base', ease: 'swift' }, { target: 'children', from: { opacity: '0', x: 'lg' }, duration: 'base', ease, stagger: 'fastest' }] as MotionStep[] }) },
]

export const triggers = (): Record<string, { label: string; icon: string; help: string }> => ({
  appear: { label: t('Appear'), icon: 'b-eye', help: t('Plays once as it scrolls into view.') },
  scroll: { label: t('Scroll'), icon: 'b-mouse-scroll', help: t('Follows the scroll between a start and an end point.') },
  hover: { label: t('Hover'), icon: 'b-hand-pointing', help: t('Plays on hover and focus, reverses after.') },
  press: { label: t('Press'), icon: 'b-hand-tap', help: t('Plays while pressed.') },
  load: { label: t('Page Load'), icon: 'b-rocket-launch', help: t('Plays as the page paints, with no script. Its delay and stagger are capped, so it can’t hold the page back.') },
  loop: { label: t('Loop'), icon: 'b-arrows-clockwise', help: t('Stops within 5 seconds, unless it repeats forever. Then the page needs a Motion Toggle block.') },
  event: { label: t('On Event'), icon: 'b-broadcast', help: t('Plays from a “Play animation” action in Events.') },
})

export const propertyLabels = (): Record<string, string> => ({
  opacity: t('Opacity'), x: t('Move X'), y: t('Move Y'), z: t('Move Z'), scale: t('Scale'), scaleX: t('Scale X'), scaleY: t('Scale Y'),
  rotate: t('Rotate'), rotateX: t('Rotate X (3D)'), rotateY: t('Rotate Y (3D)'), skewX: t('Skew X'), skewY: t('Skew Y'), blur: t('Blur'), brightness: t('Brightness'), grayscale: t('Grayscale'),
  clipPath: t('Reveal'), backgroundColor: t('Fill'), color: t('Text Color'), borderColor: t('Border Color'), borderRadius: t('Radius'), boxShadow: t('Shadow'),
  letterSpacing: t('Letter Spacing'), transformOrigin: t('Origin'), perspective: t('Perspective'),
})
