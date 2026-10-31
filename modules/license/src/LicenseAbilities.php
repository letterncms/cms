<?php

declare(strict_types=1);

namespace Cms\Modules\License;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use RuntimeException;

/** Read the licence state, put a key in place, refresh. Registered only with a paid plugin on; runs only when asked. */
final class LicenseAbilities
{
    public function register(AbilityRegistry $a): void
    {
        $service = static fn (): LicenseService => app(LicenseService::class);

        $a->register('license/status', [
            'label' => 'Licence Status',
            'description' => 'This site\'s paid plugin licences: the host, its class, each plugin\'s state and level.',
            'permission' => 'license.view',
            'annotations' => ['readOnly' => true],
            'handler' => static fn () => $service()->report()->toArray(),
        ]);

        $a->register('license/install', [
            'label' => 'Add Licence Key',
            'description' => 'Put a licence key (a signed token) in place for this site.',
            'permission' => 'license.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['token' => ['type' => 'string', 'maxLength' => 8192]], 'required' => ['token']],
            'handler' => static function (array $in) use ($service) {
                try {
                    return $service()->install($in['token'])->toArray();
                } catch (RuntimeException $e) {
                    throw AbilityException::conflict($e->getMessage());
                }
            },
        ]);

        $a->register('license/clear', [
            'label' => 'Remove Licence Key',
            'description' => 'Remove this site\'s licence key. The site keeps working.',
            'permission' => 'license.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'handler' => static fn () => $service()->clear()->toArray(),
        ]);

        $a->register('license/refresh', [
            'label' => 'Refresh Licence',
            'description' => 'Ask the licence server for a current token: at most once a day, whoever asks.',
            // Any signed-in person's visit keeps a licence current; there is no input and nothing comes back.
            'permission' => static fn ($user) => $user !== null,
            'expose' => ['mcp' => false, 'assistant' => false],
            'handler' => static fn () => ['result' => $service()->refresh()],
        ]);
    }
}
