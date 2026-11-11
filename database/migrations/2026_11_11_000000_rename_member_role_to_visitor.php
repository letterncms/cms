<?php

declare(strict_types=1);

use Cms\Content\Collections\CollectionRepository;
use Cms\Content\Entries\EntryGate;
use Cms\Content\Entries\FileDriver;
use Cms\Content\Entries\Frontmatter;
use Cms\Settings\SettingsRegistry;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Cms\Users\Accounts;
use Cms\Users\Roles;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The role a visitor's account gets was `member` and is `visitor`. What a site stored under the old id
 * follows: its users' roles, the role new visitors get (config/accounts.yaml), where the site saved its
 * roles, the role itself (config/roles.yaml), and the lists of who may read a collection or an entry
 * (`gate.access`). Nothing to do on a new site, and nothing the second time.
 */
return new class extends Migration
{
    private const string FROM = 'member';

    private const string TO = 'visitor';

    private const int JSON = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR;

    private bool $keep = false;

    public function up(): void
    {
        $roles = $this->read(Roles::SETTINGS);
        $own = is_array($roles['roles'] ?? null) ? $roles['roles'] : [];

        // A site that made a `visitor` role of its own keeps both as they are: `member` can't be renamed onto it.
        if (isset($own[self::TO])) {
            return;
        }

        if (isset($own[self::FROM])) {
            $renamed = [];

            foreach ($own as $handle => $role) {
                $renamed[$handle === self::FROM ? self::TO : $handle] = $role;
            }

            $this->write(Roles::SETTINGS, [...$roles, 'roles' => $renamed]);
        }

        $accounts = $this->read(Accounts::SETTINGS);

        if (($accounts['default_role'] ?? null) === self::FROM) {
            $this->write(Accounts::SETTINGS, [...$accounts, 'default_role' => self::TO]);
        }

        // Every row is read and looked at here: a predicate on the JSON column would have to be written per database.
        foreach (DB::table('users')->select(['id', 'roles'])->lazyById(500) as $user) {
            $held = $user->roles === null ? null : json_decode((string) $user->roles, true);

            if (is_array($held) && in_array(self::FROM, $held, true)) {
                DB::table('users')->where('id', $user->id)->update(['roles' => json_encode($this->renamed($held))]);
            }
        }

        $this->gates();
    }

    /**
     * Collections and entries say who may read them in `gate.access`, a list of roles and access names: the
     * role follows there too, or the visitors it let in are locked out. Read from where it is stored (the
     * collections' YAML, the entries table, the Markdown files and both kinds of working copy), because this
     * also runs where no module is booted.
     */
    private function gates(): void
    {
        // `member` given to someone as an access name stays in the lists, beside the role's new id.
        $this->keep = DB::table('account_grants')->where('access', self::FROM)->exists();
        $collections = content_path('collections');

        foreach (glob($collections.'/*.yaml') ?: [] as $file) {
            $definition = Yaml::read($file);

            if ($this->gate($definition)) {
                Yaml::write($file, $definition);
            }
        }

        foreach (is_dir($collections) ? new RecursiveIteratorIterator(new RecursiveDirectoryIterator($collections, FilesystemIterator::SKIP_DOTS)) : [] as $file) {
            if ($file->isFile() && $file->getExtension() === 'md') {
                [$meta, $body] = Frontmatter::parse((string) file_get_contents($file->getPathname()));

                if ($this->gate($meta)) {
                    Files::put($file->getPathname(), Frontmatter::dump($meta, $body));
                }
            }
        }

        foreach (glob(storage_path('drafts/*.json')) ?: [] as $file) {
            $draft = json_decode((string) file_get_contents($file), true);

            if (is_array($draft) && $this->working($draft)) {
                Files::put($file, json_encode($draft, self::JSON | JSON_PRETTY_PRINT));
            }
        }

        foreach (DB::table('entries')->select(['id', 'data', 'draft'])->lazyById(200) as $entry) {
            $changes = [];

            foreach (['data', 'draft'] as $column) {
                $values = $entry->{$column} === null ? null : json_decode((string) $entry->{$column}, true);

                if (is_array($values) && ($column === 'data' ? $this->gate($values) : $this->working($values))) {
                    $changes[$column] = json_encode($values, self::JSON);
                }
            }

            if ($changes !== []) {
                DB::table('entries')->where('id', $entry->id)->update($changes);
            }
        }

        // What was read before is stale, also the file entries' index, which a rewrite within its second would not renew.
        array_map(unlink(...), glob(storage_path('cache/entries/*.ser')) ?: []);
        app(CollectionRepository::class)->flush();
        app(FileDriver::class)->flush();
        app(EntryGate::class)->forget();
    }

    /** Renames the role in the `gate.access` of a collection's definition or an entry's data; says whether it was there. */
    private function gate(array &$holder): bool
    {
        $access = $holder['gate']['access'] ?? null;

        if (! is_array($access) || ! in_array(self::FROM, $access, true)) {
            return false;
        }

        $renamed = $this->keep ? array_values(array_unique([...$access, self::TO])) : $this->renamed($access);

        if ($renamed === $access) {
            return false;
        }

        $holder['gate']['access'] = $renamed;

        return true;
    }

    /** A working copy holds the entry's data under `data`, beside its title and slug. */
    private function working(array &$draft): bool
    {
        if (! is_array($draft['data'] ?? null)) {
            return false;
        }

        return $this->gate($draft['data']);
    }

    /** The list with `visitor` where `member` was, once. */
    private function renamed(array $list): array
    {
        return array_values(array_unique(array_map(static fn (mixed $item): mixed => $item === self::FROM ? self::TO : $item, $list)));
    }

    /** The old id is not put back: nothing remembers which visitor was a member. */
    public function down(): void {}

    /** What the settings file holds, as the settings registry reads it: nothing when the site never saved it. */
    private function read(string $namespace): array
    {
        return Yaml::read($this->file($namespace));
    }

    private function write(string $namespace, array $values): void
    {
        Yaml::write($this->file($namespace), $values);
        app(SettingsRegistry::class)->forget($namespace);
    }

    private function file(string $namespace): string
    {
        return site_path("config/{$namespace}.yaml");
    }
};
