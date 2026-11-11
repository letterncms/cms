<?php

declare(strict_types=1);

namespace Cms\Console;

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
            return $this->failure('The user is not valid.', 'invalid_input', array_map(static fn (array $messages) => $messages[0], $validator->errors()->toArray()));
        }

        $user = User::query()->create(['name' => $name, 'email' => $email, 'password' => $pass, 'roles' => [(string) $this->option('role')], 'super' => (bool) $this->option('super')]);
        $this->components->info("Created {$user->email}.");

        return $this->done(['id' => $user->id, 'email' => $user->email, 'roles' => $user->roles, 'super' => (bool) $user->super]);
    }
}
