import {createFileRoute} from '@tanstack/react-router';
import {savePullRequest} from "#/actions/pullrequest.ts";
import type {GitHubWebhookPayload} from "#/actions/actions.types.ts";
import {notifyDiscord} from "#/actions/n8n.ts";

export const Route = createFileRoute('/api/github')({
    server: {
        handlers: {
            POST: async ({request}) => {
                try {
                    const data: GitHubWebhookPayload = await request.json()
                    if (data.action === 'opened' && data.pull_request) {
                        console.log(`Received webhook for PR #${data.pull_request.number} in repo ${data.repository.full_name}`)
                        await savePullRequest({data})
                        await notifyDiscord({data: {message: `New PR opened: ${data.pull_request.html_url}`}})
                    }

                    return new Response(JSON.stringify({message: 'Webhook processed successfully'}), {
                        status: 200,
                        headers: {'Content-Type': 'application/json'},
                    })
                } catch (error) {
                    console.error('Error processing webhook:', error)
                    return new Response('Internal server error', {status: 500})
                }
            },
        }
    }
})