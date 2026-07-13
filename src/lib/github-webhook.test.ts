import { describe, expect, it } from 'vitest'
import { verifyGitHubWebhookSignature } from './github-webhook'

const encoder = new TextEncoder()

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
  return `sha256=${Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

describe('verifyGitHubWebhookSignature', () => {
  it('accepts an authentic payload', async () => {
    const payload = '{"action":"opened"}'
    const signature = await sign(payload, 'reviewdeck-secret')

    await expect(verifyGitHubWebhookSignature(payload, signature, 'reviewdeck-secret')).resolves.toBe(true)
  })

  it('rejects missing and mismatched signatures', async () => {
    const signature = await sign('original', 'reviewdeck-secret')

    await expect(verifyGitHubWebhookSignature('changed', signature, 'reviewdeck-secret')).resolves.toBe(false)
    await expect(verifyGitHubWebhookSignature('original', null, 'reviewdeck-secret')).resolves.toBe(false)
  })
})

