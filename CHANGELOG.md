# Changelog

## Unreleased

## 0.34.0 (2026-11-13)

### Removed

- **Breaking.** Plugins and Site Kits now browse Lettern’s store only. Adding stores and entering plugin license keys have been removed.

## 0.33.0 (2026-11-13)

### Changed

- **Every Dashboard widget now shows up, with its title, whenever you add it.** Agents, Email, Security, Sync, System, Team and Activity used to draw nothing while there was nothing to report; each now says so, like Recent Uploads does ("No agents connected", "Everything is up to date"). A widget a plugin draws from a view takes the same line from its new `empty` setting.

## 0.32.1 (2026-11-13)

### Changed

- **A list of tags in a settings panel sits in the right column,** beside its name, like the other short settings.

## 0.32.0 (2026-11-12)

### Added

- **Documents show what is inside them in the media library.** A PDF shows its first page, and a text, CSV or Markdown file shows its first lines, on its tile, in the media picker and in the file's details, where a PDF scrolls through its first five pages. Markdown files (`.md`) can be uploaded and keep their name.

## 0.31.0 (2026-11-12)

### Changed

- **Breaking.** The admin, dashboard and agent tools call these features **Globals** and **Design**. The Globals dashboard widget uses the ID `globals`. PHP code uses `GlobalContent` for an individual global, and the definition hooks are `global.saved` and `global.deleted`.

## 0.30.3 (2026-11-12)

### Fixed

- **Buttons line up with their fields** when you copy agent details, show or copy a connection key, or add page access. Link and colour pickers match the fields around them, and long agent details wrap on narrow screens.

## 0.30.2 (2026-11-12)

### Changed

- **Site kits have their own place in the admin.** Open **Browse Store** in **Site Kits** to find, install or update a kit. The **Plugins** list shows plugins only.

## 0.30.1 (2026-11-12)

### Changed

- **Settings panels, dashboard widgets, and empty settings sections share a softer fill and the same corners.** Groups have room between them, and translated settings sit in their own groups. Admin tables share one design with inset highlights for hovered and selected rows.
- **Copyable connection details use read-only fields.** Click the server URL, setup command or connection key to select its text, or use the Copy button beside it.
- **Floating controls are easier to see.** Dialogs, menus and dropdowns use a clearer outline, and the focus ring stays visible on the last field in a dialog.

## 0.30.0 (2026-11-12)

### Changed

- **Settings are easier to scan.** Related options sit in panels with aligned labels and controls. Larger editors have the full row, and fields stack where space is tight. Account and plugin settings use the same layout.

## 0.29.0 (2026-11-12)

### Fixed

- **Switches show their knob in the monochrome accent.** In dark mode, a switch that is on in the white accent no longer loses its white knob on the white track.

### Changed

- **Breaking.** Minimal, the kit a new site starts from, is a kit of the store like any other and no longer comes with the CMS: setup fetches it (`php cms install` and the browser installer do, and `composer require letterncms/minimal` puts it in `kits/`), it has a card on **Site Kits**, you can edit its details, and you can delete it when the site is another kit. A kit that can't be fetched leaves the site empty, with no kit, when you choose **Start Without a Kit** in the browser installer. A site is always one kit that is there, or none: the kit the site is can't be deleted.

### Removed

- **Use Only the Design** on a kit's menu in **Site Kits**. `php cms kit:apply <handle> --mode=design` and `kits/apply` with `mode: design` still bring a kit's design.

## 0.28.1 (2026-11-12)

### Changed

- **General comes first in settings.** The settings sidebar now lists General above Account.

## 0.28.0 (2026-11-12)

### Added

- **Code fields point out mistakes.** CSS, JavaScript, TypeScript, JSON and HTML are checked as you type: a mistake is underlined with what is wrong on hover, the number of them shows under the field, and the large editor marks their lines. ⇧⌘M lists them.

### Changed

- **Breaking.** **The body is set on its field.** Open a blocks, Markdown or rich text field in a collection's fields and check **Use as Body**: its row says **Body**, and choosing another field takes it over. Each blueprint has its own, of any of those types, or none. The **Body Field** setting is gone. In YAML it is `body: true` on the field, in place of `body: <handle>` on the collection, which is no longer read: move it onto the field. `Collection::body($blueprint)`, `Entry::body()` and `Blueprint::body()` give the field; `FieldType::body()` says whether a type can be one, and `fields/types` reports it. Needs Import 0.4 and Market 0.19.
- **Plugins is one list.** The store and what is installed are the same list, with **Installed** as its filter: an installed plugin has its switch and a menu (**Settings**, **Uninstall**) where the store offers **Install**. **Built In** is a settings page, under System.
- **A plugin has a page of its own**, at `/plugins/store/<vendor>/<name>`, with its crumbs leading back to Plugins, in place of a panel over the list. The old `?item=` links still lead there. `@letterncms/ui`: `Slideover` is gone; a panel at the right is an `InspectorPanel`, and `PanelHeader` is the first row of every one.
- **A media file opens in the panel at the right**, not a dialog, and its details are kept as they are typed.
- **Each site kit keeps its own chats.** A chat belongs to the kit the site was when it started: switching kits lists that kit's chats, and the open chat makes way for a new one.
- **The full-size chat is a sheet, like the screen**, and shows the current chat. Its header keeps what is used all the time; where the chat sits is in its menu.
- **Drag the sidebar wider**, as the chat can.
- The **Settings** crumb leads straight to where settings open, and the sidebar switches to settings with the screen.

### Fixed

- A behavior drawn in the builder's canvas that is still loading when the canvas renders again no longer leaves the page's import map behind in the admin.

## 0.27.0 (2026-11-12)

### Added

- **Switch between site kits, and back.** Choose a kit from the site's name at the top of the sidebar, or on **Site Kits**: the site is that kit at once, with nothing to decide. What the site was is saved with the kit it was, drafts included, so switching back brings it as you left it, and the toast has **Undo**. A kit's menu has **Start Over** (the kit as it came) and **Use Only the Design**. `kits/switch` and `php cms kit:switch` do the same for agents and the command line; `kits/list` says which kit the site is (`active`) and which have a saved copy (`edited`). Accounts, the media library, submissions, analytics and every setting a kit doesn't carry stay through a switch. See [Site kits](https://docs.lettern.org/design/site-kits).
- **The site's favicon is its mark in the admin.** The sidebar shows it beside the site's name, and the product's mark until the site has one.
- The site's name in the sidebar opens a menu: **Dashboard**, **Open Site**, the site's kits and **Manage Kits**. The name itself still opens the site.
- **Code fields are a code editor.** Custom CSS and JavaScript, the design's styles and scripts, code blocks and every `code` field are highlighted for their language (`language`: css, html, javascript, typescript, json), close and match brackets, complete CSS properties, search with ⌘F and indent with Tab. **Expand** at a field's top right opens it large, with line numbers.

- **Import Site** on Site Kits puts a kit's zip, the one **Export Site** downloads, into the site's kits, ready to switch to. The zip is read without trust and the kit checked whole before it is kept. `kits/import` does the same for agents.
- **Redirects travel with a kit** (with Forms' forms: see their changelogs), so switching kits doesn't leave old addresses pointing at pages the new kit doesn't have.

### Changed

- **One language menu, always in the top bar.** A list of entries, a global and an entry editor each show the language on view by name, beside the screen's actions, with every language in its menu: no more row of codes above a list or tabs above a global's fields. A list's language is no longer part of a saved view. For view schemas, `ui/tabs` and a `Records` filter take `display: language` (the tabs' `segmented` is gone), and `InTopbar` puts something of a page's content in its bar.
- **Delete a site kit** from its menu on Site Kits, after a confirmation: the kit's folder goes, and the copy kept of it with what you changed. The kit the site is now, and the kits that come with Lettern, can't be deleted. `kits/delete` does the same for agents, with a dry run.
- **Edit a kit's name, description and thumbnail** from its menu on Site Kits: **Edit Details** opens the form **Export Site** uses, filled in. A kit that comes with Lettern can't be changed; the copy kept when you leave a kit keeps what you edited. `kits/update` does the same for agents.
- **Export Site** asks for a description and a thumbnail, both optional: a kit without a description says what the site says of itself (the text shown as the field's placeholder), and the thumbnail is the picture its card shows. The current kit on Site Kits has the outline a focused field has. `kits/export` takes `preview` and `previewType`.
- **⌘K is the chat.** `⌘K` and the sidebar's **Search** open the chat with `/` typed and its menu open: places, the theme, Customize Sidebar, Keyboard Shortcuts, settings, making and running things, and entries by their title, all in one list. Words that match nothing are asked of the agent, or searched without one. A place or a setting picked there puts away a chat that came out only for it; a command answers in the thread. What you had written stays, with the `/` on a line after it, and `Esc`, `⌘K` again or a click elsewhere takes the `/` away. The separate command palette is gone.
- **Site Kits** is a grid of kits with their pictures, not a list that opens a dialog of options. Choosing one switches to it; the settings of Bring In and Already on This Site are gone from the screen. Putting a kit on top of a site, choosing what happens to what clashes, stays in `kits/apply` and `kit:apply`.
- **Saved views are tabs above a collection's list**, after **All**, in place of the **Views** menu. Change the list and **Save View** appears beside **Display**; on a saved view its tab shows a dot, and **Save View** updates it or saves a new one while **Reset** puts it back. Choose the tab you are on to rename or delete it. Without saved views there are no tabs.
- **Install and delete plugins and kits from Plugins → Store on a site managed with Composer**, as on one installed from the zip. They land where `composer require` puts them and are added to or taken out of `composer.json`; `composer.lock` stays as it is until the next `composer update`. A kit from the store carries the mark Composer leaves on its own kits, so `composer update` takes it over instead of refusing.
- A collection's blueprints are a menu at the start of the **Add Field** row, named for the one on view: switch, add, rename and remove them there. The row stays where it is whether there is one blueprint or several, and adding one asks for its name.

### Removed

- **Breaking.** `acceptsQuery` and `group` on a command registered in the admin, `group` on one declared in PHP (`$cms->admin()->command()`), and the text `perform` was given: anything typed after `/` is asked or searched, so no command takes it. A command says `when` it is offered instead, and a line under `/` shows its `shortcut`. The workspace's New Chat command is gone too: ask in the chat from elsewhere with `events.emit('chat.ask', words)`.

### Fixed

- Pressing `Enter` in the chat's `/` menu before its lines are in picks the first line for what was typed, never a line left from the last few letters, and what follows `/` is never sent as a message.
- The plugin page in the store can be scrolled again.
- **Body Field** offers the fields of every blueprint, not only the collection's own, and a new entry of a blueprint is previewed with that blueprint's fields.

## 0.26.1 (2026-11-12)

### Fixed

- **Agents learn what a field is for again.** The site's JSON Schema files, the API and MCP had only a field's label ("Alt Text") where they said what it does, since the admin dropped the helper lines under its fields. A field now says it in `about`, which only agents read: every core block and setting that lost a line has it back. See [Fields](https://docs.lettern.org/content/fields).

## 0.26.0 (2026-11-12)

### Added

- **Behaviors that draw in the builder.** A block behavior whose script says `export const canvas = true` runs in the builder's canvas too, so a WebGL scene, a chart or a drawn plate shows there as on the site instead of its name. It is mounted with the same `mount(el, props, context)` and cleanup as on the site, undone before every edit renders the canvas again and mounted afresh after it. Its context says `canvas: true` and carries the canvas's own `window` and `document`, for the size, scroll and media queries a script reads. Any other behavior keeps the name it shows there now.

### Fixed

- **Export Site** works for a site with a long title among its entries: an entry whose headline ran past about 120 characters made the export refuse its own file. A kit's file names may now be as long as a file system allows.
- A site kit whose collection files its entries under a taxonomy the kit also brings, or picks from another of its collections, applies whatever order their names come in, and a kit in more languages than the site applies too: its entries in those languages are no longer refused before the languages are added. A collection the site keeps its own of (`skip`) is checked as the site's, so a kit collection that needs the kit's version of it is refused before anything is written, not halfway through.
- The installer says what a person acts on: a ready server is one line with a check mark, one that isn't lists only what is missing, by the folder's name in the site (never the server's whole path) and only the database drivers it can use. The password's rule is said when one falls short, and the table prefix's placeholder is "cms_".
- Applying a site kit names what is already on the site by its title and kind ("Home · Entry", "Footer · Component"), not its path, and a kit that can't be applied says so in plain words, the detail in the browser's console. `kits/get` steps carry `title` and an entry's `collection`.
- **Export Site** downloads the site as a kit: a zip of the kit's folder, ready for another site's `kits/`. `kits/export` takes `zip` for that; without it, and on the command line, it still writes a folder.
- Design System › Spacing has a heading and adds a step with its **+**, as Containers and Breakpoints do, and a style's **Border** is one control saying "None" until it has a colour, as **Fill** is, its width beside it once it does.
- **The Audit Log names what each change was made to**, also a change made by id: what is removed (a revoked token, a deleted file or chat) by what its dry run said it would remove, kept with the change, and what is still there (a tested webhook) by its name when the log is read. Plugins name theirs with the `audit.subject` filter. An action whose ability was renamed since reads as it is called now, once in the filter ("Customized Built-In Page", not "Customise Pages").
- **Signed In** under Account lists the ten browsers used last, this one first; **Sign Out Everywhere Else** ends the rest too. `sessions/list` takes `limit`.
- Plugins › Installed and the Store name and describe a plugin the same way, in its own words and the admin's language, and a name is never cut short ("F…"): its description gives way.
- A view's action may be `destructive`, the kit's red Delete button, as an editor of the kit's own draws it: Forms' Delete is.
- A settings field may ask before a change that loses something is saved: `confirmChange: {from, title, text, confirm}`. Analytics asks so when you go back to page views only.
- A table of rows (`repeater` with `display: table`) names its row button with `removeLabel` where a row is a record of its own: SEO's redirects say **Delete**.
- Fewer sentences under fields: the builder's inspector, block settings, a field type's settings, Add Field (a type is its name and icon), Move and two-factor setup say what a label or a placeholder can carry (**Allowed Blocks**: "Every Block"), and nothing more. A new password's rule is said when it falls short.
- **Dates and times read the admin's way.** A date field, the publication dialog among them, shows its day as the admin's language writes it ("Nov 11, 2026") with a month to pick it from, and its time as "7:03 PM" or "19:03", typed either way. They were the browser's own controls, which followed the browser's language. `DateInput` and `TimeInput` in `@letterncms/ui` are the controls.
- A version in an entry's history marks only the words that differ from now, not the whole paragraph.
- A tags field that can't be changed (an entry someone else is editing, a value set in another language) looks closed like the fields around it, without its tags' remove buttons.
- **Discard Unpublished Changes** and **Unpublish** ask first, and say what is lost: they ran at once.
- One way to switch the language on view and one for a value in each language: a global set switches its language with the codes a list has (EN, DE, FR, named in full on hover), and a menu item's label and link in other languages are one field each, named by the language, as on the settings screens. The menu wrote "Label in français".
- An empty list offers its one action (**New Post**, **New Token**, **Upload** in an empty folder), and says the collection's name as it is written ("No Audit Things yet", not "No audit things yet").
- An SVG is shown whole in the media library, a media field and the dashboard, not cropped like a photo. A size in bytes reads "155 B", like "109 kB".
- **Create the First Page** on a new site's Dashboard goes to the collection whose pages sit at the root of the site, else the first with pages of their own: it went to the first collection by name.
- The Info panel names an entry's language ("English", not "en"), and a long URL is cut short within the panel, whole on hover.
- **Focus rings stand out on every theme colour.** The focus line is the theme colour wherever it reaches 3:1 against the page, the sidebar and a chosen row, and otherwise the same hue made darker (light) or lighter (dark) until it does. Amber's on light is a deeper amber; it was 2:1.
- Form-like pages share one column: a collection's fields and settings now sit in the same centred width as Settings, a menu and a global set.
- On a phone, a screen's bar with two actions keeps the primary one's words and shows the other as its icon, so neither runs off the screen (Languages). A count in a list reads "104 Entries" without "Entries" before it.
- The Audit Log no longer opens with **Ran Automatic Updates** for every visit to the admin: a visit that finds no security update to move along changed nothing, and is left out. Every step of an update that runs is still there, the one that finishes or fails it too.
- A collection's list on a site with several languages shows the language whose chip is lit, also before one is picked, and the number beside its name counts that language. It showed the entries of every language under **EN**.
- A collection with many fields opens its list again: with more than twelve columns to offer, the list showed “Allows at most 12 items” instead of its entries.

## 0.25.0 (2026-11-12)

### Added

- **Site kits.** A kit is a whole site to start from: collections and their entries, global sets, menus, the design (tokens, fonts, scripts, styles, vendored libraries), the media they name and the few settings a kit may carry, in the same layout as a site's own `content/` and `config/`, with a `kit.json` that says what it is. It is copied in once; after that the site owns every file and nothing links back. A new site starts from **Minimal**, the kit that comes with the CMS; `php cms install --kit=<handle>` and the browser installer offer the others: kits in the site's `kits/` folder (where `composer require` of a `cms-kit` package puts one), and free kits of the store, fetched like a plugin. **Site Kits**, under Design, lists them and applies one, in full or only its design, after showing what it would create, replace or leave. Nothing that exists is overwritten silently: while the site has something of a name the kit brings, applying it is refused and names each one, until you choose to keep the site's, replace it (after a snapshot) or keep both. A kit with scripts needs the permission to edit custom CSS and JavaScript; one that needs plugins the site lacks says which. Entries come in through the entry service under new ids, and relations, parents, translations, menu items, links and components follow; a date ahead of the export stays as far ahead. A kit writes as whoever applies it, with their permissions (collections, entries, menus, global sets, media, languages), everything it would write is checked before the first file is, and one that fails on the way leaves the site as it was. **Export Site** (or `php cms kit:export <folder>`) turns any site into a kit: its published entries (drafts with `--drafts`), templates and components but no other collection a plugin owns, and never accounts, tokens, secrets, submissions, analytics, the audit log or licences. A site's `.htaccess` keeps `kits/` closed, and its `.gitignore` leaves out what Composer puts there. Abilities: `kits/list`, `kits/get` (with `mode`, the plan step by step), `kits/apply` (with an honest dry run) and `kits/export`; commands: `kit:list`, `kit:apply <handle> --mode=design|full --clash=refuse|skip|replace|rename --dry-run` and `kit:export`.
- **A theme colour for the admin.** **Theme Color** under **Settings → General** sets it for everyone, and **Account → Profile → Theme Color** lets each person pick their own, with **Use Admin Default** to follow everyone's again. Choose amber, orange, pink, violet, blue, green or monochrome (the admin's own ink: black on light, near white on dark). One colour carries through the whole admin: **Publish** and **Go Live**, switches that are on, ticked boxes, chosen options, highlights, selected rows, focus rings and the chat's bubble. The words on every colour reach 4.5:1 and every focus line 3:1 in light and dark, amber's on light aside, which stays amber with a halo. The admin shows the colour as you pick it and paints it before the first frame. Plugins that use the `signal` and `focus` colours follow it, and `AccentPicker` in `@letterncms/ui` is the control.
- `@letterncms/ui`: the `tonal` button, filled at rest without being a sheet of its own (`bg-tonal`, `bg-tonal-hover`).
- `@letterncms/ui`: the `comment-solid` icon, the speech bubble filled.
- Design tokens: `info-soft`, the wash of an info badge, which stays blue whatever the theme colour.

### Changed

- **The admin's greys take on its theme colour.** The desk, the sidebar, hover and pressed films, tabs and filters, the chat's button, edges and wells are a neutral grey with a little of the theme colour in it: warm with amber, cool slate with blue, a hint of rose with pink, plain grey with monochrome. In dark mode the page and menus lean toward it too. Words keep their colours.
- **The admin's accent is amber**, warmer than the brand's lemon yellow and easier to see on white. Focus and selection, which were blue, follow it too; information alone stays blue.
- **Chat** in the top bar is a `tonal` button a shade deeper than before, with a solid speech bubble in the theme colour.
- Switches that are on, ticked boxes and chosen options are filled with the theme colour instead of ink.

### Removed

- **Breaking.** `php cms starter:refresh` is gone, and with it `Cms\Modules\Site\Starter`: the starter is the built-in kit `minimal` (`modules/site/kits/minimal`), and `php cms kit:apply minimal --clash=replace` puts it back on a site.

## 0.24.0 (2026-11-12)

### Added

- `audit.unrecorded` (filter): a plugin leaves a call out of the Audit Log, by the ability, its input and its answer: a call made over and over for one change, such as each turn of an import, keeping the one that finishes it.
- **A setting in every language of the site**: a settings field with `localizable: true` holds one value per language, `{en: …, de: …}`. The settings page shows it once per language, under the language's own name, and a language added to the site gets its field at once; `placeholder` and `default` can differ per language. A save changes the languages it is given and keeps the others, and `SettingsRegistry::localized($namespace, $handle, $locale)` reads one language's value. A secret with a value per language is masked language by language. Consent's banner words use it.
- **A new site is ready for agents with three things**: beside `AGENTS.md`, it has its content model as JSON Schema files and an `llms.txt`.
  - **`content/schemas/`** holds a JSON Schema per collection (`collections/<handle>.json`), per blueprint of a collection (`collections/<handle>.<blueprint>.json`) and per global set (`globals/<handle>.json`), and `blocks.json`: a block document, with every block type of the site, its props and the children it takes. An agent or an editor's tooling reads what an entry must look like without starting the site, and a pull request shows a change to the model as a diff. The site writes them when it is installed and whenever a definition changes: a collection or a global set saved or deleted, a fieldset saved, in the admin or by an ability, a template or component added, a module or plugin turned on or off (on the next request, which runs with it), and `cms migrate`, which picks up a definition edited by hand. `php cms schemas` writes them by hand and `php cms schemas --check` fails when they are not current, writing nothing; agents use `schemas/status` and `schemas/refresh`. The folder is in `content/`, so it is in the site's git and not served to the web. Plugins add files with the `schemas.documents` filter. New hooks: `fieldset.saved`, `global-set.saved` and `global-set.deleted`.
  - **`llms.txt`** is the site's own now: built with the pages and answered at `/llms.txt`, it lists the public pages by collection under the site's name and description. It was the SEO plugin's alone. An `llms.txt` a site put in `public/` itself is left as it is: the build writes only the files it wrote before. A plugin makes it richer through the `site.llms` filter instead of writing a second file, as SEO does from its next version on.
  - `AGENTS.md` points at both.
- **A word can say which of its meanings it is**: `t('Light||weight')`, `__('Expired||order')`. English is the key of every translation and one dictionary is read for every package, so until now one English word had one translation, also where another language needs two (the views of a page and the saved views of a list, a phone number and a phone's screen). A `||` at the end of a key followed by plain lowercase words is the context: part of the key, never shown. A language that has no translation for it says the word as it translates the key without it, and only then in English. Placeholders are filled after the lookup, so a value holding `||` is shown whole. For plugins too, from this version on. `./dev check` refuses a context that no language uses.
- **Repeat**'s **Previous and Next Entry** source tells each item which side it is on: `item.side` is `previous` or `next`, and `item.previous` and `item.following` are that as yes or no. One Repeat now renders both neighbours with the right label and arrow (`bind: {"visible": "item.following"}`, `{"state:next": "item.following"}`, or `item.side|is:next`).
- **Fonts that do not move the text.** Adding a Google Font now reads the font’s own tables and gives each face the fallback that stands in for it until it arrives: Arial, Times New Roman or Courier New, drawn at the size and line height that match (`sizeAdjust`, `ascentOverride`, `descentOverride`, `lineGapOverride`). Nobody types those numbers any more; the ones you change in `fonts` stay when the family is imported again.
- **Design styles for a class.** The design’s element styles take a class a block carries, alone or on a tag: `".note em"`, `"span.note"`, `".card.is-open > a:hover"`, with the same safe properties, tokens and states as a tag. Give a block the class and style it in the Design System; a class no longer needs custom CSS. A key the design cannot style is refused by name when it is saved.
- `@letterncms/ui`: `ColorInput`, a colour typed or picked (the swatch with the system's picker beside the value), which the colour field is made of.
- `@letterncms/ui`: `useShortcutLabel(combo, label, group, enabled)` lists a key in the keyboard shortcuts overlay without listening for it, for keys handled in the page builder's canvas or by a field itself.
- A password can be looked at while you type it: every password and key field has an eye at its end, on the sign-in and reset screens, in Account's Change Password, in settings and in the installer.
- Design tokens: `shadow-rule` (a hairline along the bottom of a row of tabs) and `shadow-underline` (the tab on view), and `text-on-success`, `text-on-warning` and `text-on-danger` for words on their own wash.
- `@letterncms/ui`: `Pressable`, the control without a look, for the ones that draw themselves (a colour plane, a box of a spacing control, a card that opens, canvas chrome). It is a `<button type="button">`, or a link with `to`, with the kit's focus line, 44px to hit on a touch screen, `disabled` and `data-active`; `inset` puts the focus line inside its edge, `compact` leaves out the touch area. Everything it looks like is its `className`.
- **Term archives**: a collection can have a page per term of a taxonomy that lists its own entries filed under the term, such as `/blog/topics/tides` beside the term's own page. Choose the taxonomy and the URL under **Term Archives** in the collection's settings, or write `archives: {topics: '/blog/topics/{slug}'}` in its definition, with a pattern per language under `routes`. The page shows the term and the entries, ten to a page. A template named `<collection>_archive`, or `archive` for every collection, designs it: the page is the term, with its fields, and the new Repeat source **Entries of This Term** lists the entries; on the term's own page that source lists the entries of every collection. Archives are built with the site and follow what changes: publishing, unpublishing or re-filing an entry and an end date that passes rebuild them, renaming or deleting a term moves or removes them. They are in the site's search and the sitemap, name their versions in other languages, leave out drafts and what a visitor may not read, and never share an address with a page: saving either where the other is, is refused with the address. `terms/list` answers with each term's `archives`.
- `site.search.records` (filter): every record of the site's search index, to add pages that are no entry.
- `collections/usage` counts the rows of one kind that a collection's entries have in a matrix field.
- **Used By** in the lists of templates and components: a template names the collections it frames and how many entries chose it themselves, a component how many entries hold it, and one nobody uses says "Nothing". `entries/list` carries `usedBy` for them.
- Audit Log: a **When** filter (Today, Last 7 Days, Last 30 Days, Last 90 Days), and **Export CSV**, which downloads what is narrowed as a CSV file (more than 10,000 changes is refused, never cut short, and no cell can start a spreadsheet formula); the export is itself recorded. `audit/list` takes `period`, `from` and `to`, and `audit/export` is new. A view's action can `then: 'download'` the file its ability answers with (`{name, type, content}`).
- Roles: a group of permissions is ticked or cleared at once with its **All**, a collection's row with its name, and a column of the collections table with **All Collections**. **Duplicate Role** in a role's menu starts a new role with the same permissions; **Delete Role** moved into that menu.
- Account › **Signed In** lists where you are signed in: the browser and system, the address, when it was last used, with **This Device** marked. **Sign Out** ends one of the others and **Sign Out Everywhere Else** all of them; either gives the account a new "keep me signed in" token, so a signed-out browser can't come back with its old one, while this browser keeps its own. Sessions opened before this release are not listed, and are ended with the rest. It reads the site's sessions as they are kept, in files (the default) or the database; with another session driver the section is not shown. Abilities `sessions/list` and `sessions/delete` (`id`, or `others: true`; admin only).
- The keyboard shortcuts overlay (**?**) lists the page builder's canvas keys under **Page Builder** while they work: the arrows to select, ⇧↑ and ⇧↓ to select more, ⌥↑ and ⌥↓ to move, ↵ to edit, ⌘D to duplicate, ⌫ to delete, Esc, ⌥⌘T and ⌥⌘Y to insert, and undo and redo.

### Changed

- **Chat** in the top bar is a filled button now, a shade deeper when pointed at, always last in the bar, beside the edge the chat opens from, and it steps aside while the chat is open: the chat's own Close puts it away and brings the button back, with the focus on it.
- Secondary buttons draw their outline inside their edge, so they are as tall as every other button beside them.
- **Breaking.** A string of your own that ends in `||` and lowercase words (`'Cats||dogs and birds'`, in `__()`, `t()`, a field's label or options) now shows only the words before the `||`: write it differently, or give it a translation. Any other `||` stays part of the text.
- A list on a phone names its values: each one in a row is led by its column's name ("Updated last week", "Entries 3"), unless it says what it is (a status, an address, a person). A date the status already tells and a value that is missing stay out of the row.
- A calendar shows each record's status as a dot before its title.
- On a phone every dialog is a sheet with a grip at its top: drag it down, flick it or press it and the sheet goes; let go early and it returns. The grip is the sheet's one way out, so the × beside it is gone there. The page builder's block panel has the same grip on a phone. `@letterncms/ui` exports `SheetHandle` for a sheet of your own, and `InspectorPanel` takes `sheet` to rise from the bottom edge with it.
- On a touch screen the lines of a menu, a select and a picker are 44px tall.
- Global sets have one name. The sidebar, the screen, its breadcrumb and the widget say **Global Sets** (they said "Globals"), the permissions are **View Global Sets** and **Edit Global Set Values**, and the abilities are labelled **List Global Sets** and **Update Global Set Values**. Addresses, ability names (`globals/…`) and the `globals` data path stay as they are.
- A tree's drag handle stands at the start of its row, where a list is taken hold of, instead of at its far end with the row's actions. What is said beside a title (who is editing) is read whole: on a wide screen a long title gives way to it.
- Removing a matrix row type in the blueprint builder says how many rows were made with it before it is taken away.
- **Breaking.** One word for components: the block that places one is `component`, not `pattern`, in block trees (`{"type":"component","props":{"ref":"card"}}`) and in Block Markdown (`::: component {"props":{"ref":"header"}}`). `cms migrate` renames it in what a site has stored: entries, their working copies, revisions and profile values in the database, the Markdown files under `content/collections` (front matter and directives), the working copies in `storage/drafts`, and the YAML and JSON files under `content/` (global sets, collections, fieldsets, your own block files), together with the `allowed` list of a blocks field, `dynamic: patterns` of a select, and `children` and `parent` in your own blocks' `block.json`. A content file whose front matter can't be read is left as it is. The old name is no longer read. In code, `Cms\Modules\Blocks\Patterns` is `Cms\Modules\Blocks\Components`, the filter `blocks.pattern-sources` is `blocks.component-sources`, `fields.options.patterns` is `fields.options.components` (`dynamic: components`), and the admin's icon `pattern` is `section-copy`.
- The fields editor: removing a field can be undone from the message that confirms it, which puts it back in its place without touching what you changed since. While the save bar is up, messages rise above it instead of covering Save, and the one with Undo closes once the change is saved or discarded (`untilSaved` and `useSaveBarOpen` in `@letterncms/ui`). A field's **Required** and **Show as Property** are two checkboxes on a row of their own, under **Width**, instead of switches hanging beside it. A collection's and a global set's settings are laid out like every other settings form: one column, a heading over each group.
- **Rename View** and **Delete View** work for any of your saved views, not only the one the list is in: with several, they ask which, starting on the current one, and Delete View is that dialog's red button. `prompt` in `@letterncms/ui` takes `danger`.
- The tab of the pages a plugin brings, beside **Site** under Pages, is named for what it lists (the label the plugin registers its pages under), not after the plugin. Those pages have a **Version** column, Standard or Customized, and a status that says how that version stands: the standard one is Published. `pages/builtin` answers with `displayStatus: "published"` for it, where it said "standard". In a list of fields, a group has a folder for its icon instead of the blocks field's four squares. The lists of templates and components keep the title to its words, with the status beside it, and show **Updated**.
- The Audit Log says what happened, in the past tense: **Published Entry**, **Deleted Collection**, **Sent Test Email**. A deleted entry is named by the title it had, and turning automatic security updates on or off says which. A plugin names its own changes through the `audit.past` filter (ability name => words). `audit/list` items carry `publishedAt` and `updatedAt` as null, so Display offers no Updated column: `createdAt` is when it happened.
- The permission group that holds **Access the Admin** is called **Admin**, not "General" beside the General settings page; a permission registered without a group joins it.
- Plugins: an installed plugin the store lists has **View in Store** in its menu, which opens its page in the Store (`/plugins?tab=store&item=<package>`), and a plugin has one icon in Installed and in the Store. On a phone the rows' switches stand in one column at the end of the line, and everywhere a switch sits on its row's line. **Built In** says what each module is without cutting it at a comma, lists what can't be switched off last, and gives Collaboration and Site icons of their own. A license key has one name: **Add License Key** in a paid plugin's page and, while the store sells something, in the Store's More menu, and **Remove License Key** on the Licenses tab. The Store's More menu says **Check Now**, as Updates does. `@letterncms/ui`: a `DataColumn` with `control`.
- Customizing the Dashboard keeps **Cancel** and **Done** in the bar and puts what concerns the default in a **More** menu (**Reset to Default**, **Save for Everyone**, which was "Save as Default", and **Reset Everyone’s Default**), so the bar fits a phone. A tile shows its grip while you customize.
- The page builder's controls (its canvas toolbar, the inspector's spacing, colour, shadow, token and alignment controls, the writing view) and the chat's composer are drawn with the kit: each shows the kit's focus line, and the canvas's layers, radii, durations and shadows are the admin's tokens. `@letterncms/ui` exports `NEW_COLOR`, what a new colour starts as, and the admin's CSS has `cms-checkerboard` (under a colour that may be see-through, in the admin's greys, dark too) and `cms-swatch-edge`. Every module and plugin is now clear of raw values, so the UI lint holds without a list of exceptions.
- Settings › Email groups the SMTP server's fields under **SMTP** (Host and Port, Encryption, then Username and Password side by side) after the fields every way of sending has, **Email Footer** included, and Settings › Assistant sets **Default Model** beside **Model for Small Tasks**, with **Effort** and **Ask Before** under them.
- **Each Line** animates the lines the text is laid out in with every trigger, also **On Load**, **Scroll** and **Loop**, where it used to animate each word behind a mask: the words of a line move together and the next line takes its turn after them, counted again when the width changes. Without JavaScript the words go one by one, as before.

### Fixed

- Two settings saved at the same moment keep both: a secret saved by one request (an API key, a password) was written back as it had been by another that read the secrets before and saved something else, also in another settings page. A save now takes a lock and works on what is stored at that moment. A file of secrets the site's key can't open is never written over: saving a page with secrets says so and saves nothing.
- A select field whose options a plugin adds (`dynamic`, the `fields.options.<name>` filter) keeps the values it is given when they are numbers, such as the ids of another service's lists: they were renumbered from 0, and the labels became the values. Options of the field's own and those added are merged by value, and two plain lists are still one list.
- German, read through: the builder, the design system and the site's own words were proofread string by string. About ninety corrections: wrong or mixed terms (a gradient's "Stopp", "Mischmodus", "Kindelemente"), labels that were sentences ("Website-Name", "Griffgröße", "Mindesthöhe"), instructions that now address you the same way everywhere, and buttons that were too long for their place ("Link senden", "Push zurücknehmen", "Als Standard").
- Words that read wrong in German, French or Dutch because they shared a key with another meaning now have their own: in the builder, **Fill**, **Fit**, **Float**, **Clear**, **Justify**, **Light**, **Lines**, **Row**, **Repeat**, **Switch**, **To**, **Add**, **After**, **Ease** and the **Message** shape; **Outline** for a page's structure against a border's outline; a link's **Phone** number against the phone's screen; **Previous** and **Next** entry against paging (French "Précédente", "Suivante"; German "Vorheriger", "Nächster"); a shadow's **Custom** in German. German says "Ohne" for **None**, which fits whatever it stands beside.
- The rows of the Display menu are all the same height, ticked or not.
- Dragging with a screen reader is announced in the admin's language (Dutch, French, German) instead of English, in words that say what happened and the position in the list, not an id. Every module and plugin gets it: the shared `@dnd-kit/core` hands out a `DndContext` that speaks.
- A name read together with its value ("Author: Anna") takes the language's separator: French sets a narrow no-break space before the colon. `labelled(label, value)` in `@letterncms/ui`.
- A group of avatars shows one initial per person, so the next circle never cuts a letter, and its count grows into a pill instead of losing digits; a single avatar shows two letters at most, with air around them.
- Green, amber and red badges read at 4.5:1 or more wherever they stand, in light and dark: their words are a step toward ink, as the blue one's already were.
- A tree's expander, a table's drag handle, a widget's rows, the icon picker's icons and a person picker's names show the focus line when you reach them with the keyboard.
- A saved view kept with the **Published** filter before entries could have an end date lists published entries again, not every entry.
- The content API's OpenAPI document says which entries it gives: published, their publication date come and their end date not passed.
- On a phone a list's select filters take two to a row, so three of them no longer squeeze into one line with Display, and the Audit Log's rows say who, how and when without leading each with its column's name. A view's column can say it is `bare`. A value that is missing stays out of a phone's row in every list, not only a date.
- On a phone the page builder's block sheet has one way out, its grip, as every other sheet: the × beside the block's name is gone there.
- On a phone, a page with tabs counts its tab's actions and its own together: with three or more they show as icons, so the page's name keeps its room (Forms' Submissions tab lost it to Export CSV, Rename and Delete). A table of rows in a form (redirects, rates) is a card per row on a phone, each field with its label, instead of a table wider than the screen; its `add: false` leaves out the button that adds a row, where rows come from a dialog.

### Security

- A secret of a settings page whose field a plugin takes away (as Brevo does with its key while the mail transport's serves) is still a secret: `settings/get` and `settings/update` answered with it in clear, and the next save wrote it into `config/<namespace>.yaml`. Every key that `storage/secrets.json` holds for a page, and every field registered as `secret`, is now masked in answers and kept out of the settings file.
- **A Content-Security-Policy for the public pages.** Turn on **Content Security Policy** under Settings → General → Security, and a page runs only what the site and its plugins put in its head and foot (each inline script by its hash), loads from the site itself and the providers the Embed and Video blocks know, and from the hosts you add under **Allowed Hosts**. A script that gets into a page's content some other way runs nothing. Built pages get it from `public/.htaccess`, pages PHP answers as a header; the admin, the builder and previews are not touched. A new site starts with it on; a site installed before keeps it off until you turn it on. **Report Only** sends it as `Content-Security-Policy-Report-Only` while you try it. It goes out once a full build has seen every page, and names the hosts of images and video files from elsewhere (or a CDN) and the scripts that wait for consent. Plugins add to it with the `site.policy` filter.
- Every site's `public/.htaccess` now has a block the CMS keeps current, between `# BEGIN cms` and `# END cms`: built pages are sent with `X-Content-Type-Options: nosniff`, and with the policy when it is on. A site that was installed before gets it with `cms migrate`; what you wrote outside the block stays as it is.

## 0.23.0 (2026-11-11)

### Added

- **German**: the admin, the sign-in and account pages, emails and the setup page of the zip speak German (Deutsch), in the informal *du* the plugins already use. Choose it under Account → Appearance, or for everyone under Settings → General → Admin Language; a browser set to German gets it without asking.
- **A new site is ready for AI agents**: installing a site, with `cms install` or through the setup in the browser, writes an `AGENTS.md` in its folder. It says what the site is, where content, design and settings live, how to find the abilities and try one without writing (`php cms run abilities/list --json`, `collections/schema`, `--dry-run`), how to build and check the pages, where the MCP server is, and the rules that matter: abilities instead of the database, Block Markdown in content files, design tokens instead of fixed values. It is written from the site as installed, so it names only the commands, modules and plugins that site has. From then on the file is yours: it is never written again, and a site that already has one keeps it.
- The blueprint builder edits what was only written by hand. A field's **Conditions** read as sentences, “Show when Kind is Text or Video”, “Require when Featured is On”, with the choices of the field they name; renaming a field is followed by the conditions that name it, removing one takes them with it, and conditions that come back to their own field are refused, in the builder and by `collections/save`. A matrix lists its row types like fields, each open on its name, handle and fields. A collection's **Blueprints** are a switch above its fields (Article, Video, +), so every blueprint is edited in the same editor with every option; removing one that entries were made with says how many first, and changing a saved handle warns as a field's does. `entries/list` filters by `blueprint`.
- On a translation, fields that hold one value for every language (`localizable: false`) are closed, wherever they are drawn (a property, a row of the details, the body), with a lock and the code of the language they are set in beside their label; pointing at it names the language. `Fields` closes a single field with `readOnly`, and `SharedMark` is the mark.
- **Ends**, where an entry is published: the publication dialog (Schedule, Publication Date) has **Starts** and **Ends**, with **Remove End Date** to take the end away. The entry's details say when it ends or ended. An entry whose time is up reads **Expired** in lists and in the editor and can be published again, from the editor, its row or a selection; a list's **Published** filter leaves it out and **Expired** shows only those (`entries/list` takes the statuses `expired` and `active`), and a list can show an **Ends** column, from Display or as `ends` in a collection's default display fields.
- In a collection with several blueprints, **New** asks which kind of entry to make, wherever it is pressed (the list, the command palette, the home screen), and the editor shows the fields of the blueprint an entry was made with: its properties, its body, its history. A collection with one set of fields works as before.
- **Editors for the new field types**: a link field picks its destination like every other link in the admin (a page, an address, an email, a phone number, a file) and has its label beside it; a date range is two dates; a time, a slider for a range, an address with latitude and longitude for a location, and a table whose rows and columns are added and removed. A matrix lists its rows by kind, each open on the fields of its kind, dragged to reorder, with **Add Row** offering the kinds. A link field offers only the kinds its `types` name and keeps a picked file by its id. A file field opens the media library on what it takes (its `accept`, and no images; `media/list` takes `accept` and `except`), a terms field picks from its taxonomy, and a field that is required under a condition (`required_if`) shows as required while the condition holds.
- **The content API asks more**: `GET /api/v1/content/{collection}` filters with operators, `filter[rating][gte]=3`, `[ne]`, `[lt]`, `[lte]`, `[gt]`, `[in]=a,b`, `[contains]` (a list has the value, a text has it in it) and `[exists]=true|false`, on a field of the collection, on what is inside one (`filter[place.address]=Gent`) and on `id`, `title`, `slug`, `uri`, `parentId`, `publishedAt`, `updatedAt` and `position`; numbers and switches compare as what they are. `sort` takes several fields (`-publishedAt,title`). `fields=title,uri,summary` gives only those of each entry, and `expand=author,related.author` gives relations as entries instead of ids, two levels deep at most: only published entries the request may read, of collections the API serves; a relation in a group is `expand=meta.related`, a level costs one lookup whatever the page holds, and one answer expands at most 200 entries. Both work on `/content/{collection}/{slug}` too. A field that is missing or empty equals only nothing (`filter[summary]=`), is unequal to every value and is neither less nor more than any, on every driver and database. A list answers with `meta.count`, `from`, `to` and `hasMore` beside the totals, and `links` to this, the first, previous, next and last page. Drafts and what is for signed-in visitors stay out as before, in expanded relations as well. It is all in `openapi.json`.
- **Several blueprints in one collection**: beside `fields`, a collection can name more sets of fields, `blueprints: {video: {title: Video, fields: [...]}}`, for entries that come in kinds. An entry is made with one (`blueprint` on `entries/create`) and keeps it: its defaults, validation, shared fields, file body and what templates get all follow that blueprint, a translation or a copy has the blueprint of its source, and an entry made without one has the collection's own `fields`. `collections/schema` gives the schemas of each blueprint under `blueprints`, `collections/get` their fields under `resolvedBlueprints`, and an entry says which it has (`blueprint`). The `entries.blueprint` column and `blueprint` in a file's front matter, stored and unread until now, are what holds it.
- **Breaking.** **Fields shared across languages**: `localizable: false` on a field of a collection now does what it says, where it was ignored: a translation that held a value of its own in such a field takes the original's the next time either is saved. The field holds one value for every language: it is set on the original entry, and its translations take that value when they are made and whenever the original's content changes (what waits in the original's draft arrives when it is published, and an original that is not published only reaches a published translation's draft, never what it serves). A translation keeps the original's value whatever it is sent, and `entries/get` names those fields as `sharedFields` so an editor can show them as read-only. Live translations are rebuilt when a shared value changes, and a dry run of a change to the original lists the translations it would rewrite. It applies to the fields of a collection, not to fields nested in a group, repeater or matrix.
- **An end date for a publication**: an entry can carry `expiresAt`, set when it is published (`entries/publish`, `entries/create` with status published, `entries/update` with `publish: true`; publish a live entry again to move it, `null` to remove it). From that moment the entry is no longer on the site, in lists, in the content API or in search, and says `expired` as its status; `cms publish:scheduled` (and, without cron, the check after requests) then unpublishes it, so it is a draft again and its static page is removed. In a file collection the date is `expires_at` in the front matter; `cms migrate` adds the `expires_at` column. `expires_at` filters and sorts like `published_at`. A date given with a time zone is kept as the moment it is, and an entry that ran out can be published again at once: its past end date is dropped.
- **Taxonomies**: a collection with `taxonomy: true` (the **Taxonomy** switch in its settings) is a vocabulary whose entries are the terms, and the new `terms` field (`taxonomy: <handle>`, `max`) files entries of other collections under them. Terms are entries, so they are renamed, translated and nested (a tree collection) like any other, and a term's page is its entry's page at the taxonomy's route (`/topics/{slug}`): list what is filed under it with the Repeat block's **Collection Entries** and **Only Entries Linking To: This Page**. The new Repeat source **Taxonomy Terms** lists terms with how many published entries each has (all of them, or those of this page). A terms field stores ids and also takes a term's slug or title, looked up in the entry's language; a name that several nested terms share is refused, with the id asked for. Agents get `terms/list` (terms with counts) and `terms/import`, which turns a collection's free tags into terms (found by title, so running it again changes nothing; a tag whose slug is taken gets one of its own and is reported; a scheduled entry stays scheduled); the content API filters by term, `?filter[topics]=news`, by slug or id, for any relation field. `tags` stays for free words without pages.
- **Seven field types**, each with its JSON Schema, validation, clean-up and a round trip through database and file collections:
- **Who is editing**: a list of entries says beside a title who is editing that entry right now ("Ada is editing"), so you know before you open it. The first person to edit an entry holds it until they leave, stop editing for two minutes or someone takes it over. Whoever opens it meanwhile reads it, with a notice above the document that names the person editing and one button, **Take Over**; the person taken over from sees the same notice, and nothing of theirs is saved over yours. Plugins put a notice of their own there with the panel slot `entry.notice`, and make the editor read-only with `hold(true)`. `collaboration/presence` answers with `holding` and marks the `holder` among the others, `collaboration/take-over` takes an entry, and `entries/list` and `entries/tree` carry `editingBy` for an entry someone else is editing.
- **Saved views**: keep a collection's list the way you like to come back to it. **Views**, beside **Display**, saves what the list is narrowed to (status, language, search), its order, its columns and whether it is a table, cards or a calendar under a name; choosing a view puts the list back that way, and the button then shows its name. **Rename View** and **Delete View** are in the same menu. Views are yours alone and follow your account to every browser. Agents and plugins use `saved-views/list`, `saved-views/create`, `saved-views/update` and `saved-views/delete`; a list is named by its id (`entries.<collection>`), and a view holds only filters and columns its list has.
  - `link`: `{type, value, label?, new_tab?}` where `type` is `entry` (an entry id, of `collections` when set), `url`, `email`, `phone` or `media` (a file's id); `types` limits which. A string is read as a link (`https://…`, `/path`, `entry:<id>`, `mailto:…`, `tel:…`). Templates get `url` (the page's address, `mailto:`, `tel:`, the file) and a `label` that falls back to the page's title.
  - `date-range`: `{start, end}` as dates, or moments with `time: true`; the end is not before the start. A draft may hold one of the two; to be published it has both.
  - `time`: `"HH:MM"` on a 24-hour clock, `"HH:MM:SS"` with `seconds: true`.
  - `range`: a number between `min` (0) and `max` (100) in steps of `step` (1); a value between two steps moves to the nearest.
  - `table`: rows of text cells, every row as wide as the widest; with `header` (on by default) templates get the first row as `header` and the others as `rows`.
  - `geo`: `{lat, lng, address?}` in decimal degrees. The address is text; no map service is called.
  - `file`: files of the media library that are not images (`accept`, `max`), stored as ids; templates get `{id, url, name, filename, extension, mime, kind, size}`.
- **Matrix** field type: a list of rows of several kinds, each kind with fields of its own (`types: [{handle, label, fields}]`, `max`). A row is its fields' values and `type`, the handle of its kind: `{type: quote, text: …}`. Each row is checked against the fields of its kind, with errors that name them (`data.sections.1.text`), the JSON Schema has a branch per kind, and rows are written to an entry's file as YAML like any other field. A field type can check its own definition when a blueprint is saved (`FieldType::validateDefinition()`).
- **Conditional fields** in collections, global sets and every other blueprint, as block fields had them: `if: {kind: video}` or `if: {kind: [video, audio], featured: true}` shows a field only while the fields beside it hold those values, and a `required` field with a condition is required only then. `required_if: {…}` leaves the field on view and requires it under the condition. Publishing checks it, the collection's JSON Schema says it (`allOf` with `if`/`then`, in `collections/schema`), and a condition that names a field that isn't beside it is refused when the definition is saved. The schema validator reads `allOf` and `if`/`then`/`else`.
- **Relations that hold**: an `entries`, `users` or `media` field only takes ids that exist, an `entries` field only entries of its `collections` and a `media` field only files its `accept` allows. A write that names something else is refused with the path of the id (`data.author.0`), in a dry run too; what an entry already named stays, so content that points at something since deleted can still be saved. Entry ids are stored in lower case.
- **Reverse relations**: `EntryQuery::references($id, $field = null)` finds the entries that name an entry, on both drivers: wherever its id is in their data, so in a relation field at any depth (a group, the rows of a repeater), a link or a block. Agents read it with `references/list` (what links to an entry, across collections, with the fields that name it) and `references` on `entries/list`; the content API takes `?references=<id>` (and `references_field=`), and the Repeat block's **Collection Entries** source has **Only Entries Linking To** this page or the outer item: the posts of an author, the projects of a client.
- **Media**: a file's details list every page, global set and design file that uses it, linked to where it opens, and deleting a file names them first. Files dragged from the desktop onto the library or the media picker upload into the folder on view. Agents read the same with `media/get` (`usedBy`).
- **Media folders**: the library and the media picker show the folders as a tree beside the files (a select above them on a phone), and a folder can be empty. **New Folder** makes one in the folder on view; a folder's menu renames it or deletes it, and its files then move to the folder above. **Move to Folder** is in a file's menu, in its details and in the selection bar, with a tree to choose from and **New Folder** right there. Folders someone made are kept in `content/media/folders.json`, beside the records. Agents use `media/move`, `media-folders/create`, `media-folders/rename` and `media-folders/delete`; `media/list` answers with the whole tree in `folders`.
- **Media**: **Replace File** in a file's details puts another file of the same kind in its place. The item stays what it was to every page that uses it (its id, name, alt text, caption, focal point and folder), and its image sizes are made again. **Crop** and **Rotate** change a JPEG, PNG or WebP: drag the corners or the rectangle, or move a corner with the arrow keys; the focal point stays on what it marked, and a photo that its metadata turns upright is cropped as it stands. Whenever a file's bytes change, its address changes with them, because files are cached for a year by their address: what uses the file by its id needs nothing, and content that names the old address is rewritten to the new one. Agents use `media/replace` (a URL or base64 data) and `media/transform` (`rotate`, `crop`); both ask first, and their `dryRun` checks the file itself and lists what would be rewritten. `POST /api/v1/media/upload` takes `replace` with an item's id and runs `media/replace`, so it is in the Audit Log like every change.
- **A guided start for a new site.** The Dashboard of a fresh install opens with **Get Started**: Name the Site, Choose Colors and Fonts, Create the First Page and Connect an AI Agent, one column, each leading to the screen where it is done. A step is ticked when it happened (the design was saved, a page was created, an agent was authorized), and the list is gone once all are, or when someone with access to settings chooses **Hide**. Plugins add steps with the `dashboard.start` filter; agents read it with `dashboard-start/get` and hide or show it with `dashboard-start/update`.
- A block behaviour can wait for the whole page: `when: "loaded"` mounts it after the page's load event and its fonts, for a script that measures text or layout. Beside `load`, `visible` and `idle`.
- A block can carry several behaviours: `behavior` takes a list, `[{module: "tilt"}, {module: "cue", props: {…}}]`, and each is mounted and undone by itself. They start in the order written and finish loading in whichever order their scripts arrive, so one must not count on another having mounted. One behaviour is written as before.
- The **Motion Toggle** block tells scripts: pausing sets `<html data-cms-motion="paused">` and dispatches `cms:motion` on `document` (`event.detail.paused`), and a block behaviour's `reducedMotion` is true while motion is paused, with the behaviour mounted again when that changes. A canvas or a script's own loop can now stop with everything else.
- **Scroll progress for styles and scripts**: a scroll animation with `trigger.progress: true` (or with `scrub`) sets `--cms-progress` (0 to 1) on its element and dispatches `cms:progress` on it (`event.detail.progress`). A number that counts with the scroll is a few lines in a behaviour, with no animation library.
- A block's attributes can name another block: `"aria-labelledby": "#hero-title"` or `"aria-controls": "#panel"` in `attrs` becomes the id that block has on the page (its anchor, a heading's own, or one made for it). In `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-owns`, `aria-details`, `aria-flowto`, `aria-activedescendant`, `aria-errormessage` and `for`. The build warns when the block named is not on the page.
- **Repeat** has a source for a detail page's way on: **Previous and Next Entry** (`neighbors`) lists the entries before and after the current one in its collection's order, either side alone with `show`, and round the ends with `wrap`.

### Changed

- **Breaking.** The content API refuses what it does not know with `422 invalid_input` instead of answering as if it had not been asked: a filter or sort on something that is not a field of the collection (or on a column that is not public, such as `status` or `author_id`), an unknown operator, an unknown name in `fields`, an `expand` that is no relation or deeper than two levels, `contains` on a field that is neither a list nor a text, a `page` past the last one, and a `page` or `limit` that is no number in range.
- The `url` field type is called **URL** in the field picker; **Link** is the new `link` type.
- Lists on a phone: a row has one menu, in the middle of its two lines at the end, and what stood beside it as an icon (**View on Site**) is the first item of that menu. A number says what it counts ("3 Links"), and what is said beside a title starts the line under it, so a long title cannot push it out. **Display** calls the order of a list you arrange by hand **Manual Order**. A view's column takes `badge` (a key of the row, drawn as a badge after the value) and `unit` (`{one, other}` with `{count}`, said with a number where no header is on view).
- The lists of collections, global sets, menus and languages work alike, all four as wide as the page: a collection has a menu in its row (**Edit Fields**, and **Open Entries** if you may see them), global sets and menus list their names without the handle, a menu shows how many links it has as a number, the default language is marked with a badge, and a language without a URL prefix says "No Prefix". With more than one language, a global set's tabs are named after the languages ("Deutsch"), not their codes. **Set Up Automatic Translation** stands beside **Add Language** instead of under the list, and the sentences under the list and in the New Menu dialog are gone.
- The menu editor: a link is drawn like a field in a collection, a nested link starts under its parent's name, and what moves or removes it is one menu in its row, with **Edit Page** and **Open in a New Tab** for a link to a page, so nothing overlaps on a phone. Removing a link can be undone from the message that confirms it, which puts it back where it was without touching what you changed since. A new link starts with the cursor in its label, and **Add Page** stays open to add several pages. A menu's name and its **Submenus** are one dialog, **Menu Settings**, in the bar, which names the links that are nested too deep for fewer levels; **Delete Menu** is at the foot of the page. An empty menu, a menu that failed to load and a search with no pages are drawn like everywhere else.
- **Add Language**: the languages are rows you can hit on a phone, the one being added shows that it is, and a search that finds nothing says "No matches" with a way back.
- A collection, a global set or a fieldset whose fields cannot be saved says which field is wrong: the refusal of `collections/save`, `globals/save` and `fieldsets/save` carries every problem in `details` under the path of the option it is about (`fields.2.handle`, `fields.0.fields.1.type`), beside the sentence it already had.
- When a collection's or a global set's fields cannot be saved, the field that is wrong opens with a red edge and says what is wrong under its handle or type, also for a field inside a group or a repeater. `@letterncms/ui` exports `FieldError`, and `FieldsEditor` takes `errors` (by path) and `path`.
- The fields editor of a collection, a global set and the user profile: the word "Fields" is no longer printed again under the Fields tab, deleting is one quiet button at the end of the page, **Add Field** shows what each type is for in full, an icon is named in words ("File Text") instead of by its key, and the warning about changing a handle shows only once you change one that holds values.
- A global set's fields are the same screen as a collection's: **Fields** and **Settings** as tabs in one column under the set's own name, with **Delete Global Set** at the foot of Settings instead of in the middle of the page on a phone. In a collection's settings the list's columns are one group labelled **Columns** with **Reset Columns** beside it, the group that holds the structure is called Content, and the line under URL Pattern is gone.
- A view's `ui/records` takes `controls` (`{component, props}`): a component of the catalog drawn in the list's toolbar before **Display**. `@letterncms/ui`: `setViewPrefs(handle, prefs)` puts a list's view, sort and columns in place, and every list showing them follows at once; `DataView` takes `controls`.
- An entry's row menu says **Edit**, not "Open", beside its pencil, for those who may edit it. The number beside a collection's name (and on the **Site** tab of Pages) counts its entries in the language on view whatever the list is narrowed to, so it no longer reads "0" next to a filter that found nothing.
- **Media**: a file's details are one form whose **Save** is the dialog's own button, with **Delete File** at its foot. The focal point is a control with a name: click or tap the picture, drag the marker, or move it with the arrow keys (Shift for bigger steps, Home for the middle). The media picker opens as a sheet on a phone, shows the files a field takes without a kind switch, says **Use Image** for an image field, and for a field that takes one file a click chooses it: no count and no second button. An empty library offers **Upload** where it says so. The sentences under Alt Text, **Serve AVIF Images** and **Remove Photo Metadata** are gone.
- **Media**: a file's folder is no longer a text field in its details, and a folder with nothing in it says "No files in this folder" with **Upload** instead of "No matches".
- **Media**: 3D models, textures (HDR and KTX2) and animations (Lottie and Rive) are kinds of their own. Each shows its icon and what it is (GLB, HDR, Lottie) where a picture would be, its details say kind, type and size without the image tools, and the library's kind filter and `media/list` (`kind`: `model`, `texture`, `animation`) find them. **Other** no longer includes PDFs.
- **Media**, settled after a design review. Cropping takes over the file's sheet instead of opening a second dialog over it, offers a shape (**Freeform**, **Original**, **1:1**, **4:3**, **16:9**) and has plain square handles on its corners and, freeform, its edges. The focal point's marker is a dark and a white ring, visible on any picture, and **Crop** and **Rotate** sit under the picture. A file says what it is in words (**Image · JPG**) instead of a media type, in its details, the table and the cards, which show kind and size. Folders are rounded rows like the sidebar's, with **New Folder** under them from the start, and the move dialog marks the folder the files are in as **Current**. The picker is thumbnails and names: no menus, checkboxes or display choices. An empty library has **Upload** once, in the bar, and files held over the library say where they will land.
- **Settings have one home.** A module or plugin with a screen of its own keeps its settings as that screen's **Settings** tab, and the settings sidebar no longer repeats it: Media, Analytics, Forms and Market are gone from there. What has no screen (General, Email, Roles, SEO, Brevo) stays in Settings. `/settings/<namespace>` still leads to the tab, and searching the admin for "Media Settings" does too. For plugins: `home:` on a settings page now means it is listed on its screen only. A settings page with tabs of its own (SEO) calls its form's tab **General**, not Settings again.
- **Settings say less.** The notes under fields are gone from General, Email, Assistant, the Audit Log's settings, visitor accounts, a collection's **Who Can Read This** and Sync's **Connect a Site**: a placeholder shows the shape where one helps (**Keep Entries For** reads **Forever** when empty). The password rule stays, because it must be met.
- One word for one act on the system screens: a user is deleted with **Delete User** (it was Remove User), an access name is added with **Add Access**, Sync's dialog button is **Connect Site**, and **Replace Key** (it was Make a New Key, confirmed with New Key) says what it does to this site's key. **Send Test Email** carries the send icon instead of a second envelope. Profile Fields sits at the width of every other form and no longer explains itself.
- **Users**: Edit User and Invite User are one form with the dialog's own **Save** or **Send Invitation**; **Suspend**, **Resend Invitation** and **Delete User** sit under it, and the dialog shows its shape while a person loads instead of nothing. What a person may read beyond their roles is one field, **Page Access**, at the size of the others. **Roles**: the list of roles is the admin's own list, keyboard and touch sized, each role says how many people hold it in words, permission groups are headed like every section, and **Delete Role** is the red button deleting has everywhere.
- **Plugins › Store** is one list of rows, like every list of the admin, instead of a grid of cards: what the store features leads it instead of standing a second time under All Plugins. A row says only what differs: no price badge where nothing is sold, no author where there is one. Categories are a select, shown once a category holds more than one plugin. Adding a store asks in the admin's words (**Add Store**, **Store Address**, **Check Store**, **Key Fingerprint**).
- **Dashboard**: the greeting is set in the admin's own heading size instead of the one outsized line of the admin. Widgets speak only when they have something to say: **Security** shows two-factor sign-in while it is off and tokens that lie unused, **System** shows waiting database updates and plugins that failed, and **Email**, **Agents**, **Sync**, **Team** and **Activity** take no room while there is nothing sent, connected, shared or recorded. None of them restates what its own screen says.
- **Account** is four sections that start at the same edge: **Profile** (the avatar no longer indents its fields, and Language spans the row), **Security** as two rows that each say how they stand and offer one thing (**Password · Change Password**, **Two-Factor Authentication · Off · Set Up**), **Agents** (who is connected over MCP as you, each with **Disconnect**, which revokes its tokens (`mcp-agents/delete` for agents and the API); then the server URL and the Claude Code command, labelled like fields and wrapped on a phone) and **API Tokens**. A new token's access is chosen with all three options in view, and the token is shown once with its name, its access and its expiry beside it and **Copy Token** as the dialog's main button. The line under New Password is gone: what a password must have is said when one falls short.
- **Small things across the admin, from a design review.** A dialog whose body scrolls draws a line under its title, so rows pass under an edge. The chosen option of a segmented control is clearly lighter than its track in the dark theme. Picture cards stand two across on a phone. In a list's rows on a phone, what follows the title wraps instead of squeezing the first value to a letter. A list with nothing to search or filter has no empty band above it. Lists side by side no longer push the page sideways with a long title. A screen's bar on a phone keeps the words of its one or two actions (without their icons) instead of bare icons. An empty select says **Choose**.

### Removed

- **Breaking.** A plugin no longer has to register a home-screen widget. `PackageManager::problems()`, the "invalid" status of `cms plugins` (and its failing exit code), the notice on the Dashboard in debug mode and `AdminRegistry::widgetsByPackage()` are gone. A plugin with nothing worth a glance registers none and shows nothing; plugin tests that asserted `problems()` is empty drop that line.
- The **Site Setup** widget. The guided start on the Dashboard takes its place; what it listed (public URL, description, timezone, email sender) is on **Settings › General** and **Email**.
- **Breaking.** The `account.api` slot of the admin. What a plugin shows on Account is a section it adds with the `view.account` filter, as the MCP module now does for **Agents**.
- **Design System**: an element style can reach a tag inside a tag. Beside the elements the Design System offers, `styles` and `prose` take any tag, alone or up to three deep with a space (inside) or ` > ` (directly inside), and one state or part at the end: `"h1 em"`, `"li > a"`, `"nav a:hover"`, `"li::marker"`. Classes, ids and attributes stay with `custom.css`.
- **Fonts**: importing a Google Fonts family takes what the family really has. A variable family is one file for the weights its axis spans (EB Garamond is 400 to 800, not 100 to 900), a static family the weights it has, and no file is saved twice. `design/fonts-import` takes `style` (`normal`, `italic` or `both`; italic alone for a display face) and `weights` for static families. A font face can name what is drawn until it arrives: `fallback` (a local font such as Arial) with `sizeAdjust`, `ascentOverride`, `descentOverride` and `lineGapOverride`, and font tokens that name the family get that stand-in by themselves, so text doesn't move when the font loads.
- The guide every agent starts from has a short **Front end** part: where motion, block behaviours, page transitions, fonts and the code beside the design are described, and the abilities that change them.

### Fixed

- For screen readers and voice control: the account button at the foot of the sidebar is named by the name it shows (it was only “Account”, so saying the name you see did nothing), an entry’s author button says who it shows, and a tree list such as Pages is a proper table again (the drag-and-drop announcer sat among its rows).
- **Plugins › Updates** no longer says "All plugins are up to date" above a list of plugins no store can check: with none from a store it says **No plugins to check**, and plugins that are not from a store are named only beside ones that are. A site updated with Composer says so in four words, not an instruction.
- On a phone, a list's select filters (the Audit Log's **Everyone** and **All Actions**) share one row, half each, instead of stacking at half width with **Display** hanging beside the second.
- The Audit Log says every action in words: one whose ability is gone (renamed since, or its plugin is off) reads as its name in words (`pages/customise` is **Customise Pages**) instead of standing as a raw name among the others, in the list and in the action filter.
- Filters on entries answer the same on database and file collections, on SQLite and MySQL: "is not" also finds entries where the field is empty, "less than" and "more than" never do, and `contains` finds a value in a list and a part in a text. On MySQL a number in a field now sorts as a number, a switch filters as a switch, and search and `like` no longer mind capitals.
- A page load animation that starts from transparent no longer makes the page count as slow to show: the text is drawn from the first frame at an opacity nobody can see, so the browser counts it (Largest Contentful Paint) when the page appears and not when the animation ends. Measured on a heading animated from opacity 0: largest paint at 1.6 s before this change and together with the first paint after it.
- Pages with an animation no longer ask for two files that are not there: the site's script looked for its `motion` and `scroll` parts at the site's root (two 404s on every such page) before loading them from where they are.
- With navigation without page loads, a link to the page you are on (the logo, the current menu item) scrolls to the top instead of loading the page again, which restarted whatever was kept across pages, such as a WebGL canvas.
- In the builder, a block that a behaviour draws (a canvas, a chart) is no longer a blank: while it is empty it says which behaviour draws it and that the preview shows it. The canvas still runs no scripts.
- `design/update` with only part of the page transition, such as `{"transition": {"navigation": "client"}}`, keeps the transition's other settings instead of dropping its type and duration.
- The **Icon** block shows its **Custom SVG** when there is one. It showed the named icon instead, and since a new Icon starts with one, the SVG only appeared after the name was cleared.
- Every answer sends `{}` where a map is empty: a block's `props` at any depth, also inside matrix rows and repeater items, came back as `[]` from the content API and from abilities (`entries/get`, `entries/create` and the rest, `blocks/from-markdown`, `components/list`), and so did an entry's `data` without fields in the content API. A typed client reads `[]` as a list.

## 0.22.0 (2026-11-11)

### Added

- **Keyboard shortcuts**: press `?` anywhere in the admin for the keys that work on the screen you are on: in the editor that includes Save, Publish and the details panel. It is also in the command palette. Plugins list their own by giving `useShortcut` a label: `useShortcut('mod+shift+p', publish, true, t('Publish'))`; a registered command or a sidebar item with a `shortcut` is listed too.
- **Code beside the design**: ES modules in `content/design/scripts/` and stylesheets in `content/design/styles/` load on every page, with a template or with a component (`content/design/code.json`), or with one block (`code: {scripts, styles}`). One script imports another by path; each file is published with a hash in its name and cached forever, and changing one rebuilds only the pages that load it. `custom.css` and `custom.js` stay as they are. Agents use `design-code/list`, `design-code/get`, `design-code/save`, `design-code/delete` and `design-code/set-load`, and read `cms://site/code`.
- **Libraries without a bundler**: `cms vendor add gsap@3.12.5` fetches a package's ES module at one exact version from jsDelivr into `content/design/vendor/`, records its version and hash in `content/design/vendor/lock.json`, and puts it in the import map of pages that load a script, so scripts write `import gsap from "gsap"`. `--file=` takes one file of a package and `--as=` names the import; `cms vendor list`, `remove` and `update` do the rest, as do the abilities `design-vendor/list`, `design-vendor/create`, `design-vendor/delete` and `design-vendor/update`. The site serves the files itself: a build that would still import from the CDN or another address is refused, and a file that no longer matches its hash is not published. What a library requests once it runs is up to the library.
- **Block behaviours**: any block or component names a script of the design with `behavior: {module, props, when}`. The site calls the script's `mount(el, props, {token, reducedMotion, signal})` when the element is in the document and what it returns (and `unmount(el)`) when it leaves, also when a script or a page transition changes the page. `token('color.primary')` reads the design where the element is, `when: "visible"` waits until the element is about to be seen, and text in `props` can name data (`"{props.speed}"`). This is where GSAP, Three.js or Lenis attach.
- **Navigation without page loads**: with `navigation: "client"` in the design's `transition`, links to pages of the site fetch the page and swap it in inside the view transition. Blocks with `persist: "<name>"` stay the same element across pages, so a WebGL canvas keeps drawing and audio keeps playing. Scripts get `cms:before-leave` (cancelable, and `event.detail.waitUntil(promise)` holds the swap) and `cms:after-enter`, and `window.cmsNavigate.go(url)` and `.prefetch(url)`. Scroll positions come back with Back and Forward, focus moves to the new page's main content and its title is announced, and links are fetched when the pointer rests on them, except links with a query string and paths a plugin excludes (`site.navigate.skip`), which always load the page. Pages stay the static HTML they were: without JavaScript every link loads its page.
- **Motion**: a scroll animation can pin its element (`trigger.pin: "150vh"`: it holds at the top of the screen for that much scrolling while its steps play) and trail the scroll (`trigger.scrub: 0.6`). Steps can target `chars` (letters, split inside their words; the block is still read as its text by screen readers) and `lines` (real lines for appear, hover, press and event). Text in a script that joins its letters, such as Arabic, and text with links in it animate by word instead. An `ease` can be a curve of the design: `token:ease.<name>`. Scroll animations stay CSS where the browser has scroll-driven animations; a small script now moves the same keyframes where it hasn't. All of it is off for people who ask for less motion.
- New sites come with one block behaviour: a soft light behind the home page's first section that follows the pointer (`content/design/scripts/spotlight.js` and `content/design/styles/spotlight.css`). It shows where a site's own scripts and styles go and how a block names them; delete the two files and the block's `behavior` and `code` to be rid of it.
- **Media** keeps what scenes and animation players load: 3D models (`.glb`, and `.gltf` with its data embedded), environment maps (`.hdr`), GPU textures (`.ktx2`), Lottie animations (`.json`) and Rive files (`.riv`). Each is recognised by its contents and has a size limit of its own (64, 8, 32, 32, 4 and 16 MB). A Lottie animation with expressions, fonts to load or images that aren't embedded, and a model that points at other files, are refused with the reason, also when the file arrives by git or FTP. Every site, existing ones included, serves media with the right type, `nosniff` and a long cache from a `public/media/.htaccess` the CMS writes and keeps current.
- `SafeFetcher::post()` sends a body as it is with the caller's own headers, such as a signature, and can keep the start of a long answer instead of refusing it. `SafeFetcher::isPublic()` says whether an address is on the public internet. Plugins that call other servers use these instead of a check of their own.
- `GET /api/v1/openapi.json` is the REST API as an OpenAPI 3.1 document. Without a token it says how the API works: the generic paths (`/abilities`, `/abilities/{name}`, `/batch`), the error shape, bearer authentication, and the public content API (`/content/{collection}`, `/content/{collection}/{slug}`) with its query parameters and answers. It names no ability, so it does not say which plugins a site runs. With a token it has a path for every ability that token may run (plugins' included), each with its input and output schema. `GET /api/v1` links to it.
- A read ability called with `GET` reads its query string as its schema asks: `?perPage=5` is a number and `?ids[]=a&ids[]=b` a list; a map or a list of maps is one value, as JSON.
- `collections/schema` and the MCP resource `cms://collections/{handle}/schema` give one collection's JSON Schema: what an entry's `data` must follow as a draft and to be published, and the whole input of `entries/create` and `entries/update` for that collection. Every collection an ability answers with carries its `schema`. Resources can be families now (`cms()->context()->template()`), listed by MCP's `resources/templates/list`.
- `navigation/remove-item` removes one item of a menu by its id, with what is nested under it, beside `navigation/add-item`.
- Dry runs: every ability that changes something takes `dryRun: true` (`cms run … --dry-run`). Nothing is written, run or recorded, and the answer is `{dryRun, ability, checked, input, changes}`. `checked` says how far it went: `"full"` when the dry run is refused exactly where the real run would be and `changes` lists what would change or be removed, `"input"` when only the input and your permission were checked (`changes` is null, and the real run may still refuse). Entries (create, update, publish, unpublish, discard, delete, duplicate, move, reorder, restore, `pages/customize`), `settings/update` and every ability marked destructive or asking first (deleting a collection, file, user, global set, menu, comment, chat or token, removing a language, switching or uninstalling a plugin, starting or undoing a sync) are checked in full, by the same code the real run uses. A plugin's ability says the same with a `dryRun` callback; `Cms\Content\Entries\EntryService::dry()` runs entry writes without making them. In the workspace and for the assistant a dry run is shown as a check, not as a change.
- Every ability says what it answers with: an `output` JSON Schema beside its `input`, in `abilities/list`, `GET /api/v1/abilities`, `cms run --list --json` and as each MCP tool's `outputSchema`. Plugins write it the short way with `Cms\Support\Schema\Shape`. The tests hold every result against its schema, key for key.
- **Design System › Code** (it was Custom Code) holds all of the site's code in one column: **Styles** and **Scripts** each start with the site's own file (Site CSS, Site JavaScript) and list the design's other files under it, each opening on its contents to edit and save with the rest; **Libraries** lists what scripts import, to add as `name@version`, update or remove. Changing any of it needs the permission to edit custom code. **Motion › Page Transition** has **Page Loads**: Full Page, or Instant for navigation without page loads.
- **The builder has controls for this week's front-end features.** Interact › **Behaviors** holds everything a block does beyond its events in one place: the built-in behaviours, a **Script** of the design mounted on the block with when it **Runs** (On Load, In View, When Idle) and its **Options**, the scripts and styles the block loads, and its Alpine component. A scroll animation has **Pin Distance** and **Smoothing**, a step can target **Each Line** and **Each Letter**, and **Ease** lists the design's own curves first. Content › Advanced has **Persist As** for elements that live on when pages swap. Putting scripts, styles, a behaviour or a persist name on a block needs the permission to edit custom code, in the admin and through every ability; without it a block keeps what it has.

### Changed

- The installer and the page where an app asks to connect look like the admin they belong to: the same typeface, colours, corners, fields, checkboxes and buttons as the sign-in screen, in light and dark. The installer says what a server is missing and offers **Check Again**, shows what a field got wrong under that field and what the database refused in the database's group, and keeps the install token in a group of its own. When there are no plugins to choose, its one button is **Go to Dashboard**. The consent page names the app, the address its answer goes to and whose access it gets, and its button names the app: **Connect Claude**.
- Sign-in: every step starts at the same height, headings are in one case, Email and Password are drawn alike, **Reset Password** and **Back to Sign In** are buttons you can reach and hit, and choosing a new password has a way back.
- The admin's light, dark or system theme is kept on your account, so it is the same in every browser you sign in to, from the first paint. The account menu and the command palette show the same choice.
- Chosen rows are a quiet grey instead of blue, and **Delete** in the selection bar is red like every other way into deleting. A list you can read at a glance (fewer than eight rows, nothing filtered) has no search or status filter; a language switch always stays. A row's menu button is the same size and in the same place on every row.
- The command palette starts with what you can make and do; places come last, without the screen you are on. It offers only the theme you are not in, and a screen's Settings tab is listed only where Settings lists it. On a phone it fills the screen and has a Close button.
- One word for one thing: the command palette lists what you can make under **New**, a row's drag handle says "Drag to Reorder", a calendar's undated records stand under "No Date", and the buttons that make a menu or a global set say **Create Menu** and **Create Global Set**.
- An empty screen says what is missing and offers one thing to do, nothing more: the sentences under "No files yet", "No collections yet", "Not Found" and the others are gone, and small empty lists (API tokens, redirects) are drawn like every other one. The way out of a page that isn't there is **Go to Dashboard**.
- **Breaking.** `@letterncms/ui`: `EmptyState` and `NotFoundState` no longer take a `description`, and a view's `empty` (and `ui/empty`) no longer has a `text`: a view that sends one is refused. Something that failed is a `QueryError` (`title`, `message`).
- `@letterncms/ui`: actions that wait for the pointer are `cms-reveal` inside a `cms-reveal-row` (add `cms-reveal-over` to lay them over the end of the row, so they take no room from what it says). `Row` and `DataView` use them; they show on hover, on focus inside the row, while their menu is open, and always on a touch screen.
- **Breaking.** The role a visitor's account gets is `visitor` (was `member`), the word everything else already used for it: the role's label, `kind: visitors` in `users/list`, the **Visitor Accounts** settings. `cms migrate` renames it in what a site has stored: accounts with the role `member` get `visitor`, as do **Role for New Visitors**, a `member` role in the site's own roles, and **Who Has Access** of every collection and entry that named it, so visitors read what they could before. A site whose roles already have a `visitor` of their own is left as it is. Plugins and templates that name the role `member` need the new id.
- **Breaking.** MCP speaks two protocol revisions: `2026-07-28`, where every request names the revision, and `2025-11-25` for clients that start with the `initialize` handshake. The older `2025-06-18` and `2025-03-26` are gone: `initialize` answers them with `2025-11-25`, and a request that names one is told which revisions are spoken.
- A cleared link field is stored as nothing (`null`) instead of an empty string.
- **Breaking.** For plugins: `cms()->navigation()` (the admin's sidebar) is `cms()->adminNav()`, and `cms()->content()` (where entries are written) is `cms()->entryService()`; `entries()` still reads them. Settings are read with one word: `cms()->setting($namespace, $key = null, $default = null)` gives one value of a namespace, or all of them without a key (it was `cms()->settings(…)`), and a plugin reads its own namespace with `$this->setting($key = null, $default = null)` (it was `$this->settings(…)`). `settingsRegistry()` still registers and saves settings.
- Composer no longer installs this version beside a plugin release that still calls names this version removed: Analytics before 0.7, Brevo before 0.5, Forms before 0.12, Market before 0.15 and SEO before 0.8 (`conflict` in `composer.json`). Update those plugins together with the CMS.
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
- The chat: a chat that has nothing in it yet is titled **Chat** (New Chat is the action), a site without an assistant asks "What are you looking for?" above its search field, past chats carry an icon so they read as chats, and a list that fails to load says so with **Try Again**.
- The save bar's **Discard** and **Save** are the same buttons as everywhere else, its warning reads in the dark theme, and it no longer has a yellow dot: yellow is for publishing. `data-theme` on an element inside the admin sets that piece in the theme it names; `useTheme()` says which theme is on view.
- **Design System**: a phone has the preview too, behind **Preview** in the bar, drawn at phone width from the unsaved draft, with the light and dark switch. A row's ⋯ (Rename, Delete) is always there on a touch screen. A section that is one list no longer prints its name a second time under the bar (Colors, Spacing, Sizes, Elements, Form Fields). The preview opens in the theme the admin is in. The button that adds something says what it adds (**Add Color**, **Add Font**, **Add Variant**), an element style is deleted with **Delete** like a token, and a design system that fails to load says so with **Try Again**.
- **History** shows a version before it restores it: an older version opens to exactly what restoring it would change, with what is there now beside what the version brings back, field by field and for a page block by block, and **Restore Version** under it. A version opens with a click, a tap or the keyboard; Restore no longer waits for a pointer to rest on the row.
- **Editing on a phone**: the editor's bar keeps Insert Block, Undo and Redo, and a line under it says which page is open and whether it is saved. With a block selected, the details button opens that block's settings in a sheet that rises from the bottom while the block scrolls into view above it, undimmed; the page's own details are in the block's menu there. Insert Block opens as a sheet, and the chat moves into More Actions. Outline rows are 40px to hit on a touch screen, and a container no longer repeats what the row under it says while it is open. On every screen size, **Published** in the bar opens what publishing offers next (Publication Date, Unpublish).
- An entry's ID is **Copy ID** in More Actions, copied whole, instead of a cut-off line under Info.
- **Block editor**: Insert Block lists blocks by name, so twice as many fit; what a block is for is its tooltip. The builder's panels are built from the admin's own buttons, so they share its focus ring and its 44px touch area, and they no longer explain themselves in sentences under their fields. An animation's card is shorter: one row says which screens it plays on, times are labelled fields with their unit, and a unit shows in an empty field too. Writing uses the admin's type sizes. A heading has one **Anchor** field, and a block's ID is **Copy ID** in its menu instead of a line under Advanced.

### Removed

- **Breaking.** The builder no longer registers a second set of icons under `b-<name>` (`b-trash`, `b-plus`): the block editor uses the admin's own icon names, and its bundle is half the size. A plugin that named one writes the admin's name (`trash`) or the Phosphor name instead.
- **Breaking.** Style keys are CSS properties by their own names. The shorthands `direction`, `wrap`, `justify`, `align`, `paddingX`, `paddingY`, `marginX`, `marginY`, `radius`, `shadow`, `colSpan` and `bg` are no longer understood in a block's `style`, in `bind` (`style:<property>`) or in the design's element styles; write `flexDirection`, `flexWrap`, `justifyContent`, `alignItems`, `paddingInline`, `paddingBlock`, `marginInline`, `marginBlock`, `borderRadius`, `boxShadow`, `gridColumn` and `backgroundColor`. Styles saved through the CMS already hold the full names. A binding saved as `style:bg` or another shorthand was stored as written: it now does nothing until it is saved under the full name. `blocks/types` no longer lists `aliases`.

### Fixed

- `fieldsets/save` refuses a field of a type that does not exist, a handle used twice and fields nested too deep, as `collections/save` does. It checked handles only, so a fieldset could be saved that no collection could then import.
- A number given as text (a query string, `cms run --key=value`) that is too large to be one is refused as invalid input. It was silently cut down to the largest integer.
- A row of a list shows the focus ring when you reach it with the keyboard, and a field that has the focus is clear to see in the dark theme.
- On a touch screen every button is at least 44px to hit, whatever its size, and a dialog's buttons on a phone are 44px tall with more room between and under them.
- `GET /api/v1/abilities/{name}` reads numbers and booleans from the query string (`?perPage=5`, `?force=true`) as the ability's schema asks for them, instead of refusing them as text.
- A calendar shows a record's title across the whole day: its actions lie over the end of the title while you point at the record or reach it with the keyboard.
- On a touch screen a segmented control's options, a page's tabs and a widget's link are 44px tall to hit, and what a row can do is always on view. With a keyboard a row's actions show as soon as the row has the focus.
- The search field of a collection's list names the list ("Search Pages") instead of reading "Search …", and an empty collection says "No pages yet" instead of "No {items} yet". Search fields in lists, pickers, the store, the menu editor and the command palette say "Search" or name what they search ("Search People"), without an ellipsis.
- The selection bar stays on one line on a phone, and a main button that is off is pale with quiet words, in light and dark, instead of a faded copy of itself.
- Choosing an image for a field while the library has none says "No images yet" and offers the upload, not "No matches".
- **Users** and the **Audit Log** keep their tabs when you open their Settings tab.
- On a phone a screen inside another (a collection's fields, a menu, a section of the design) has a way back to the one above it, the top bar's last button sits as far from the edge as its first, and the sidebar button and the way back are far enough apart to hit the right one.
- The chat's model picker holds its place while the models load instead of appearing late, and is the same button as everywhere else.
- Comments: Resolve, Edit and Delete show on a touch screen, where they were hidden until a pointer rested on the comment. An entry without comments says so the way every empty panel does, and saving an edited comment says **Save Comment**.

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
