import {createServerFn} from "@tanstack/react-start";
import {getRequest} from "@tanstack/react-start/server";
import {createAuthenticatedServerClient} from "#/supabase/server.ts";
import {z} from "zod";
import {getUserDisplayName, getUserInitials} from "#/lib/user.ts";

const createCommentInput = z.object({
    prId: z.number().int().positive(),
    lineId: z.string().min(1).max(120),
    content: z.string().trim().min(1).max(10_000),
});

export const insertComment = createServerFn({method: 'POST'})
    .inputValidator(createCommentInput)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase, user} = await createAuthenticatedServerClient(request.headers);

        const {data: result, error} = await supabase
            .from('inline_comments')
            .insert({
                pr_id: data.prId,
                line_id: data.lineId,
                author: getUserDisplayName(user),
                avatar: getUserInitials(user),
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


const getCommentsInput = z.object({prId: z.number().int().positive()});

export const getCommentsByPullRequestId = createServerFn({method: 'GET'})
    .inputValidator(getCommentsInput)
    .handler(async ({data}) => {
        const request = getRequest();
        const {supabase} = await createAuthenticatedServerClient(request.headers);

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
