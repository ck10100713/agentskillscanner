import { define } from 'gunshi'
import { Scanner } from '../scanner.js'
import { formatTerminal, formatJson } from '../formatter.js'
import { SkillLevel } from '../types.js'

const LEVEL_MAP: Record<string, SkillLevel> = {
  user: SkillLevel.USER,
  project: SkillLevel.PROJECT,
  plugin: SkillLevel.PLUGIN,
  enterprise: SkillLevel.ENTERPRISE,
}

export const scanCommand = define({
  name: 'agentskillscanner',
  description: 'Scan and report all available skills for AI coding assistants',
  args: {
    json: {
      type: 'boolean',
      short: 'j',
      description: '以 JSON 格式輸出',
      default: false,
    },
    'project-dir': {
      type: 'string',
      short: 'd',
      description: '專案目錄（預設：目前工作目錄）',
      default: process.cwd(),
    },
    level: {
      type: 'string',
      short: 'l',
      description: '篩選層級：user, project, plugin, enterprise（可用逗號分隔多個）',
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      description: '顯示完整描述與路徑',
      default: false,
    },
  },
  run: (ctx) => {
    const { json, verbose } = ctx.values
    const projectDir = ctx.values['project-dir'] ?? process.cwd()

    // Parse level filter
    let levelFilter: SkillLevel[] | undefined
    const levelArg = ctx.values.level
    if (levelArg) {
      const parts = levelArg.split(',').map(s => s.trim().toLowerCase())
      levelFilter = parts
        .map(v => LEVEL_MAP[v])
        .filter((v): v is SkillLevel => v !== undefined)
      if (levelFilter.length === 0) levelFilter = undefined
    }

    const scanner = new Scanner(projectDir)
    const result = scanner.scan(levelFilter)

    if (json) {
      console.log(formatJson(result))
    } else {
      console.log(formatTerminal(result, verbose ?? false))
    }
  },
})
