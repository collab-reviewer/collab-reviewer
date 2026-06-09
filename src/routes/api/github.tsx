import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/api/github')({
    server: {
        handlers: {
            POST: async ({request}) => {
                try {
                    const payload = await request.json()
                    if (payload.action === 'opened' && payload.pull_request) {
                        console.log('¡Nuevo Pull Request creado!')
                        console.log('Título:', payload.pull_request.title)
                        console.log('Usuario:', payload.pull_request.user.login)

                        // Aquí puedes hacer lo que necesites:
                        // - Guardar un registro en Supabase
                        // - Enviar un mensaje a Discord/Slack
                        // - Mandar un correo
                    }

                    return new Response(JSON.stringify({message: 'Webhook recibido con éxito'}), {
                        status: 200,
                        headers: {'Content-Type': 'application/json'},
                    })
                } catch (error) {
                    console.error('Error procesando el webhook:', error)
                    return new Response('Error interno del servidor', {status: 500})
                }
            },
        }
    }
})
