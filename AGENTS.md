# cms

The kernel, package `letterncms/cms`: `src/`, `modules/` (what the admin is made of, including `admin`), `admin-sdk/`, `brand/`, `stubs/site/` (the files every site starts with). `README.md` says how to run it from a clean clone.

- `composer test` needs no Node and no plugins: tests that turn on a plugin skip themselves here. Those plugins' own repositories cover the rest.
- `pnpm build`, `pnpm typecheck` (the build doesn't typecheck) and `pnpm test` for the admin; `pnpm test:browser` runs its fixture checks in headless Chrome.

## Rules

- **The product's name in code is data:** `{brand}` or `:brand` in translated strings, `cms_brand()` in PHP, `brand()` in the admin, from `brand/brand.json`. Identifiers use the permanent prefix `cms` and the permanent vendor `letterncms`.
- **The core never names a plugin's classes.** Plugins depend down, on this package, not the other way around.
- **No plan files.** No specs, research or progress notes in the repository. Decisions go in commit messages.
- **Keep it true.** `letterncms/docs` describes the product as it is after your change.
- A change people can see or use gets a line under `## Unreleased` in `CHANGELOG.md`, written for the reader, starting with `**Breaking.**` when it breaks something.
