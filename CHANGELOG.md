# Changelog

## Unreleased

### Added

- Pick any icon for a collection or a global set: a searchable list of all 1,500 Phosphor icons, found by name or by what they are for ("email" finds the envelope).
- Plugins can dock a column beside the page on every screen: the `shell.dock` slot with `Dock` from `@letterncms/ui`. A `topbar.end` panel sits at the far end of every screen's bar, and an editor's own tools go in that bar through `toolbar` in `EntryEditorProps`. A nav item can run a command instead of leading to a screen, and a `nav.<id>` panel can show its status beside its label. Routes can open over the screen they came from (`overlay`) and keep what they show private (`private`).
- Skills: ready-made ways of working for agents, registered with `cms()->skills()`. Every agent gets them: the assistant's `/`, and MCP clients as prompts.
- Plugins can add to what `@` and `/` offer in a chat with `registry.composer`, and offer things from a screen with `useScreenContext({ items })`. All of it is one thing, a `ContextItem`.
- Abilities can mark a change that stays a draft (`annotations: ['draft' => true]`), for agents to treat as safe to undo unless a call publishes it. `entries/create` and `entries/update` do.
- Screens can say what they show with `useScreenContext`, for whatever works alongside them. An open entry shows changes made from outside as they happen, and `events.emit('content.changed')` asks it to look.

### Changed

- There are never more than two side panels: one on the left and one on the right. A screen that uses the right edge says so with `useScreenContext({ rightEdge: true })`, and a `Dock` then gets `floating`, a card over the page.

- The sidebar is there or it isn't: hide it and it's gone, with a button at the top left and `⌘\` to bring it back. It stays that way until you change it. It no longer folds to a row of icons. A screen can bring a state of its own to it with `ScreenSidebar` from `@letterncms/ui`, like the settings one, with a way back, and folded away to start with.
- On a phone the sidebar opens from that button instead of keeping a row of icons down the side, so screens get the full width.

### Removed

- **Breaking.** The `sidebar.history` slot, and `shell.compact`. Use `ScreenSidebar`.

### Fixed

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
