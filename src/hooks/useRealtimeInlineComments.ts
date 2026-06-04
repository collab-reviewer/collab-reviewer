import { useEffect, useState } from 'react'
import { supabase } from '#/integrations/tanstack-query/supabase-client'

export interface InlineComment {
id: number
pr_id: number
line_id: string
author: string
avatar: string
content: string
timestamp: string
created_at: string
}

export function useRealtimeInlineComments(prId: number, initialComments: InlineComment[]) {
const [comments, setComments] = useState<InlineComment[]>(initialComments)

useEffect(() => {
    // Subscribe to new comments on this PR
    const channel = supabase
    .channel(`inline_comments:pr_${prId}`)
    .on(
        'postgres_changes',
        {
        event: 'INSERT',
        schema: 'public',
        table: 'inline_comments',
        filter: `pr_id=eq.${prId}`,
        },
        (payload) => {
        const newComment = payload.new as InlineComment
        setComments((prev) => [...prev, newComment])
        }
    )
    .subscribe()

    // Cleanup: unsubscribe when component unmounts
    return () => {
    channel.unsubscribe()
    }
}, [prId])

return { comments, setComments }
}