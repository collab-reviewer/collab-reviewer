import { useEffect, useState } from 'react'
import { supabase } from '#/integrations/tanstack-query/supabase-client'

export interface Message {
  id?: number
  pr_id?: number
  author: string
  avatar: string
  content: string
  type: string
  timestamp: string
  created_at?: string
  icon?: string
}

export function useRealtimeMessages(prId: number, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    // Subscribe to new messages on this PR
    const channel = supabase
      .channel(`messages:pr_${prId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `pr_id=eq.${prId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) =>
            prev.some((msg) => msg.id === newMessage.id)
              ? prev
              : [...prev, newMessage]
          )
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when component unmounts
    return () => {
      channel.unsubscribe()
    }
  }, [prId])

  return { messages, setMessages }
}
