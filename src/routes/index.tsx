import {createFileRoute} from '@tanstack/react-router';
import {useState, useRef, useEffect} from 'react';

// --------------------------------------------------------
// DATOS MOCK INICIALES
// --------------------------------------------------------
const MOCK_CHANNELS = [
    {id: 102, title: "feat: Implement JWT validation", repo: "api-backend", unread: 2, isActive: true},
    {id: 98, title: "fix: Mobile nav overflow", repo: "frontend-app", unread: 0, isActive: false},
    {id: 95, title: "chore: Update dependencies", repo: "api-backend", unread: 0, isActive: false},
];

const MOCK_PR_DATA = {
    title: "Implement JWT validation for login",
    prNumber: 102,
    author: "dev-juan",
    status: "open",
    branch: "feature/jwt-auth",
};

const MOCK_DIFF_LINES = [
    {id: 'h1', type: 'header', content: '@@ -15,7 +15,7 @@ function validateSession(req, res) {'},
    {id: 'L15', type: 'context', oldL: 15, newL: 15, content: '  const user = req.user;'},
    {id: 'L16-del', type: 'remove', oldL: 16, newL: null, content: '- const isAuthenticated = user !== null;'},
    {
        id: 'L16-add',
        type: 'add',
        oldL: null,
        newL: 16,
        content: '+ const isAuthenticated = user !== null && !user.isExpired;'
    },
    {id: 'L17', type: 'context', oldL: 17, newL: 17, content: '  '},
    {id: 'L18', type: 'context', oldL: 18, newL: 18, content: '  if (!isAuthenticated) {'},
    {
        id: 'L19',
        type: 'context',
        oldL: 19,
        newL: 19,
        content: '    return res.status(401).json({ error: "Unauthorized" });'
    },
];

const INITIAL_MESSAGES = [
    {
        id: 1, author: "System", content: "dev-juan requested a review from you",
        timestamp: "2 hours ago", type: "system-event", icon: "request", avatar: "SJ"
    }
];

const INITIAL_INLINE_COMMENTS = [
    {
        id: 999, lineId: 'L16-add', author: "dev-juan", avatar: "DJ",
        content: "Añadí la validación extra aquí. ¿Te parece bien manejarlo en esta capa o lo movemos al servicio?",
        timestamp: "15 mins ago"
    }
];

// --------------------------------------------------------
// ICONOS SVG (Estilo Lucide)
// --------------------------------------------------------
const Icons = {
    GitPullRequest: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3"></circle>
        <circle cx="6" cy="6" r="3"></circle>
        <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
        <line x1="6" y1="9" x2="6" y2="21"></line>
    </svg>,
    CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>,
    Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>,
    MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>,
    Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>,
    Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>,
};

// --------------------------------------------------------
// 1. SIDEBAR (Lista de PRs activas)
// --------------------------------------------------------
function Sidebar() {
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
                                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group border ${channel.isActive ? 'bg-white border-slate-200 shadow-sm' : 'border-transparent hover:bg-slate-100/50'}`}>
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
                                    className={`text-[13px] leading-snug font-medium line-clamp-2 ${channel.isActive ? 'text-slate-900' : 'text-slate-600'}`}>{channel.title}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-14 px-4 border-t border-slate-200 flex items-center gap-3 bg-white">
                <div
                    className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[11px] font-bold text-indigo-700">TL
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-slate-900 leading-tight">tech-lead (You)</span>
                    <span className="text-[11px] text-slate-500 leading-tight">Online</span>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------
// 2. VISOR DE CÓDIGO (Con Comentarios en línea)
// --------------------------------------------------------
function InlineCommentEditor({onCancel, onSave}: { onCancel: () => void, onSave: (text: string) => void }) {
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
                    className="px-3 py-1.5 text-[12px] bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium disabled:opacity-50 transition-colors"
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
}

function CodeViewer({prData}: { prData: typeof MOCK_PR_DATA }) {
    const [inlineComments, setInlineComments] = useState(INITIAL_INLINE_COMMENTS);
    const [activeEditorLineId, setActiveEditorLineId] = useState<string | null>(null);

    const handleSaveInlineComment = (lineId: string, text: string) => {
        setInlineComments([...inlineComments, {
            id: Date.now(),
            lineId,
            author: "tech-lead",
            avatar: "TL",
            content: text,
            timestamp: "Just now"
        }]);
        setActiveEditorLineId(null);
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

                    const lineComments = inlineComments.filter(c => c.lineId === line.id);
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

// --------------------------------------------------------
// 3. CHAT GLOBAL (Con soporte para comandos "/")
// --------------------------------------------------------
function ChatPanel() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        let newMsg: any = {
            id: Date.now(),
            author: "tech-lead",
            avatar: "TL",
            timestamp: "Just now",
        };

        if (text.startsWith('/')) {
            const command = text.split(' ')[0].toLowerCase();

            if (command === '/lgtm' || command === '/approve') {
                newMsg.type = "system-event";
                newMsg.icon = "approve";
                newMsg.content = "tech-lead approved these changes";
            } else if (command === '/close') {
                newMsg.type = "system-event";
                newMsg.icon = "info";
                newMsg.content = "tech-lead closed this pull request";
            } else {
                newMsg.type = "comment";
                newMsg.content = text;
            }
        } else {
            newMsg.type = "comment";
            newMsg.content = text;
        }

        setMessages((prev) => [...prev, newMsg]);
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isCommandMode = inputValue.startsWith('/');

    return (
        <div
            className="w-105 min-w-95 bg-[#FCFCFD] flex flex-col h-full border-l border-slate-200 z-20 shrink-0">
            <div
                className="h-14 px-5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-medium text-[14px]">
                    <Icons.MessageSquare/> Global Discussion
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-6">
                        {msg.type === 'system-event' ? (
                            <div
                                className="flex items-start gap-3 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                                <div className="mt-0.5">{msg.icon === 'approve' ? <Icons.CheckCircle/> :
                                    <Icons.Info/>}</div>
                                <div>
                                    <p className="text-[13px] font-medium text-slate-700">{msg.content}</p>
                                    <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div
                                    className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 bg-indigo-100 border-indigo-200 text-indigo-700">
                                    {msg.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-semibold text-[13px] text-slate-900">{msg.author} <span
                                            className="text-[11px] font-normal text-slate-500 ml-1">(You)</span></span>
                                        <span className="text-[11px] text-slate-500">{msg.timestamp}</span>
                                    </div>
                                    <div
                                        className="text-[13px] text-slate-700 bg-white border border-slate-200 rounded-lg rounded-tl-none p-3 shadow-sm">
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 relative">
                {/* Menú de Comandos Flotante */}
                {isCommandMode && (
                    <div
                        className="absolute bottom-[105%] left-4 right-4 mb-2 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-30">
                        <div
                            className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                            Available Commands
                        </div>
                        <button
                            onClick={() => {
                                setInputValue('/approve ');
                                document.getElementById('global-chat-input')?.focus();
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 transition-colors"
                        >
                            <Icons.CheckCircle/>
                            <div>
                                <div className="text-[13px] font-medium text-slate-700">/approve <span
                                    className="text-slate-400 font-normal">or /lgtm</span></div>
                                <div className="text-[11px] text-slate-500">Approve the pull request and allow merge
                                </div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setInputValue('/close ');
                                document.getElementById('global-chat-input')?.focus();
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                        >
                            <Icons.Info/>
                            <div>
                                <div className="text-[13px] font-medium text-slate-700">/close</div>
                                <div className="text-[11px] text-slate-500">Close without merging</div>
                            </div>
                        </button>
                    </div>
                )}

                {/* Input del Chat Global */}
                <div
                    className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow bg-white shadow-sm">
          <textarea
              id="global-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a comment or '/' for commands..."
              className="w-full px-3 py-3 text-[13px] text-slate-900 focus:outline-none resize-none h-20 bg-transparent"
          />
                    <div className="bg-slate-50 px-3 py-2 border-t border-slate-100 flex justify-between items-center">
                        <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            {isCommandMode ? (
                                <span className="text-blue-500 flex items-center gap-1"><Icons.Zap/> Command mode</span>
                            ) : (
                                'Markdown is supported'
                            )}
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                            Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------
// ROUTE PRINCIPAL (TanStack Start)
// --------------------------------------------------------
export const Route = createFileRoute('/')({
    component: () => (
        // Estructura maestra: Flex row ocupando toda la pantalla sin scroll global
        <div className="flex h-screen w-full font-sans antialiased text-slate-900 bg-white overflow-hidden">
            <Sidebar/>
            <CodeViewer prData={MOCK_PR_DATA}/>
            <ChatPanel/>
        </div>
    ),
});