# Changelog

## Unreleased

### Added

- **Code beside the design**: ES modules in `content/design/scripts/` and stylesheets in `content/design/styles/` load on every page, with a template or with a component (`content/design/code.json`), or with one block (`code: {scripts, styles}`). One script imports another by path; each file is published with a hash in its name and cached forever, and changing one rebuilds only the pages that load it. `custom.css` and `custom.js` stay as they are. Agents use `design-code/list`, `design-code/get`, `design-code/save`, `design-code/delete` and `design-code/set-load`, and read `cms://site/code`.
- **Libraries without a bundler**: `cms vendor add gsap@3.12.5` fetches a package's ES module at one exact version from jsDelivr into `content/design/vendor/`, records its version and hash in `content/design/vendor/lock.json`, and puts it in the import map of pages that load a script, so scripts write `import gsap from "gsap"`. `--file=` takes one file of a package and `--as=` names the import; `cms vendor list`, `remove` and `update` do the rest, as do the abilities `design-vendor/list`, `design-vendor/create`, `design-vendor/delete` and `design-vendor/update`. The site serves the files itself: a build that would still import from the CDN or another address is refused, and a file that no longer matches its hash is not published. What a library requests once it runs is up to the library.
- **Block behaviours**: any block or component names a script of the design with `behavior: {module, props, when}`. The site calls the script's `mount(el, props, {token, reducedMotion, signal})` when the element is in the document and what it returns (and `unmount(el)`) when it leaves, also when a script or a page transition changes the page. `token('color.primary')` reads the design where the element is, `when: "visible"` waits until the element is about to be seen, and text in `props` can name data (`"{props.speed}"`). This is where GSAP, Three.js or Lenis attach.
- **Navigation without page loads**: with `navigation: "client"` in the design's `transition`, links to pages of the site fetch the page and swap it in inside the view transition. Blocks with `persist: "<name>"` stay the same element across pages, so a WebGL canvas keeps drawing and audio keeps playing. Scripts get `cms:before-leave` (cancelable, and `event.detail.waitUntil(promise)` holds the swap) and `cms:after-enter`, and `window.cmsNavigate.go(url)` and `.prefetch(url)`. Scroll positions come back with Back and Forward, focus moves to the new page's main content and its title is announced, and links are fetched when the pointer rests on them, except links with a query string and paths a plugin excludes (`site.navigate.skip`), which always load the page. Pages stay the static HTML they were: without JavaScript every link loads its page.
- **Motion**: a scroll animation can pin its element (`trigger.pin: "150vh"`: it holds at the top of the screen for that much scrolling while its steps play) and trail the scroll (`trigger.scrub: 0.6`). Steps can target `chars` (letters, split inside their words; the block is still read as its text by screen readers) and `lines` (real lines for appear, hover, press and event). Text in a script that joins its letters, such as Arabic, and text with links in it animate by word instead. An `ease` can be a curve of the design: `token:ease.<name>`. Scroll animations stay CSS where the browser has scroll-driven animations; a small script now moves the same keyframes where it hasn't. All of it is off for people who ask for less motion.
- New sites come with one block behaviour: a soft light behind the home page's first section that follows the pointer (`content/design/scripts/spotlight.js` and `content/design/styles/spotlight.css`). It shows where a site's own scripts and styles go and how a block names them; delete the two files and the block's `behavior` and `code` to be rid of it.
- **Media** keeps what scenes and animation players load: 3D models (`.glb`, and `.gltf` with its data embedded), environment maps (`.hdr`), GPU textures (`.ktx2`), Lottie animations (`.json`) and Rive files (`.riv`). Each is recognised by its contents and has a size limit of its own (64, 8, 32, 32, 4 and 16 MB). A Lottie animation with expressions, fonts to load or images that aren't embedded, and a model that points at other files, are refused with the reason, also when the file arrives by git or FTP. Every site, existing ones included, serves media with the right type, `nosniff` and a long cache from a `public/media/.htaccess` the CMS writes and keeps current.
- `SafeFetcher::post()` sends a body as it is with the caller's own headers, such as a signature, and can keep the start of a long answer instead of refusing it. `SafeFetcher::isPublic()` says whether an address is on the public internet. Plugins that call other servers use these instead of a check of their own.
- `collections/schema` and the MCP resource `cms://collections/{handle}/schema` give one collection's JSON Schema: what an entry's `data` must follow as a draft and to be published, and the whole input of `entries/create` and `entries/update` for that collection. Every collection an ability answers with carries its `schema`. Resources can be families now (`cms()->context()->template()`), listed by MCP's `resources/templates/list`.
- `navigation/remove-item` removes one item of a menu by its id, with what is nested under it, beside `navigation/add-item`.
- Dry runs: every ability that changes something takes `dryRun: true` (`cms run … --dry-run`). Nothing is written, run or recorded, and the answer is `{dryRun, ability, checked, input, changes}`. `checked` says how far it went: `"full"` when the dry run is refused exactly where the real run would be and `changes` lists what would change or be removed, `"input"` when only the input and your permission were checked (`changes` is null, and the real run may still refuse). Entries (create, update, publish, unpublish, discard, delete, duplicate, move, reorder, restore, `pages/customize`), `settings/update` and every ability marked destructive or asking first (deleting a collection, file, user, global set, menu, comment, chat or token, removing a language, switching or uninstalling a plugin, starting or undoing a sync) are checked in full, by the same code the real run uses. A plugin's ability says the same with a `dryRun` callback; `Cms\Content\Entries\EntryService::dry()` runs entry writes without making them. In the workspace and for the assistant a dry run is shown as a check, not as a change.
- Every ability says what it answers with: an `output` JSON Schema beside its `input`, in `abilities/list`, `GET /api/v1/abilities`, `cms run --list --json` and as each MCP tool's `outputSchema`. Plugins write it the short way with `Cms\Support\Schema\Shape`. The tests hold every result against its schema, key for key.

### Changed

- **Breaking.** For plugins: `cms()->navigation()` (the admin's sidebar) is `cms()->adminNav()`, and `cms()->content()` (where entries are written) is `cms()->entryService()`; `entries()` still reads them. Settings are read with one word: `cms()->setting($namespace, $key = null, $default = null)` gives one value of a namespace, or all of them without a key (it was `cms()->settings(…)`), and a plugin reads its own namespace with `$this->setting($key = null, $default = null)` (it was `$this->settings(…)`). `settingsRegistry()` still registers and saves settings.
- **Breaking.** `patterns/list` and `patterns/save` are `components/list` and `components/save`, named after the `components` collection whose entries they list and save.
- **Breaking.** Every command takes `--json`: it then prints one JSON document and nothing else, `{"data": …}` when it worked and `{"error": {"type", "message", "details"}}` with a non-zero exit when it didn't, the same shape the REST API answers with, and it never asks a question (`pull`, `push` and `sync:undo` need `--yes`). That holds before a command starts too: an unknown command, or a site that cannot boot, is the same document, for `cms run` also without `--json`. Something unexpected is logged and said as “The command failed.”, not as its internals. `cms run` always answers this way, so its result is under `data` and a failure is the error document instead of a line of text; its input as one JSON object is `--input='{…}'` (was `--json=`). `license:status --json` and `media:check --json` print their report under `data`.
- **Breaking.** Abilities are named `thing/verb`, and a verb means the same on every thing: `list`, `get`, `get-many` (several by id), `create`, `update`, `delete`; `save` only creates or replaces a definition by its handle (`collections/save`, `fieldsets/save`, `globals/save`, `components/save`, `user-fields/save`) or a script or stylesheet of the design by its path (`design-code/save`); every other verb is an act of its own, kept on a list a test holds. Renamed, without aliases: `navigation/save` → `navigation/update`, `navigation/add` → `navigation/add-item`, `languages/save` → `languages/update`, `languages/add` → `languages/create`, `languages/remove` → `languages/delete`, `languages/default` → `languages/set-default`, `languages/prefix` → `languages/set-prefix`, `entries/lookup` → `entries/get-many`, `media/lookup` → `media/get-many`, `users/lookup` → `people/list`, `entries/revisions` → `revisions/list`, `entries/revision` → `revisions/get`, `entries/restore` → `revisions/restore`, `globals/update` → `globals/set`, `users/fields` → `user-fields/get`, `users/fields-save` → `user-fields/save`, `pages/customise` → `pages/customize`, `packages/sync` → `packages/migrate`, `packages/stores` → `package-stores/list`, `packages/store-add` → `package-stores/create`, `packages/store-remove` → `package-stores/delete`, `assistant/resources` → `assistant-resources/list`, `assistant/resource` → `assistant-resources/get`, `tokens/revoke` → `tokens/delete`, `license/clear` → `license/delete`, `design/code` → `design-code/set-custom`. `design/code-files`, `-read`, `-write`, `-delete` and `-load` are `design-code/list`, `get`, `save`, `delete` and `set-load`, and `design/vendor-list`, `-add`, `-update` and `-remove` are `design-vendor/list`, `create`, `update` and `delete`. `site/get` is gone: `settings/get` with namespace `site` has the same. `navigation/update` changes a menu that exists and answers `not_found` for one that does not, where `navigation/save` made it: `navigation/create` makes a menu, and takes `handle`, `maxDepth` and `items` beside the title. `revisions/list` takes the entry as `entryId` (was `id`). A token scoped by pattern follows the new names: `entries/*` no longer reaches revisions (`revisions/*`), nor `users/*` the profile fields and `people/list`, nor `packages/*` the stores (`package-stores/*`), nor `design/*` the design's scripts, styles and libraries (`design-code/*`, `design-vendor/*`).
- **Breaking.** `cms sync` is `cms migrate`, and the `cms.sync` action that runs after it is `cms.migrated`: “sync” now only means the Sync module (`pull`, `push`, `sync:undo`, `sync:history`). `cms migrate` takes the place of the framework's command of that name and takes what that one is called with: `--force` (it never asks anyway), `--database`, `--step`, and `--path` with `--realpath` to run only the migrations named. `migrate:fresh`, `migrate:refresh`, `migrate:reset`, `migrate:rollback`, `migrate:status` and `migrate:install` work as before, on the core's tables and the packages', and `cms migrate` brings back whatever a rollback took, also for a package that is at its version. `cms packages:update` is `cms update`. Change deploy scripts that call the old names.
- **Breaking.** A field that fails validation in `entries/create`, `entries/update` and `entries/publish` is named by its path in the input, as the collection's schema has it, in a dry run too: `details` has `data.summary` where it had `summary`.
- **Breaking.** An answer's maps are JSON objects on every transport, also when empty: an entry without field values has `"data": {}` where it had `"data": []`. MCP: a tool's `structuredContent` is always an object, as its `outputSchema` says: a list is under `items` (an empty one too), a string, a number or nothing under `result`. `Ability::$output` is read with `output()`.
- **Design tokens**: motion and layering have small named scales that every admin module and plugin can use: `duration-fast`, `duration-base`, `duration-move` and `duration-slow`, and `z-raised`, `z-drag`, `z-sticky`, `z-bar`, `z-drawer`, `z-overlay` and `z-tooltip`. A transition without a duration takes `duration-base`. New colours for pointed-at and pressed fills (`ink-hover`, `danger-hover`, `signal-hover`, `float-hover` and their `-active`), `focus-hover`, `fill`, `border-hover` and `info`, the shadows `shadow-edge`, `shadow-focus` and `shadow-cursor`, and the size `text-display` for the title of an entry. The admin's own components use them, so dialogs, panels and toasts move at one speed.
- Everything that fails says so the same way, with **Try Again**: a list, a form, a widget, a screen, the admin itself. A crash says so in plain words and keeps its technical message for the console. Every search that finds nothing says **No matches**. Short status lines no longer end in a period.
- A button that deletes or removes something looks the same everywhere: red words, no fill, until you point at it.
- **Breaking.** `@letterncms/ui`: `WidgetMessage` is gone, use `<EmptyState compact>`. `QueryError` takes a `title` and `className`, its button says **Try Again**, and it is the one component for anything that failed. `Button` has `variant="destructive"` for the way into deleting something; `danger` stays the last step of its confirm.
- **Breaking.** `@letterncms/ui`: `confirm()` and `prompt()` require `confirm`, the label of the button that goes through with it, as a verb ("Delete", "Rename"): the "Confirm" and "OK" fallbacks are gone.
- The save bar's **Discard** and **Save** are the same buttons as everywhere else, its warning reads in the dark theme, and it no longer has a yellow dot: yellow is for publishing. `data-theme` on an element inside the admin sets that piece in the theme it names; `useTheme()` says which theme is on view.

### Removed

- **Breaking.** Style keys are CSS properties by their own names. The shorthands `direction`, `wrap`, `justify`, `align`, `paddingX`, `paddingY`, `marginX`, `marginY`, `radius`, `shadow`, `colSpan` and `bg` are no longer understood in a block's `style`, in `bind` (`style:<property>`) or in the design's element styles; write `flexDirection`, `flexWrap`, `justifyContent`, `alignItems`, `paddingInline`, `paddingBlock`, `marginInline`, `marginBlock`, `borderRadius`, `boxShadow`, `gridColumn` and `backgroundColor`. Styles saved through the CMS already hold the full names. A binding saved as `style:bg` or another shorthand was stored as written: it now does nothing until it is saved under the full name. `blocks/types` no longer lists `aliases`.

### Fixed

- `fieldsets/save` refuses a field of a type that does not exist, a handle used twice and fields nested too deep, as `collections/save` does. It checked handles only, so a fieldset could be saved that no collection could then import.
- A row of a list shows the focus ring when you reach it with the keyboard, and a field that has the focus is clear to see in the dark theme.
- On a touch screen every button is at least 44px to hit, whatever its size, and a dialog's buttons on a phone are 44px tall with more room between and under them.

### Security

- **Breaking.** The CMS no longer uses a proxy from the server's environment (`http_proxy`, `https_proxy`, `ALL_PROXY`) for anything it fetches: updates, the store, remote media, fonts, Sync. A proxy would connect to an address nobody checked. A server that can only reach the internet through a proxy can no longer fetch these.
- Everything the CMS fetches goes only to public addresses, judged more strictly: shared, multicast and site-local ranges and the IPv6 forms that carry an IPv4 address (IPv4-compatible, local-use NAT64, 6to4, Teredo) are refused, an IPv4-mapped or NAT64 address is judged as the IPv4 address it carries, and the address the connection really reached is checked against the one that was vetted before anything is sent.
- `packages/plan-install` no longer answers with the license token: for a paid package its `access` carried the `X-Cms-License` header and query the download is fetched with. It now has only `allowed`, `reason`, `message` and `buy_url`, as the catalog does.

## 0.21.0 (2026-11-11)

### Changed

- **Pages**: the pages a feature brings, like sign-in and checkout, have a tab beside your own pages, one per feature (**Site**, **Account**, **Market**, and any plugin's), instead of a section under the list. Each tab is the same list: search, the same columns and the same statuses, where **Standard** is the version the feature ships and **Changes** means your version waits to be published.
- Clicking a built-in page opens it in the editor, made from its standard version the first time. **Use Standard Version** in its ⋯ menu deletes your version and goes back to the standard one. Back from the editor returns to its tab.
- **Breaking.** `ui/records` no longer takes `appendix`: a list of other rows is a `ui/tab` of its own. `pages/builtin` takes a `group` and says for each page its `displayStatus`, dates, `version`, `href` and whether it opens (`opens`) or can go back to standard (`restorable`); each group has its `total`.

### Fixed

- Lists that are a tree, like **Pages**, keep their 40px rows when the table is too narrow for every column: the drag handle no longer counts as a column that gives way, which wrapped each row's actions onto a second line.
- A list's `key` (the field that tells its rows apart) is used; rows were always told apart by `id`.
- A `ui/records` list's `at` finds its rows in an answer that is itself a list.

## 0.20.2 (2026-11-11)

### Fixed

- **Templates**: **Offered For** lists the sign-in and account pages, and any other pages that pick a template, so a template made for them saves instead of saying the collection must be one of the others.

## 0.20.1 (2026-11-07)

### Changed

- **Prose**: opening an element in **Elements in Prose** shows it in the preview, an article with every element prose can style; **+** offers just those.

### Fixed

- Prose styles text, not layout: a **Box** or **Repeat** inside prose drawn as a list or a link (a nav, tags, a card) no longer takes prose's list spacing or link underline. A box with paragraphs of its own spaces them once **Prose** is on for it too.

## 0.20.0 (2026-11-07)

### Changed

- **Design System**: an element's or a button's style shows only what it sets, and starts empty. **Add a Property** offers every property, Font, Size and Margin first, and each row's ⋯ removes it.
- Properties have short names that fit their row (**Decoration Color**, **Underline Offset**, **Snap Align**; **Duration**, **Delay** and **Easing** under Transition). A name that still doesn't fit, as in a translation, wraps beside its control instead of moving above it, in the inspector and the Design System.
- The Design System's style rows share the label column of its other rows.
- **Prose**: its element styles are **Elements in Prose**, which apply only there (Elements apply everywhere), and its preview shows every element you can style: lists, quotes, code, a picture with its caption, a table and a rule.

## 0.19.1 (2026-11-07)

### Fixed

- **Design System**: every row of an element's or a button's style has a ⋯ menu on hover: **Remove** for a property you added, **Reset** for a control that is set. A property you add keeps the same spacing as the rows above it, and **Shown On** lines up with them.

## 0.19.0 (2026-11-06)

### Added

- **Design System**: **Prose** is a section of its own. Set the space between blocks, before and after headings and between list items once, and every block in long-form text follows it, images and your own blocks too. A live sample shows the result.
- **Prose**, a switch under **Typography** in the Design tab of **Page Content** and **Box**, turns a block into long-form text. It replaces typing the `cms-prose` class, which still works.
- **Margin** (top and bottom) for element styles in the Design System, as a control.

### Changed

- The **CSS** section is gone, from the inspector and from the Design System. Each section's **+** adds a property it has no row for yet, such as **Scroll Snap Align** in **Size** or **Text Underline Offset** in **Typography**, with its own control; what you had set there shows in its section.
- **Page Content** looks the same in the editor and on the site. Without **Wrap in a Container**, its blocks join the layout around them, and its Design tab shows only the text styles that still reach them; with it, its own size and spacing apply, such as the margin above an article's text.
- The editor's top bar keeps **Chat**, the sidebar button and **Publish** together, instead of holding room for the widest publish label.

### Fixed

- Images, videos, embeds, quotes and lists in long-form text get the same space above them as paragraphs.

## 0.18.3 (2026-11-06)

### Fixed

- **Design**: Page Transition's inputs line up with the token rows below them, and a spacing of 0 no longer draws a stray line beside its ⋯ menu.

## 0.18.2 (2026-11-06)

### Fixed

- **Design**: the ⋯ menu of every token row (fonts, type scale, spacing, shape, motion) no longer slips past the edge of the panel, which also caused a horizontal scroll, when the panel is narrow.

## 0.18.1 (2026-11-06)

### Changed

- **Typography** has one list of **Fonts**: the roles your site uses (sans, display, mono…), each a row with a sample and its font. Its picker shows the fonts on your site, each in itself with its weights, adds one from Google Fonts or a .woff2 file, and removes one nothing uses. What a font falls back to is in the row's menu. Font Families and Font Files are gone.

## 0.18.0 (2026-11-06)

### Added

- **Shown On** on a button variant: the background it's made for, like a dark band, so the preview shows it there instead of on the page.

### Changed

- **Sizes** is its own section of the Design System, with a preview of fields, buttons and chips at each size.
- The previews of buttons, fields and sizes show their parts in one column, without cards, and mark the part being edited by its title. Buttons and Form Fields lose their note about sizes.

## 0.17.0 (2026-11-06)

### Added

- **Control Sizes**, under **Spacing**: one Small, Medium and Large scale (height, padding, text size) for buttons, form fields, tag fields and chips. A button and a field of the same size line up. They are `control` tokens (`control.md-height`…), and `data-size` picks the size on an element or anything around it.
- A Button with only an icon is square; **Shape** **Round** makes it a circle, or a labelled button a pill. **Name for Screen Readers** names an icon-only button.
- **Form Fields → Size and Spacing → Form Size** sets the size of fields in forms, and their send button follows.

### Changed

- **Breaking.** Button variants are looks only: a variant's height, padding and text size are ignored, and a Button's **Size** always applies. Move them to **Control Sizes**. Button variants lose their Height and Padding controls and gain Shadow.
- **Breaking.** `fields.field` no longer has `height`, `paddingX` or `fontSize`, nor `tags` and `chips` a `height`: fields take their size from the control sizes.
- **Breaking.** `button` is no longer an element style; buttons are styled by their variants.
- Disabled buttons use the same opacity as disabled fields. Chips in a List Filter are Small.

## 0.16.0 (2026-11-06)

### Added

- **Design System → Form Fields** styles every field on the site once: the forms you build, the account pages, the checkout, list filters and the Input block. **All Fields** sets the height, fill, border, radius and text every boxed field shares; then each state (hover, focus, invalid, disabled), labels and help, spacing, and each kind of field has its own row: dropdowns, text areas, checkboxes (mark shape, weight and size), radio buttons (dot or ring), switches, sliders, tag fields, chips and file pickers. Empty controls show what applies, from your tokens.
- On **Form Fields** and **Buttons**, the preview shows every kind of field, or every button variant, in each of its states and sizes, drawn by your site's stylesheet as you edit, in light or dark and at each screen width. Opening a row brings its part into view. You can click and type in it.
- Checkboxes, radio buttons, switches and sliders are drawn by the design system instead of the browser, so they match the site in light and dark.
- The **Input** block can be a **Switch** or a **Date**, and a slider fills its track up to the thumb.
- Agents set fields with `fields` in `design/update`; `design/get` describes every property as `fieldStyles`. Your own markup gets the same look with the classes `cms-input`, `cms-label`, `cms-check`, `cms-radio`, `cms-switch`, `cms-range`, `cms-tags` and `cms-chip`.

### Changed

- **Breaking.** `input`, `textarea`, `select` and `label` are no longer element styles in `tokens.json`: they are `fields` (`field` and `label`).
- Button variants are edited state by state (**Default**, **Hover**, **Pressed**, **Focus**), with **Height** and **Letter Spacing** controls.
- List Filter options shown as chips, and Filter Search and Filter Sort, look like the site's other fields.

## 0.15.0 (2026-11-06)

### Changed

- Filter Search and Filter Sort fields are white, the same height, and lighten their border on hover and focus. **Show Label** off hides a field's label from sight while screen readers still read it.

## 0.14.0 (2026-11-06)

### Changed

- **Plugins → Store** is redesigned: search and sort sit above the categories, featured plugins come first, every plugin is a card of the same size with its icon and maker, and a plugin opens on a page with its screenshots, description, changelog, what it needs and links to its docs and code. Price only shows as a filter once the store sells something.
- A store's catalog can name each plugin's icon and mark it featured, and its detail can carry captioned screenshots, requirements, release notes and links. Stores that don't still work as before.
- A List Filter's choice waits until it has two options, and its **All** counts items rather than values, so a plugin in two categories counts once.

## 0.13.0 (2026-11-05)

### Added

- A Dashboard widget can be drawn from a view: `view` gives it a tree of the same components as any place, built in PHP for whoever looks, with no admin build, and `action` the link in its header.

### Changed

- Plugins and Built In say what each one is again when another needs it: a lock beside its switch says "Needed by …" on hover or a press. A list's switch column can do the same with `reason`.

## 0.12.0 (2026-11-05)

### Changed

- **Breaking.** Sites style with `content/design/tokens.json`, custom CSS and the Design tab as in 0.10.0 again. 0.11.0's theme (`theme.json`), its style names and its Design System screen are gone, and so is the `letterncms/design` dependency. Light and dark are `data-theme` again.

## 0.11.0 (2026-11-05)

### Fixed

- Going Back past unsaved changes and choosing **Discard** right away left you on the page; it now goes back.

## 0.10.0 (2026-11-05)

### Added

- For plugins: a `ui/records` list can do everything a collection's list does. `sort` sorts by the ability, `tree` draws records nested and puts them in order by dragging, `filters` can be `segmented`, `calendar` loads a month at a time, `dates` and `defaultView` say how dates sort and which view comes first, and `appendix` draws other rows under the list, lined up with it. Columns take `address`, `media`, `languages` and `field` as formats, `fit`, `excerpt` and `card`. A bulk action with `each` runs once per selected row, keeps what failed selected and says why, and shows while `some` holds; its `success` and `confirm` title can count (`{"one": …, "other": …}`). A row action can be `inline`, a page's action can have a `key`, and a `when` can compare (`{row.status} is draft, changed`). See Plugins → Views in the docs.

### Changed

- Each collection's list is drawn by the same list as every other place, from data: its search, status and language, the page tree with drag to reorder, sorting, table, cards and calendar, its columns, row and bulk actions, and the built-in pages under Pages work as before. Its search is `?search=` in the address.
- Every list has its checkboxes in the margin left of the rows, as collections had, so titles line up with the search above them.
- `pages/builtin` says for each page which `group` and `collection` it belongs to, and whether you may customize it (`customisable`).

### Removed

- The `conflict` with the old `letterncms/assistant`, `letterncms/site` and `letterncms/sync` packages. None of them is published any more.
- **Breaking.** The `content/entries` catalog component. A collection's place is `ui/records`, from `Cms\Modules\Content\EntriesView`.

## 0.9.0 (2026-11-05)

### Added

- `cms()->url($path)`: the public site's absolute address, from **Public URL** under Settings → **General**, else `APP_URL`. Everything the CMS sends out (emails, the admin, MCP, licence checks, links in comments) uses it, and `config('app.url')` always equals it.
- `Permissions::register()` takes `roles:`, the default roles that hold a permission (`['editor']`, `['editor', 'author']`). The Editor and Author roles a site starts with are built from them, so a module or plugin that is off adds nothing to them.
- `Cms\Contracts\Translator` (`available()`, `translate(array $strings, string $from, string $to): array`) is the machine translation Languages offers. The Assistant binds Claude; `NoTranslator` is the default.
- `Cms\Support\Files::readJson()`, `Files::putJson()` and `Files::locked()` for a module's or plugin's own state files: read a JSON file (or `[]`), write one atomically, and run work under a lock file without waiting.
- `Cms\Admin\Views::notFound($icon, $back)` draws the page of a place that isn't there, and `Cms\Abilities\Ability::ADMIN_ONLY` keeps an ability to the admin's own client (no API tokens, MCP, CLI or agents).
- `EntryDriver` has `findMany()` and `findByUri()`, as both drivers already did.
- `setPreference()`, `requestText()`, `ComposerPanelProps` (with the answering `agent`) and `PanelSlots` in `@letterncms/sdk`; `Notice`, `formatBytes`, `deviceWidths` and `wideFieldTypes` in `@letterncms/ui`, and a form mode for `Dialog` (`onSubmit`, `submitLabel`, `submitDisabled`, `danger`, `busy`).
- The `ease` field component: one easing control for design tokens, transitions and animations.

### Changed

- **Breaking.** Assistant and Sync are part of the CMS: core modules instead of plugins, never installed from the store. Both are on unless you switch them off under Plugins → **Built In**. Claude answers in the workspace once an Anthropic API key is set under Settings → **Assistant**; without one, nothing mentions it. A Composer site takes them by dropping `letterncms/assistant` and `letterncms/sync` from its `composer.json` and running `composer update`. The CMS can't be installed next to either plugin, so a site that still requires one stays on 0.8 until then.
- Sync is free on every site: a public site no longer needs a Sync license to push or pull.
- **Breaking.** Their classes are under `Cms\Modules\Assistant\` (was `Cms\Assistant\`) and `Cms\Modules\Sync\` (was `Cms\Sync\`), with the providers `Cms\Modules\Assistant\AssistantModule` and `Cms\Modules\Sync\SyncModule`. Their package names, settings, routes, abilities, commands and permissions stay as they were.
- **Breaking.** Sync knows a plugin's tables only from the plugin's own `composer.json` (`extra.cms.sync`): it no longer has Forms', Commerce's and Analytics' built in. The workspace's chats are a group of their own, **Chats**, pulled but never pushed.
- The installer recommends SEO and Forms: the rest comes with the CMS.
- **Breaking.** `fields.options.<name>` fills the `dynamic` options of block fields too: `blocks.options.<name>` is gone. `button-variants`, `sources` and `patterns` are `fields.options` lists like `templates`, and `collections` is every collection but the system ones, wherever it is used.
- **Breaking.** `config('app.url')` follows **Public URL** under Settings → **General**: `APP_URL` only counts while that is empty.
- `media.uploaded` fires for every new file, however it was added (an upload in the admin or with an API token, `media/import` from a URL, a plugin calling `MediaStore::store()`), and not again for a file that was already there.
- Visitor accounts are the **Settings** tab of **Users**, and **Visitor Accounts** in the settings sidebar. `/settings/accounts` leads there. `/users/fields` is gone: it is the **Profile Fields** tab of Users.
- Paid Plugins (`letterncms/license`) is a required module: Modules needs it to check keys.
- Sync's abilities are the admin's only: no API tokens or CLI (`cms pull` and `cms push` stay), as already no MCP or agents.
- After a pull or push, Sync clears the same caches an update does: everything under `storage/cache`, where Languages now keeps its own too.
- **Breaking.** `Cms\Modules\Sync\Console\SyncCommand`, the base of `cms pull` and `cms push`, is `TransferCommand`.
- **Breaking.** Panels, commands, entry actions and composer sources take their `id` from their key: leave `id` out of `registry.*.set()`. `registry.panels` is typed by slot (`PanelSlots`).
- Notices across the admin look like a view's `ui/notice`, tablet previews are 820px wide everywhere, file sizes read in the admin's language, and copying says **Copied** only when it worked.
- The Shortcuts widget always lists ⌘J, named after the workspace's agent.
- A preview that can't be drawn says why in the editor, instead of “Request failed (422)”.
- Picking a block in the Outline opens its inspector, also when it was already selected.
- `request()` keeps its default headers when you pass your own.

### Removed

- **Breaking.** `extra.cms.provides` in a package's `composer.json`, and `PackageManager::providing()`: nothing asked a package what it provides.
- **Breaking.** The `cms.updated` action: an update runs `cms.sync` like `cms sync` does.
- **Breaking.** `Cms::version()` (use `Cms::VERSION`) and the `cms_path()` helper.
- **Breaking.** A field type's `fallback` key, which let one type stand in for another that is missing.
- **Breaking.** `AdminRegistry::removeNav()`, `Views::unregister()` and `AbilityRegistry::unregister()`: a plugin adds what it needs and changes what is there with the `admin.nav` and `view.<id>` filters.
- **Breaking.** `type` and `suggests` in what `PackageManifest` reads from a package's `composer.json`.
- **Breaking.** The `languages.translator` filter: bind `Cms\Contracts\Translator` instead.
- **Breaking.** The `blocks.options.<name>` filters: use `fields.options.<name>`.
- **Breaking.** The internal hooks `preview.editor`, `site.build.before`, `account.url`, `account.denied` and `account.teaser-notice`: Site and Account call each other directly.
- **Breaking.** The site helpers `cms_entries()`, `cms_entry()`, `cms_url()` and `cms_token()`, which nothing documented: `cms_global()`, `cms_menu()` and `cms_translations()` stay.
- **Breaking.** The admin import names `@letterncms/collaboration`, `@letterncms/languages`, `@letterncms/media` and `@letterncms/navigation`, which nothing imported. `@letterncms/blocks` stays.
- **Breaking.** A collection's `listing` key: `default_columns` chooses the columns.
- **Breaking.** Content's own `revisions.keep` listener, which kept the default of 100: the filter stays for plugins.
- The `/downloads/` exception in the static build's link check: a site answers its own addresses with `site.links.answered`.
- **Breaking.** From the admin's API: `RouteDef.layout` and `title`; the `shell.aside` slot and the `full` prop of `shell.banner` and `shell.dock` panels; `Manifest.components`; the UI kit's `Page.headerActions`, `Button.iconRight`, `Badge.dot`, `Textarea.autoGrow` props and the exports `MenuButton`, `ContextMenu`, `TableSkeleton`, `TableToolbar`, `DisplayOptions`, `ViewSwitcher`, `formatValue`, `GroupedFields`, `changedFrom`, `recordDateColumnIds`, `WidgetContext`, `useWidget`, `viewRoute` and `fieldColumnId`; `@letterncms/blocks`' `BlocksField`, `useTokens`, `InlineEditable`, `blockTree` and `BlockTypeDef`; the field components `site-ease`, `blocks-ease` and `blocks-easing` (use `ease`); a module's default export is no longer called at start.

## 0.8.0 (2026-11-04)

### Changed

- **Breaking.** Site is part of the CMS: the design system, page templates and components, rendering, previews, the static build, search and the starter kit are a core module instead of a plugin, never installed from the store. It is on unless you switch it off under Plugins → **Built In**, as a headless site may, and keeps Blocks on while it is. A Composer site takes it by dropping `letterncms/site` from its `composer.json` and running `composer update`. The CMS can't be installed next to the Site plugin, so a site that still requires it stays on 0.7 until then.
- **Breaking.** Site's classes are under `Cms\Modules\Site\` (was `Cms\Site\`), with the provider `Cms\Modules\Site\SiteModule`. Its package name `letterncms/site`, its settings, routes, abilities and permissions stay as they were. A plugin that renders with Site names it under `extra.cms.modules` in `composer.json` (`["letterncms/site"]`) instead of requiring it, and needs the CMS 0.8.
- **Breaking.** The `render.page` filter is gone: `Cms\Modules\Site\Rendering\PageContext::current()` is the page being rendered, or null when there is none.
- The installer recommends SEO, Forms and Assistant: the rest comes with the CMS.

## 0.7.0 (2026-11-04)

### Added

- The Plugins screen lists what comes with the CMS and can be switched off, under **Built In**, each with its switch.
- A plugin that builds on an optional module says so in `composer.json` under `extra.cms.modules` (`["letterncms/blocks"]`): it starts only while that module is on, and the module stays on while the plugin needs it.
- The `render.page` filter tells a module which page is being rendered (`entry`, `uri`, `locale`), when a plugin such as Site renders one.

### Changed

- **Breaking.** Blocks, Email, Collaboration, Languages, MCP, Media and Navigation are part of the CMS: core modules instead of plugins, in every site, never installed from the store. Email, Media and Navigation are always on; Blocks, Collaboration, Languages and MCP are on unless you switch them off under Plugins → **Built In**. The Email and Media settings and the Languages screen sit in the first group of the settings sidebar. A Composer site takes it by dropping those seven from its `composer.json` and running `composer update`.
- **Breaking.** Names now read like the other modules': the packages `letterncms/email` (was `letterncms/mail`), `letterncms/collaboration` (was `letterncms/collab`) and `letterncms/languages` (was `letterncms/i18n`); the namespaces `Cms\Modules\Blocks\`, `Cms\Modules\Email\`, `Cms\Modules\Collaboration\`, `Cms\Modules\Languages\`, `Cms\Modules\Mcp\`, `Cms\Modules\Media\` and `Cms\Modules\Navigation\`; the settings `email` (`config/email.yaml`, `CMS_EMAIL_*`) and `languages`; the abilities `email/test`, `email/status`, `email/log` and `collaboration/presence`; the table `email_log`; the hooks `email.colors` and `languages.translator`; the admin imports `@letterncms/collaboration` and `@letterncms/languages`. A plugin built on any of them needs the CMS 0.7 and these names, and no longer requires them in `composer.json`.
- **Breaking.** Email is sent with `Cms\Modules\Email\Mailer`, a `Cms\Modules\Email\Message` and `Cms\Modules\Email\Body`. `Cms\Contracts\Mailer`, `Cms\Contracts\MailMessage`, `Cms\Contracts\Defaults\LogMailer` and `Cms\Support\MailBody` are gone: a plugin adds a way to send through `Cms\Modules\Email\Transports`, as Brevo does.
- `media.url` and `media.img` adjust the address and markup Media works out (`$url, $image` and `$html, $image, $alt, $options`), instead of being how they're worked out. `blocks.svg` is gone: an Icon block's own SVG is cleaned like an upload.
- The installer recommends Site, SEO, Forms and Assistant: the rest comes with the CMS.
- A site needs PHP's GD extension, for Media.

### Fixed

- Saving hand-written Block Markdown with an image keeps it as Markdown's own `![alt](/image.png)`.

## 0.6.0 (2026-11-04)

### Added

- The workspace: a thread at the right edge of every screen, opened with **New Chat** at the top of the sidebar, **Chat** in the top bar or `⌘J`, where the whole site can be run without AI. `/` lists what you may do: make a page or post, go somewhere, change a settings page, or run any ability, grouped by what it belongs to. A command that needs input asks for it right in the composer, with fields from its input; one that needs nothing runs at once. Every command runs as you, through the same permissions and audit log as the screens.
- Each command is answered with a view to act on. Creating, publishing, updating, duplicating and deleting entries, inviting and adding users, saving settings and global sets say what happened in a line, with the next steps (**Open**, **Publish**, **View on Site**, **Unpublish**, **Resend Invitation**, and **Delete** to take it back), and those buttons run as commands in the same thread. Any other ability is answered from what it returned: a list as records, a record as its values, with **Open** when it names a place.
- A thread is renamed in place with **Rename Chat**, from its `⋯` menu or its row. An approval starts on **Decline**, and its go-ahead says what it does (**Delete Entry**). Every control in the thread is at least 40px to tap on a touch screen.
- Search in the thread: a few words and `Enter` find the places, settings pages, content, people and files you may see, grouped, each opening where it is. Fast, and no tokens.
- Agents: plain language in the thread goes to an agent when a plugin provides one, through the new `Cms\Contracts\Agent` contract (`NoAgent` by default, when a message is a search and nothing mentions AI). An agent streams its answer into the same turns, keeps its own history with the thread, and is told what the person ran and searched since it last answered. See Plugins → Agents in the docs.
- An ability can say how it's answered in the workspace with `answer`; `Cms\Modules\Workspace\Answers::done()` writes the usual one. The `workspace.answer` filter adds to any answer and the `workspace.search` filter adds a section to search.
- `threads/list`, `threads/get`, `threads/rename` and `threads/delete` for the admin's own client, `workspace/search` and `workspace/commands`. Threads belong to one person, are encrypted at rest and go with their account.
- The `sidebar.start` and `workspace.composer` panel slots. A composer source's line can run an ability in the thread (`command`), with fields from its schema or loaded ones, and have a heading of its own (`group`).
- `ui/records` takes literal `rows` in place of a `source`, and `View` draws a view inside something else (`embedded`), running its buttons through the host when it says how (`run`, and `ask` for one that asks first). The new `ui/links` draws a short list of places.
- An agent can move the admin. `admin/open` opens a place the person may see (an admin path, with `?tab=`, `?field=` or `?do=`), and the screen goes there as the agent answers, with the thread beside it, never on reloading a thread. Its row reads **Opened** with a link to the place, and admin links in an agent's answer, or a path written as code, open in the admin. It is offered to agents and the admin, not over MCP, REST or the CLI, and not in `/`. Tool events and results name the `ability` they ran.
- An input schema can name its choices with `x-labels` (or `oneOf` with `const` and `title`) and a property with `title`, for the forms the workspace asks with.

### Changed

- **Breaking.** The thread at the right edge, its history, composer, `@` context, approvals and the full-size `/chat/:id` view are the workspace's, a module of the core, instead of the assistant plugin's. `@` is offered only while an agent answers.
- `users/create` and `users/update` list the roles there are in their input, with their names, so a form can offer them. Their switch for super admins reads **Super Admin**, and every switch in a form is named by its label.
- A button for an entry that is gone says **This entry no longer exists.** instead of that you aren't allowed to: a missing entry is `not_found`, not `forbidden`. Deleting an entry or a person says whom (`entries/delete` returns the `title`, `users/delete` the `name`).
- Confirmations are alert dialogs, and a second one never opens over the first.
- The hidden **Skip to Content** link stays out of sight, its shadow too, until the keyboard reaches it.
- Agents can turn plugins on and off and uninstall them, over MCP and in the assistant, and always ask a person first. An ability marked `confirm` asks first like a destructive one (`Ability::asksFirst()`).

## 0.5.1 (2026-11-04)

### Fixed

- A word reads the same on every screen in Dutch, French and German: where the core and a plugin translated it differently, which one you saw could change from one page to the next. `./dev check` now refuses a word translated two ways.
- The Audit Log says **Installation** for changes made while installing.

## 0.5.0 (2026-11-04)

### Added

- Views: a place of the admin as data. A plugin registers a screen with `cms()->views()->register()`, or ships it as `views/<id>.json`: a page, tabs, lists bound to an ability with search, filters, pages, row and bulk actions, forms that load from one ability and save with another, details, stats, charts, before-and-after, and buttons that run abilities, ask first or open a dialog. Lettern draws every view with one renderer, checks it against the component catalog, and leaves out what the person looking may not see or do. See Plugins → Views in the docs.
- A repeater can show its items as a table (`display: table`), one row each.
- `packages/switch` turns a module or plugin on (with its install steps) or off. `packages/list` says where each one is set up (`to`, `settingsTo`) and, in a few words, what it is or why it stays on (`note`), sorted by name. `users/list` gives each person as one value (`person`), marks the one asking (`you`), and lists what stands out (`badges`: suspended, super admin, roles).

### Changed

- Settings pages, the Audit Log and each collection's place are views. A plugin adds a tab or a button to a settings page as data, through the `view.settings` filter.
- Users, Plugins, Globals, Collections and Account are views too. A plugin adds a tab to Plugins, or a section to Account, with the `view.plugins` and `view.account` filters, as the license module adds **Licenses**. A global set in several languages has a tab for each.
- `globals/update` returns the values as stored, and `globals/save` without a handle makes a new set with one from its title.
- The assistant's answers are drawn by the same renderer and catalog as the admin's places, and can use notices, charts, details and before-and-after too. An answer still can't load data or run an ability without its approvals.

### Removed

- **Breaking.** The `settings.tabs` and `settings.actions` panel slots. Add tabs and buttons to a settings page with the `view.settings` filter.
- **Breaking.** The `plugins.tabs` and `account.sections` panel slots. Use the `view.plugins` and `view.account` filters.
- The json-render packages from the admin.

## 0.4.0 (2026-11-04)

### Added

- Plugins can add tabs to a settings page, in the `settings.tabs` slot: the form is the first tab, Settings, and each other tab brings its own content and buttons. A page with only its form shows no tabs.
- A plugin's settings page and its sidebar item are called what the plugin is: leave out the label in `SettingsRegistry::register()` (`register('seo', fields: [...])`) or `$admin->nav()` and they take the plugin's name, `extra.cms.label` in its composer.json.
- A settings namespace registered with `page: false` keeps values that are set where they're used, read and saved like any others, without a page in Settings.
- A plugin with a screen of its own shows its settings as a **Settings** tab on that screen, drawn by the same form as every settings page: `ScreenTabs` and `useScreenTabs()` from `@letterncms/ui` add it after the screen's own tabs. Register the settings with `home:` set to the screen's sidebar item; /settings/<namespace> leads to the tab. Media, Forms, Analytics, Commerce and the Audit Log work this way.
- One way to save every form: a bar rises over the bottom of the screen while there are changes, with **Discard** and **Save** (⌘S), and says what went wrong if saving fails. Settings pages and tabs, Account, Profile Fields, Globals, the Design System and navigation menus use it; plugins get it as `SaveBar` from `@letterncms/ui`.
- A link can open a settings page at one field: `?field=<handle>` scrolls to it and puts the cursor there. Commerce's Go Live checks use it.
- A screen's sections can sit under its row in the sidebar: `ScreenSidebar` with `nested`. The Design System's sections do, so the sidebar stays the one you were in.
- **Publish** and **Unpublish** are in the ⋯ menu of an entry's row, in every collection.
- **Reset Everyone’s Default**, beside **Save as Default** in Customize Sidebar and on the Dashboard while customizing, puts the default back to what modules and plugins set up. It shows only once a default was saved.
- **Skip to Content** is the first stop for the keyboard, and the browser tab is named after the screen, such as “Pages · Lettern”. The sidebar button and the way back come before the sidebar, as they are on view.
- For admin themes: `confirmLeaving()` from `@letterncms/sdk` decides how leaving unsaved changes is asked about; the admin asks in its own dialog.
- For plugins: `Segmented` takes `fit` (one line that shrinks to the room there is), `Tabs` takes `fit` and an `icon` per tab, and `PersonPicker` takes `size`. `pnpm test:browser` runs the admin’s fixture checks in headless Chrome.
- For plugins: a settings page's top bar shows what its tab can do, from the `settings.actions` slot (`{ namespace, tab, dirty }`). Email's **Send Test Email** and SEO's **New Redirect** are there.
- For plugins: `Select` takes `defaultLabel` (the option that applies while nothing is chosen), `empty` and an `action` for a list with no options; a select field takes them as `placeholder`, `empty` and `action`.

### Changed

- The admin has a new look: Instrument Sans, warm paper-and-ink colors in light and dark, and yellow for selected text. Buttons, fields, menus, dialogs (a sheet from the bottom on a phone), toasts, tables and dashboard tiles share it, and a long list of choices, such as time zones, opens with a search field.
- The admin's default language is **Admin Language** in Settings → General (`admin_language` in `config/site.yaml`). Empty, everyone without a language of their own gets their browser's.
- In **Plugins**, each plugin has its own switch in its row to turn it on or off, grayed out with the reason when it's required or another plugin needs it. Its description sits beside its name, and a plugin with a problem shows the problem there.
- The **Licenses** tab is a list of the paid plugins, each with a short state and a badge, and the license key field. The Store and Updates tabs say less, too.
- **Account** is a settings page like the others, saved from the save bar for your profile and language, which sits with your name and email. The theme is chosen in your account menu only. **Change Password** and two-factor setup each open a dialog, under **Security**. Tokens and the way to connect an AI agent are one section, **API & Agents**, and a token's access is one choice: Full Access, Read Only or Content Only.
- Two-factor setup shows its setup key in groups of four with a **Copy** button, and its code field works with your phone's one-time-code autofill. The recovery codes can be copied too.
- **Public Accounts** are **Visitor Accounts**, set on the **Sign-Up** tab of Users (Team, Visitors, Sign-Up, Profile Fields) instead of a page of their own, and their settings show only once they're on. Links to the old page open the tab.
- Profile fields are a tab of **Users**, next to Team and Visitors. The menu at the top of Users is gone; Roles is in the settings sidebar.
- Inviting someone offers only the roles that open the admin; a visitor's roles are those of a visitor. The Security column of Users is **Two-Factor**.
- The **Roles** editor shows every collection's View, Create, Edit, Publish and Delete as one table, keeps the list of roles in view while you scroll, stacks on a phone, and lists permission groups in a fixed order, General first.
- The **Audit Log** can be narrowed to one person or one action, and a change opens as a readable list of what was sent, with the raw data folded away. Its settings are called **Audit Log** too.
- Settings that keep things for a number of days are named the same way, **Keep … For**, with "days" in the field.
- **Breaking.** For plugins: `DataView` offers Calendar only with `calendar` (for records that happen on a day, like orders) and Grid only with `image`, and adds the Published and Updated columns only when the records have those dates.
- Pages and the other collections' lists look and work the same, a tree or not: the title, URL and status sit in the same place, sorting the page tree no longer moves the columns, a row's actions show when you point at it, and the URL column widens to fit the addresses before it cuts them off.
- Built-in pages line up with the pages above them. A standard page shows no status; **Customize** in its row makes it the site's own, and a customized one opens with a click like any page.
- A short list shows no search box, and **Display** only when it has columns to add. Display lists the columns once, and **Reset Display** shows only when something differs from the default.
- The selection bar is centered on the list, not the window, and offers only what applies: **Unpublish** without **Publish** when everything selected is published.
- An empty list shows its message alone, without column headers. A search or filter that finds nothing says “No matches”, with **Clear Filters** everywhere, and an empty list no longer repeats the top bar's main button.
- On a phone, a list row is its title with the rest on one line under it, so nothing scrolls sideways; the calendar is a list of the month's days, and the search box takes the full width.
- A dialog starts in its first field, or on its main button when it has none, instead of on Close.
- An entry's card shows one date and says which: when it was published, or else when it was updated. A collection keeps its count beside its name in calendar view.
- In the command palette, content found for a search goes below the commands, so the highlight stays where it is when it arrives. Checkout and other built-in pages are no longer offered under Create: they are customized from Pages.
- The entry editor stays still while you work: the builder's **Outline** is out or folded away as you last left it, from the first frame instead of sliding in after the page loads, and saving shows as a small dot beside the title rather than words that pushed the buttons along.
- An entry's details show less: the **Record** (created, updated, ID) only to people who can manage collections, no **Author** on templates, components and built-in pages, no publishing on templates and components, and no dates nobody knows. A built-in page is a **Page** there, and the panel button is called **Page Details** (or the kind of entry you're in).
- **Publication Date…**, **Move…** and **View on Site** are in the ⋯ menu only, which offers **View on Site** while the site shows this exact version and **Preview** while it doesn't. The publication dialog explains nothing and says what its button will do: **Publish**, **Schedule**, **Publish Changes** or **Change Date**, and can't be pressed with nothing to change.
- A section of entry details that holds one field of the same name has no heading over it, and on a phone the editor's top bar keeps the title.
- Each thing in the sidebar has one way in: Settings is the gear beside your name (no longer also in your menu or the site's), and **Customize Sidebar…** is in every row's menu (and at the end of **More**, no longer in the site menu). The site's name opens the site.
- In **Customize Sidebar**, items under More read as clearly as pinned ones, and **Reset to Default** goes away once your sidebar is the default again.
- The home screen is called **Dashboard** everywhere. Customizing it keeps every widget where it is: a frame shows around each one, its remove button inside the frame, with no column labels. **Save as Default** and **Reset to Default** are buttons beside Cancel and Done, and each column has its own **Add Widget**.
- Globals show their handle only to people who can change their fields.
- The admin is a sheet of paper on a desk: the screen is a white sheet inset in a warm gray frame, the sidebar lies on the frame with the screen you're on as a white slip, and an editor's inspector sits on the frame beside the page. On a phone the sheet fills the window and the sidebar opens over it.
- The sidebar is where you work: Dashboard, Analytics and Plugins, then **Content** (pages, blog, media, navigation, forms, commerce, globals) and **Design** (Design System, templates, components, collections). Everything is in it from the start; **More** appears only for what you unpin. Settings are what you set up once: your **Account**, **General** and the **Audit Log** at the top, then **People** (Users, Roles) and **Plugins**: every plugin with settings, by its name, including those kept as a **Settings** tab on the plugin's own screen (Analytics, Commerce, Forms, Media), which open there with the settings sidebar beside them. The gear, its shortcut (⇧⌘ and comma) and /settings open General.
- **Breaking.** For plugins: a settings page registered without a `section` is listed under **Plugins** in Settings, and a plugin's page or screen there always is, whatever section it names. Sidebar items are shown by default (`pinned` defaults to true), and the `submenu` option is gone. `SettingsRegistry::register()`'s `section` defaults to `plugins`.
- Every screen has one compact bar: its name (after the places that lead to it) on the left, what it can do on the right, and no second title under it. Its hairline shows once you scroll. Screens no longer show a settings gear: a plugin's settings are its screen's **Settings** tab, or its page under Plugins.
- A way back returns to where you came from: out of Settings to the last screen you were on, from an editor to the list or the dashboard you opened it from.
- In Plugins, a row opens the plugin's settings (or its screen), and **Settings** in its menu leads to the same place.
- The **Member** role is called **Visitor** (its handle stays `member`).
- The Recently Edited widget lists a built-in page as one of the site's pages, shows a dash for something never dated, and names each row in full for screen readers, also on a phone.
- An entry's panel lays its fields out like the block inspector, with the label beside each control, and its status, dates and ID together under **Info**. **History** is a timeline: what happened, then who and when, with **Restore** on the row you point at.
- The admin is in American English throughout: **License** (and the **Licenses** tab), **Customize**, **Color**, **Canceled**.
- **Breaking.** For plugins: `Section` and `SectionHeading` from `@letterncms/ui` take no `description`: a section is its title and what it holds. In Updates, when it last checked sits beside **Check Now**.
- Permissions read alike in Roles: title case, **View** rather than “See” (**View Licenses**), and a **Trusted Only** badge instead of a warning sentence on **Add Custom HTML Blocks**, **Edit Custom CSS and JavaScript** and **Install Unsigned Packages**. For plugins: `Permissions::register()` takes `trusted: true` for these.
- Labels beside fields look like the block inspector’s everywhere: a value set here reads in ink and resets when you click its label, an inherited one stays muted with a small dot.
- An entry’s panel shows its tabs as icons, named in a tooltip, when their names don’t fit, as in Dutch.
- A search in the Store that finds nothing says “No matches” with **Clear Filters**, like every other list.
- Avatars’ initials have their own tone in dark mode, and the slug and person fields take the inspector’s height there.
- General’s description and the note under **Who Has Access** are shorter.
- Every settings form is the same centered column under its page's tabs, on a settings page and on a screen's Settings tab, and its sections are headed alike everywhere. A screen's settings opened from the settings sidebar show only the form.
- With changes on more than one tab of a page, one save bar saves or discards them all. The dot on a tab with unsaved changes is yellow, and screen readers hear it.
- A select's default reads as a value (**Browser Language**, **None**) and is the first choice in its list. A list without options says so.
- A tags field shows the field's own placeholder, or “Add…”.
- In **Users**, a row opens the person, and the dialog has everything that can be done: **Remove User**, **Suspend**, **Resend Invitation**. Access names added or removed there wait for **Save** with the rest.
- In **Roles**, the role on view is a white slip like the sidebar's place, and the number beside a role is how many people hold it.
- The Audit Log no longer records saving your own list views and columns, or starting two-factor setup (turning it on is recorded). Settings without a page are named by what was saved, such as **Sidebar**. **Keep Entries For** accepts 0, which keeps them forever, and the log offers no Updated sort beside **When**.
- Token expiry choices and the Rich Text field type are in title case: **30 Days**, **1 Year**, **Rich Text**.
- The browser tab of an editor is named after what's open in it, such as “Home · Lettern”.
- An entry’s editor says how saving stands without moving anything: **Publish** keeps its place and size beside **Published**, the state reads on a phone too, and a save that didn’t go through says why in a line over the page (“Couldn’t save. Check your connection.”) with **Retry**, instead of the browser’s error in a bar that pushed the page down.
- An address that leads nowhere (a deleted or mistyped entry, menu, global set or collection) shows the same **Not Found**, under the crumbs of where it would be, with the way back.
- The entry panel’s first tab is named after the collection in your language, and a built-in page (sign in, checkout) shows its address instead of an editable handle.
- In entry lists the checkboxes sit in the margin left of the rows, so titles line up with the search above them; on a phone a row’s second line no longer starts indented. A selection stays when you switch between Table, Grid and Calendar, Calendar shows checkboxes only on hover or while selecting, and **Display** names the order the list has (**Published**, newest first) instead of “Default Order”.
- Built-in pages are grouped under the plugin that brings them (**Commerce**), each shows **Standard** until it is customized, and **Customize** is always in view.
- Every list’s search reads “Search pages…”, “Search plugins…” and is one width, and a list with nothing in it yet shows only its empty state.
- Customizing the Dashboard rings each tile instead of drawing a frame around it, and the widget gallery closes with its × alone. **Recently Edited** lines its columns up, writes times in whole words (“2 hours ago”, “2 days ago”) and leaves out what was never edited here.
- Editing the fields of a global set or a collection is saved from the save bar, and **Delete** is at the end of the page instead of beside **Save**. A global set opens them with a labeled **Edit Fields** button, and the crumbs lead back through the set.
- In **Plugins**, each plugin’s description is one short line, the Store’s **Refresh**, **Upload Zip** and **Add Store** are in view instead of in a ⋯ menu, its cards show a plugin’s own icon once installed without repeating who made a first-party one, and **Paid** is a plain badge. **Updates** says when it last checked in words (“Checked 5 hours ago”) and names plugins that didn’t come from a store by their names. A license reads **Active**, **Limited** or **Needs Attention**.
- The Dashboard is as wide as the other work screens.

### Removed

- **Breaking.** The Admin settings page. The default sidebar and home screen are saved with **Save as Default** where they're arranged, as before. Entries per page (50), the autosave delay (1.2 seconds) and the revisions kept per entry (100) are no longer settings; plugins can still change the revisions kept with the `revisions.keep` filter.

### Fixed

- The browser's Back button no longer leaves unsaved changes without asking, and closing or reloading the tab with changes unsaved asks first. Leaving asks in the admin's own dialog, **Cancel** or **Discard**, instead of the browser's.
- Esc no longer leaves Settings while you're working in the page, such as on a closed dropdown.
- On a phone, the sidebar button sits under a notice such as Commerce's test mode, in the screen's bar, instead of over the notice's icon.
- Lists fit beside a docked chat instead of scrolling sideways: the title gives way a little, then the columns at the right, one by one, while the row's actions stay.
- The Design System's sections are set in under its row, at the same spacing as every other row. The sidebar's first row lines up with the screen's bar, the Outline gives the editor's sidebar its full height, and Customize Sidebar closes with its ×, its sections named as the sidebar names them.
- The **Go Live** link in Commerce's test-mode notice is underlined so it reads as a link in light mode too.
- Going back from the Design System to Settings left the way back stuck on the same page. A way back never leads into a page that only redirects.
- **Duplicate** is no longer offered on a built-in page (checkout, account pages): there is only one of each.
- The builder's **Outline** is called Structuur in Dutch and Plan in French.
- **Collections** shows **New Collection** once while there are none, not in the top bar as well.

- **Collections** lists only the site's own collections. The ones the CMS and its plugins bring, such as templates, components, and account and checkout pages, are no longer there, and their fields can't be changed or the collection deleted from there. `collections/list` still returns them, marked `system`.
- The sidebar slides back the way it came when you leave settings or a screen's own sidebar, instead of in from the same side.
- The license and update notices no longer sit under the sidebar button and the way back, which covered their icon and text. They are a strip above the screen, beside the sidebar, so nothing under them moves, and they stay readable on a phone.
- The admin's tab bars no longer scroll up and down by a pixel when you scroll over them.
- A list right under a section's title no longer draws a second line under the title's own.
- You can no longer take away your own roles or super admin status from Users and lock yourself out. Another administrator can.
- `{brand}` and `:brand` in field labels, help text and options written in PHP show the product's name in English too, not only in other languages.
- An error from the browser, such as a refused clipboard, shows a short message instead of the browser's own. A URL that can't be copied says “Couldn’t copy the URL”.
- A number field with a width fills it, so it lines up with the fields beside it.
- Tab moves from sidebar row to sidebar row instead of stopping on each row's hidden **Unpin** button; the row's menu (right-click or long-press) has it.
- The Dashboard's database-updates notice says only that updates are waiting, beside **Run Updates**.
- The keyboard cursor in a collection’s list shows its blue bar again.
- Right-aligned column headings that sort line up with the numbers under them.
- Typing in a settings field and taking it back no longer leaves the save bar up.
- A link to a field a settings page doesn't have no longer stays in the address, and a settings page that doesn't exist says “Not Found” in its bar and on the page.
- Fields in a row with other controls take the room they have, and compact segmented choices such as H1 to H6 no longer cut their labels short.
- A pressed icon button, such as the settings gear while Settings is open, shows as pressed.
- **Add Field** and **Add Property** open their list below the button and as wide as the panel they're in, instead of over the top bar and past the inspector's edge.
- A screen that doesn't exist says “Not Found”, like a missing entry or settings page.
- On a phone, a list with checkboxes, such as Media, lines up the second line of each row with its title, like the entry lists.
- A select's empty text and its action, and the section headings of settings written in PHP, are translated like the rest of a field.

### Security

- The assistant can no longer create, invite, change or remove people, grant or take away roles, or change what a role may do, even when asked by an admin. People do that themselves, in Settings. Over MCP these were already out of reach.

## 0.3.1 (2026-11-02)

### Fixed

- Starting an update on a site with `CMS_ALLOW_FILE_MODS=false` says it doesn't change its own files, in the admin's language, instead of calling the site locked.

## 0.3.0 (2026-11-02)

### Added

- A block can be shown only to people signed in, by binding `visible` to `account`, or only to people signed out, with `hidden`, on every page: on one built in advance, the browser shows the right one before it's painted, from a cookie that says only that someone is signed in. The data `accounts` has the sign-in, sign-up and account pages' addresses and words in the page's language, while public accounts are on.

### Changed

- The team has the site's account pages too, with what they bought there like anyone: signing in at `/admin` and going to `/account` no longer leads back to the admin. Their profile, password and data stay in the admin, and the account menu links there. A signed-in team member who opens `/sign-in` goes to their account.

### Removed

- **Breaking.** `CMS_LOCKDOWN` is gone. Collections, settings, roles, the design system and plugins can always be changed in the admin, by the people whose role allows it. A site that sets it can drop the line. `CMS_ALLOW_FILE_MODS=false` still stops plugin files changing from the web. For plugins: `Cms::lockedDown()`, `Cms::guardConfigWrites()` and `cms.lockedDown` in the admin's manifest are gone with it.

## 0.2.3 (2026-11-02)

### Fixed

- A URL that names a folder in the site's root no longer redirects through `http://` when a proxy in front of the site handles HTTPS. New sites get this in `.htaccess`. On an existing site, add `DirectorySlash Off` below `DirectoryIndex index.php`, and `RewriteOptions AllowNoSlash` below `RewriteEngine On`.

## 0.2.2 (2026-11-02)

### Changed

- The store, the licence service and the website are at lettern.org, and the docs at docs.lettern.org. Sites find the store there from this version on.

## 0.2.1 (2026-11-02)

### Fixed

- A line break in rich text no longer turns into two each time it's saved.

## 0.2.0 (2026-11-02)

### Added

- Pick any icon for a collection or a global set: a searchable list of all 1,500 Phosphor icons, found by name or by what they are for ("email" finds the envelope).
- Plugins can dock a column beside the page on every screen: the `shell.dock` slot with `Dock` from `@letterncms/ui`. A `topbar.end` panel sits in every screen's bar, an editor's own tools go in that bar through `toolbar` in `EntryEditorProps`, and `registry.entryActions` adds lines to the editor's **More** menu. Routes can open over the screen they came from (`overlay`) and keep what they show private (`private`).
- Skills: ready-made ways of working for agents, registered with `cms()->skills()`. Every agent gets them: the assistant's `/`, and MCP clients as prompts.
- Plugins can add to what `@` and `/` offer in a chat with `registry.composer`, and offer things from a screen with `useScreenContext({ items })`. All of it is one thing, a `ContextItem`.
- Abilities can mark a change that stays a draft (`annotations: ['draft' => true]`), for agents to treat as safe to undo unless a call publishes it. `entries/create` and `entries/update` do.
- Screens can say what they show with `useScreenContext`, for whatever works alongside them. An open entry shows changes made from outside as they happen, and `events.emit('content.changed')` asks it to look.

### Changed

- A calmer top bar in the editor. A way back and tools on the left, the page's title in the middle, actions on the right. Publishing is one control that also says where things stand: the button when there's something to publish, a quiet "Published" when there isn't. Scheduling moved into **More**, the last thing in the bar. Plugins can use it with `back` and `title` on `Topbar`.
- The way back in the settings and outline sidebars says where it goes, and the sidebar's name sits below it, so it can't be mistaken for closing the sidebar.
- There are never more than two side panels: one on the left and one on the right. A screen that uses the right edge says so with `useScreenContext({ rightEdge: true })`, and a `Dock` then gets `floating`, a card over the page.
- The sidebar is there or it isn't, with one button at the top left and `⌘\`. That button and the way back beside it never move, the top bar slides along with the sidebar, and its title stays in the middle. Left and right panels come and go with the same quick animation. It stays that way until you change it. It no longer folds to a row of icons. A screen can bring a state of its own to it with `ScreenSidebar` from `@letterncms/ui`, like the settings one, with a way back, and folded away to start with.
- On a phone the sidebar opens from that button instead of keeping a row of icons down the side, so screens get the full width.

### Removed

- **Breaking.** The `sidebar.history` slot, and `shell.compact`. Use `ScreenSidebar`.

### Fixed

- An entry only saves when something in it changed. A field reporting the value it already had could rewrite the page's file, and changing something back no longer counts as unsaved.
- A collection whose icon is named after a Phosphor icon, like `handshake` or `book`, now shows it in the sidebar and lists instead of a plain circle.

## 0.1.3 (2026-11-01)

### Changed

- New installs lock to commits that stay available, after a tidy-up of this repository's history.

## 0.1.2 (2026-11-01)

### Security

- The update list can be kept fresh by a key that can only do that: it can't sign a release, so it never has to sit beside the keys that can.

## 0.1.1 (2026-11-01)

### Changed

- The `@letterncms/*` npm packages are now published by a GitHub workflow with no stored token, so each version carries npm's provenance record of where it was built.

## 0.1.0 (2026-11-01)

### Added

- Build a plugin's admin module from npm: `@letterncms/admin`, `@letterncms/sdk` and `@letterncms/ui`, with no workspace needed.
- Install with Composer (`composer create-project letterncms/lettern`), or upload a small zip that fetches the same release. Either way the site is a Composer project.
- Choose your plugins during setup. Nothing is preinstalled, and each plugin updates on its own.
- Public accounts, off until a site turns them on: visitors can sign up, sign in, reset a password, confirm an email address, edit a profile, download their data and delete their account, on pages designed in the builder. Limit pages to an account, a role or an access name, with a teaser for everyone else. Plugins use it all through `cms()->accounts()`.
- Update from the admin with one click: releases are signed, go live by switching a pointer and go back by themselves if they fail, and security updates install on their own. The Store and Updates tabs in Modules browse and install plugins from a store, on any site, and a paid plugin's key goes in from its listing. A paid plugin's licence never takes a public site down.

### Changed

- The public account pages say what's wrong at the field it's about and put the focus there, show a password on request, and make way for the message once a link is sent. Account Navigation can be a sidebar, and plugins choose their place in it.
- The main sidebar is now about content: Design and Tools moved to Settings.
- The publish button in the admin is the brand's yellow instead of orange.
- Lettern is free and open source under the MIT licence, for any use on any number of sites, with no key, no limit and no banner. Paid plugins carry a licence of their own.

### Removed

- Site themes, admin themes and their settings. The starter kit is part of the site plugin and the admin is a module.
- Sharing one installation between sites.
- Content no longer has `{brand.name}` and its sibling tokens, and `brand.*` is gone as a binding path. Write the product's name and links as plain text. `brand/brand.json` still names the product in the admin, emails, the command line and the installer.
