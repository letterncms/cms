<?php

declare(strict_types=1);

namespace Cms\Modules\License;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use RuntimeException;
use Cms\Support\Schema\Shape;

/** Read the licence state, put a key in place, refresh. Registered only with a paid plugin on; runs only when asked. */
final class LicenseAbilities
{
    public function register(AbilityRegistry $a): void
    {
        $service = static fn (): LicenseService => app(LicenseService::class);

        $a->register('license/status', [
            'label' => 'License Status',
            'description' => 'This site\'s paid plugin licenses: the host, its class, each plugin\'s state and level.',
            'permission' => 'license.view',
            'annotations' => ['readOnly' => true],
            // Each plugin by the name people know it by, beside its package name.
            'output' => self::report()->with([
                'items' => Shape::map(self::item()->with(['label' => Shape::STRING])),
                'list' => [['product' => Shape::STRING, 'label' => Shape::STRING, 'state' => Shape::STRING, 'standing' => Shape::enum('active', 'limited', 'attention'), 'level' => Shape::INTEGER]],
            ]),
            'handler' => static function () use ($service) {
                $report = $service()->report()->toArray();
                $packages = cms()->packages()->repository();

                foreach ($report['items'] as $product => $item) {
                    $report['items'][$product]['label'] = $packages->find((string) $product)?->label ?? $product;
                }

                return [...$report, 'list' => LicenseViews::rows($report['items'])];
            },
        ]);

        $a->register('license/install', [
            'label' => 'Add License Key',
            'description' => 'Put a license key (a signed token) in place for this site.',
            'permission' => 'license.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'input' => ['type' => 'object', 'properties' => ['token' => ['type' => 'string', 'maxLength' => 8192]], 'required' => ['token']],
            'output' => self::report(),
            'handler' => static function (array $in) use ($service) {
                try {
                    return $service()->install($in['token'])->toArray();
                } catch (RuntimeException $e) {
                    throw AbilityException::conflict($e->getMessage());
                }
            },
        ]);

        $a->register('license/clear', [
            'label' => 'Remove License Key',
            'description' => 'Remove this site\'s license key. The site keeps working.',
            'permission' => 'license.manage',
            'expose' => ['mcp' => false, 'assistant' => false],
            'annotations' => ['destructive' => true],
            'output' => self::report(),
            'handler' => static fn () => $service()->clear()->toArray(),
        ]);

        $a->register('license/refresh', [
            'label' => 'Refresh License',
            'description' => 'Ask the license server for a current token: at most once a day, whoever asks.',
            // Any signed-in person's visit keeps a licence current; there is no input and nothing comes back.
            'permission' => static fn ($user) => $user !== null,
            'expose' => ['mcp' => false, 'assistant' => false],
            'output' => Shape::of(['result' => Shape::enum('skipped', 'failed', 'unchanged', 'updated')]),
            'handler' => static fn () => ['result' => $service()->refresh()],
        ]);
    }

    /** LicenseReport::toArray(): the host, the key's state and each paid plugin's. */
    private static function report(): Shape
    {
        return Shape::of([
            'host' => Shape::STRING, 'class' => Shape::STRING, 'token' => Shape::STRING, 'lid' => Shape::STRING_OR_NULL, 'rev' => Shape::INTEGER_OR_NULL,
            'level' => Shape::INTEGER, 'items' => Shape::map(self::item()), 'notes' => [Shape::STRING], 'domains' => [Shape::STRING],
        ]);
    }

    /** One paid plugin in a report. */
    private static function item(): Shape
    {
        return Shape::of([
            'edition' => Shape::STRING_OR_NULL, 'status' => Shape::STRING_OR_NULL, 'level' => Shape::INTEGER, 'reason' => Shape::STRING,
            'upd' => Shape::STRING_OR_NULL, 'trm' => Shape::STRING_OR_NULL,
        ]);
    }
}
