import {createServerFn} from "@tanstack/react-start";
import type {GitHubWebhookPayload} from "#/actions/actions.types.ts";
import {createServerClientInstance} from "#/supabase/server.ts";
import {getRequest} from "@tanstack/react-start/server";
import type {PullRequest} from "#/types/pull_request.ts";

export const savePullRequest = createServerFn({method: "POST"})
    .inputValidator((data: GitHubWebhookPayload) => data)
    .handler(async ({data}) => {

        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);


        const {error} = await supabase.from('pull_requests').insert({
            title: data.pull_request.title,
            pr_number: data.pull_request.number,
            branch: data.pull_request.head.ref,
            status: data.pull_request.state,
            author: data.pull_request.user.login,
            repo: data.repository.name,
            diff_url: data.pull_request.diff_url
        });

        if (error) {
            throw new Error(error.message);
        }

        console.log(`Pull request #${data.pull_request.number} saved successfully!`);

    })


export const getPullRequests = createServerFn({method: "GET"})
    .handler(async () => {

        const request = getRequest();
        const {supabase} = createServerClientInstance(request.headers);

        const {data, error} = await supabase.from('pull_requests').select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data?.map(pr => ({
            id: pr.id,
            title: pr.title,
            prNumber: pr.pr_number,
            author: pr.author,
            branch: pr.branch,
            status: pr.status,
            repo: pr.repo,
            diffUrl: pr.diff_url
        } as PullRequest)) || [];

    })


export interface DiffLine {
    id: string;
    type: 'header' | 'add' | 'remove' | 'context';
    content: string;
    oldL: string | null;
    newL: string | null;
}

export const getPullRequestDiff = createServerFn({method: "GET"})
    .inputValidator((url: string) => url)
    .handler(async ({data: url}) => {
        if (!url) return [];

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch diff from GitHub');

        const diffText = await response.text();
        const parsedLines: DiffLine[] = [];
        const lines = diffText.split('\n');

        let oldLineNum = 0;
        let newLineNum = 0;

        lines.forEach((line, index) => {
            const id = `line-${index}`;

            if (line.startsWith('@@')) {
                const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
                if (match) {
                    oldLineNum = parseInt(match[1], 10);
                    newLineNum = parseInt(match[2], 10);
                }
                parsedLines.push({id, type: 'header', content: line, oldL: null, newL: null});
            } else if (line.startsWith('+') && !line.startsWith('+++')) {
                parsedLines.push({id, type: 'add', content: line, oldL: null, newL: String(newLineNum++)});
            } else if (line.startsWith('-') && !line.startsWith('---')) {
                parsedLines.push({id, type: 'remove', content: line, oldL: String(oldLineNum++), newL: null});
            } else if (line.startsWith(' ')) {
                parsedLines.push({
                    id,
                    type: 'context',
                    content: line,
                    oldL: String(oldLineNum++),
                    newL: String(newLineNum++)
                });
            } else {
                parsedLines.push({id, type: 'header', content: line, oldL: null, newL: null});
            }
        });

        return parsedLines;
    });