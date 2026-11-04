# Changelog

## Unreleased

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
