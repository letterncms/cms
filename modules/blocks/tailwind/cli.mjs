// The compiler for a server that has Node: `node compile.mjs < source.json > site.css`.
// PHP hands it the same source the admin compiles in the browser (Styling\Compiler).
import { build } from './compile'

let input = ''
process.stdin.setEncoding('utf8')
for await (const chunk of process.stdin) input += chunk

try {
  process.stdout.write(await build(JSON.parse(input)))
} catch (error) {
  process.stderr.write(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
