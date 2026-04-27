// TODO (Frontend team): Render a single chat message bubble.
// - role === 'user': right-aligned navy bubble
// - role === 'assistant': left-aligned white bubble with United avatar
// - If message.metadata?.suggestions has items, render DestinationCard for each below the bubble
// - If message.metadata?.rankingCriteria is set, render a small subtitle above the cards (FR-018)
// - If message.metadata?.responseType === 'conflict', surface conflictHint text
// - If message.metadata?.responseType === 'no_results', surface alternativeHint text

import type { Message } from '../../lib/types'
import { DestinationCard } from './DestinationCard'

interface Props {
  message: Message
  conversationId: string | null
}

const RANKING_LABELS: Record<string, string> = {
  best_match: 'Sorted by best match for your preferences',
  lowest_price: 'Sorted by lowest price',
  shortest_duration: 'Sorted by shortest flight time',
}

export function MessageBubble({ message, conversationId }: Props) {
  const isUser = message.role === 'user'
  const meta = message.metadata

  return (
    <div className={`flex flex-col gap-3 px-4 py-1 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Message bubble */}
      <div className={`max-w-[85%] flex items-start gap-2.5 ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-[#003087] text-white text-xs font-bold flex items-center justify-center mt-1 shadow-sm">
            U
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-b from-[#003087] to-[#00276E] text-white rounded-tr-sm shadow-[0_8px_20px_rgba(0,48,135,0.3)]'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>
      </div>

      {/* Destination cards (assistant only) */}
      {meta?.suggestions && meta.suggestions.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {/* Ranking label — FR-018 */}
          {meta.rankingCriteria && RANKING_LABELS[meta.rankingCriteria] && (
            <p className="text-xs text-gray-400 px-1">{RANKING_LABELS[meta.rankingCriteria]}</p>
          )}
          {meta.suggestions.map((s) => (
            <DestinationCard key={s.destinationId} suggestion={s} conversationId={conversationId} />
          ))}
        </div>
      )}

      {/* Conflict hint — FR-013 */}
      {meta?.responseType === 'conflict' && meta.conflictHint && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 max-w-[90%]">
          {meta.conflictHint}
        </p>
      )}

      {/* No results hint — FR-014 */}
      {meta?.responseType === 'no_results' && meta.alternativeHint && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 max-w-[90%]">
          {meta.alternativeHint}
        </p>
      )}
    </div>
  )
}
