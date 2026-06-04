import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/integrations/tanstack-query/supabase-client'

export function useInlineComments(prId: number) {
return useQuery({
    queryKey: ['inline_comments', prId],
    queryFn: async () => {
    const { data, error } = await supabase
        .from('inline_comments')
        .select('*')
        .eq('pr_id', prId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
    },
})
}