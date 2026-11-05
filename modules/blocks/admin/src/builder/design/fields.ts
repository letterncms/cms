import type { StyleField } from './StyleFields'

/** A row that takes a name of the vocabulary: the property's tokens, nothing else. */
export const tok = (handle: string, label: string, extra: Partial<StyleField> = {}): StyleField => ({ handle, type: 'text', component: 'blocks-token', label, ...extra })

/** A row that takes a color of the vocabulary. */
export const col = (handle: string, label: string, extra: Partial<StyleField> = {}): StyleField => ({ handle, type: 'color', component: 'blocks-color', label, ...extra })

/** A row of keyword buttons. */
export const seg = (handle: string, label: string, options: { value: string; label?: string; icon?: string; title?: string }[], extra: Partial<StyleField> = {}): StyleField => ({ handle, type: 'select', display: 'segmented', block: true, size: 'sm', label, options, ...extra })
