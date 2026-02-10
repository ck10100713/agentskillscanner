import { join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { parseFrontmatter } from '../frontmatter.js'
import type { SkillInfo, PluginInfo, ScanResult } from '../types.js'
import { Tool, SkillLevel, SkillType } from '../types.js'
import type { ToolScanner } from '../tool-scanner.js'
import { isDir, isFile, sortedDir, readFileSafe } from '../fs-utils.js'

export class GeminiScanner implements ToolScanner {
  readonly tool = Tool.GEMINI
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
    if (targets.includes(SkillLevel.PLUGIN)) {
      const { skills, plugins } = this.scanExtensions()
      result.skills.push(...skills)
      result.plugins.push(...plugins)
    }

    return result
  }

  private scanUser(): SkillInfo[] {
    const skillsDir = join(this.home, '.gemini', 'skills')
    return this.scanSkillDir(skillsDir, SkillLevel.USER)
  }

  private scanProject(): SkillInfo[] {
    const skillsDir = join(this.projectDir, '.gemini', 'skills')
    return this.scanSkillDir(skillsDir, SkillLevel.PROJECT)
  }

  private scanSkillDir(skillsDir: string, level: SkillLevel): SkillInfo[] {
    if (!isDir(skillsDir)) return []

    const items: SkillInfo[] = []
    for (const child of sortedDir(skillsDir)) {
      const childPath = join(skillsDir, child)
      if (!isDir(childPath)) continue

      const skillMd = join(childPath, 'SKILL.md')
      if (!isFile(skillMd)) continue

      const text = readFileSafe(skillMd)
      const fm = parseFrontmatter(text)
      const name = fm.name ?? child
      const desc = fm.description ?? ''
      delete fm.name
      delete fm.description

      items.push({
        name,
        tool: this.tool,
        skillType: SkillType.SKILL,
        level,
        description: desc,
        path: skillMd,
        pluginName: '',
        marketplace: '',
        enabled: true,
        extra: fm,
      })
    }
    return items
  }

  private scanExtensions(): { skills: SkillInfo[]; plugins: PluginInfo[] } {
    const skills: SkillInfo[] = []
    const plugins: PluginInfo[] = []

    const dirs = [
      join(this.home, '.gemini', 'extensions'),
      join(this.projectDir, '.gemini', 'extensions'),
    ]

    for (const extDir of dirs) {
      if (!isDir(extDir)) continue

      for (const child of sortedDir(extDir)) {
        const childPath = join(extDir, child)
        if (!isDir(childPath)) continue

        const extJson = join(childPath, 'gemini-extension.json')
        if (!isFile(extJson)) continue

        let data: Record<string, unknown>
        try {
          data = JSON.parse(readFileSafe(extJson))
        } catch {
          continue
        }

        const name = (data.name as string) ?? child
        const desc = (data.description as string) ?? ''

        const pinfo: PluginInfo = {
          name,
          tool: this.tool,
          marketplace: '',
          installPath: childPath,
          version: '',
          enabled: true,
          description: desc,
          author: '',
          items: [],
        }

        plugins.push(pinfo)
      }
    }

    return { skills, plugins }
  }
}
