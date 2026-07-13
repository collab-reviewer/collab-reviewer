import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'
import { createAuthenticatedServerClient, createServerClientInstance } from '#/supabase/server.ts'
import type { GitHubWebhookPayload } from '#/lib/github-webhook.ts'
import { parsePullRequestDiff } from '#/lib/pull-request-diff.ts'
import type { DiffLine } from '#/lib/pull-request-diff.ts'
import type { PullRequest } from '#/types/pull_request.ts'

const pullRequestIdSchema = z.string().regex(/^\d+$/, 'Invalid pull request ID')

export async function savePullRequest(requestHeaders: Headers, data: GitHubWebhookPayload) {
  const { supabase } = createServerClientInstance(requestHeaders)

  const { error } = await supabase.from('pull_requests').insert({
    title: data.pull_request.title,
    pr_number: data.pull_request.number,
    branch: data.pull_request.head.ref,
    status: data.pull_request.state,
    author: data.pull_request.user.login,
    repo: data.repository.name,
    diff_url: data.pull_request.diff_url,
  })

  if (error) throw new Error(error.message)
}

export const getPullRequests = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest()
  const { supabase } = await createAuthenticatedServerClient(request.headers)
  const { data, error } = await supabase
    .from('pull_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((pullRequest): PullRequest => ({
    id: pullRequest.id,
    title: pullRequest.title,
    prNumber: pullRequest.pr_number,
    author: pullRequest.author,
    branch: pullRequest.branch,
    status: pullRequest.status,
    repo: pullRequest.repo,
    diffUrl: pullRequest.diff_url,
  }))
})

export const getPullRequestDiff = createServerFn({ method: 'GET' })
  .inputValidator(pullRequestIdSchema)
  .handler(async ({ data: prId }): Promise<DiffLine[]> => {
    const request = getRequest()
    const { supabase } = await createAuthenticatedServerClient(request.headers)
    const { data: pullRequest, error } = await supabase
      .from('pull_requests')
      .select('diff_url')
      .eq('id', Number(prId))
      .single()

    if (error || !pullRequest?.diff_url) throw new Error('Pull request diff could not be found')

    const diffUrl = new URL(pullRequest.diff_url)
    if (diffUrl.protocol !== 'https:' || diffUrl.hostname !== 'github.com') {
      throw new Error('Pull request diff URL is not trusted')
    }

    const response = await fetch(diffUrl, {
      headers: { Accept: 'application/vnd.github.v3.diff' },
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error('Failed to fetch diff from GitHub')

    return parsePullRequestDiff(await response.text())
  })
