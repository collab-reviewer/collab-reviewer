import {MOCK_CHANNELS} from "./MOCK-DATA";
import {GitPullRequest} from "lucide-react";

export function Sidebar() {
    return (
        <div className="flex flex-col h-full shrink-0 w-70 bg-slate-50/50 border-r border-slate-200 z-10">
            <div
                className="flex items-center justify-between px-5 h-14 bg-white border-b border-slate-200 shadow-sm/50 shrink-0">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-7 h-7 text-white shadow-sm bg-slate-900 rounded-lg">
                        <GitPullRequest className="w-4 h-4"/>
                    </div>
                    <span className="text-sm font-bold tracking-tight text-slate-900">ReviewDeck</span>
                </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto scroll-smooth">
                <div className="px-2 mb-3 text-xs font-bold tracking-wider uppercase text-slate-400">
                    Active Reviews
                </div>
                <div className="space-y-1.5">
                    {MOCK_CHANNELS.map((channel) => (
                        <button
                            key={channel.id}
                            className={`flex flex-col w-full px-3 py-3 text-left transition-all border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 ${
                                channel.isActive
                                    ? 'bg-white border-slate-200 shadow-sm'
                                    : 'border-transparent hover:bg-slate-100/80 hover:border-slate-200/50'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full mb-1.5">
                                <span className="text-xs font-semibold text-slate-500 truncate pr-2">
                                    {channel.repo}
                                </span>
                                {channel.unread > 0 && (
                                    <span
                                        className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[10px] font-bold text-white bg-indigo-600 rounded-full shadow-sm shrink-0">
                                        {channel.unread}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-start gap-2.5">
                                <GitPullRequest
                                    className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                                        channel.isActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-500'
                                    }`}
                                />
                                <span
                                    className={`text-sm leading-snug font-medium line-clamp-2 transition-colors ${
                                        channel.isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                                    }`}
                                >
                                    {channel.title}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 px-5 h-16 bg-white border-t border-slate-200 shrink-0">
                <div
                    className="flex items-center justify-center shrink-0 w-9 h-9 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                    TL
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-slate-900">
                        tech-lead <span className="text-slate-400 font-medium ml-0.5">(You)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Online
                    </span>
                </div>
            </div>
        </div>
    );
}