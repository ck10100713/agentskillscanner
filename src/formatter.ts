import pc from 'picocolors'
import type { ScanResult, SkillInfo, PluginInfo } from './types.js'
import { SkillLevel, SkillType, LEVEL_LABELS, TYPE_LABELS, byLevel } from './types.js'

function truncate(text: string, maxLen = 72): string {
  const clean = text.replace(/\n/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  return clean.slice(0, maxLen - 3) + '...'
}

export function formatTerminal(result: ScanResult, verbose: boolean): string {
  const lines: string[] = []

  // Title box
  const title = 'Claude Code 技能掃描報告'
  const boxW = 58
  lines.push(pc.cyan('╔' + '═'.repeat(boxW) + '╗'))
  lines.push(pc.cyan('║') + pc.bold(pc.white('  ' + title.padEnd(boxW - 2))) + pc.cyan('║'))
  lines.push(pc.cyan('╚' + '═'.repeat(boxW) + '╝'))
  lines.push('')

  let anyOutput = false

  // User, Project, Enterprise levels
  for (const level of [SkillLevel.USER, SkillLevel.PROJECT, SkillLevel.ENTERPRISE] as const) {
    const items = byLevel(result, level)
    if (items.length === 0) continue
    anyOutput = true
    const label = LEVEL_LABELS[level]
    lines.push(pc.bold(`── ${label} ${'─'.repeat(55 - label.length)}`))

    for (const sk of items) {
      const badge = `[${TYPE_LABELS[sk.skillType]}]`
      const desc = sk.description || '(描述未填寫)'
      lines.push(`  ${pc.green('●')} ${pc.bold(sk.name.padEnd(44))} ${pc.dim(badge)}`)
      lines.push(`    ${pc.dim(truncate(desc))}`)
      if (verbose && sk.path) {
        lines.push(`    ${pc.dim('路徑: ' + sk.path)}`)
      }
    }
    lines.push('')
  }

  // Plugin level
  const pluginItems = byLevel(result, SkillLevel.PLUGIN)
  if (pluginItems.length > 0 || result.plugins.length > 0) {
    anyOutput = true
    const label = LEVEL_LABELS[SkillLevel.PLUGIN]
    lines.push(pc.bold(`── ${label} ${'─'.repeat(55 - label.length)}`))

    for (const pinfo of result.plugins) {
      const statusIcon = pinfo.enabled
        ? pc.green('✓ 已啟用')
        : pc.red('✗ 已停用')
      lines.push(
        `  ${pc.yellow('▸')} ${pc.bold(pinfo.name)}` +
        ` ${pc.dim('@ ' + pinfo.marketplace)}` +
        `  [${statusIcon}]`
      )
      if (verbose && pinfo.description) {
        lines.push(`    ${pc.dim(truncate(pinfo.description, 68))}`)
      }
      if (verbose) {
        lines.push(`    ${pc.dim('路徑: ' + pinfo.installPath)}`)
      }

      if (pinfo.items.length === 0) {
        lines.push(`    ${pc.dim('(無掃描到的項目)')}`)
      } else {
        for (let i = 0; i < pinfo.items.length; i++) {
          const item = pinfo.items[i]
          const isLast = i === pinfo.items.length - 1
          const connector = isLast ? '└─' : '├─'
          const badge = TYPE_LABELS[item.skillType]

          const typeColorFn = {
            [SkillType.COMMAND]: pc.magenta,
            [SkillType.AGENT]: pc.blue,
            [SkillType.SKILL]: pc.green,
            [SkillType.HOOK]: pc.yellow,
          }[item.skillType] ?? pc.dim

          let prefix = item.name
          if (item.skillType === SkillType.COMMAND) {
            prefix = item.name !== pinfo.name
              ? `/${pinfo.name}:${item.name}`
              : `/${item.name}`
          }

          lines.push(
            `    ${connector} ${typeColorFn(prefix.padEnd(38))}` +
            ` ${pc.dim(`[${badge}]`)}`
          )
          if (verbose && item.description) {
            const padding = isLast ? '    ' : '│   '
            lines.push(`    ${padding} ${pc.dim(truncate(item.description, 60))}`)
          }
        }
      }
      lines.push('')
    }
  }

  if (!anyOutput) {
    lines.push(`  ${pc.dim('(未掃描到任何技能)')}`)
    lines.push('')
  }

  // Summary
  lines.push(pc.bold(`── 統計摘要 ${'─'.repeat(47)}`))

  const userCnt = byLevel(result, SkillLevel.USER).length
  const projCnt = byLevel(result, SkillLevel.PROJECT).length
  const entCnt = byLevel(result, SkillLevel.ENTERPRISE).length
  const pluginAll = byLevel(result, SkillLevel.PLUGIN)
  const pluginCmds = pluginAll.filter(s => s.skillType === SkillType.COMMAND).length
  const pluginAgents = pluginAll.filter(s => s.skillType === SkillType.AGENT).length
  const pluginSkills = pluginAll.filter(s => s.skillType === SkillType.SKILL).length
  const pluginHooks = pluginAll.filter(s => s.skillType === SkillType.HOOK).length
  const enabledPlugins = result.plugins.filter(p => p.enabled).length
  const totalPlugins = result.plugins.length

  lines.push(
    `  使用者: ${pc.bold(String(userCnt))}` +
    `  專案: ${pc.bold(String(projCnt))}` +
    `  企業: ${pc.bold(String(entCnt))}`
  )

  let pluginDetail = `命令 ${pluginCmds} / 代理 ${pluginAgents} / 技能 ${pluginSkills}`
  if (pluginHooks > 0) {
    pluginDetail += ` / 鉤子 ${pluginHooks}`
  }
  lines.push(
    `  外掛: ${pc.bold(String(totalPlugins))} 個` +
    ` (${pc.green(enabledPlugins + ' 已啟用')})` +
    `  項目: ${pluginDetail}`
  )
  lines.push(`  ${pc.dim('合計: ' + result.skills.length + ' 個項目')}`)
  lines.push('')

  return lines.join('\n')
}

export function formatJson(result: ScanResult): string {
  const output = {
    skills: result.skills.map(s => ({
      name: s.name,
      skill_type: s.skillType,
      level: s.level,
      description: s.description,
      path: s.path,
      plugin_name: s.pluginName,
      marketplace: s.marketplace,
      enabled: s.enabled,
      extra: s.extra,
    })),
    plugins: result.plugins.map(p => ({
      name: p.name,
      marketplace: p.marketplace,
      install_path: p.installPath,
      version: p.version,
      enabled: p.enabled,
      description: p.description,
      author: p.author,
      items: p.items.map(i => ({
        name: i.name,
        skill_type: i.skillType,
        level: i.level,
        description: i.description,
        path: i.path,
        plugin_name: i.pluginName,
        marketplace: i.marketplace,
        enabled: i.enabled,
        extra: i.extra,
      })),
    })),
    summary: {
      user: byLevel(result, SkillLevel.USER).length,
      project: byLevel(result, SkillLevel.PROJECT).length,
      enterprise: byLevel(result, SkillLevel.ENTERPRISE).length,
      plugin_count: result.plugins.length,
      plugin_items: byLevel(result, SkillLevel.PLUGIN).length,
      total: result.skills.length,
    },
  }
  return JSON.stringify(output, null, 2)
}
