import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir, platform } from 'node:os'
import { parseFrontmatter } from './frontmatter.js'
import type { SkillInfo, PluginInfo, ScanResult } from './types.js'
import { SkillLevel, SkillType } from './types.js'

export class Scanner {
  private projectDir: string
  private home: string
  private claudeDir: string

  constructor(projectDir: string) {
    this.projectDir = resolve(projectDir)
    this.home = homedir()
    this.claudeDir = join(this.home, '.claude')
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
      const plugins = this.scanPlugins()
      result.plugins = plugins
      for (const p of plugins) {
        result.skills.push(...p.items)
      }
    }
    if (targets.includes(SkillLevel.ENTERPRISE)) {
      result.skills.push(...this.scanEnterprise())
    }

    return result
  }

  // -- User level --

  private scanUser(): SkillInfo[] {
    const skillsDir = join(this.claudeDir, 'skills')
    return this.scanSkillDir(skillsDir, SkillLevel.USER)
  }

  // -- Project level --

  private scanProject(): SkillInfo[] {
    const skillsDir = join(this.projectDir, '.claude', 'skills')
    return this.scanSkillDir(skillsDir, SkillLevel.PROJECT)
  }

  // -- Shared: scan skills directory --

  private scanSkillDir(skillsDir: string, level: SkillLevel): SkillInfo[] {
    const items: SkillInfo[] = []
    if (!isDir(skillsDir)) return items

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

  // -- Plugin level --

  private scanPlugins(): PluginInfo[] {
    const pluginsFile = join(this.claudeDir, 'plugins', 'installed_plugins.json')
    const settingsFile = join(this.claudeDir, 'settings.json')

    if (!isFile(pluginsFile)) return []

    let data: Record<string, unknown>
    try {
      data = JSON.parse(readFileSafe(pluginsFile))
    } catch {
      return []
    }

    // Read enabled state
    let enabledMap: Record<string, boolean> = {}
    if (isFile(settingsFile)) {
      try {
        const settings = JSON.parse(readFileSafe(settingsFile))
        enabledMap = settings.enabledPlugins ?? {}
      } catch {
        // ignore
      }
    }

    const version = (data.version as number) ?? 1
    const pluginsData = (version >= 2 ? (data.plugins ?? data) : data) as Record<string, unknown>

    const result: PluginInfo[] = []

    for (const [pluginKey, entries] of Object.entries(pluginsData)) {
      if (!Array.isArray(entries) || entries.length === 0) continue
      const entry = entries[0] as Record<string, unknown>
      const installPath = (entry.installPath as string) ?? ''
      const ver = (entry.version as string) ?? ''

      // Parse plugin_name@marketplace
      const atIdx = pluginKey.lastIndexOf('@')
      const pluginName = atIdx > 0 ? pluginKey.slice(0, atIdx) : pluginKey
      const marketplace = atIdx > 0 ? pluginKey.slice(atIdx + 1) : ''

      const enabled = enabledMap[pluginKey] ?? false

      // Read plugin.json for description
      let desc = ''
      let author = ''
      const pluginJson = join(installPath, '.claude-plugin', 'plugin.json')
      if (isFile(pluginJson)) {
        try {
          const pj = JSON.parse(readFileSafe(pluginJson))
          desc = pj.description ?? ''
          const a = pj.author
          if (typeof a === 'object' && a !== null) {
            author = a.name ?? ''
          } else if (typeof a === 'string') {
            author = a
          }
        } catch {
          // ignore
        }
      }

      const pinfo: PluginInfo = {
        name: pluginName,
        marketplace,
        installPath,
        version: ver,
        enabled,
        description: desc,
        author,
        items: [],
      }

      // Scan plugin contents
      pinfo.items.push(
        ...this.scanPluginCommands(installPath, pinfo),
        ...this.scanPluginAgents(installPath, pinfo),
        ...this.scanPluginSkills(installPath, pinfo),
        ...this.scanPluginHooks(installPath, pinfo),
      )

      result.push(pinfo)
    }

    return result
  }

  private makePluginSkill(
    name: string,
    stype: SkillType,
    path: string,
    pinfo: PluginInfo,
    description = '',
    extra: Record<string, string> = {},
  ): SkillInfo {
    return {
      name,
      skillType: stype,
      level: SkillLevel.PLUGIN,
      description,
      path,
      pluginName: pinfo.name,
      marketplace: pinfo.marketplace,
      enabled: pinfo.enabled,
      extra,
    }
  }

  private scanPluginCommands(root: string, pinfo: PluginInfo): SkillInfo[] {
    const cmdDir = join(root, 'commands')
    const items: SkillInfo[] = []
    if (!isDir(cmdDir)) return items

    for (const file of sortedDir(cmdDir)) {
      if (!file.endsWith('.md')) continue
      const mdPath = join(cmdDir, file)
      const text = readFileSafe(mdPath)
      const fm = parseFrontmatter(text)
      const name = fm.name ?? file.replace(/\.md$/, '')
      const desc = fm.description ?? ''
      delete fm.name
      delete fm.description
      items.push(this.makePluginSkill(name, SkillType.COMMAND, mdPath, pinfo, desc, fm))
    }
    return items
  }

  private scanPluginAgents(root: string, pinfo: PluginInfo): SkillInfo[] {
    const agentDir = join(root, 'agents')
    const items: SkillInfo[] = []
    if (!isDir(agentDir)) return items

    for (const file of sortedDir(agentDir)) {
      if (!file.endsWith('.md')) continue
      const mdPath = join(agentDir, file)
      const text = readFileSafe(mdPath)
      const fm = parseFrontmatter(text)
      const name = fm.name ?? file.replace(/\.md$/, '')
      const desc = fm.description ?? ''
      delete fm.name
      delete fm.description
      items.push(this.makePluginSkill(name, SkillType.AGENT, mdPath, pinfo, desc, fm))
    }
    return items
  }

  private scanPluginSkills(root: string, pinfo: PluginInfo): SkillInfo[] {
    const skillsDir = join(root, 'skills')
    const items: SkillInfo[] = []
    if (!isDir(skillsDir)) return items

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
      items.push(this.makePluginSkill(name, SkillType.SKILL, skillMd, pinfo, desc, fm))
    }
    return items
  }

  private scanPluginHooks(root: string, pinfo: PluginInfo): SkillInfo[] {
    const hooksDir = join(root, 'hooks')
    const items: SkillInfo[] = []
    if (!isDir(hooksDir)) return items

    const hooksJson = join(hooksDir, 'hooks.json')
    if (!isFile(hooksJson)) return items

    let data: Record<string, unknown>
    try {
      data = JSON.parse(readFileSafe(hooksJson))
    } catch {
      return items
    }

    const hookDesc = (data.description as string) ?? ''
    const hooksMap = (data.hooks ?? {}) as Record<string, unknown>
    for (const hookName of Object.keys(hooksMap).sort()) {
      items.push(this.makePluginSkill(hookName, SkillType.HOOK, hooksJson, pinfo, hookDesc))
    }
    return items
  }

  // -- Enterprise level --

  private getEnterpriseDir(): string {
    switch (platform()) {
      case 'darwin':
        return '/Library/Application Support/ClaudeCode'
      case 'linux':
        return '/etc/claude-code'
      case 'win32':
        return 'C:\\ProgramData\\ClaudeCode'
      default:
        return ''
    }
  }

  private scanEnterprise(): SkillInfo[] {
    const entDir = this.getEnterpriseDir()
    if (!entDir || !isDir(entDir)) return []

    const items: SkillInfo[] = []

    // Scan skills subdirectory
    const skillsSub = join(entDir, 'skills')
    if (isDir(skillsSub)) {
      items.push(...this.scanSkillDir(skillsSub, SkillLevel.ENTERPRISE))
    }

    // Scan root-level directories with SKILL.md
    for (const child of sortedDir(entDir)) {
      const childPath = join(entDir, child)
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
        skillType: SkillType.SKILL,
        level: SkillLevel.ENTERPRISE,
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
}

// -- Filesystem helpers --

function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

function isFile(p: string): boolean {
  try {
    return statSync(p).isFile()
  } catch {
    return false
  }
}

function sortedDir(p: string): string[] {
  try {
    return readdirSync(p).sort()
  } catch {
    return []
  }
}

function readFileSafe(p: string): string {
  try {
    return readFileSync(p, 'utf-8')
  } catch {
    return ''
  }
}
