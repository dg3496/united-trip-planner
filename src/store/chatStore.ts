import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import type { Message, TripPlannerResponse } from '../lib/types'
import { sendChatMessage, createConversation } from '../lib/api'

// nanoid is tiny; add it as a dep below if not already in package.json
// If missing, replace nanoid() calls with crypto.randomUUID()

interface ChatState {
  conversationId: string | null
  messages: Message[]
  isLoading: boolean
  error: string | null

  // Actions
  sendMessage: (text: string) => Promise<void>
  resetConversation: () => void
  clearError: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversationId: null,
      messages: [],
      isLoading: false,
      error: null,

      sendMessage: async (text: string) => {
        const trimmed = text.trim()
        if (!trimmed) return

        // Optimistic: append user bubble immediately (FR-005 optimistic render)
        const userMessage: Message = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : nanoid(),
          role: 'user',
          content: trimmed,
          createdAt: new Date().toISOString(),
        }

        set((s) => ({
          messages: [...s.messages, userMessage],
          isLoading: true,
          error: null,
        }))

        try {
          // Lazily create conversation on first message
          let conversationId = get().conversationId
          if (!conversationId) {
            conversationId = await createConversation()
            set({ conversationId })
          }

          const response: TripPlannerResponse = await sendChatMessage(conversationId, trimmed)

          const assistantMessage: Message = {
            id: typeof crypto !== 'undefined' ? crypto.randomUUID() : nanoid(),
            role: 'assistant',
            content: response.assistantMessage,
            metadata: response,
            createdAt: new Date().toISOString(),
          }

          set((s) => ({
            messages: [...s.messages, assistantMessage],
            isLoading: false,
          }))
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Something went wrong'
          set((s) => ({
            // Remove optimistic user message on failure so user can retry
            messages: s.messages.filter((m) => m.id !== userMessage.id),
            isLoading: false,
            error: msg,
          }))
        }
      },

      resetConversation: () => {
        set({ conversationId: null, messages: [], isLoading: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'united-chat-store',
      // Only persist conversation state, not loading/error
      partialize: (s) => ({
        conversationId: s.conversationId,
        messages: s.messages,
      }),
    }
  )
)
