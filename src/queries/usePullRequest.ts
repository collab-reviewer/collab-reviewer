import {useQuery} from "@tanstack/react-query";
import {getPullRequests} from "#/actions/pullrequest.ts";

export const pullRequestKeys = {
    all: ["pullRequests"] as const,
    lists: () => [...pullRequestKeys.all, "list"] as const,
}


export const usePullRequestQuery = () => {
    return useQuery({
        queryKey: pullRequestKeys.lists(),
        queryFn: () => getPullRequests(),
    })
}