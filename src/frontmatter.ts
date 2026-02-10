const FRONTMATTER_RE = /\A---\s*\n(.*?)\n---/s

export function parseFrontmatter(text: string): Record<string, string> {
  // Match --- at the very beginning of the string
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}

  const block = match[1]
  const result: Record<string, string> = {}
  let currentKey: string | null = null
  let multilineBuf: string[] = []

  for (const line of block.split('\n')) {
    // Multiline continuation (indented by 2+ spaces or empty)
    if (currentKey && (line.startsWith('  ') || line.trim() === '')) {
      multilineBuf.push(line.trim())
      continue
    }

    // Save previous multiline value
    if (currentKey && multilineBuf.length > 0) {
      result[currentKey] = multilineBuf.filter(l => l).join(' ')
      currentKey = null
      multilineBuf = []
    }

    // Match key: value
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/)
    if (kv) {
      const key = kv[1]
      const val = kv[2].trim()
      if (val === '|' || val === '>') {
        currentKey = key
        multilineBuf = []
      } else {
        result[key] = val
        currentKey = null
        multilineBuf = []
      }
    }
  }

  // Handle trailing multiline
  if (currentKey && multilineBuf.length > 0) {
    result[currentKey] = multilineBuf.filter(l => l).join(' ')
  }

  return result
}
