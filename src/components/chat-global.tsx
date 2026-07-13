import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  CheckCircle2,
  CircleX,
  Command,
  CornerDownLeft,
  LoaderCircle,
  MessageCircle,
  MessagesSquare,
  Send,
  Sparkles,
} from 'lucide-react'
import { getMessagesByPullRequestId, insertMessage } from '#/actions/messages.ts'
import { getUserDisplayName } from '#/lib/user.ts'

interface ChatPanelProps {
  prId?: string
  user: User | null
}

interface Message {
  id: number
  prId: number
  author: string
  avatar: string
  content: string
  type: string
  timestamp: string
  createdAt: string
}

interface CreateMessagePayload {
  prId: number
  content: string
  type: 'comment' | 'approve' | 'close'
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function ChatPanel({ prId, user }: ChatPanelProps) {
  const queryClient = useQueryClient()
  const prefersReducedMotion = useReducedMotion()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const numericPrId = prId ? Number.parseInt(prId, 10) : Number.NaN
  const hasValidPullRequest = Boolean(prId) && Number.isFinite(numericPrId)

  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ['messages', prId],
    queryFn: () => getMessagesByPullRequestId({ data: { prId: numericPrId } }),
    enabled: hasValidPullRequest,
  })

  const addMessageMutation = useMutation({
    mutationFn: (newMessage: CreateMessagePayload) => insertMessage({ data: newMessage }),
    onSuccess: async () => {
      setInputValue('')
      await queryClient.invalidateQueries({ queryKey: ['messages', prId] })
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [messages, prefersReducedMotion])

  const handleSend = (event?: FormEvent) => {
    event?.preventDefault()
    const text = inputValue.trim()
    if (!text || !hasValidPullRequest || addMessageMutation.isPending) return

    const authorName = getUserDisplayName(user)
    const command = text.startsWith('/') ? text.split(' ')[0].toLowerCase() : ''
    let type: CreateMessagePayload['type'] = 'comment'
    let content = text

    if (command === '/lgtm' || command === '/approve') {
      type = 'approve'
      content = `${authorName} approved these changes`
    } else if (command === '/close') {
      type = 'close'
      content = `${authorName} closed this pull request`
    }

    addMessageMutation.mutate({
      prId: numericPrId,
      content,
      type,
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const insertCommand = (command: string) => {
    setInputValue(command)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  if (!prId) return <DiscussionEmptyState />

  const isCommandMode = inputValue.startsWith('/')
  const currentUserDisplayName = getUserDisplayName(user)

  return (
    <motion.aside
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-full w-[378px] shrink-0 flex-col border-l border-black/10 bg-[#f8f7f2] text-ink shadow-[-12px_0_40px_rgba(4,15,12,0.1)]"
      aria-label="Pull request discussion"
    >
      <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-black/[0.08] bg-white/65 px-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <MessagesSquare className="size-4 text-accent" />
            <h2 className="text-sm font-bold tracking-[-0.015em]">Discussion</h2>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">Review conversation</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1.5 text-[10px] font-bold text-black/42 shadow-sm">
          <span className="size-1.5 rounded-full bg-accent" />
          {messages.length} {messages.length === 1 ? 'note' : 'notes'}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {isLoading ? (
          <MessageSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-rose-900/10 bg-rose-50 p-4 text-xs leading-relaxed text-rose-800">
            The discussion could not be loaded. Refresh the page to try again.
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="grid size-12 place-items-center rounded-2xl border border-black/[0.07] bg-white text-black/30 shadow-sm">
              <MessageCircle className="size-5" />
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold tracking-[-0.025em]">Start the review thread</h3>
            <p className="mt-2 text-xs leading-relaxed text-black/42">Share context, ask a question, or use a command to record the review decision.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((message: Message, index: number) => (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={message.author === currentUserDisplayName}
                index={index}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative border-t border-black/[0.08] bg-white/80 p-4 backdrop-blur-md">
        <AnimatePresence>
          {isCommandMode ? (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.17 }}
              className="absolute bottom-[calc(100%+8px)] left-4 right-4 z-30 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_24px_60px_rgba(17,31,27,0.17)]"
            >
              <div className="flex items-center gap-2 border-b border-black/[0.07] bg-canvas/60 px-3.5 py-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">
                <Command className="size-3.5 text-accent" /> Review commands
              </div>
              <CommandButton
                icon={<CheckCircle2 className="size-4 text-accent" />}
                command="/approve"
                detail="Approve these changes"
                onClick={() => insertCommand('/approve ')}
              />
              <CommandButton
                icon={<CircleX className="size-4 text-rose-500" />}
                command="/close"
                detail="Close without merging"
                onClick={() => insertCommand('/close ')}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_28px_rgba(21,32,31,0.07)] transition-shadow focus-within:border-accent/50 focus-within:shadow-[0_10px_34px_rgba(25,167,137,0.11)]">
          <textarea
            ref={inputRef}
            id="global-chat-input"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add to the discussion…"
            rows={3}
            disabled={addMessageMutation.isPending}
            aria-expanded={isCommandMode}
            className="block h-[82px] w-full resize-none bg-transparent px-3.5 py-3 text-[13px] leading-relaxed text-ink outline-none placeholder:text-black/28 disabled:opacity-60"
          />
          <div className="flex h-10 items-center justify-between border-t border-black/[0.06] bg-canvas/40 px-2.5">
            <div className="flex items-center gap-2">
              {isCommandMode ? (
                <span className="flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.09em] text-[#08745f]">
                  <Sparkles className="size-3" /> Command
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[9px] font-medium text-black/30">
                  <CornerDownLeft className="size-3" /> Shift + Enter for a new line
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || addMessageMutation.isPending}
              className="flex h-7 items-center gap-1.5 rounded-lg bg-ink px-2.5 text-[10px] font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[#243532] disabled:translate-y-0 disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              {addMessageMutation.isPending ? <LoaderCircle className="size-3 animate-spin" /> : <Send className="size-3" />}
              {addMessageMutation.isPending ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
        {addMessageMutation.error ? (
          <p className="mt-2 text-[10px] font-medium text-rose-600">Message failed to send. Your draft is still here.</p>
        ) : null}
      </form>
    </motion.aside>
  )
}

function MessageItem({ message, isCurrentUser, index }: { message: Message; isCurrentUser: boolean; index: number }) {
  const isSystemEvent = message.type !== 'comment'

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.035, 0.2) }}
    >
      {isSystemEvent ? (
        <div className={`flex gap-3 rounded-2xl border p-3.5 ${message.type === 'approve' ? 'border-accent/15 bg-accent/[0.06]' : 'border-rose-900/10 bg-rose-50/70'}`}>
          <div className={`grid size-8 shrink-0 place-items-center rounded-xl ${message.type === 'approve' ? 'bg-accent/12 text-accent' : 'bg-rose-100 text-rose-500'}`}>
            {message.type === 'approve' ? <CheckCircle2 className="size-4" /> : <CircleX className="size-4" />}
          </div>
          <div>
            <p className="text-xs font-bold leading-relaxed text-ink/80">{message.content}</p>
            <p className="mt-1 text-[10px] font-medium text-black/35">{formatDate(message.timestamp)}</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <div className={`grid size-8 shrink-0 place-items-center rounded-xl text-[9px] font-bold ${isCurrentUser ? 'bg-ink text-white' : 'border border-black/[0.07] bg-white text-black/55 shadow-sm'}`}>
            {message.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[11px] font-bold text-ink/75">
                {message.author}{isCurrentUser ? <span className="ml-1 font-medium text-black/30">you</span> : null}
              </span>
              <span className="shrink-0 text-[9px] font-medium text-black/28">{formatDate(message.timestamp)}</span>
            </div>
            <div className={`mt-1.5 rounded-2xl border px-3.5 py-3 text-[12px] leading-[1.6] shadow-sm ${isCurrentUser ? 'rounded-tr-sm border-ink/5 bg-ink text-white/80' : 'rounded-tl-sm border-black/[0.07] bg-white text-ink/70'}`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          </div>
        </div>
      )}
    </motion.article>
  )
}

function CommandButton({ icon, command, detail, onClick }: { icon: React.ReactNode; command: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-black/[0.05] px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-canvas/60 focus-visible:bg-canvas focus-visible:outline-none"
    >
      {icon}
      <span className="flex-1">
        <span className="block font-mono text-[11px] font-semibold text-ink">{command}</span>
        <span className="mt-0.5 block text-[10px] text-black/38">{detail}</span>
      </span>
      <CornerDownLeft className="size-3.5 text-black/20" />
    </button>
  )
}

function DiscussionEmptyState() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.16 }}
      className="relative z-20 flex h-full w-[378px] shrink-0 flex-col items-center justify-center border-l border-black/10 bg-[#f8f7f2] px-8 text-center text-ink shadow-[-12px_0_40px_rgba(4,15,12,0.1)]"
    >
      <div className="grid size-12 place-items-center rounded-2xl border border-black/[0.07] bg-white text-black/25 shadow-sm">
        <MessagesSquare className="size-5" />
      </div>
      <p className="mt-4 text-sm font-bold">Discussion is standing by</p>
      <p className="mt-1.5 text-xs leading-relaxed text-black/38">The review conversation opens with your selected pull request.</p>
    </motion.aside>
  )
}

function MessageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Loading discussion">
      {[72, 88, 63].map((width) => (
        <div key={width} className="flex gap-3">
          <div className="size-8 rounded-xl bg-black/[0.07]" />
          <div className="flex-1">
            <div className="h-2 w-20 rounded bg-black/[0.07]" />
            <div className="mt-2 h-16 rounded-2xl bg-black/[0.05]" style={{ width: `${width}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}
