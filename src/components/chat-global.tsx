import {useState, useRef, useEffect} from 'react';
import {INITIAL_MESSAGES, type Message} from './MOCK-DATA';
import {CheckCircle, Info, MessageSquare, Zap} from "lucide-react";


export function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const text = inputValue.trim();
        const baseMessage = {
            id: Date.now(),
            author: 'tech-lead',
            avatar: 'TL',
            timestamp: 'Just now',
        };

        let newMsg: Message;

        if (text.startsWith('/')) {
            const command = text.split(' ')[0].toLowerCase();

            if (command === '/lgtm' || command === '/approve') {
                newMsg = {
                    ...baseMessage,
                    type: 'system-event',
                    icon: 'approve',
                    content: 'tech-lead approved these changes',
                };
            } else if (command === '/close') {
                newMsg = {
                    ...baseMessage,
                    type: 'system-event',
                    icon: 'info',
                    content: 'tech-lead closed this pull request',
                };
            } else {
                newMsg = {...baseMessage, type: 'comment', content: text};
            }
        } else {
            newMsg = {...baseMessage, type: 'comment', content: text};
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

    const insertCommand = (command: string) => {
        setInputValue(command);
        document.getElementById('global-chat-input')?.focus();
    };

    const isCommandMode = inputValue.startsWith('/');

    return (
        <div
            className="flex flex-col h-full w-105 min-w-95 shrink-0 bg-slate-50/50 border-l border-slate-200 z-20">
            <div
                className="flex items-center justify-between h-14 px-5 bg-white border-b border-slate-200 shrink-0 shadow-sm/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <MessageSquare className="w-4 h-4 text-slate-500"/>
                    Global Discussion
                </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-6 last:mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {msg.type === 'system-event' ? (
                            <div
                                className="flex items-start gap-3 px-4 py-3 bg-white border border-slate-200 shadow-sm rounded-xl">
                                <div className="mt-0.5">
                                    {msg.icon === 'approve' ? (
                                        <CheckCircle className="w-5 h-5 text-emerald-500"/>
                                    ) : (
                                        <Info className="w-5 h-5 text-blue-500"/>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-slate-800">{msg.content}</p>
                                    <span className="text-xs font-medium text-slate-400 mt-0.5">{msg.timestamp}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <div
                                    className="flex items-center justify-center shrink-0 w-8 h-8 mt-0.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                                    {msg.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1.5">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {msg.author}
                                            {msg.author === 'tech-lead' && (
                                                <span className="ml-1.5 text-xs font-medium text-slate-400">(You)</span>
                                            )}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">{msg.timestamp}</span>
                                    </div>
                                    <div
                                        className="p-3.5 text-sm text-slate-700 bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm">
                                        <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>

            <div className="relative p-4 bg-white border-t border-slate-200">
                {isCommandMode && (
                    <div
                        className="absolute left-4 right-4 bottom-[calc(100%+8px)] bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-30">
                        <div
                            className="px-3 py-2 text-xs font-bold tracking-wider text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                            Available Commands
                        </div>
                        <button
                            onClick={() => insertCommand('/approve ')}
                            className="flex items-center w-full gap-3 px-3 py-2.5 text-left transition-colors border-b border-slate-50 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0"/>
                            <div className="flex flex-col">
                                <div className="text-sm font-semibold text-slate-800">
                                    /approve <span className="text-slate-400 font-normal ml-1">or /lgtm</span>
                                </div>
                                <div className="text-xs text-slate-500">Approve the pull request and allow merge</div>
                            </div>
                        </button>
                        <button
                            onClick={() => insertCommand('/close ')}
                            className="flex items-center w-full gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                            <Info className="w-4 h-4 text-rose-500 shrink-0"/>
                            <div className="flex flex-col">
                                <div className="text-sm font-semibold text-slate-800">/close</div>
                                <div className="text-xs text-slate-500">Close without merging</div>
                            </div>
                        </button>
                    </div>
                )}

                <div
                    className="flex flex-col overflow-hidden transition-all bg-white border border-slate-200 rounded-xl shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <textarea
                        id="global-chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a comment or '/' for commands..."
                        className="w-full h-20 px-3.5 py-3 text-sm text-slate-900 bg-transparent resize-none placeholder:text-slate-400 focus:outline-none"
                    />
                    <div
                        className="flex items-center justify-between px-3 py-2 bg-slate-50/50 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            {isCommandMode ? (
                                <span
                                    className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    <Zap className="w-3.5 h-3.5"/>
                                    Command mode
                                </span>
                            ) : (
                                <span>Markdown is supported</span>
                            )}
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                        >
                            Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}