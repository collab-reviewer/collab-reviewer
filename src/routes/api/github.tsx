import {createFileRoute} from '@tanstack/react-router';
import {savePullRequest} from "#/actions/pullrequest.ts";
import {notifyDiscord} from "#/actions/n8n.ts";
import {githubWebhookPayloadSchema, verifyGitHubWebhookSignature} from "#/lib/github-webhook.ts";

export const Route = createFileRoute('/api/github')({
    server: {
        handlers: {
            POST: async ({request}) => {
                try {
                    const secret = process.env.GITHUB_WEBHOOK_SECRET;
                    if (!secret) {
                        console.error('GITHUB_WEBHOOK_SECRET is not configured');
                        return jsonResponse({message: 'Webhook is not configured'}, 503);
                    }

                    const body = await request.text();
                    const isAuthentic = await verifyGitHubWebhookSignature(
                        body,
                        request.headers.get('x-hub-signature-256'),
                        secret,
                    );

                    if (!isAuthentic) {
                        return jsonResponse({message: 'Invalid webhook signature'}, 401);
                    }

                    if (request.headers.get('x-github-event') !== 'pull_request') {
                        return jsonResponse({message: 'Event ignored'}, 202);
                    }

                    let rawPayload: unknown;
                    try {
                        rawPayload = JSON.parse(body);
                    } catch {
                        return jsonResponse({message: 'Invalid JSON payload'}, 400);
                    }

                    const parsedPayload = githubWebhookPayloadSchema.safeParse(rawPayload);
                    if (!parsedPayload.success) {
                        return jsonResponse({message: 'Invalid webhook payload'}, 400);
                    }

                    const data = parsedPayload.data;
                    if (data.action === 'opened' && data.pull_request) {
                        console.log(`Received webhook for PR #${data.pull_request.number} in repo ${data.repository.full_name}`)
                        await savePullRequest(request.headers, data)
                        try {
                            await notifyDiscord({message: `New PR opened: ${data.pull_request.html_url}`})
                        } catch (notificationError) {
                            console.error('Pull request saved, but Discord notification failed:', notificationError)
                        }
                    }

                    return jsonResponse({message: 'Webhook processed successfully'}, 200);
                } catch (error) {
                    console.error('Error processing webhook:', error)
                    return jsonResponse({message: 'Internal server error'}, 500);
                }
            },
        }
    }
})

function jsonResponse(body: {message: string}, status: number) {
    return Response.json(body, {status});
}
