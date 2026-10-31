<?php

declare(strict_types=1);

namespace Cms\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Cms\Users\Passwords;
use Cms\Users\User;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

final class UserCommand extends Command
{
    protected $signature = 'user:create {--name=} {--email=} {--password=} {--role=admin} {--super}';

    protected $description = 'Create a user';

    public function handle(): int
    {
        $name = $this->option('name') ?: text('Name', required: true);
        $email = strtolower((string) ($this->option('email') ?: text('Email', required: true, validate: fn ($v) => filter_var($v, FILTER_VALIDATE_EMAIL) ? null : 'Enter a valid email.')));
        $pass = $this->option('password') ?: password('Password', required: true);

        $validator = Validator::make(['password' => $pass, 'email' => $email], ['password' => Passwords::rules(), 'email' => ['email', 'unique:users,email']]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::query()->create(['name' => $name, 'email' => $email, 'password' => $pass, 'roles' => [(string) $this->option('role')], 'super' => (bool) $this->option('super')]);
        $this->components->info("Created {$user->email}.");

        return self::SUCCESS;
    }
}
