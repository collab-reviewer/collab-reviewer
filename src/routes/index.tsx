import {createFileRoute, redirect} from '@tanstack/react-router';
import {Sidebar} from '#/components/sidebar';
import {CodeViewer} from '#/components/code-viewer';
import {ChatPanel} from '#/components/chat-global';

import {MOCK_PR_DATA} from '#/components/MOCK-DATA';
import {checkAuth} from "#/actions/session.ts";


export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        const {isAuthenticated, user} = await checkAuth()

        if (!isAuthenticated) {
            throw redirect({
                to: '/login',
            })
        }

        return {user}
    },
    component: () => (
        <div className="flex h-screen w-full font-sans antialiased text-slate-900 bg-white overflow-hidden">
            <Sidebar/>
            <CodeViewer prData={MOCK_PR_DATA}/>
            <ChatPanel/>
        </div>
    ),
});