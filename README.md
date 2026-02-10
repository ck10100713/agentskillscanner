# agentskillscanner

[繁體中文](#繁體中文) | [English](#english)

---

## English

Scan and report all available skills for AI coding assistants — supports **Claude Code**, **OpenAI Codex CLI**, **Gemini CLI**, and **GitHub Copilot CLI**.

### Supported Tools & Scan Paths

| Tool | Level | Path |
|------|-------|------|
| Claude Code | User | `~/.claude/skills/*/SKILL.md` |
| Claude Code | Project | `<project>/.claude/skills/*/SKILL.md` |
| Claude Code | Plugin | `installed_plugins.json` + each plugin directory |
| Claude Code | Enterprise | `/Library/Application Support/ClaudeCode/` |
| Codex CLI | User | `~/.codex/skills/*/SKILL.md` |
| Codex CLI | Project | `<repoRoot>/.agents/skills/*/SKILL.md` |
| Codex CLI | Enterprise | `/etc/codex/skills/*/SKILL.md` |
| Gemini CLI | User | `~/.gemini/skills/*/SKILL.md` |
| Gemini CLI | Project | `<project>/.gemini/skills/*/SKILL.md` |
| Gemini CLI | Plugin | `~/.gemini/extensions/*/gemini-extension.json` |
| Copilot CLI | User | `~/.copilot/mcp-config.json` (MCP servers) |
| Copilot CLI | Project | `<project>/.github/copilot-instructions.md` |

### Installation & Usage

```bash
# Option 1: Run directly with npx (no install needed)
npx agentskillscanner

# Option 2: Install globally
npm install -g agentskillscanner
agentskillscanner
```

### CLI Options

```
-j, --json              Output in JSON format
-d, --project-dir DIR   Project directory (default: current working directory)
-l, --level LEVELS      Filter levels (comma-separated: user,project,plugin,enterprise)
-t, --tool TOOLS        Filter tools (comma-separated: claude-code,codex,gemini,copilot)
-V, --verbose           Show full descriptions and paths
-v, --version           Show version number
-h, --help              Show help
```

### Examples

```bash
# Scan all tools (default)
agentskillscanner

# Only scan Claude Code
agentskillscanner --tool claude-code

# Only scan Codex CLI
agentskillscanner --tool codex

# Scan multiple tools
agentskillscanner --tool codex,gemini

# JSON output (includes tool field)
agentskillscanner --json

# Combine tool and level filters
agentskillscanner --level user --tool codex

# Only user and project levels
agentskillscanner --level user,project

# Verbose mode
agentskillscanner --verbose
```

### Supported Platforms

All scan levels (User, Project, Plugin, Enterprise) are supported on macOS, Linux, and Windows.

The Enterprise-level scan directory varies by OS:

| OS      | Claude Code Enterprise Dir                | Codex CLI Enterprise Dir |
| ------- | ----------------------------------------- | ------------------------ |
| macOS   | `/Library/Application Support/ClaudeCode` | `/etc/codex/skills`      |
| Linux   | `/etc/claude-code`                        | `/etc/codex/skills`      |
| Windows | `C:\ProgramData\ClaudeCode`               | —                        |

### Development

```bash
pnpm install
pnpm build
node dist/index.js
```

---

## 繁體中文

掃描並彙整所有 AI 編碼工具的技能配置 — 支援 **Claude Code**、**OpenAI Codex CLI**、**Gemini CLI** 與 **GitHub Copilot CLI**。

### 支援工具與掃描路徑

| 工具 | 層級 | 路徑 |
|------|------|------|
| Claude Code | 使用者 | `~/.claude/skills/*/SKILL.md` |
| Claude Code | 專案 | `<project>/.claude/skills/*/SKILL.md` |
| Claude Code | 外掛 | `installed_plugins.json` + 各外掛目錄 |
| Claude Code | 企業 | `/Library/Application Support/ClaudeCode/` |
| Codex CLI | 使用者 | `~/.codex/skills/*/SKILL.md` |
| Codex CLI | 專案 | `<repoRoot>/.agents/skills/*/SKILL.md` |
| Codex CLI | 企業 | `/etc/codex/skills/*/SKILL.md` |
| Gemini CLI | 使用者 | `~/.gemini/skills/*/SKILL.md` |
| Gemini CLI | 專案 | `<project>/.gemini/skills/*/SKILL.md` |
| Gemini CLI | 外掛 | `~/.gemini/extensions/*/gemini-extension.json` |
| Copilot CLI | 使用者 | `~/.copilot/mcp-config.json`（MCP 伺服器） |
| Copilot CLI | 專案 | `<project>/.github/copilot-instructions.md` |

### 安裝與使用

```bash
# 方式一：npx 直接執行（免安裝）
npx agentskillscanner

# 方式二：全域安裝
npm install -g agentskillscanner
agentskillscanner
```

### CLI 選項

```
-j, --json              以 JSON 格式輸出
-d, --project-dir DIR   專案目錄（預設：目前工作目錄）
-l, --level LEVELS      篩選層級（逗號分隔：user,project,plugin,enterprise）
-t, --tool TOOLS        篩選工具（逗號分隔：claude-code,codex,gemini,copilot）
-V, --verbose           顯示完整描述與路徑
-v, --version           顯示版本號
-h, --help              顯示說明
```

### 範例

```bash
# 預設掃描所有工具
agentskillscanner

# 只掃描 Claude Code
agentskillscanner --tool claude-code

# 只掃描 Codex CLI
agentskillscanner --tool codex

# 掃描多個工具
agentskillscanner --tool codex,gemini

# JSON 輸出（含 tool 欄位）
agentskillscanner --json

# 組合工具與層級篩選
agentskillscanner --level user --tool codex

# 只看使用者與專案層級
agentskillscanner --level user,project

# 詳細模式
agentskillscanner --verbose
```

### 支援平台

所有掃描層級（User、Project、Plugin、Enterprise）皆支援 macOS、Linux 與 Windows。

Enterprise 層級的掃描目錄依作業系統不同：

| 作業系統 | Claude Code Enterprise 目錄               | Codex CLI Enterprise 目錄 |
| -------- | ----------------------------------------- | ------------------------- |
| macOS    | `/Library/Application Support/ClaudeCode` | `/etc/codex/skills`       |
| Linux    | `/etc/claude-code`                        | `/etc/codex/skills`       |
| Windows  | `C:\ProgramData\ClaudeCode`               | —                         |

### 開發

```bash
pnpm install
pnpm build
node dist/index.js
```

## License

MIT
