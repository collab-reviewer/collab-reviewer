import { useQuery } from '@tanstack/react-query'
import { supabase } from '#/integrations/tanstack-query/supabase-client'

export function usePullRequests() {
return useQuery({
    queryKey: ['pull_requests'],
    queryFn: async () => {
    const { data, error } = await supabase
        .from('pull_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
    },
})
}