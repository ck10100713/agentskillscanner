import { define } from 'gunshi'
import { MultiScanner } from '../multi-scanner.js'
import { formatTerminal, formatJson } from '../formatter.js'
import { SkillLevel, Tool } from '../types.js'
import type { Tool as ToolType } from '../types.js'

const LEVEL_MAP: Record<string, SkillLevel> = {
  user: SkillLevel.USER,
  project: SkillLevel.PROJECT,
  plugin: SkillLevel.PLUGIN,
  enterprise: SkillLevel.ENTERPRISE,
}

const TOOL_MAP: Record<string, ToolType> = {
  'claude-code': Tool.CLAUDE_CODE,
  claude: Tool.CLAUDE_CODE,
  codex: Tool.CODEX,
  gemini: Tool.GEMINI,
  copilot: Tool.COPILOT,
}

export function createScanCommand(version: string) {
  return define({
    name: 'agentskillscanner',
    version,
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
      tool: {
        type: 'string',
        short: 't',
        description: '篩選工具：claude-code, codex, gemini, copilot（可用逗號分隔多個）',
      },
      verbose: {
        type: 'boolean',
        short: 'V',
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

      // Parse tool filter
      let toolFilter: ToolType[] | undefined
      const toolArg = ctx.values.tool
      if (toolArg) {
        const parts = toolArg.split(',').map(s => s.trim().toLowerCase())
        toolFilter = parts
          .map(v => TOOL_MAP[v])
          .filter((v): v is ToolType => v !== undefined)
        if (toolFilter.length === 0) toolFilter = undefined
      }

      const scanner = new MultiScanner(projectDir)
      const result = scanner.scan(toolFilter, levelFilter)

      if (json) {
        console.log(formatJson(result, version))
      } else {
        console.log(formatTerminal(result, verbose ?? false, version))
      }
    },
  })
}
