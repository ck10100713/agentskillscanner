import type { Tool, SkillLevel, ScanResult } from './types.js'

export interface ToolScanner {
  readonly tool: Tool
  scan(levels?: SkillLevel[]): ScanResult
}
