# cms

The kernel, package `letterncms/cms`: `src/`, `modules/` (what the admin is made of, including `admin`), `admin-sdk/`, `brand/`, `stubs/site/` (the files every site starts with). `README.md` says how to run it from a clean clone.

- `composer test` needs no Node and no plugins: tests that turn on a plugin skip themselves here. Those plugins' own repositories cover the rest.
- `pnpm build`, `pnpm typecheck` (the build doesn't typecheck) and `pnpm test` for the admin; `pnpm test:browser` runs its fixture checks in headless Chrome.

## Rules

- **The product's name in code is data:** `{brand}` or `:brand` in translated strings, `cms_brand()` in PHP, `brand()` in the admin, from `brand/brand.json`. Identifiers use the permanent prefix `cms` and the permanent vendor `letterncms`.
- **The core never names a plugin's classes.** Plugins depend down, on this package, not the other way around.
- A change people can see or use gets a line under `## Unreleased` in `CHANGELOG.md`, written for the reader, starting with `**Breaking.**` when it breaks something.

## Admin UI

Build screens from `@letterncms/ui` (`modules/admin/src/ui`). One component per pattern; never draw a second one.

| Pattern | Use |
|---|---|
| Page header | `Page` (`crumbs`, `actions`); `Topbar` in an editor. No second title and no line explaining the screen. Groups are `Section`. |
| List | `DataView` for records (search, sort, selection, views); `List` with `Row` for a short plain list. |
| Form | `Fields` from field definitions; `Field` around a control of your own. In a dialog: `Dialog` with `onSubmit` and `submitLabel`. |
| Save | `SaveBar`. No Save button on a screen. |
| Destructive action | `<Button variant="destructive">`, then `confirm({ title, confirm: t('Delete'), danger: true })`. `variant="danger"` is only that confirm's last button. In a menu: an item with `danger`. |
| Error | `QueryError` (`title`, `message`, `onRetry`, `retrying`; `compact` in a panel or widget). `message` is plain words for the person: an exception's text goes to the console. Never `EmptyState` with a warning icon. A field's own error is `Field`'s `error`. |
| Empty | `EmptyState` (`compact` in a panel, a widget or a dialog): a title and one action. It takes no sentence, and nothing is drawn as bare words instead. `NoMatches` only when someone searched or filtered and nothing was found: a list with nothing in it at all is an `EmptyState`. `NotFoundState` when the thing isn't there. |
| Alert | `Notice` on a screen or in a dialog; `Banner` above the sheet, for the shell only; `toast` for the result of an action. |
| Loading | `Skeleton` in the shape of what is coming; `Spinner` where there is no shape; `loading` on the `Button` that started it. |

- Use `Button` and `IconButton`, never a raw `<button>`. An `IconButton` needs a `label`.
- Use the tokens in `modules/admin/src/styles/theme.css`: `text-2xs` to `text-3xl` and `text-display`, `rounded-xs` to `rounded-xl`, the named colours and shadows, `duration-fast|base|move|slow`, `z-raised|drag|sticky|bar|drawer|overlay|tooltip`. A new token goes in `styles/tokens.css` with a dark value.
- `./dev check` fails on exactly these in admin code: a raw `<button`, `text-[…]`, `rounded-[…]`, `z-[…]` and `z-10`, `duration-[…]` and `duration-150`, `shadow-[…]`, `bg-[…]`, and hex colours. A justified exception goes in `workspace/tools/ui-lint-allow.txt` with its reason; that file only shrinks (`node tools/ui-lint.mjs --prune`), never grows for new code.
- Focus is a 2px line of the focus colour: leave the default ring on a button, inset it on a row or a tab (`-outline-offset-2`), and give a field `cms-input`. `outline-none` only where the focus shows another way or on a popup that hands the focus on. A menu item under the arrow keys shows its fill, no ring.
- `Button` is 44px to hit on a touch screen whatever its size, and so are a `Segmented` option and a tab; a control of your own needs the same (`cms-touch`).
- Actions that show only when a row is pointed at are `cms-reveal` inside a `cms-reveal-row` (`Row` and `DataView` do it for you): they also show when the row holds the focus or has a menu open, and always on a touch screen. Never `opacity-0 group-hover:opacity-100` by hand.
- Look at what you built in light, dark and at phone width before the pull request.

Copy:

- Labels, headings, buttons and menu items in Title Case: "Add Field", "Clear Filters".
- Messages and descriptions in sentence case, ending in a period when they are a sentence.
- Short status lines in sentence case without a period: "No matches", "Unsaved changes", "Your dashboard is empty".
- Buttons start with a verb and name what they do: "Delete Page", never "OK", "Yes" or "Confirm".
- Retry is always "Try Again". An empty search is always "No matches".
- One word for one act, on every screen:
  - **New** makes a record of its own that then stands in a list (New Page, New Collection, New Role, New Token, New Menu); the dialog's button is "Create Page". **Add** puts one more part into the thing on screen, or picks from what exists (Add Field, Add Link, Add Widget, Add Language, Add Plugin); its button repeats it, "Add Field". Never a bare "Create", "Add" or "Continue".
  - **Delete** ends something for good (a page, a collection, a role, a file). **Remove** takes it out of where it is while it lives on, or was only a part (a widget from the dashboard, a file from a field, a person from a page, a filter). A plugin is uninstalled: "Uninstall".
  - **Rename** changes a name where it stands (a menu item, a dialog whose button is "Rename"): not "Edit Name" or "Change Name".
  - A handle that moves a row is "Drag to Reorder".
- A search field says "Search", or "Search Pages" where it has a list of its own: Title Case, no ellipsis.
- Every string goes through `t()`, with a translation in each `lang/*.json`: `./dev i18n`, then `./dev check`.
