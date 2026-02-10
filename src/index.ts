import { cli } from 'gunshi'
import { scanCommand } from './commands/index.js'

await cli(process.argv.slice(2), scanCommand)
