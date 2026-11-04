<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Support\Files;
use Cms\Support\Yaml;
use Illuminate\Filesystem\Filesystem;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Process\Process;

/**
 * Every plugin off, alone and in combination, with public accounts on: the site, the admin, every read-only
 * ability, editing an existing entry and a full build keep working, and turning
 * everything back on brings the content back whole. One process per configuration.
 */
final class PluginIsolationTest extends TestCase
{
    private const array MODULES = ['letterncms/audit', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/collections', 'letterncms/dashboard', 'letterncms/globals', 'letterncms/languages', 'letterncms/mcp', 'letterncms/users'];

    private const int PARALLEL = 4;

    private string $root;

    protected function setUp(): void
    {
        $this->root = sys_get_temp_dir().'/cms-isolation-'.bin2hex(random_bytes(6));
    }

    protected function tearDown(): void
    {
        Files::deleteDirectory($this->root);
    }

    public function test_every_plugin_can_be_off_alone_and_in_combination(): void
    {
        $all = $this->plugins();
        $all === [] && $this->markTestSkipped("Needs every plugin, which aren't installed here.");
        $this->assertContains('letterncms/site', array_keys($all));

        $seed = $this->root.'/seed';
        $this->writeSite($seed, array_keys($all));
        $seeded = $this->outcome($this->probe($seed, 'seed'), 'seed');
        $this->assertSame([], $seeded['problems']);
        $this->assertSame([], array_values(array_diff(array_keys($all), $seeded['active'])), json_encode($seeded['inactive']));

        $failures = [];
        $names = array_keys($all);
        $configurations = ['nothing' => ['enabled' => []]];

        foreach ($names as $i => $name) {
            $configurations["only {$name}"] = ['enabled' => $this->withRequirements($name, $all)];
            $configurations["without {$name}"] = ['enabled' => array_values(array_diff($names, [$name]))];

            foreach (array_slice($names, $i + 1) as $other) {
                $configurations["without {$name} and {$other}"] = ['enabled' => array_values(array_diff($names, [$name, $other]))];
            }
        }

        foreach (self::MODULES as $module) {
            $configurations["without module {$module}"] = ['enabled' => $names, 'disabled' => [$module]];
        }

        $configurations['without every optional module'] = ['enabled' => $names, 'disabled' => self::MODULES];
        $configurations['only the required modules'] = ['enabled' => [], 'disabled' => self::MODULES];

        $this->runAll($configurations, $seed, $failures);

        $this->assertSame([], $failures, implode("\n\n", $failures));
    }

    /** @param array<string, array{enabled: list<string>, disabled?: list<string>}> $configurations */
    private function runAll(array $configurations, string $seed, array &$failures): void
    {
        $files = new Filesystem;
        $queue = $configurations;
        $running = [];
        $all = array_keys($this->plugins());

        while ($queue !== [] || $running !== []) {
            while ($queue !== [] && count($running) < self::PARALLEL) {
                $label = array_key_first($queue);
                $state = $queue[$label];
                unset($queue[$label]);
                $site = $this->root.'/'.md5($label);
                (new Process(['cp', '-a', $seed, $site]))->mustRun(); // Keeps the plugin links as links.
                Yaml::write($site.'/config/plugins.yaml', $state);
                $running[$label] = ['site' => $site, 'step' => 'check', 'process' => $this->probe($site, 'check', start: true)];
            }

            usleep(20_000);

            foreach ($running as $label => $job) {
                if ($job['process']->isRunning()) {
                    continue;
                }

                $result = $this->outcome($job['process'], $label);

                foreach ($result['problems'] as $problem) {
                    $failures[] = "{$label}: {$problem}";
                }

                if ($job['step'] === 'check') {
                    // On again: nothing an off plugin left behind was lost in the save.
                    Yaml::write($job['site'].'/config/plugins.yaml', ['enabled' => $all]);
                    $running[$label] = ['site' => $job['site'], 'step' => 'compare', 'process' => $this->probe($job['site'], 'compare', start: true)];
                } else {
                    Files::deleteDirectory($job['site']);
                    unset($running[$label]);
                }
            }
        }
    }

    /** @return array{problems: list<string>, active: list<string>, inactive: array<string, string>} */
    private function outcome(Process $process, string $label): array
    {
        if (preg_match('/^RESULT:(.*)$/m', $process->getOutput(), $m)) {
            return json_decode($m[1], true);
        }

        return ['problems' => ["died with exit {$process->getExitCode()}: ".mb_substr($process->getOutput().$process->getErrorOutput(), 0, 2000)], 'active' => [], 'inactive' => []];
    }

    private function probe(string $site, string $action, bool $start = false): Process
    {
        $process = new Process([PHP_BINARY, dirname(__DIR__).'/fixtures/isolation-probe.php', $site, $action], env: ['DB_DATABASE' => $site.'/db.sqlite'], timeout: 120);
        $start ? $process->start() : $process->run();

        return $process;
    }

    private function writeSite(string $site, array $enabled): void
    {
        Yaml::write($site.'/config/site.yaml', ['name' => 'Isolation', 'url' => 'http://localhost', 'locale' => 'en', 'locales' => ['en', 'de']]);
        Yaml::write($site.'/config/plugins.yaml', ['enabled' => $enabled]);
        // Public accounts on, as a site that sells or gates content has them.
        Yaml::write($site.'/config/accounts.yaml', ['enabled' => true, 'sign_up' => 'open']);
        Yaml::write($site.'/content/collections/pages.yaml', ['title' => 'Pages', 'singular' => 'Page', 'route' => '/{slug}', 'home' => 'home', 'body' => 'content', 'fields' => [['handle' => 'content', 'type' => 'blocks']]]);
        touch($site.'/db.sqlite');
        @mkdir($site.'/plugins', 0o777, true);

        foreach (glob((getenv('CMS_TEST_PLUGINS') ?: getcwd().'/plugins').'/*', GLOB_ONLYDIR) ?: [] as $plugin) {
            symlink($plugin, $site.'/plugins/'.basename($plugin));
        }
    }

    /** @return array<string, list<string>> The default plugins: name => other plugins it requires. */
    private function plugins(): array
    {
        $out = [];

        foreach ((glob((getenv('CMS_TEST_PLUGINS') ?: getcwd().'/plugins').'/*/composer.json') ?: []) as $file) {
            $composer = json_decode((string) file_get_contents($file), true);
            $out[$composer['name']] = array_values(array_filter(array_keys($composer['require'] ?? []), static fn (string $dep) => str_starts_with($dep, 'cms/') && $dep !== 'letterncms/cms'));
        }

        return $out;
    }

    /** @return list<string> */
    private function withRequirements(string $name, array $all): array
    {
        $out = [$name];

        foreach ($all[$name] ?? [] as $dep) {
            $out = [...$out, ...$this->withRequirements($dep, $all)];
        }

        return array_values(array_unique($out));
    }
}
