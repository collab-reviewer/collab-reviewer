import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/api/test')({
    server: {
        handlers: {
            GET: async ({request}) => {
                console.log('Request received:', request)
                return new Response('Hello, world!')
            }
        }
    }
})
