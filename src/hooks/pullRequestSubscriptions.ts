import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {createClient} from "#/supabase/client.ts";
import {pullRequestKeys} from "#/queries/usePullRequest.ts";
import type {PullRequest} from "#/types/pull_request.ts";

export function usePullRequestSubscription() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('realtime_prs')
            .on(
                'postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'pull_requests'},
                (payload) => {
                    queryClient.setQueryData(pullRequestKeys.lists(), (oldData: PullRequest[]) => {
                        return [payload.new, ...(oldData || [])];
                    });
                }
            )
            .on(
                'postgres_changes',
                {event: 'UPDATE', schema: 'public', table: 'pull_requests'},
                (payload) => {
                    queryClient.setQueryData(pullRequestKeys.lists(), (oldData: PullRequest[]) => {
                        return oldData?.map(pr => pr.id === payload.new.id ? payload.new : pr) || [];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, queryClient]);
}