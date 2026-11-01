# The CMS

The kernel of the CMS: content, users, abilities, the admin and everything plugins build on. A site doesn't install this directly: start from the [`letterncms/lettern`](https://github.com/letterncms/lettern) project, or the zip.

```bash
composer create-project letterncms/lettern my-site
```

## Working on it

You need PHP 8.4 and Composer:

```bash
git clone https://github.com/letterncms/cms
cd cms
composer install
composer test
```

Tests that turn on a plugin skip themselves here. The admin takes Node 22 and pnpm:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

To try a change in a real site, build the admin, then make a site next to your clone and point it there:

```bash
composer create-project letterncms/lettern ../sandbox
cd ../sandbox
composer config repositories.cms path ../cms
composer update letterncms/cms
php cms install
php cms serve
```
