# agentskillscanner

[繁體中文](#繁體中文) | [English](#english)

---

## English

Scan and report all available skills for AI coding assistants (Claude Code).

Scans across four levels:

1. **User** — `~/.claude/skills/*/SKILL.md`
2. **Project** — `<project>/.claude/skills/*/SKILL.md`
3. **Plugin** — `installed_plugins.json` + each plugin directory
4. **Enterprise** — `/Library/Application Support/ClaudeCode/`

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
-v, --verbose           Show full descriptions and paths
-h, --help              Show help
```

### Examples

```bash
# Scan all levels (default)
agentskillscanner

# JSON output
agentskillscanner --json

# Only user and project levels
agentskillscanner --level user,project

# Verbose mode
agentskillscanner --verbose
```

### Supported Platforms

All scan levels (User, Project, Plugin, Enterprise) are supported on macOS, Linux, and Windows.

The Enterprise-level scan directory varies by OS:

| OS      | Enterprise Directory                      |
| ------- | ----------------------------------------- |
| macOS   | `/Library/Application Support/ClaudeCode` |
| Linux   | `/etc/claude-code`                        |
| Windows | `C:\ProgramData\ClaudeCode`               |

### Development

```bash
pnpm install
pnpm build
node dist/index.js
```

---

## 繁體中文

掃描並彙整所有可用的 Claude Code skills，涵蓋四個層級：

1. **使用者層級 (User)** — `~/.claude/skills/*/SKILL.md`
2. **專案層級 (Project)** — `<project>/.claude/skills/*/SKILL.md`
3. **外掛層級 (Plugin)** — `installed_plugins.json` + 各外掛目錄
4. **企業層級 (Enterprise)** — `/Library/Application Support/ClaudeCode/`

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
-v, --verbose           顯示完整描述與路徑
-h, --help              顯示說明
```

### 範例

```bash
# 預設掃描所有層級
agentskillscanner

# JSON 輸出
agentskillscanner --json

# 只看使用者與專案層級
agentskillscanner --level user,project

# 詳細模式
agentskillscanner --verbose
```

### 支援平台

所有掃描層級（User、Project、Plugin、Enterprise）皆支援 macOS、Linux 與 Windows。

Enterprise 層級的掃描目錄依作業系統不同：

| 作業系統 | Enterprise 目錄                            |
| -------- | ----------------------------------------- |
| macOS    | `/Library/Application Support/ClaudeCode` |
| Linux    | `/etc/claude-code`                        |
| Windows  | `C:\ProgramData\ClaudeCode`               |

### 開發

```bash
pnpm install
pnpm build
node dist/index.js
```

## License

MIT
