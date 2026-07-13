import type { User } from '@supabase/supabase-js'

export function getUserDisplayName(user: User | null | undefined) {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined
  const candidates = [metadata?.full_name, metadata?.user_name, user?.email]
  return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? 'Reviewer'
}

export function getUserInitials(user: User | null | undefined) {
  return getUserDisplayName(user)
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
