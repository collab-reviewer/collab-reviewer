import {useState, useRef, useEffect} from 'react';
import { Icons } from '#/components/icon';
import { useMessages } from '#/hooks/useMessages';
import { useRealtimeMessages } from '#/hooks/useRealTimeMessages';
import { supabase } from '#/integrations/tanstack-query/supabase-client.ts';

// --------------------------------------------------------
// 3. CHAT GLOBAL (Con soporte para comandos "/")
// --------------------------------------------------------
export function ChatPanel({ prId = 1 }: { prId?: number }) {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages from database
    const { data: dbMessages = [] } = useMessages(prId);
    
    // Set up real-time subscription
    const { messages, setMessages } = useRealtimeMessages(prId, (dbMessages as any) || []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        let newMsg: any = {
            pr_id: prId,
            author: "tech-lead",
            avatar: "TL",
            timestamp: Date.now(),
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

        try {
            // Insert message into database and return the inserted row
            const { data, error } = await supabase
                .from('messages')
                .insert(newMsg)
                .select()
                .single()

            if (error) throw error
            if (data) {
                setMessages((prev) =>
                    prev.some((msg) => msg.id === data.id)
                        ? prev
                        : [...prev, data]
                )
            }
            setInputValue('')
        } catch (error) {
            console.error('Failed to save message:', error)
        }
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
                                    <span className="text-[11px] text-slate-400">{(Date.now() - msg.timestamp)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div
                                    className="w-8 h-8 rounded-full border flex items-center justify-center text-[11px] 
                                        font-bold shrink-0 mt-0.5 bg-indigo-100 border-indigo-200 text-indigo-700">
                                    {msg.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-semibold text-[13px] text-slate-900">{msg.author} <span
                                            className="text-[11px] font-normal text-slate-500 ml-1">(You)</span></span>
                                        <span className="text-[11px] text-slate-500">{(Date.now() - msg.timestamp)}</span>
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
                        className="absolute bottom-[105%] left-4 right-4 mb-2 bg-white border 
                            border-slate-200 shadow-lg rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-200 z-30">
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
                    className="border border-slate-200 rounded-xl overflow-hidden 
                        focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow bg-white shadow-sm">
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 
                                rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                            Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

