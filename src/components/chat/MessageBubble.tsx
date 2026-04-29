import type { Message } from '../../lib/types'
import { DestinationCard } from './DestinationCard'

interface Props {
  message: Message
  conversationId: string | null
  onSuggestionSelect: (text: string) => void
}

const RANKING_LABELS: Record<string, string> = {
  best_match: 'Sorted by best match for your preferences',
  lowest_price: 'Sorted by lowest price',
  shortest_duration: 'Sorted by shortest flight time',
}

export function MessageBubble({ message, conversationId, onSuggestionSelect }: Props) {
  const isUser = message.role === 'user'
  const meta = message.metadata

  return (
    <div data-role={message.role} className={`flex flex-col gap-3 px-4 py-1 ${isUser ? 'items-end' : 'items-start'}`}>
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
              ? 'bg-gradient-to-b from-[#003087] to-[#00276E] text-white rounded-tr-sm shadow-[0_6px_20px_rgba(0,48,135,0.28)]'
              : 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-sm shadow-[0_2px_12px_rgba(15,23,42,0.06)]'
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

      {/* Filter suggestion chips — shown on no_results and conflict */}
      {(meta?.responseType === 'no_results' || meta?.responseType === 'conflict') &&
        meta.filterSuggestions && meta.filterSuggestions.length > 0 && (
          <div className="w-full flex flex-wrap gap-2 pt-1">
            {meta.filterSuggestions.map((chip) => (
              <button
                key={chip}
                onClick={() => onSuggestionSelect(chip)}
                className="text-xs font-medium px-3 py-2 rounded-full border border-[#003087]/30 text-[#003087] bg-white hover:bg-[#003087] hover:text-white active:bg-[#00276E] active:text-white transition-colors shadow-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
    </div>
  )
}
