<?php

declare(strict_types=1);

use Cms\Settings\SettingsRegistry;
use Cms\Support\Yaml;
use Cms\Users\Accounts;
use Cms\Users\Roles;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The role a visitor's account gets was `member` and is `visitor`. What a site stored under the old id
 * follows: its users' roles, the role new visitors get (config/accounts.yaml) and, where the site saved
 * its roles, the role itself (config/roles.yaml). Nothing to do on a new site, and nothing the second time.
 */
return new class extends Migration
{
    private const string FROM = 'member';

    private const string TO = 'visitor';

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

        // The text of the column, not a JSON function: those differ per database, and SQLite's breaks under a table prefix.
        foreach (DB::table('users')->where('roles', 'like', '%"'.self::FROM.'"%')->select(['id', 'roles'])->lazyById(500) as $user) {
            $held = (array) json_decode((string) $user->roles, true);

            if (in_array(self::FROM, $held, true)) {
                $held = array_map(static fn (mixed $role): mixed => $role === self::FROM ? self::TO : $role, $held);

                DB::table('users')->where('id', $user->id)->update(['roles' => json_encode(array_values(array_unique($held)))]);
            }
        }
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
