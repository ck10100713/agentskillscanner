import { join, resolve, dirname } from 'node:path'
import { homedir } from 'node:os'
import { parseFrontmatter } from '../frontmatter.js'
import type { SkillInfo, ScanResult } from '../types.js'
import { Tool, SkillLevel, SkillType } from '../types.js'
import type { ToolScanner } from '../tool-scanner.js'
import { isDir, isFile, sortedDir, readFileSafe } from '../fs-utils.js'

export class CodexScanner implements ToolScanner {
  readonly tool = Tool.CODEX
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
    if (targets.includes(SkillLevel.ENTERPRISE)) {
      result.skills.push(...this.scanEnterprise())
    }

    return result
  }

  private scanUser(): SkillInfo[] {
    const skillsDir = join(this.home, '.codex', 'skills')
    if (!isDir(skillsDir)) return []

    const items: SkillInfo[] = []

    for (const child of sortedDir(skillsDir)) {
      if (child === '.system') continue
      const childPath = join(skillsDir, child)
      if (!isDir(childPath)) continue

      const skill = this.readSkillMd(childPath, child, SkillLevel.USER)
      if (skill) items.push(skill)
    }

    // Bundled skills under .system/
    const systemDir = join(skillsDir, '.system')
    if (isDir(systemDir)) {
      for (const child of sortedDir(systemDir)) {
        const childPath = join(systemDir, child)
        if (!isDir(childPath)) continue

        const skill = this.readSkillMd(childPath, child, SkillLevel.USER)
        if (skill) {
          skill.extra = { ...skill.extra, bundled: 'true' }
          items.push(skill)
        }
      }
    }

    return items
  }

  private scanProject(): SkillInfo[] {
    const repoRoot = findRepoRoot(this.projectDir)
    if (!repoRoot) return []

    const skillsDir = join(repoRoot, '.agents', 'skills')
    return this.scanSkillDir(skillsDir, SkillLevel.PROJECT)
  }

  private scanEnterprise(): SkillInfo[] {
    const entDir = '/etc/codex/skills'
    return this.scanSkillDir(entDir, SkillLevel.ENTERPRISE)
  }

  private scanSkillDir(skillsDir: string, level: SkillLevel): SkillInfo[] {
    if (!isDir(skillsDir)) return []

    const items: SkillInfo[] = []
    for (const child of sortedDir(skillsDir)) {
      const childPath = join(skillsDir, child)
      if (!isDir(childPath)) continue

      const skill = this.readSkillMd(childPath, child, level)
      if (skill) items.push(skill)
    }
    return items
  }

  private readSkillMd(dir: string, fallbackName: string, level: SkillLevel): SkillInfo | null {
    const skillMd = join(dir, 'SKILL.md')
    if (!isFile(skillMd)) return null

    const text = readFileSafe(skillMd)
    const fm = parseFrontmatter(text)
    const name = fm.name ?? fallbackName
    const desc = fm.description ?? ''
    delete fm.name
    delete fm.description

    return {
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
    }
  }
}

export function findRepoRoot(startDir: string): string | null {
  let dir = resolve(startDir)
  const root = dirname(dir) === dir ? dir : undefined

  while (true) {
    if (isDir(join(dir, '.git'))) return dir
    const parent = dirname(dir)
    if (parent === dir || parent === root) return null
    dir = parent
  }
}
