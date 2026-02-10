import { readFileSync, readdirSync, statSync } from 'node:fs'

export function isDir(p: string): boolean {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

export function isFile(p: string): boolean {
  try {
    return statSync(p).isFile()
  } catch {
    return false
  }
}

export function sortedDir(p: string): string[] {
  try {
    return readdirSync(p).sort()
  } catch {
    return []
  }
}

export function readFileSafe(p: string): string {
  try {
    return readFileSync(p, 'utf-8')
  } catch {
    return ''
  }
}
