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
| Empty | `EmptyState` (`compact` in a panel or widget), a title and one action, no sentence explaining it; `NoMatches` when a search or filter finds nothing; `NotFoundState` when the thing isn't there. |
| Alert | `Notice` on a screen or in a dialog; `Banner` above the sheet, for the shell only; `toast` for the result of an action. |
| Loading | `Skeleton` in the shape of what is coming; `Spinner` where there is no shape; `loading` on the `Button` that started it. |

- Use `Button` and `IconButton`, never a raw `<button>`. An `IconButton` needs a `label`.
- Use the tokens in `modules/admin/src/styles/theme.css`: `text-2xs` to `text-3xl` and `text-display`, `rounded-xs` to `rounded-xl`, the named colours and shadows, `duration-fast|base|move|slow`, `z-raised|drag|sticky|bar|drawer|overlay|tooltip`. A new token goes in `styles/tokens.css` with a dark value.
- `./dev check` fails on exactly these in admin code: a raw `<button`, `text-[…]`, `rounded-[…]`, `z-[…]` and `z-10`, `duration-[…]` and `duration-150`, `shadow-[…]`, `bg-[…]`, and hex colours. A justified exception goes in `workspace/tools/ui-lint-allow.txt` with its reason; that file only shrinks (`node tools/ui-lint.mjs --prune`), never grows for new code.
- Focus is a 2px line of the focus colour: leave the default ring on a button, inset it on a row or a tab (`-outline-offset-2`), and give a field `cms-input`. `outline-none` only where the focus shows another way or on a popup that hands the focus on. A menu item under the arrow keys shows its fill, no ring.
- `Button` is 44px to hit on a touch screen whatever its size; a control of your own needs the same.
- Look at what you built in light, dark and at phone width before the pull request.

Copy:

- Labels, headings, buttons and menu items in Title Case: "Add Field", "Clear Filters".
- Messages and descriptions in sentence case, ending in a period when they are a sentence.
- Short status lines in sentence case without a period: "No matches", "Unsaved changes", "Your dashboard is empty".
- Buttons start with a verb and name what they do: "Delete Page", never "OK", "Yes" or "Confirm".
- Retry is always "Try Again". An empty search is always "No matches".
- Every string goes through `t()`, with a translation in each `lang/*.json`: `./dev i18n`, then `./dev check`.
