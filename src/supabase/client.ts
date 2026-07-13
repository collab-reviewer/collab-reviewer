import {createBrowserClient} from '@supabase/ssr'

export function createClient() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_KEY;

    if (!url || !key) throw new Error('Supabase browser environment variables are not configured');

    return createBrowserClient(
        url,
        key,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
        }
    )
}
