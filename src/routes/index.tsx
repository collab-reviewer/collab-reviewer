import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { Sidebar } from '#/components/sidebar'
import { CodeViewer } from '#/components/code-viewer'
import { ChatPanel } from '#/components/chat-global'
import { checkAuth } from '#/actions/session.ts'
import { pullRequestKeys } from '#/queries/usePullRequest.ts'
import { getPullRequests } from '#/actions/pullrequest.ts'

const searchSchema = z.object({
    prId: z.string().optional(),
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
    const { prId } = Route.useSearch()
    const { user } = Route.useRouteContext()

    return (
        <main className="flex h-dvh min-h-[720px] w-full min-w-[1200px] overflow-hidden bg-night font-sans antialiased">
            <Sidebar activePullRequestId={prId} user={user}/>
            <CodeViewer prId={prId} user={user}/>
            <ChatPanel prId={prId} user={user}/>
        </main>
    );
}
