import {createServerClient, parseCookieHeader, serializeCookieHeader} from "@supabase/ssr";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_KEY;

export const createServerClientInstance = (requestHeaders: Headers) => {

    if (!URL || !KEY) throw new Error('Supabase server environment variables are not configured');

    const responseHeaders = new Headers();

    const supabase = createServerClient(
        URL,
        KEY,
        {
            cookies: {
                getAll() {
                    const parsed = parseCookieHeader(requestHeaders.get('Cookie') ?? '');
                    return parsed.map(cookie => ({
                        name: cookie.name,
                        value: cookie.value ?? ''
                    }));
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value, options}) => {
                        responseHeaders.append(
                            'Set-Cookie',
                            serializeCookieHeader(name, value, options)
                        )
                    });
                },
            },
        }
    );


    return {supabase, responseHeaders};
}

export async function createAuthenticatedServerClient(requestHeaders: Headers) {
    const client = createServerClientInstance(requestHeaders);
    const {data: {user}, error} = await client.supabase.auth.getUser();

    if (error || !user) throw new Error('Authentication required');

    return {...client, user};
}
