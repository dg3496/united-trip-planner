// TODO (Frontend team): Scrollable list of message bubbles.
// - useEffect to auto-scroll to bottom on new messages
// - Shows ExamplePrompts when messages is empty (FR-005 welcome state)
// - Shows LoadingIndicator when isLoading is true

import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { MessageBubble } from './MessageBubble'
import { LoadingIndicator } from './LoadingIndicator'
import { ExamplePrompts } from './ExamplePrompts'

interface Props {
  messages: Message[]
  isLoading: boolean
  conversationId: string | null
  onExampleSelect: (prompt: string) => void
}

export function MessageList({ messages, isLoading, conversationId, onExampleSelect }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) {
      // User just sent — scroll to bottom to show the loading indicator
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'assistant') {
      // Response arrived — scroll so the user's question sits at the top of the viewport
      const container = containerRef.current
      if (!container) return
      const userBubbles = container.querySelectorAll('[data-role="user"]')
      const lastUser = userBubbles[userBubbles.length - 1] as HTMLElement | undefined
      lastUser?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto py-4 flex flex-col gap-1 bg-gradient-to-b from-slate-50 to-white">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col gap-4 px-4">
          {/* Welcome header */}
          <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm p-4 shadow-sm">
            <p className="text-base font-semibold text-slate-800">
              Where do you want to go?
            </p>
            <p className="text-sm text-slate-500">
              Tell me your travel style, budget, or dates and I'll find the best options for you.
            </p>
          </div>
          <ExamplePrompts onSelect={onExampleSelect} />
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} conversationId={conversationId} onSuggestionSelect={onExampleSelect} />
      ))}

      {isLoading && <LoadingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}
