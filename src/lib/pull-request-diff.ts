export interface DiffLine {
  id: string
  type: 'header' | 'add' | 'remove' | 'context'
  content: string
  oldL: string | null
  newL: string | null
}

const HUNK_HEADER = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/

export function parsePullRequestDiff(diffText: string): DiffLine[] {
  const parsedLines: DiffLine[] = []
  let oldLineNumber = 0
  let newLineNumber = 0

  for (const [index, line] of diffText.split('\n').entries()) {
    const id = `line-${index}`

    if (line.startsWith('@@')) {
      const match = line.match(HUNK_HEADER)
      if (match) {
        oldLineNumber = Number.parseInt(match[1], 10)
        newLineNumber = Number.parseInt(match[2], 10)
      }
      parsedLines.push({ id, type: 'header', content: line, oldL: null, newL: null })
      continue
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      parsedLines.push({ id, type: 'add', content: line, oldL: null, newL: String(newLineNumber++) })
      continue
    }

    if (line.startsWith('-') && !line.startsWith('---')) {
      parsedLines.push({ id, type: 'remove', content: line, oldL: String(oldLineNumber++), newL: null })
      continue
    }

    if (line.startsWith(' ')) {
      parsedLines.push({
        id,
        type: 'context',
        content: line,
        oldL: String(oldLineNumber++),
        newL: String(newLineNumber++),
      })
      continue
    }

    parsedLines.push({ id, type: 'header', content: line, oldL: null, newL: null })
  }

  return parsedLines
}
