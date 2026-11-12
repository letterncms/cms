import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { HighlightStyle, bracketMatching, indentOnInput, syntaxHighlighting, syntaxTree, syntaxTreeAvailable } from '@codemirror/language'
import { diagnosticCount, linter, lintGutter, lintKeymap, type Diagnostic } from '@codemirror/lint'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, type Extension } from '@codemirror/state'
import { EditorView, drawSelection, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, keymap, lineNumbers, placeholder as placeholderText } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { t } from '@letterncms/sdk'

/**
 * The code editor CodeEditor loads on first use, so the admin's first paint never carries it.
 * Its colours are the kit's tokens (`--cms-code-*` in tokens.css), so it follows light, dark and the accent.
 */

const languages: Record<string, () => Extension> = {
  css: () => css(),
  html: () => html(),
  javascript: () => javascript(),
  js: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  ts: () => javascript({ typescript: true }),
  json: () => json(),
}

/**
 * Mistakes in the code, as its language's parser finds them: what it couldn't read, what is missing,
 * and in HTML a closing tag that closes nothing. Shown underlined, with the reason on hover.
 */
const mistakes = linter((view) => {
  const found: Diagnostic[] = []
  // A parse still under way ends where it stopped, which reads as a mistake: wait until it has read everything.
  if (!syntaxTreeAvailable(view.state)) return found
  const doc = view.state.doc
  syntaxTree(view.state).cursor().iterate((node) => {
    if (found.length >= 100) return false
    if (node.type.isError) {
      const text = doc.sliceString(node.from, Math.min(node.to, node.from + 24)).split('\n')[0].trim()
      // A missing piece has no width: it is marked on the character where it should have been.
      const from = node.from === node.to && node.from > 0 && node.from === doc.lineAt(node.from).to ? node.from - 1 : node.from
      found.push({ from, to: Math.max(node.to, Math.min(from + 1, doc.length)), severity: 'error', message: text ? t('Unexpected “{text}”', { text }) : t('Something is missing here') })
    } else if (node.name === 'MismatchedCloseTag') {
      found.push({ from: node.from, to: node.to, severity: 'error', message: t('“{tag}” closes a tag that isn’t open', { tag: doc.sliceString(node.from, node.to) }) })
    }
  })
  return found
}, { delay: 400, needsRefresh: (update) => syntaxTree(update.state) !== syntaxTree(update.startState) })

const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.operatorKeyword, tags.modifier, tags.controlKeyword, tags.definitionKeyword, tags.moduleKeyword], color: 'var(--cms-code-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp, tags.attributeValue], color: 'var(--cms-code-string)' },
  { tag: [tags.number, tags.bool, tags.null, tags.atom, tags.unit, tags.color], color: 'var(--cms-code-number)' },
  { tag: [tags.propertyName, tags.attributeName, tags.definition(tags.propertyName)], color: 'var(--cms-code-property)' },
  { tag: [tags.tagName, tags.className, tags.labelName], color: 'var(--cms-code-tag)' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.macroName], color: 'var(--cms-code-function)' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment], color: 'var(--cms-code-comment)', fontStyle: 'italic' },
  { tag: [tags.punctuation, tags.bracket, tags.angleBracket, tags.separator], color: 'var(--cms-muted)' },
  { tag: tags.invalid, color: 'var(--cms-danger)' },
])

const theme = EditorView.theme({
  '&': { color: 'var(--cms-text)', backgroundColor: 'transparent', height: '100%' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '20px', overflow: 'auto' },
  '.cm-content': { padding: '7px 0', caretColor: 'var(--cms-ink)' },
  '.cm-line': { padding: '0 10px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--cms-ink)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--cms-focus-soft)' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '&.cm-focused .cm-activeLine': { backgroundColor: 'var(--cms-hover)' },
  '.cm-selectionMatch': { backgroundColor: 'var(--cms-signal-soft)' },
  '&.cm-focused .cm-matchingBracket': { backgroundColor: 'var(--cms-active)', outline: '1px solid var(--cms-border-strong)' },
  '.cm-placeholder': { color: 'var(--cms-ghost)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--cms-ghost)', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 4px 0 12px', minWidth: '28px' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--cms-muted)' },
  '.cm-tooltip': { backgroundColor: 'var(--cms-float)', color: 'var(--cms-text)', border: '1px solid var(--cms-border-float)', borderRadius: '8px', boxShadow: 'var(--cms-shadow-pop)', overflow: 'hidden' },
  '.cm-tooltip-autocomplete > ul': { fontFamily: 'var(--font-mono)', maxHeight: '220px' },
  '.cm-tooltip-autocomplete > ul > li': { padding: '2px 8px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: 'var(--cms-focus-soft)', color: 'var(--cms-ink)' },
  '.cm-completionIcon': { display: 'none' },
  '.cm-panels': { backgroundColor: 'var(--cms-surface)', color: 'var(--cms-text)', borderColor: 'var(--cms-border)' },
  '.cm-searchMatch': { backgroundColor: 'var(--cms-signal-soft)' },
  '.cm-lintRange-error': { backgroundImage: 'none', textDecoration: 'underline wavy var(--cms-danger)', textDecorationSkipInk: 'none', textUnderlineOffset: '3px' },
  '.cm-tooltip-lint': { padding: '0' },
  '.cm-diagnostic': { padding: '6px 10px', fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: '16px' },
  '.cm-diagnostic-error': { borderLeft: '2px solid var(--cms-danger)' },
  '.cm-lint-marker-error': { content: 'none' },
  '.cm-gutter-lint': { width: '14px' },
  '.cm-gutter-lint .cm-gutterElement': { padding: '0 0 0 6px' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'var(--cms-focus-soft)', outline: '1px solid var(--cms-focus)' },
})

export interface EditorOptions {
  parent: HTMLElement
  value: string
  language?: string
  placeholder?: string
  disabled?: boolean
  /** The large editor: line numbers, no wrapping. */
  full?: boolean
  label?: string
  id?: string
  describedBy?: string
  onChange: (value: string) => void
  onFocus: (focused: boolean) => void
  /** How many mistakes the code has now. */
  onErrors: (count: number) => void
}

export interface Editor {
  setValue: (value: string) => void
  setDisabled: (disabled: boolean) => void
  focus: () => void
  destroy: () => void
}

export function createEditor(options: EditorOptions): Editor {
  const editable = new Compartment()
  const lock = (disabled: boolean) => [EditorView.editable.of(!disabled), EditorState.readOnly.of(disabled)]
  const attributes: Record<string, string> = { spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off' }
  if (options.label) attributes['aria-label'] = options.label
  if (options.id) attributes.id = options.id
  if (options.describedBy) attributes['aria-describedby'] = options.describedBy
  const view = new EditorView({
    parent: options.parent,
    state: EditorState.create({
      doc: options.value,
      extensions: [
        options.full ? [lintGutter(), lineNumbers(), highlightActiveLineGutter()] : EditorView.lineWrapping,
        highlightSpecialChars(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ icons: false }),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...completionKeymap, ...lintKeymap, indentWithTab]),
        EditorState.tabSize.of(2),
        syntaxHighlighting(highlight),
        theme,
        languages[options.language ?? ''] ? [languages[options.language ?? '']!(), mistakes] : [],
        options.placeholder ? placeholderText(options.placeholder) : [],
        EditorView.contentAttributes.of(attributes),
        editable.of(lock(!!options.disabled)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) options.onChange(update.state.doc.toString())
          if (update.focusChanged) options.onFocus(update.view.hasFocus)
          const errors = diagnosticCount(update.state)
          if (errors !== diagnosticCount(update.startState)) options.onErrors(errors)
        }),
      ],
    }),
  })
  return {
    setValue: (value) => {
      const current = view.state.doc.toString()
      if (value !== current) view.dispatch({ changes: { from: 0, to: current.length, insert: value } })
    },
    setDisabled: (disabled) => view.dispatch({ effects: editable.reconfigure(lock(disabled)) }),
    focus: () => view.focus(),
    destroy: () => view.destroy(),
  }
}
