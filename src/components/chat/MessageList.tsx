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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col gap-4 px-4">
          {/* Welcome header */}
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-gray-800">
              Where do you want to go?
            </p>
            <p className="text-sm text-gray-500">
              Tell me your travel style, budget, or dates and I'll find the best options for you.
            </p>
          </div>
          <ExamplePrompts onSelect={onExampleSelect} />
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} conversationId={conversationId} />
      ))}

      {isLoading && <LoadingIndicator />}

      <div ref={bottomRef} />
    </div>
  )
}
