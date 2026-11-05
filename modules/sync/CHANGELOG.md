# Changelog

Part of the CMS since 0.9.0: newer changes are in [its changelog](../../CHANGELOG.md).

## 0.6.0 (2026-11-04)

### Changed

- **Breaking.** Needs the CMS 0.8, where Site comes with the CMS. After a sync, the static site is rebuilt only when the site builds one.

## 0.5.0 (2026-11-04)

### Changed

- **Breaking.** Needs the CMS 0.7, where Blocks, Email, Collaboration, Languages, MCP, Media and Navigation come with the CMS.

## 0.4.1 (2026-11-04)

### Fixed

- Its words read the same as the rest of the admin in Dutch, French and German: where two packages translated a word differently, which one you saw could change from one page to the next.

## 0.4.0 (2026-11-04)

### Changed

- Needs the CMS 0.5 or later.
- The Sync screen is drawn by the admin like every other place. Each connected site has its name as a heading, with **Disconnect** beside it and **Pull**, **Push** and **Undo Last Push** under it, shown but not possible while a sync runs. **Undo** in **History** is in a row's menu. Needs the CMS with views.
- **Connect a Site** says on the field when a key isn't one, before it asks the other site.

## 0.3.0 (2026-11-04)

### Changed

- Needs the CMS 0.4 or later.
- **Sync** is listed under Plugins in Settings.
- **Connect a Site** is the main button, the sites are a plain list, and **Came In Lately** is **History**, which names each site as you named it here. Rows wrap on a phone instead of cutting off.
- American English: a Sync **license**, **Canceled**. The permission is **Push and Pull Content Between Sites**.
- Whether other sites may pull from or push to this one are **Allow Pull From Other Sites** and **Allow Push From Other Sites**, saved from the save bar.
- **Undo Last Push** and **Disconnect** are buttons in a site's row instead of a ⋯ menu.
- History says what came in: “Pulled from Staging”, or “Staging pushed to this site”.

## 0.2.0 (2026-11-02)

### Added

- A **Sync** widget for the home screen: the sites this one syncs with, when each was last pulled or pushed, and a sync while it runs.

## 0.1.0 (2026-11-02)

### Added

- Push a site to another environment, or pull one into it, from **Sync** in the admin or with `php cms push` and `php cms pull`: the database (all of it, or chosen parts and collections), media, and optionally the files in `content/` and `config/`. Connect two sites by pasting one's connection key into the other.
- A preview of what changes before anything runs, a backup of the receiving site first and **Undo** afterwards, progress as it goes and a transfer that picks up where it stopped after a timeout.
- URLs and folder paths are rewritten on the way, inside JSON and PHP-serialized values too. The receiving site keeps its own `.env`, secrets, keys, plugins, Sync connections and signed-in people.
- Free between local and staging sites. A public site takes part with a Sync licence.
