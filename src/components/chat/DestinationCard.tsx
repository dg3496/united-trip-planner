import { useState } from 'react'
import { Clock, Plane, Star, ChevronDown, ChevronUp } from 'lucide-react'
import type { Suggestion } from '../../lib/types'
import { ExpandedFlightDetail } from './ExpandedFlightDetail'

// Static Unsplash photo map keyed by IATA destination id.
// Using images.unsplash.com (stable) instead of source.unsplash.com (deprecated).
const DESTINATION_IMAGES: Record<string, string> = {
  AMS: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
  ANC: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
  BCN: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
  BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?w=800',
  BOG: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
  CUN: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800',
  DEN: 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800',
  DUB: 'https://images.unsplash.com/photo-1564959130747-897fb406b9af?w=800',
  FCO: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  FLL: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?w=800',
  GRU: 'https://images.unsplash.com/photo-1587282045344-4f6e222ad81f?w=800',
  HNL: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  ICN: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  KEF: 'https://images.unsplash.com/photo-1490077476659-095159692ab5?w=800',
  LAX: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
  LIM: 'https://images.unsplash.com/photo-1531968455001-5c04c3ef0b84?w=800',
  LIS: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  MBJ: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  MEX: 'https://images.unsplash.com/photo-1585208798174-6cedd4ada00c?w=800',
  MIA: 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800',
  NAS: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800',
  NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  PHX: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  PUJ: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800',
  SAN: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  SEA: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800',
  SJU: 'https://images.unsplash.com/photo-1619546952812-520e98064a52?w=800',
}

interface Props {
  suggestion: Suggestion
  conversationId: string | null
}

export function DestinationCard({ suggestion, conversationId }: Props) {
  const [expanded, setExpanded] = useState(false)

  const durationHours = Math.floor(suggestion.flightDurationMinutes / 60)
  const durationMins = suggestion.flightDurationMinutes % 60

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden">
      {/* Header image area */}
      <div className="relative h-32 bg-gradient-to-br from-[#003087] to-[#0056B8]">
        <img
          src={DESTINATION_IMAGES[suggestion.destinationId] ?? ''}
          alt={suggestion.city}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        {suggestion.isBestValue && (
          <span className="absolute top-3 left-3 bg-[#C8960C] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={10} fill="white" /> Best Value
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
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
        {/* Why this is the right choice — lead with the most important info */}
        <p className="text-sm text-slate-800 leading-relaxed font-medium">{suggestion.whyThisMatches}</p>

        {/* Flight meta */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Plane size={12} />
            {suggestion.stops === 0 ? 'Nonstop' : `${suggestion.stops} stop`}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {durationHours}h {durationMins}m
          </span>
          <span className="ml-auto">
            {new Date(suggestion.outboundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(suggestion.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

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
            <><ChevronUp size={14} /> Hide flight details</>
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
      </div>
    </div>
  )
}
