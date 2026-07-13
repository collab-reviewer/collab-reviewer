import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  GitPullRequest,
  LoaderCircle,
  MessagesSquare,
  ShieldCheck,
} from 'lucide-react'
import { checkAuth } from '#/actions/session.ts'
import { createClient } from '#/supabase/client.ts'

export const Route = createFileRoute('/login/')({
  beforeLoad: async () => {
    const { isAuthenticated } = await checkAuth()
    if (isAuthenticated) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    setIsSubmitting(true)
    setErrorMessage('')

    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative grid min-h-dvh min-w-[1200px] grid-cols-[minmax(0,1.25fr)_minmax(460px,0.75fr)] overflow-hidden bg-night font-sans text-white">
      <section className="workspace-grid relative flex min-h-[720px] flex-col overflow-hidden border-r border-white/[0.08] px-12 py-10 xl:px-16 xl:py-12">
        <div className="absolute -left-24 top-1/3 size-[420px] rounded-full bg-accent/[0.07] blur-[100px]" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative flex items-center gap-3"
        >
          <div className="relative grid size-10 place-items-center rounded-xl bg-canvas text-ink shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <GitPullRequest className="size-5" />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-night bg-accent" />
          </div>
          <div>
            <p className="text-base font-bold tracking-[-0.025em]">ReviewDeck</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/35">Collaborative review</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-[9vh] max-w-[680px]"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent-bright">
            <span className="size-1.5 rounded-full bg-accent-bright shadow-[0_0_12px_rgba(88,223,187,0.8)]" />
            A calmer way to ship
          </div>
          <h1 className="mt-6 max-w-[650px] font-serif text-[clamp(48px,5.2vw,78px)] font-semibold leading-[0.94] tracking-[-0.055em] text-white/95 text-balance">
            Make the code review count.
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-[1.75] text-white/42">
            One focused workspace for diffs, precise inline feedback, and the conversation that gets great work across the line.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-auto grid max-w-[720px] grid-cols-3 gap-3 pt-12"
        >
          <FeatureCard icon={<Code2 className="size-4" />} label="Read clearly" detail="A focused, line-level diff canvas" />
          <FeatureCard icon={<MessagesSquare className="size-4" />} label="Align quickly" detail="Context stays beside the code" />
          <FeatureCard icon={<CheckCircle2 className="size-4" />} label="Ship together" detail="Decisions are visible to everyone" />
        </motion.div>
      </section>

      <section className="relative flex min-h-[720px] items-center justify-center overflow-hidden bg-canvas px-12 text-ink">
        <div className="pointer-events-none absolute inset-0 opacity-[0.36] [background-image:radial-gradient(#73837e_0.7px,transparent_0.7px)] [background-size:15px_15px]" />
        <motion.div
          initial={{ opacity: 0, x: 22, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[420px]"
        >
          <div className="rounded-[28px] border border-black/10 bg-white/72 p-8 shadow-[0_28px_80px_rgba(20,36,32,0.13)] backdrop-blur-xl xl:p-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">Secure access</span>
              <ShieldCheck className="size-4 text-accent" />
            </div>
            <h2 className="mt-8 font-serif text-[38px] font-semibold leading-none tracking-[-0.04em]">Welcome back.</h2>
            <p className="mt-3 text-sm leading-relaxed text-black/45">Connect your GitHub account to open the review workspace.</p>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isSubmitting}
              className="group mt-8 flex h-12 w-full items-center justify-between rounded-xl bg-ink px-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(21,32,31,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#223532] hover:shadow-[0_18px_36px_rgba(21,32,31,0.24)] disabled:translate-y-0 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-3"
            >
              <span className="flex items-center gap-3">
                {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <GitHubMark />}
                {isSubmitting ? 'Connecting…' : 'Continue with GitHub'}
              </span>
              <ArrowRight className="size-4 text-white/45 transition-transform group-hover:translate-x-0.5" />
            </button>

            {errorMessage ? (
              <p role="alert" className="mt-3 rounded-xl border border-rose-900/10 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-8 border-t border-black/[0.07] pt-5">
              <div className="flex items-start gap-2.5 text-[11px] leading-relaxed text-black/38">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-accent" />
                <p>Authentication is handled by GitHub and Supabase. ReviewDeck never sees your GitHub password.</p>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-black/30">Built for thoughtful engineering teams</p>
        </motion.div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 backdrop-blur-sm">
      <div className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent-bright">{icon}</div>
      <p className="mt-4 text-xs font-bold text-white/80">{label}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-white/30">{detail}</p>
    </div>
  )
}

function GitHubMark() {
  return (
    <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.61-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.84a9.5 9.5 0 0 1 2.5.34c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  )
}
