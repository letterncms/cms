<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->string('name', 191)->primary();
            $table->string('version', 64);
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->json('roles')->nullable();
            $table->boolean('super')->default(false);
            $table->string('avatar', 512)->nullable();
            $table->string('locale', 16)->nullable();
            $table->json('preferences')->nullable();
            $table->json('data')->nullable();
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('api_tokens', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('token_hash', 64)->unique();
            $table->json('scopes')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('collection', 64);
            $table->string('blueprint', 64)->nullable();
            $table->string('locale', 16)->default('en');
            $table->ulid('origin_id')->nullable();
            $table->ulid('parent_id')->nullable();
            $table->integer('position')->default(0);
            $table->string('slug', 191);
            $table->string('uri', 512)->nullable();
            $table->string('title', 512);
            $table->string('status', 16)->default('draft');
            $table->json('data')->nullable();
            $table->json('draft')->nullable();
            $table->ulid('author_id')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['collection', 'locale', 'status']);
            $table->index(['collection', 'parent_id', 'position']);
            $table->index(['locale', 'uri']);
            $table->index('origin_id');
            $table->index(['collection', 'slug']);
        });

        Schema::create('revisions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('entry_id');
            $table->string('collection', 64);
            $table->ulid('user_id')->nullable();
            $table->string('action', 32);
            $table->string('title', 512);
            $table->json('snapshot');
            $table->string('message', 512)->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['entry_id', 'created_at']);
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration')->index();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration')->index();
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->ulid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        foreach (['sessions', 'failed_jobs', 'job_batches', 'jobs', 'cache_locks', 'cache', 'revisions', 'entries', 'api_tokens', 'password_reset_tokens', 'users', 'packages'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
