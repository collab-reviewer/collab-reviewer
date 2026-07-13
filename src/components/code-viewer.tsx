import { useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  Braces,
  Check,
  FileCode2,
  GitBranch,
  GitMerge,
  GitPullRequest,
  LoaderCircle,
  MessageSquarePlus,
  RotateCcw,
  X,
} from 'lucide-react'
import { getPullRequestDiff } from '#/actions/pullrequest.ts'
import { getCommentsByPullRequestId, insertComment } from '#/actions/inlineComments.ts'
import type { DiffLine } from '#/lib/pull-request-diff.ts'
import { getUserDisplayName } from '#/lib/user.ts'
import { usePullRequestQuery } from '#/queries/usePullRequest.ts'

interface InlineCommentEditorProps {
  isSaving: boolean
  errorMessage?: string
  onCancel: () => void
  onSave: (text: string) => void
}

interface InlineComment {
  id: number
  lineId: string
  author: string
  avatar: string
  content: string
  timestamp: string
}

interface CodeViewerProps {
  prId?: string
  user: User | null
}

interface CreateCommentPayload {
  prId: number
  lineId: string
  content: string
}

function InlineCommentEditor({ isSaving, errorMessage, onCancel, onSave }: InlineCommentEditorProps) {
  const [text, setText] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="mx-5 my-3 ml-[92px] overflow-hidden rounded-xl border border-accent/30 bg-[#1b2926] shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-black/30"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
        <MessageSquarePlus className="size-3.5 text-accent-bright" />
        New inline note
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && text.trim()) onSave(text.trim())
          if (event.key === 'Escape') onCancel()
        }}
        placeholder="Explain the issue, suggest a change, or ask a question…"
        className="h-24 w-full resize-none bg-transparent px-4 py-3 text-[13px] leading-relaxed text-white/90 outline-none placeholder:text-white/25"
      />
      {errorMessage ? (
        <p className="flex items-center gap-2 border-t border-rose-400/15 bg-rose-400/[0.06] px-4 py-2 text-xs text-rose-200">
          <AlertCircle className="size-3.5" /> {errorMessage}
        </p>
      ) : null}
      <div className="flex items-center justify-between border-t border-white/[0.07] bg-black/10 px-3 py-2.5">
        <span className="hidden text-[10px] text-white/25 xl:block">⌘ Enter to submit · Esc to close</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="grid size-8 place-items-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Cancel comment"
          >
            <X className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSave(text.trim())}
            disabled={!text.trim() || isSaving}
            className="flex h-8 items-center gap-2 rounded-lg bg-accent px-3 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(25,167,137,0.2)] transition-colors hover:bg-[#1cba98] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            {isSaving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {isSaving ? 'Saving' : 'Add note'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function CodeViewer({ prId, user }: CodeViewerProps) {
  const queryClient = useQueryClient()
  const [activeEditorLineId, setActiveEditorLineId] = useState<string | null>(null)
  const numericPrId = prId ? Number.parseInt(prId, 10) : Number.NaN
  const hasValidPullRequest = Boolean(prId) && Number.isFinite(numericPrId)
  const { data: pullRequests = [] } = usePullRequestQuery()
  const pullRequest = pullRequests.find((item) => String(item.id) === prId)

  const {
    data: diffLines = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['diff', prId],
    queryFn: () => getPullRequestDiff({ data: prId! }),
    enabled: hasValidPullRequest,
    staleTime: 60_000,
  })

  const { data: inlineComments = [] } = useQuery({
    queryKey: ['inlineComments', prId],
    queryFn: () => getCommentsByPullRequestId({ data: { prId: numericPrId } }),
    enabled: hasValidPullRequest,
  })

  const commentsByLine = useMemo(() => {
    const grouped = new Map<string, InlineComment[]>()
    for (const comment of inlineComments as InlineComment[]) {
      const comments = grouped.get(comment.lineId)
      if (comments) comments.push(comment)
      else grouped.set(comment.lineId, [comment])
    }
    return grouped
  }, [inlineComments])

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    let files = 0
    for (const line of diffLines) {
      if (line.type === 'add') additions += 1
      if (line.type === 'remove') deletions += 1
      if (line.content.startsWith('diff --git')) files += 1
    }
    return { additions, deletions, files: Math.max(files, diffLines.length > 0 ? 1 : 0) }
  }, [diffLines])

  const addCommentMutation = useMutation({
    mutationFn: (newComment: CreateCommentPayload) => insertComment({ data: newComment }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inlineComments', prId] })
      setActiveEditorLineId(null)
    },
  })

  const handleSaveInlineComment = (lineId: string, text: string) => {
    addCommentMutation.mutate({
      prId: numericPrId,
      lineId,
      content: text,
    })
  }

  if (!prId) return <CodeEmptyState />

  return (
    <motion.section
      key={prId}
      initial={{ opacity: 0, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="workspace-grid relative flex min-w-[520px] flex-1 flex-col overflow-hidden bg-night text-white"
      aria-label="Pull request code review"
    >
      <header className="relative z-10 flex h-[74px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-panel/95 px-6 shadow-[0_8px_28px_rgba(0,0,0,0.12)] backdrop-blur-md">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/36">
            <span>{pullRequest?.repo ?? 'Pull request'}</span>
            <span className="text-white/15">/</span>
            <span className="font-mono text-accent-bright">#{pullRequest?.prNumber ?? prId}</span>
          </div>
          <h1 className="mt-1.5 max-w-[620px] truncate text-[15px] font-semibold tracking-[-0.015em] text-white/95">
            {pullRequest?.title ?? 'Selected pull request'}
          </h1>
        </div>
        <div className="ml-5 flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-accent-bright">
            <GitPullRequest className="size-3" />
            {pullRequest?.status ?? 'Open'}
          </span>
          <span className="flex max-w-[190px] items-center gap-1.5 truncate rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 font-mono text-[10px] text-white/45">
            <GitBranch className="size-3 shrink-0" />
            {pullRequest?.branch ?? 'Review branch'}
          </span>
        </div>
      </header>

      <div className="relative z-[5] flex h-[46px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-night/90 px-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
          <Braces className="size-3.5 text-accent-bright" />
          Unified diff
          {isFetching && !isLoading ? <LoaderCircle className="size-3 animate-spin text-white/30" /> : null}
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span className="text-white/35">{stats.files} {stats.files === 1 ? 'file' : 'files'}</span>
          <span className="text-accent-bright">+{stats.additions}</span>
          <span className="text-[#ff887c]">−{stats.deletions}</span>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto pb-20 pt-3 font-mono text-[12px] leading-[1.75] text-white/72">
        {isLoading ? (
          <DiffSkeleton />
        ) : error ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-8 text-center">
            <div className="grid size-12 place-items-center rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] text-rose-300">
              <AlertCircle className="size-5" />
            </div>
            <h2 className="mt-4 font-sans text-sm font-bold text-white/85">The diff could not be loaded</h2>
            <p className="mt-1.5 max-w-sm font-sans text-xs leading-relaxed text-white/35">{(error as Error).message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 font-sans text-xs font-bold text-white/70 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RotateCcw className="size-3.5" /> Try again
            </button>
          </div>
        ) : diffLines.length === 0 ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-white/30">
            <FileCode2 className="size-7" />
            <span className="mt-3 font-sans text-sm">No changed lines in this pull request.</span>
          </div>
        ) : (
          diffLines.map((line) => (
            <DiffRow
              key={line.id}
              line={line}
              comments={commentsByLine.get(line.id) ?? []}
              user={user}
              isEditorOpen={activeEditorLineId === line.id}
              isSaving={addCommentMutation.isPending && activeEditorLineId === line.id}
              mutationError={addCommentMutation.error}
              onToggleEditor={() => {
                addCommentMutation.reset()
                setActiveEditorLineId((current) => current === line.id ? null : line.id)
              }}
              onCancelEditor={() => setActiveEditorLineId(null)}
              onSaveComment={(text) => handleSaveInlineComment(line.id, text)}
            />
          ))
        )}
      </div>
    </motion.section>
  )
}

interface DiffRowProps {
  line: DiffLine
  comments: InlineComment[]
  user: User | null
  isEditorOpen: boolean
  isSaving: boolean
  mutationError: Error | null
  onToggleEditor: () => void
  onCancelEditor: () => void
  onSaveComment: (text: string) => void
}

function DiffRow({
  line,
  comments,
  user,
  isEditorOpen,
  isSaving,
  mutationError,
  onToggleEditor,
  onCancelEditor,
  onSaveComment,
}: DiffRowProps) {
  if (line.type === 'header') {
    const isHunk = line.content.startsWith('@@')
    const isFile = line.content.startsWith('diff --git')
    return (
      <div className={`whitespace-pre px-5 ${isHunk ? 'my-2 border-y border-accent/10 bg-accent/[0.055] py-2 text-accent-bright/70' : isFile ? 'mt-5 border-y border-white/[0.07] bg-white/[0.025] py-2.5 font-semibold text-white/70' : 'py-0.5 text-white/30'}`}>
        {line.content || ' '}
      </div>
    )
  }

  const isAddition = line.type === 'add'
  const isRemoval = line.type === 'remove'
  const rowTone = isAddition
    ? 'bg-accent/[0.075] hover:bg-accent/[0.12]'
    : isRemoval
      ? 'bg-[#ff675f]/[0.07] hover:bg-[#ff675f]/[0.11]'
      : 'hover:bg-white/[0.025]'
  const codeTone = isAddition ? 'text-[#7ae5c3]' : isRemoval ? 'text-[#ff9a91]' : 'text-white/68'

  return (
    <div>
      <div className={`group relative flex min-w-max transition-colors ${rowTone}`}>
        <div className="sticky left-0 z-[2] flex w-[76px] shrink-0 border-r border-white/[0.06] bg-night/95 text-[10px] text-white/20 backdrop-blur-sm">
          <span className="w-1/2 py-0.5 pr-2 text-right tabular-nums">{line.oldL ?? ''}</span>
          <span className="w-1/2 py-0.5 pr-2 text-right tabular-nums">{line.newL ?? ''}</span>
          <button
            type="button"
            onClick={onToggleEditor}
            className="absolute left-1/2 top-1/2 z-10 grid size-5 -translate-x-1/2 -translate-y-1/2 scale-90 place-items-center rounded-md bg-accent text-white opacity-0 shadow-lg transition-all hover:scale-100 group-hover:scale-100 group-hover:opacity-100 focus:scale-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright"
            aria-label={`Add a comment to line ${line.newL ?? line.oldL}`}
          >
            <MessageSquarePlus className="size-3" />
          </button>
        </div>
        <code className={`min-w-max whitespace-pre py-0.5 pl-4 pr-8 ${codeTone}`}>{line.content || ' '}</code>
      </div>

      {comments.length > 0 ? (
        <div className="mx-5 my-3 ml-[92px] overflow-hidden rounded-xl border border-white/[0.08] bg-panel shadow-[0_12px_35px_rgba(0,0,0,0.2)]">
          {comments.map((comment, index) => {
            const isCurrentUser = comment.author === getUserDisplayName(user)
            return (
              <div key={comment.id} className={`flex gap-3 p-3.5 font-sans ${index > 0 ? 'border-t border-white/[0.07]' : ''}`}>
                <div className={`grid size-7 shrink-0 place-items-center rounded-lg text-[9px] font-bold ${isCurrentUser ? 'bg-accent/15 text-accent-bright' : 'bg-white/[0.06] text-white/55'}`}>
                  {comment.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-white/80">{comment.author}</span>
                    <span className="text-[10px] text-white/25">{comment.timestamp}</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-white/60">{comment.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {isEditorOpen ? (
          <InlineCommentEditor
            isSaving={isSaving}
            errorMessage={mutationError?.message}
            onCancel={onCancelEditor}
            onSave={onSaveComment}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function CodeEmptyState() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="workspace-grid relative flex min-w-[520px] flex-1 items-center justify-center overflow-hidden bg-night px-10 text-center"
    >
      <div className="absolute left-[14%] top-[18%] size-64 rounded-full bg-accent/[0.045] blur-3xl" />
      <div className="relative max-w-md">
        <div className="relative mx-auto grid size-20 place-items-center rounded-[26px] border border-white/[0.08] bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
          <GitMerge className="size-8 text-accent-bright/75" strokeWidth={1.5} />
          <span className="absolute -right-1 -top-1 flex h-5 items-center rounded-full border border-accent/20 bg-accent/10 px-1.5 font-mono text-[8px] font-bold text-accent-bright">READY</span>
        </div>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-bright/70">Review workspace</p>
        <h1 className="mt-3 font-serif text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-white/90 text-balance">
          Choose a pull request to begin.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/35">
          Inspect every changed line, leave precise notes, and make the merge decision together.
        </p>
      </div>
    </motion.section>
  )
}

function DiffSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading code diff">
      <div className="mx-5 mb-4 h-8 rounded-lg bg-white/[0.04]" />
      {[90, 72, 84, 62, 95, 78, 55, 88, 69, 92, 76, 58].map((width, index) => (
        <div key={`${width}-${index}`} className={`flex h-[22px] items-center ${index === 4 || index === 5 ? 'bg-accent/[0.05]' : ''}`}>
          <div className="h-full w-[76px] border-r border-white/[0.05]" />
          <div className="ml-4 h-1.5 rounded bg-white/[0.055]" style={{ width: `${width / 1.5}%` }} />
        </div>
      ))}
    </div>
  )
}
