import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {createServerClientInstance} from "#/supabase/server.ts";

interface CreateMessageInput {
    prId: number;
    author: string;
    avatar: string;
    content: string;
    type?: string;
}

export const insertMessage = createServerFn({method: 'POST'})
    .inputValidator((data: CreateMessageInput) => data)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

        const {data: result, error} = await supabase
            .from('messages')
            .insert({
                pr_id: data.prId,
                author: data.author,
                avatar: data.avatar,
                content: data.content,
                type: data.type || 'comment',
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return result;
    });

interface GetMessagesInput {
    prId: number;
}

export const getMessagesByPullRequestId = createServerFn({method: 'GET'})
    .inputValidator((data: GetMessagesInput) => data)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

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