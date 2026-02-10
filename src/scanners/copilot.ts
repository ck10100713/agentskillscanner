import { join, resolve } from 'node:path'
import { homedir } from 'node:os'
import type { SkillInfo, ScanResult } from '../types.js'
import { Tool, SkillLevel, SkillType } from '../types.js'
import type { ToolScanner } from '../tool-scanner.js'
import { isFile, readFileSafe } from '../fs-utils.js'

export class CopilotScanner implements ToolScanner {
  readonly tool = Tool.COPILOT
  private projectDir: string
  private home: string

  constructor(projectDir: string) {
    this.projectDir = resolve(projectDir)
    this.home = homedir()
  }

  scan(levels?: SkillLevel[]): ScanResult {
    const targets = levels ?? [SkillLevel.USER, SkillLevel.PROJECT, SkillLevel.PLUGIN, SkillLevel.ENTERPRISE]
    const result: ScanResult = { skills: [], plugins: [] }

    if (targets.includes(SkillLevel.USER)) {
      result.skills.push(...this.scanUser())
    }
    if (targets.includes(SkillLevel.PROJECT)) {
      result.skills.push(...this.scanProject())
    }

    return result
  }

  private scanUser(): SkillInfo[] {
    const mcpConfig = join(this.home, '.copilot', 'mcp-config.json')
    if (!isFile(mcpConfig)) return []

    let data: Record<string, unknown>
    try {
      data = JSON.parse(readFileSafe(mcpConfig))
    } catch {
      return []
    }

    const servers = (data.mcpServers ?? data.servers ?? {}) as Record<string, unknown>
    const items: SkillInfo[] = []

    for (const serverName of Object.keys(servers).sort()) {
      const server = servers[serverName] as Record<string, unknown> | undefined
      const desc = (server?.description as string) ?? ''

      items.push({
        name: serverName,
        tool: this.tool,
        skillType: SkillType.COMMAND,
        level: SkillLevel.USER,
        description: desc,
        path: mcpConfig,
        pluginName: '',
        marketplace: '',
        enabled: true,
        extra: { source: 'mcp-config' },
      })
    }

    return items
  }

  private scanProject(): SkillInfo[] {
    const instrFile = join(this.projectDir, '.github', 'copilot-instructions.md')
    if (!isFile(instrFile)) return []

    const text = readFileSafe(instrFile)
    const firstLine = text.split('\n').find(l => l.trim().length > 0)?.trim() ?? ''
    const desc = firstLine.startsWith('#')
      ? firstLine.replace(/^#+\s*/, '')
      : firstLine.slice(0, 100)

    return [{
      name: 'copilot-instructions',
      tool: this.tool,
      skillType: SkillType.SKILL,
      level: SkillLevel.PROJECT,
      description: desc || 'Copilot project instructions',
      path: instrFile,
      pluginName: '',
      marketplace: '',
      enabled: true,
      extra: {},
    }]
  }
}
