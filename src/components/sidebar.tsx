import { Icons } from "./icon";

import { MOCK_CHANNELS } from "./MOCK-DATA";

// --------------------------------------------------------
// 1. SIDEBAR (Lista de PRs activas)
// --------------------------------------------------------

export function Sidebar() {
    return (
        <div className="w-70 min-w-70 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
            <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white shadow-sm">
                        <Icons.GitPullRequest/>
                    </div>
                    <span className="font-semibold text-slate-900 text-sm tracking-tight">ReviewDeck</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <div className="px-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Active
                    Reviews
                </div>
                <div className="space-y-1">
                    {MOCK_CHANNELS.map((channel) => (
                        <button key={channel.id}
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group border 
                                    ${channel.isActive ? 'bg-white border-slate-200 shadow-sm' : 'border-transparent hover:bg-slate-100/50'}`}>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[11px] font-medium text-slate-500">{channel.repo}</span>
                                {channel.unread > 0 && (
                                    <span
                                        className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                                        {channel.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 items-start">
                                <span
                                    className={`mt-0.5 ${channel.isActive ? 'text-green-600' : 'text-slate-400'}`}><Icons.GitPullRequest/></span>
                                <span
                                    className={`text-[13px] leading-snug font-medium line-clamp-2 
                                        ${channel.isActive ? 'text-slate-900' : 'text-slate-600'}`}>{channel.title}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-14 px-4 border-t border-slate-200 flex items-center gap-3 bg-white">
                <div
                    className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center 
                        justify-center text-[11px] font-bold text-indigo-700">TL
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-slate-900 leading-tight">tech-lead (You)</span>
                    <span className="text-[11px] text-slate-500 leading-tight">Online</span>
                </div>
            </div>
        </div>
    );
}