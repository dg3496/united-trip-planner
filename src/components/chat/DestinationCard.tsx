import { useState } from 'react'
import { Clock, Plane, Star, Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { Suggestion } from '../../lib/types'
import { setPriceAlert } from '../../lib/api'
import { ExpandedFlightDetail } from './ExpandedFlightDetail'

interface Props {
  suggestion: Suggestion
  conversationId: string | null
}

export function DestinationCard({ suggestion, conversationId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [alertSet, setAlertSet] = useState(false)
  const navigate = useNavigate()

  const durationHours = Math.floor(suggestion.flightDurationMinutes / 60)
  const durationMins = suggestion.flightDurationMinutes % 60

  async function handlePriceAlert() {
    try {
      // flight_id not in the suggestion — we pass destination_id for the alert.
      // The Edge Function stores the cheapest flight id; here we persist the alert
      // against the destination for the demo. In production this would resolve
      // to a specific flight_id.
      await setPriceAlert(suggestion.destinationId, '', suggestion.lowestFareUsd)
      setAlertSet(true)
      toast.success("We'll let you know if the price drops")
    } catch {
      toast.error('Could not set alert. Try again.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header image area */}
      <div className="relative h-32 bg-gradient-to-br from-[#003087] to-[#0056B8]">
        <img
          src={`https://source.unsplash.com/800x300/?${suggestion.city.toLowerCase()},travel`}
          alt={suggestion.city}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        {suggestion.isBestValue && (
          <span className="absolute top-3 left-3 bg-[#C8960C] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="white" /> Best Value
          </span>
        )}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="font-bold text-lg leading-tight drop-shadow">{suggestion.city}</p>
          <p className="text-xs opacity-90 drop-shadow">{suggestion.country}</p>
        </div>
        <div className="absolute bottom-3 right-3 text-white text-right">
          <p className="font-bold text-xl drop-shadow">${suggestion.lowestFareUsd}</p>
          <p className="text-xs opacity-90 drop-shadow">round trip</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Flight summary */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Plane size={12} />
            {suggestion.stops === 0 ? 'Nonstop' : `${suggestion.stops} stop`}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {durationHours}h {durationMins}m
          </span>
          <span>
            {new Date(suggestion.outboundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' - '}
            {new Date(suggestion.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Why this matches — FR-023 */}
        <p className="text-sm text-gray-700 leading-relaxed">{suggestion.whyThisMatches}</p>

        {/* Trade-off — FR-024 */}
        {suggestion.tradeOff && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            {suggestion.tradeOff}
          </p>
        )}

        {/* Expand toggle — FR-019 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center gap-1 text-xs text-[#003087] font-medium py-1"
        >
          {expanded ? (
            <><ChevronUp size={14} /> Hide details</>
          ) : (
            <><ChevronDown size={14} /> Show flight details</>
          )}
        </button>

        {expanded && (
          <ExpandedFlightDetail
            suggestion={suggestion}
            conversationId={conversationId}
          />
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handlePriceAlert}
            disabled={alertSet}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 rounded-xl border transition-colors ${
              alertSet
                ? 'border-green-200 text-green-700 bg-green-50'
                : 'border-gray-200 text-gray-600 hover:border-[#003087]/30 hover:text-[#003087] active:bg-gray-50'
            }`}
          >
            <Bell size={13} />
            {alertSet ? 'Alert set' : 'Notify me if price drops'}
          </button>
        </div>
      </div>
    </div>
  )
}
