import {createServerClient, parseCookieHeader, serializeCookieHeader} from "@supabase/ssr";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_KEY;

export const createServerClientInstance = (requestHeaders: Headers) => {

    const responseHeaders = new Headers();

    const supabase = createServerClient(
        URL!,
        KEY!,
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