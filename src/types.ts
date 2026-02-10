export const Tool = {
  CLAUDE_CODE: 'claude-code',
  CODEX: 'codex',
  GEMINI: 'gemini',
  COPILOT: 'copilot',
} as const

export type Tool = (typeof Tool)[keyof typeof Tool]

export const TOOL_LABELS: Record<Tool, string> = {
  [Tool.CLAUDE_CODE]: 'Claude Code',
  [Tool.CODEX]: 'OpenAI Codex CLI',
  [Tool.GEMINI]: 'Gemini CLI',
  [Tool.COPILOT]: 'GitHub Copilot CLI',
}

export const SkillLevel = {
  USER: 'user',
  PROJECT: 'project',
  PLUGIN: 'plugin',
  ENTERPRISE: 'enterprise',
} as const

export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel]

export const SkillType = {
  SKILL: 'skill',
  COMMAND: 'command',
  AGENT: 'agent',
  HOOK: 'hook',
} as const

export type SkillType = (typeof SkillType)[keyof typeof SkillType]

export const LEVEL_LABELS: Record<SkillLevel, string> = {
  [SkillLevel.USER]: '使用者層級 (User)',
  [SkillLevel.PROJECT]: '專案層級 (Project)',
  [SkillLevel.PLUGIN]: '外掛層級 (Plugin)',
  [SkillLevel.ENTERPRISE]: '企業層級 (Enterprise)',
}

export const TYPE_LABELS: Record<SkillType, string> = {
  [SkillType.SKILL]: '技能',
  [SkillType.COMMAND]: '命令',
  [SkillType.AGENT]: '代理',
  [SkillType.HOOK]: '鉤子',
}

export interface SkillInfo {
  name: string
  tool: Tool
  skillType: SkillType
  level: SkillLevel
  description: string
  path: string
  pluginName: string
  marketplace: string
  enabled: boolean
  extra: Record<string, string>
}

export interface PluginInfo {
  name: string
  tool: Tool
  marketplace: string
  installPath: string
  version: string
  enabled: boolean
  description: string
  author: string
  items: SkillInfo[]
}

export interface ScanResult {
  skills: SkillInfo[]
  plugins: PluginInfo[]
}

export function byLevel(result: ScanResult, level: SkillLevel): SkillInfo[] {
  return result.skills.filter(s => s.level === level)
}

export function byTool(result: ScanResult, tool: Tool): ScanResult {
  return {
    skills: result.skills.filter(s => s.tool === tool),
    plugins: result.plugins.filter(p => p.tool === tool),
  }
}
