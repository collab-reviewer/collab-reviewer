import {GitPullRequest, LogOut} from "lucide-react";
import {createClient} from "#/supabase/client.ts";
import {useNavigate, useRouter} from "@tanstack/react-router";
import {usePullRequestQuery} from "#/queries/usePullRequest.ts";
import {usePullRequestSubscription} from "#/hooks/pullRequestSubscriptions.ts";
import type {PullRequest} from "#/types/pull_request.ts";

export function Sidebar() {
    const supabase = createClient();
    const router = useRouter();
    const navigate = useNavigate({from: '/'});

    const {data: channels = [], isLoading} = usePullRequestQuery();

    usePullRequestSubscription();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await router.invalidate();
        await router.navigate({to: '/login'});
    }

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

                {isLoading ? (
                    <div className="px-3 text-sm text-slate-400 flex items-center gap-2">
                        <span
                            className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                        Loading...
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {channels.map((channel: PullRequest) => (
                            <button
                                key={channel.id}
                                onClick={() => navigate({search: {prId: channel.id.toString(), url: channel.diffUrl}})}
                                className={`flex flex-col w-full px-3 py-3 text-left transition-all border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 ${
                                    channel.status === 'open'
                                        ? 'bg-white border-slate-200 shadow-sm'
                                        : 'border-transparent hover:bg-slate-100/80 hover:border-slate-200/50'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full mb-1.5">
                                    <span className="text-xs font-semibold text-slate-500 truncate pr-2">
                                        {channel.repo}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <GitPullRequest
                                        className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                                            channel.status === 'open' ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-500'
                                        }`}
                                    />
                                    <span
                                        className={`text-sm leading-snug font-medium line-clamp-2 transition-colors ${
                                            channel.status === 'open' ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                                        }`}
                                    >
                                        {channel.title}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-5 h-16 bg-white border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
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
                <button
                    onClick={() => handleLogout()}
                    className="flex items-center justify-center p-2 text-slate-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4"/>
                </button>
            </div>
        </div>
    );
}