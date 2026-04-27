// FR-019 — expanded flight detail shown inside the destination card

import { useNavigate } from 'react-router-dom'
import type { Suggestion } from '../../lib/types'

interface Props {
  suggestion: Suggestion
  conversationId: string | null
}

export function ExpandedFlightDetail({ suggestion, conversationId }: Props) {
  const navigate = useNavigate()

  function handleBook() {
    // Deep-link to booking screen with context — FR-034, FR-035
    const params = new URLSearchParams({
      destinationId: suggestion.destinationId,
      city: suggestion.city,
      fareUsd: String(suggestion.lowestFareUsd),
      outboundDate: suggestion.outboundDate,
      returnDate: suggestion.returnDate,
      stops: String(suggestion.stops),
      ...(conversationId ? { conversationId } : {}),
    })
    navigate(`/booking/select?${params.toString()}`)
  }

  return (
    <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Outbound</p>
          <p className="font-medium">{suggestion.outboundDate}</p>
          <p className="text-gray-500">{suggestion.stops === 0 ? 'Nonstop' : `${suggestion.stops} stop`}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Return</p>
          <p className="font-medium">{suggestion.returnDate}</p>
          <p className="text-gray-500">{suggestion.stops === 0 ? 'Nonstop' : `${suggestion.stops} stop`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Fare class</p>
          <p className="font-medium capitalize">Economy</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Total fare</p>
          <p className="font-bold text-[#003087] text-sm">${suggestion.lowestFareUsd}</p>
        </div>
      </div>

      <button
        onClick={handleBook}
        className="w-full bg-[#003087] text-white font-semibold text-sm py-3 rounded-xl active:bg-[#002070] transition-colors"
      >
        Book This Trip
      </button>
    </div>
  )
}
