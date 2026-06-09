import {useState} from 'react';
import {MOCK_DIFF_LINES, MOCK_PR_DATA, INITIAL_INLINE_COMMENTS} from './MOCK-DATA';
import {GitPullRequest, Plus} from "lucide-react";

interface InlineCommentEditorProps {
    onCancel: () => void;
    onSave: (text: string) => void;
}

interface InlineComment {
    id: number;
    lineId: string;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
}

interface CodeViewerProps {
    prData: typeof MOCK_PR_DATA;
}

export function InlineCommentEditor({onCancel, onSave}: InlineCommentEditorProps) {
    const [text, setText] = useState('');

    return (
        <div
            className="flex flex-col font-sans bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden shadow-2xl my-3 mx-4 ml-18 ring-1 ring-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
            <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Leave a comment..."
                className="w-full h-24 p-4 text-sm bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-3 px-4 py-3 bg-[#0d1117] border-t border-[#30363d]">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-semibold transition-colors rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#30363d]/50 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onSave(text)}
                    disabled={!text.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white transition-all bg-blue-600 rounded-lg shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
}

export function CodeViewer({prData}: CodeViewerProps) {
    const [inlineComments, setInlineComments] = useState<InlineComment[]>(INITIAL_INLINE_COMMENTS);
    const [activeEditorLineId, setActiveEditorLineId] = useState<string | null>(null);

    const handleSaveInlineComment = (lineId: string, text: string) => {
        setInlineComments((prev) => [
            ...prev,
            {
                id: Date.now(),
                lineId,
                author: 'tech-lead',
                avatar: 'TL',
                content: text,
                timestamp: 'Just now',
            },
        ]);
        setActiveEditorLineId(null);
    };

    return (
        <div
            className="flex flex-col flex-1 h-full min-w-[500px] bg-[#0d1117] border-r border-[#30363d] overflow-hidden">
            <div
                className="flex items-center justify-between px-6 h-14 bg-[#161b22] border-b border-[#30363d] shrink-0">
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                        <GitPullRequest className="w-3.5 h-3.5"/>
                        Open
                    </div>
                    <div className="w-px h-5 bg-[#30363d]"></div>
                    <h2 className="text-sm font-semibold text-slate-200">
                        {prData.title} <span className="font-normal text-slate-500">#{prData.prNumber}</span>
                    </h2>
                </div>
            </div>

            <div
                className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-[#30363d] shrink-0">
                <div className="text-xs font-mono font-medium text-slate-400">src/middleware/auth.ts</div>
            </div>

            <div
                className="flex-1 pt-4 pb-20 font-mono text-sm leading-relaxed overflow-y-auto scroll-smooth text-slate-300">
                {MOCK_DIFF_LINES.map((line) => {
                    const isHeader = line.type === 'header';
                    const isAdd = line.type === 'add';
                    const isRemove = line.type === 'remove';

                    let bgClass = 'hover:bg-[#161b22]/80 transition-colors';
                    if (isAdd) bgClass = 'bg-[#2ea043]/10 hover:bg-[#2ea043]/20 transition-colors';
                    if (isRemove) bgClass = 'bg-[#f85149]/10 hover:bg-[#f85149]/20 transition-colors';
                    if (isHeader) bgClass = 'text-slate-400 px-4 py-3 bg-[#0d1117]/50 text-xs font-semibold';

                    const lineComments = inlineComments.filter((c) => c.lineId === line.id);
                    const isEditorOpen = activeEditorLineId === line.id;

                    if (isHeader) {
                        return (
                            <div key={line.id} className={bgClass}>
                                {line.content}
                            </div>
                        );
                    }

                    return (
                        <div key={line.id} className="flex flex-col">
                            <div className={`flex group relative ${bgClass}`}>
                                <div className="relative flex shrink-0 w-[72px] border-r border-[#30363d] mr-4 text-xs">
                                    <div className="w-1/2 pr-3 py-0.5 text-right text-slate-600 select-none">
                                        {line.oldL || ' '}
                                    </div>
                                    <div className="w-1/2 pr-3 py-0.5 text-right text-slate-600 select-none">
                                        {line.newL || ' '}
                                    </div>

                                    <button
                                        onClick={() => setActiveEditorLineId(isEditorOpen ? null : line.id)}
                                        className="absolute z-10 flex items-center justify-center w-5 h-5 text-white transition-all -translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded opacity-0 shadow-sm top-1/2 left-1/2 group-hover:opacity-100 hover:bg-blue-500 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        title="Add a comment on this line"
                                    >
                                        <Plus className="w-3.5 h-3.5"/>
                                    </button>
                                </div>
                                <div
                                    className={`py-0.5 whitespace-pre break-all ${
                                        isAdd ? 'text-[#3fb950]' : isRemove ? 'text-[#ff7b72]' : 'text-slate-300'
                                    }`}
                                >
                                    {line.content}
                                </div>
                            </div>

                            {lineComments.length > 0 && (
                                <div
                                    className="ml-[72px] mr-4 my-3 font-sans bg-[#161b22] border border-[#30363d] rounded-xl shadow-md overflow-hidden">
                                    {lineComments.map((comment, index) => (
                                        <div
                                            key={comment.id}
                                            className={`p-4 ${index !== 0 ? 'border-t border-[#30363d]' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div
                                                    className={`flex items-center justify-center shrink-0 w-8 h-8 text-xs font-bold rounded-full ${
                                                        comment.author === 'tech-lead'
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                                                    }`}
                                                >
                                                    {comment.avatar}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <span className="text-sm font-semibold text-slate-200">
                                                            {comment.author}
                                                        </span>
                                                        <span className="text-xs font-medium text-slate-500">
                                                            {comment.timestamp}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm leading-relaxed text-slate-300">
                                                        {comment.content}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isEditorOpen && (
                                <InlineCommentEditor
                                    onCancel={() => setActiveEditorLineId(null)}
                                    onSave={(text) => handleSaveInlineComment(line.id, text)}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}