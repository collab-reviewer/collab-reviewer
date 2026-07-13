import {createFileRoute} from '@tanstack/react-router'
import {createServerClientInstance} from "#/supabase/server.ts";

export const Route = createFileRoute('/auth/callback')({
    server: {
        handlers: {
            GET: async ({request}) => {
                const {searchParams, origin} = new URL(request.url);
                const code = searchParams.get('code');
                const requestedNext = searchParams.get('next') || '/';
                const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//')
                    ? requestedNext
                    : '/';


                if (!code) {
                    return Response.redirect(`${origin}/login`);
                }

                const {supabase, responseHeaders} = createServerClientInstance(request.headers);


                const {error} = await supabase.auth.exchangeCodeForSession(code);

                if (error) {
                    responseHeaders.set('Location', `${origin}/login`);
                    return new Response(null, {status: 302, headers: responseHeaders});
                }

                responseHeaders.set('Location', `${origin}${next}`);

                return new Response(null, {
                    status: 302,
                    headers: responseHeaders
                });
            },
        },
    },
})
