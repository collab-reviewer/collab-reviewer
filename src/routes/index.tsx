import {createFileRoute} from '@tanstack/react-router';
import { Sidebar } from '#/components/sidebar';
import { CodeViewer } from '#/components/code-viewer';
import { ChatPanel } from '#/components/chat-global';
import { useState } from 'react';

import { MOCK_PR_DATA } from '#/components/MOCK-DATA';

// --------------------------------------------------------
// ROUTE PRINCIPAL (TanStack Start)
// --------------------------------------------------------
export const Route = createFileRoute('/')({
    component: () => {
        const [selectedPRId, setSelectedPRId] = useState<number>(1);

        return (
            // Estructura maestra: Flex row ocupando toda la pantalla sin scroll global
            <div className="flex h-screen w-full font-sans antialiased text-slate-900 bg-white overflow-hidden">
                <Sidebar onSelectPR={setSelectedPRId}/>
                <CodeViewer prData={MOCK_PR_DATA} prId={selectedPRId}/>
                <ChatPanel prId={selectedPRId}/>
            </div>
        );
    },
});