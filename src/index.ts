import { createRequire } from 'node:module'
import { cli } from 'gunshi'
import updateNotifier from 'update-notifier'
import { createScanCommand } from './commands/index.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')
updateNotifier({ pkg }).notify()

await cli(process.argv.slice(2), createScanCommand(pkg.version), {
  version: pkg.version,
})
