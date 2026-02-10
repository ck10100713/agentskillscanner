# agentskillscanner

Scan and report all available skills for AI coding assistants (Claude Code).

掃描並彙整所有可用的 Claude Code skills，涵蓋四個層級：

1. **使用者層級 (User)** — `~/.claude/skills/*/SKILL.md`
2. **專案層級 (Project)** — `<project>/.claude/skills/*/SKILL.md`
3. **外掛層級 (Plugin)** — `installed_plugins.json` + 各外掛目錄
4. **企業層級 (Enterprise)** — `/Library/Application Support/ClaudeCode/`

## 安裝與使用

```bash
# 方式一：npx 直接執行（免安裝）
npx agentskillscanner

# 方式二：全域安裝
npm install -g agentskillscanner
agentskillscanner
```

## CLI 選項

```
-j, --json              以 JSON 格式輸出
-d, --project-dir DIR   專案目錄（預設：目前工作目錄）
-l, --level LEVELS      篩選層級（逗號分隔：user,project,plugin,enterprise）
-v, --verbose           顯示完整描述與路徑
-h, --help              顯示說明
```

## 範例

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

## 開發

```bash
pnpm install
pnpm build
node dist/index.js
```

## License

MIT
