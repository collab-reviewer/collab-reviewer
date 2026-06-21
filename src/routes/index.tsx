import {createFileRoute, redirect} from '@tanstack/react-router';
import {z} from 'zod';
import {Sidebar} from '#/components/sidebar';
import {CodeViewer} from '#/components/code-viewer';
import {ChatPanel} from '#/components/chat-global';
import {checkAuth} from "#/actions/session.ts";
import {pullRequestKeys} from "#/queries/usePullRequest.ts";
import {getPullRequests} from "#/actions/pullrequest.ts";

const searchSchema = z.object({
    prId: z.string().optional(),
    url: z.string().optional(),
});

export const Route = createFileRoute('/')({
    validateSearch: searchSchema,
    beforeLoad: async () => {
        const {isAuthenticated, user} = await checkAuth()

        if (!isAuthenticated) {
            throw redirect({
                to: '/login',
            })
        }

        return {user}
    },
    loader: async ({context}) => {
        await context.queryClient.ensureQueryData({
            queryKey: pullRequestKeys.lists(),
            queryFn: () => getPullRequests()
        })
    },
    component: IndexComponent,
});

function IndexComponent() {
    const {prId, url} = Route.useSearch();

    return (
        <div className="flex h-screen w-full font-sans antialiased text-slate-900 bg-white overflow-hidden">
            <Sidebar/>
            <CodeViewer prId={prId} url={url}/>
            <ChatPanel/>
        </div>
    );
}