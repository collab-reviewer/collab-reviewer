import {useState} from 'react';
import { Icons } from './icon';

import { MOCK_DIFF_LINES, MOCK_PR_DATA } from './MOCK-DATA';
import { useInlineComments } from '#/hooks/useInLineComments';
import { useRealtimeInlineComments } from '#/hooks/useRealtimeInlineComments';
import { supabase } from '#/integrations/tanstack-query/supabase-client.ts';

// --------------------------------------------------------
// 2. Code View with inline comments
// --------------------------------------------------------
export function InlineCommentEditor({onCancel, onSave}: { onCancel: () => void, onSave: (text: string) => void }) {
    const [text, setText] = useState('');

    return (
        <div
            className="flex flex-col font-sans bg-[#0d1117] rounded-lg border border-[#30363d] overflow-hidden shadow-xl my-2 mx-4 ml-17.5">
      <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Leave a comment on this line..."
          className="w-full bg-transparent p-3 text-[13px] text-slate-200 focus:outline-none resize-none h-18"
      />
            <div className="flex justify-end gap-2 px-3 py-2 bg-[#161b22] border-t border-[#30363d]">
                <button onClick={onCancel}
                        className="px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-200 transition-colors">
                    Cancel
                </button>
                <button
                    onClick={() => onSave(text)}
                    disabled={!text.trim()}
                    className="px-3 py-1.5 text-[12px] bg-blue-600 
                        hover:bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 transition-colors"
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
}

export function CodeViewer({prData, prId = 1}: { prData: typeof MOCK_PR_DATA, prId?: number }) {
    const [activeEditorLineId, setActiveEditorLineId] = useState<string | null>(null);

    // Fetch inline comments from database
    const { data: dbComments = [] } = useInlineComments(prId);
    
    // Set up real-time subscription
    const { comments: inlineComments, setComments: setInlineComments } = useRealtimeInlineComments(prId, dbComments as any);

    const handleSaveInlineComment = async (lineId: string, text: string) => {
        try {
            // Insert comment into database and return the inserted row
            const { data, error } = await supabase
                .from('inline_comments')
                .insert({
                    pr_id: prId,
                    line_id: lineId,
                    author: "tech-lead",
                    avatar: "TL",
                    content: text,
                    timestamp: "Just now"
                })
                .select()
                .single()

            if (error) throw error
            if (data) {
                setInlineComments((prev) =>
                    prev.some((comment) => comment.id === data.id)
                        ? prev
                        : [...prev, data]
                )
            }
            setActiveEditorLineId(null)
        } catch (error) {
            console.error('Failed to save comment:', error)
        }
    };

    return (
        <div
            className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden min-w-125 border-r border-[#30363d]">
            <div
                className="h-14 px-6 border-b border-[#30363d] bg-[#161b22] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
          <span
              className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-[12px] font-medium flex items-center gap-1.5">
            <Icons.GitPullRequest/> Open
          </span>
                    <div className="h-4 w-px bg-[#30363d]"></div>
                    <h2 className="text-[14px] font-medium text-slate-200 flex items-center gap-2">
                        {prData.title} <span className="text-slate-500 font-normal">#{prData.prNumber}</span>
                    </h2>
                </div>
            </div>

            <div
                className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117] flex justify-between items-center shrink-0">
                <div className="text-[13px] font-mono text-slate-300">src/middleware/auth.ts</div>
            </div>

            <div
                className="flex-1 overflow-y-auto bg-[#0d1117] text-slate-300 font-mono text-[13px] leading-relaxed pb-20 pt-4">
                {MOCK_DIFF_LINES.map((line) => {
                    const isHeader = line.type === 'header';
                    const isAdd = line.type === 'add';
                    const isRemove = line.type === 'remove';

                    let bgClass = 'hover:bg-[#161b22]';
                    if (isAdd) bgClass = 'bg-[#2ea043]/10 hover:bg-[#2ea043]/20';
                    if (isRemove) bgClass = 'bg-[#f85149]/10 hover:bg-[#f85149]/20';
                    if (isHeader) bgClass = 'text-[#8b949e] px-4 py-2 bg-[#0d1117]';

                    const lineComments = inlineComments.filter(c => c.line_id === line.id);
                    const isEditorOpen = activeEditorLineId === line.id;

                    if (isHeader) {
                        return <div key={line.id} className={bgClass}>{line.content}</div>;
                    }

                    return (
                        <div key={line.id} className="flex flex-col">
                            {/* LÍNEA DE CÓDIGO */}
                            <div className={`flex group relative ${bgClass}`}>
                                {/* Gutter (Margen de números y botón +) */}
                                <div className="w-17.5 shrink-0 flex border-r border-[#30363d] mr-4 relative">
                                    <div
                                        className="w-1/2 text-right pr-2 text-[#6e7681] select-none">{line.oldL || ' '}</div>
                                    <div
                                        className="w-1/2 text-right pr-2 text-[#6e7681] select-none">{line.newL || ' '}</div>

                                    {/* Botón Flotante para Comentar */}
                                    <button
                                        onClick={() => setActiveEditorLineId(isEditorOpen ? null : line.id)}
                                        className="absolute left-8.75 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10 hover:bg-blue-500 shadow-md"
                                        title="Add a comment on this line"
                                    >
                                        <Icons.Plus/>
                                    </button>
                                </div>
                                {/* Contenido */}
                                <div
                                    className={`whitespace-pre break-all ${isAdd ? 'text-[#3fb950]' : isRemove ? 'text-[#ff7b72]' : 'text-[#c9d1d9]'}`}>
                                    {line.content}
                                </div>
                            </div>

                            {/* COMENTARIOS YA GUARDADOS EN LA LÍNEA */}
                            {lineComments.length > 0 && (
                                <div
                                    className="ml-17.5 mr-4 my-2 font-sans bg-[#161b22] border border-[#30363d] rounded-lg shadow-sm">
                                    {lineComments.map((comment, index) => (
                                        <div key={comment.id}
                                             className={`p-3 ${index !== 0 ? 'border-t border-[#30363d]' : ''}`}>
                                            <div className="flex gap-3">
                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 
                          ${comment.author === 'tech-lead' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-700 text-slate-300'}`}>
                                                    {comment.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className="font-semibold text-[13px] text-slate-200">{comment.author}</span>
                                                        <span
                                                            className="text-[11px] text-slate-500">{comment.timestamp}</span>
                                                    </div>
                                                    <div className="text-[13px] text-slate-300 leading-relaxed">
                                                        {comment.content}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* EDITOR ABIERTO EN LA LÍNEA */}
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
