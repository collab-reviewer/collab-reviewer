import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {createServerClientInstance} from "#/supabase/server.ts";

export interface CreateCommentInput {
    prId: number;
    lineId: string;
    author: string;
    avatar: string;
    content: string;
}

export const insertComment = createServerFn({method: 'POST'})
    .inputValidator((data: CreateCommentInput) => data)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

        const {data: result, error} = await supabase
            .from('inline_comments')
            .insert({
                pr_id: data.prId,
                line_id: data.lineId,
                author: data.author,
                avatar: data.avatar,
                content: data.content,
                timestamp: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return result;
    });


interface GetCommentsInput {
    prId: number;
}

export const getCommentsByPullRequestId = createServerFn({method: 'GET'})
    .inputValidator((data: GetCommentsInput) => data)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

        const {data: comments, error} = await supabase
            .from('inline_comments')
            .select('*')
            .eq('pr_id', data.prId)
            .order('created_at', {ascending: true});

        if (error) {
            throw new Error(error.message);
        }

        return comments.map(comment => ({
            id: comment.id,
            lineId: comment.line_id,
            author: comment.author,
            avatar: comment.avatar,
            content: comment.content,
            timestamp: comment.timestamp
        }));
    });