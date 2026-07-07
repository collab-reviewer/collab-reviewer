import {createServerFn} from "@tanstack/react-start";

interface NotifyDiscordInput {
    message: string;
}

export const notifyDiscord = createServerFn({method: 'POST'})
    .inputValidator((data: NotifyDiscordInput) => data)
    .handler(async ({data}) => {
        const response = await fetch("https://n8n.squareprojects.dev/webhook/d30f7c3f-af8e-43ec-9dcf-8b5c5466ef1c", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error('Failed to notify Discord')
        }

        return
    })