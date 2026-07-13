import type { User } from '@supabase/supabase-js'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpRight,
  CircleDot,
  GitPullRequest,
  LogOut,
  PanelLeft,
} from 'lucide-react'
import { usePullRequestSubscription } from '#/hooks/pullRequestSubscriptions.ts'
import { usePullRequestQuery } from '#/queries/usePullRequest.ts'
import { createClient } from '#/supabase/client.ts'
import { getUserDisplayName, getUserInitials } from '#/lib/user.ts'

interface SidebarProps {
  activePullRequestId?: string
  user: User | null
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

export function Sidebar({ activePullRequestId, user }: SidebarProps) {
  const router = useRouter()
  const navigate = useNavigate({ from: '/' })
  const { data: pullRequests = [], isLoading, isError } = usePullRequestQuery()

  usePullRequestSubscription()

  const handleLogout = async () => {
    await createClient().auth.signOut()
    await router.invalidate()
    await router.navigate({ to: '/login' })
  }

  const displayName = getUserDisplayName(user)
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex h-full w-[292px] shrink-0 flex-col overflow-hidden border-r border-black/10 bg-canvas text-ink"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:radial-gradient(#73837e_0.65px,transparent_0.65px)] [background-size:13px_13px]" />

      <header className="relative flex h-[74px] shrink-0 items-center justify-between border-b border-black/10 px-5">
        <div className="flex items-center gap-3">
          <div className="relative grid size-9 place-items-center rounded-xl bg-ink text-canvas shadow-[0_8px_20px_rgba(21,32,31,0.18)]">
            <GitPullRequest className="size-[18px]" strokeWidth={2.2} />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-canvas bg-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-[-0.025em]">ReviewDeck</span>
              <span className="rounded-full border border-black/10 bg-white/55 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-black/45">
                beta
              </span>
            </div>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">
              Review workspace
            </p>
          </div>
        </div>
        <PanelLeft className="size-4 text-black/30" aria-hidden="true" />
      </header>

      <div className="relative flex items-end justify-between px-5 pb-3 pt-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/38">Queue</p>
          <h2 className="mt-1 font-serif text-[25px] font-semibold leading-none tracking-[-0.03em]">Active reviews</h2>
        </div>
        <div className="mb-0.5 flex items-center gap-1.5 rounded-full border border-black/10 bg-white/45 px-2.5 py-1 text-[10px] font-bold text-black/55">
          <CircleDot className="size-3 text-accent" />
          {pullRequests.length}
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 pb-4" aria-label="Pull request reviews">
        {isLoading ? (
          <ReviewListSkeleton />
        ) : isError ? (
          <div className="mx-2 mt-3 rounded-2xl border border-rose-900/10 bg-rose-50/70 p-4 text-sm text-rose-900">
            Reviews could not be loaded. Refresh to try again.
          </div>
        ) : pullRequests.length === 0 ? (
          <div className="mx-2 mt-3 rounded-2xl border border-dashed border-black/15 bg-white/30 p-5 text-center">
            <GitPullRequest className="mx-auto size-5 text-black/30" />
            <p className="mt-3 text-sm font-semibold">Your queue is clear</p>
            <p className="mt-1 text-xs leading-relaxed text-black/45">New GitHub pull requests will appear here.</p>
          </div>
        ) : (
          <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-1.5">
            <AnimatePresence initial={false}>
              {pullRequests.map((pullRequest) => {
                const isActive = String(pullRequest.id) === activePullRequestId

                return (
                  <motion.button
                    layout
                    variants={itemVariants}
                    exit={{ opacity: 0, height: 0 }}
                    key={pullRequest.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => navigate({ search: { prId: String(pullRequest.id) } })}
                    className={`group relative w-full overflow-hidden rounded-2xl border px-3.5 py-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                      isActive
                        ? 'border-ink/10 bg-ink text-white shadow-[0_12px_32px_rgba(21,32,31,0.16)]'
                        : 'border-transparent bg-transparent text-ink hover:border-black/8 hover:bg-white/55'
                    }`}
                  >
                    {isActive ? <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-accent-bright" /> : null}
                    <div className="flex items-center justify-between gap-3">
                      <span className={`truncate text-[10px] font-bold uppercase tracking-[0.13em] ${isActive ? 'text-white/48' : 'text-black/38'}`}>
                        {pullRequest.repo}
                      </span>
                      <span className={`font-mono text-[10px] ${isActive ? 'text-accent-bright' : 'text-black/35'}`}>
                        #{pullRequest.prNumber}
                      </span>
                    </div>
                    <p className={`mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.38] tracking-[-0.01em] ${isActive ? 'text-white' : 'text-ink/80'}`}>
                      {pullRequest.title}
                    </p>
                    <div className={`mt-3 flex items-center justify-between border-t pt-2.5 ${isActive ? 'border-white/10' : 'border-black/[0.06]'}`}>
                      <span className={`flex min-w-0 items-center gap-1.5 truncate font-mono text-[9px] ${isActive ? 'text-white/45' : 'text-black/38'}`}>
                        <span className={`size-1.5 shrink-0 rounded-full ${pullRequest.status === 'open' ? 'bg-accent' : 'bg-amber-500'}`} />
                        {pullRequest.branch}
                      </span>
                      <ArrowUpRight className={`size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${isActive ? 'text-white/40' : 'text-black/25'}`} />
                    </div>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </nav>

      <footer className="relative m-3 mt-0 flex items-center gap-3 rounded-2xl border border-black/10 bg-white/65 p-3 shadow-[0_8px_26px_rgba(30,40,36,0.06)] backdrop-blur-sm">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="size-9 rounded-xl bg-black/5 object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-[11px] font-bold text-white">
            {getUserInitials(user)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold">{displayName}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-black/42">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(25,167,137,0.1)]" />
            Available
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="grid size-8 place-items-center rounded-lg text-black/35 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </footer>
    </motion.aside>
  )
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-2 px-1 pt-1" aria-label="Loading reviews">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-[116px] animate-pulse rounded-2xl border border-black/[0.05] bg-white/40 p-4">
          <div className="h-2 w-20 rounded bg-black/10" />
          <div className="mt-4 h-3 w-full rounded bg-black/10" />
          <div className="mt-2 h-3 w-3/4 rounded bg-black/10" />
          <div className="mt-5 h-2 w-28 rounded bg-black/[0.07]" />
        </div>
      ))}
    </div>
  )
}
