import { describe, expect, it } from 'vitest'
import { parsePullRequestDiff } from './pull-request-diff'

describe('parsePullRequestDiff', () => {
  it('tracks old and new line numbers across a hunk', () => {
    const lines = parsePullRequestDiff('@@ -4,2 +4,2 @@\n-old\n+new\n same')

    expect(lines).toMatchObject([
      { type: 'header', oldL: null, newL: null },
      { type: 'remove', oldL: '4', newL: null },
      { type: 'add', oldL: null, newL: '4' },
      { type: 'context', oldL: '5', newL: '5' },
    ])
  })

  it('treats file markers as metadata rather than additions or removals', () => {
    const lines = parsePullRequestDiff('--- a/file.ts\n+++ b/file.ts')

    expect(lines.map((line) => line.type)).toEqual(['header', 'header'])
  })
})

