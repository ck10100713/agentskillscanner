import { resolve } from 'node:path'
import type { Tool, SkillLevel, ScanResult } from './types.js'
import { Tool as ToolEnum } from './types.js'
import type { ToolScanner } from './tool-scanner.js'
import { ClaudeCodeScanner, CodexScanner, GeminiScanner, CopilotScanner } from './scanners/index.js'

const ALL_TOOLS: Tool[] = [ToolEnum.CLAUDE_CODE, ToolEnum.CODEX, ToolEnum.GEMINI, ToolEnum.COPILOT]

export class MultiScanner {
  private projectDir: string

  constructor(projectDir: string) {
    this.projectDir = resolve(projectDir)
  }

  scan(tools?: Tool[], levels?: SkillLevel[]): ScanResult {
    const targetTools = tools ?? ALL_TOOLS
    const result: ScanResult = { skills: [], plugins: [] }

    for (const tool of targetTools) {
      const scanner = this.createScanner(tool)
      if (!scanner) continue
      const partial = scanner.scan(levels)
      result.skills.push(...partial.skills)
      result.plugins.push(...partial.plugins)
    }

    return result
  }

  private createScanner(tool: Tool): ToolScanner | null {
    switch (tool) {
      case ToolEnum.CLAUDE_CODE:
        return new ClaudeCodeScanner(this.projectDir)
      case ToolEnum.CODEX:
        return new CodexScanner(this.projectDir)
      case ToolEnum.GEMINI:
        return new GeminiScanner(this.projectDir)
      case ToolEnum.COPILOT:
        return new CopilotScanner(this.projectDir)
      default:
        return null
    }
  }
}
