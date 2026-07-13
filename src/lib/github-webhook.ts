import { z } from 'zod'

const encoder = new TextEncoder()
const SIGNATURE_PREFIX = 'sha256='

export const githubWebhookPayloadSchema = z.object({
  action: z.string(),
  pull_request: z.object({
    number: z.number().int().positive(),
    title: z.string().min(1),
    state: z.string().min(1),
    html_url: z.url(),
    diff_url: z.url(),
    user: z.object({ login: z.string().min(1) }),
    head: z.object({ ref: z.string().min(1) }),
  }),
  repository: z.object({
    name: z.string().min(1),
    full_name: z.string().min(1),
  }),
})

export type GitHubWebhookPayload = z.infer<typeof githubWebhookPayloadSchema>

export async function verifyGitHubWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string | undefined,
) {
  if (!secret || !signature?.startsWith(SIGNATURE_PREFIX)) return false

  const expectedSignature = hexToBytes(signature.slice(SIGNATURE_PREFIX.length))
  if (!expectedSignature) return false

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )

  return crypto.subtle.verify('HMAC', key, expectedSignature, encoder.encode(payload))
}

function hexToBytes(value: string) {
  if (!/^[\da-f]{64}$/i.test(value)) return null
  const bytes = new Uint8Array(value.length / 2)
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16)
  }
  return bytes
}
