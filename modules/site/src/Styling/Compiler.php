<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

/**
 * Tailwind on the server: Node 20 or newer runs the compiler the blocks module is built with
 * (modules/blocks/dist/tailwind/compile.mjs, Tailwind itself in one file). A server without Node
 * compiles nothing: the admin does it in the browser with the same code and hands the CSS back.
 *
 * `CMS_NODE` names the binary when it is not `node` on the PATH.
 */
class Compiler
{
    private const int SECONDS = 30;

    private ?string $node = null;

    private bool $looked = false;

    /** The Node binary that can compile, or null. */
    public function node(): ?string
    {
        if ($this->looked) {
            return $this->node;
        }

        $this->looked = true;

        if (! function_exists('proc_open') || ! is_file($this->script())) {
            return null;
        }

        $binary = (string) (getenv('CMS_NODE') ?: 'node');
        $version = $this->run([$binary, '--version'], '');

        return $this->node = $version !== null && preg_match('/^v(\d+)\./', trim($version), $m) && (int) $m[1] >= 20 ? $binary : null;
    }

    /**
     * The CSS of a source ({css, files, candidates}), or null where there is no Node.
     *
     * @throws StylingException when the stylesheet does not compile
     */
    public function compile(array $source): ?string
    {
        if (($node = $this->node()) === null) {
            return null;
        }

        $error = '';
        $css = $this->run([$node, $this->script()], (string) json_encode($source, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), $error);

        return $css ?? throw new StylingException($error !== '' ? $error : __('The stylesheet could not be compiled.'));
    }

    private function script(): string
    {
        return dirname(__DIR__, 3).'/blocks/dist/tailwind/compile.mjs';
    }

    /** A command's output, or null when it failed, with what it said in $error. */
    private function run(array $command, string $input, string &$error = ''): ?string
    {
        $process = @proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);

        if (! is_resource($process)) {
            return null;
        }

        stream_set_blocking($pipes[1], false);
        stream_set_blocking($pipes[2], false);
        stream_set_blocking($pipes[0], false);

        $out = '';
        $written = 0;
        $until = microtime(true) + self::SECONDS;

        while (microtime(true) < $until) {
            if ($written < strlen($input)) {
                $bytes = @fwrite($pipes[0], substr($input, $written, 65536));
                $written += $bytes === false ? strlen($input) : $bytes;
                $written >= strlen($input) && fclose($pipes[0]);
            } elseif (is_resource($pipes[0])) {
                fclose($pipes[0]);
            }

            $out .= (string) stream_get_contents($pipes[1]);
            $error .= (string) stream_get_contents($pipes[2]);

            if (feof($pipes[1]) && feof($pipes[2])) {
                break;
            }

            usleep(2000);
        }

        is_resource($pipes[0]) && fclose($pipes[0]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        // Once the process has ended its exit code is the status's: proc_close no longer has it.
        for ($i = 0; ($status = proc_get_status($process))['running'] && $i < 500 && microtime(true) < $until; $i++) {
            usleep(2000);
        }

        $status['running'] && proc_terminate($process);
        proc_close($process);

        return ! $status['running'] && $status['exitcode'] === 0 ? $out : null;
    }
}
