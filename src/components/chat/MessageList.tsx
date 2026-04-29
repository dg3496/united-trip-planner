import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { MessageBubble } from './MessageBubble'
import { LoadingIndicator } from './LoadingIndicator'
import { ExamplePrompts } from './ExamplePrompts'

// Curated suggestion chips per featured destination
const DEST_PROMPTS: Record<string, { heading: string; prompts: string[] }> = {
  CUN: {
    heading: 'Cancun trip ideas',
    prompts: [
      'Beach trip to Cancun in May',
      'Nonstop to Cancun under $500',
      'All-inclusive Cancun vacation in June',
    ],
  },
  LIS: {
    heading: 'Lisbon trip ideas',
    prompts: [
      'Cultural trip to Lisbon in June',
      'Nonstop to Lisbon under $900 in May',
      'History and food tour in Lisbon',
    ],
  },
  HNL: {
    heading: 'Honolulu trip ideas',
    prompts: [
      'Tropical beach vacation in Honolulu in May',
      'Nonstop to Hawaii in June',
      'Warm weather getaway in Hawaii under $1000',
    ],
  },
  NRT: {
    heading: 'Tokyo trip ideas',
    prompts: [
      'Adventure trip to Tokyo in June',
      'Tokyo in May under $1000',
      'Food and culture trip to Tokyo',
    ],
  },
}

interface Props {
  messages: Message[]
  isLoading: boolean
  conversationId: string | null
  onExampleSelect: (prompt: string) => void
  destCode?: string | null
}

export function MessageList({ messages, isLoading, conversationId, onExampleSelect, destCode }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'assistant') {
      const container = containerRef.current
      if (!container) return
      const userBubbles = container.querySelectorAll('[data-role="user"]')
      const lastUser = userBubbles[userBubbles.length - 1] as HTMLElement | undefined
      lastUser?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  const destMeta = destCode ? DEST_PROMPTS[destCode] : null

  return (
    <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto py-4 flex flex-col gap-1 bg-gradient-to-b from-slate-50 to-white">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm p-4 shadow-sm">
            <p className="text-base font-semibold text-slate-800">
              {destMeta ? `Planning a trip to ${Object.entries(DEST_PROMPTS).find(([k]) => k === destCode)?.[1].heading.split(' trip')[0]}?` : 'Where do you want to go?'}
            </p>
            <p className="text-sm text-slate-500">
              {destMeta ? 'Pick a search below or describe exactly what you\'re looking for.' : 'Tell me your travel style, budget, or dates and I\'ll find the best options for you.'}
            </p>
          </div>
          <ExamplePrompts
            onSelect={onExampleSelect}
            prompts={destMeta?.prompts}
            heading={destMeta?.heading}
          />
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
