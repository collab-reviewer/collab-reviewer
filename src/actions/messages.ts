import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {createAuthenticatedServerClient} from "#/supabase/server.ts";
import {z} from "zod";
import {getUserDisplayName, getUserInitials} from "#/lib/user.ts";

const createMessageInput = z.object({
    prId: z.number().int().positive(),
    content: z.string().trim().min(1).max(10_000),
    type: z.enum(['comment', 'approve', 'close']).default('comment'),
});

export const insertMessage = createServerFn({method: 'POST'})
    .inputValidator(createMessageInput)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase, user} = await createAuthenticatedServerClient(request.headers);

        const {data: result, error} = await supabase
            .from('messages')
            .insert({
                pr_id: data.prId,
                author: getUserDisplayName(user),
                avatar: getUserInitials(user),
                content: data.content,
                type: data.type,
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return result;
    });

const getMessagesInput = z.object({prId: z.number().int().positive()});

export const getMessagesByPullRequestId = createServerFn({method: 'GET'})
    .inputValidator(getMessagesInput)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = await createAuthenticatedServerClient(request.headers);

        const {data: messages, error} = await supabase
            .from('messages')
            .select('*')
            .eq('pr_id', data.prId)
            .order('created_at', {ascending: true});

        if (error) {
            throw new Error(error.message);
        }

        return messages.map(message => ({
            id: message.id,
            prId: message.pr_id,
            author: message.author,
            avatar: message.avatar,
            content: message.content,
            type: message.type,
            timestamp: message.timestamp,
            createdAt: message.created_at
        }));
    });
