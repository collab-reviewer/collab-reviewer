interface NotifyDiscordInput {
  message: string
}

export async function notifyDiscord(data: NotifyDiscordInput) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) throw new Error('N8N_WEBHOOK_URL is not configured')

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) throw new Error('Failed to notify Discord')
}
