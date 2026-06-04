import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/integrations/tanstack-query/supabase-client'

export function useMessages(prId: number) {
return useQuery({
    queryKey: ['messages', prId],
    queryFn: async () => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('pr_id', prId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
    },
})
}