import { useState } from 'react'
import { Clock, Plane, Star, ChevronDown, ChevronUp } from 'lucide-react'
import type { Suggestion } from '../../lib/types'
import { ExpandedFlightDetail } from './ExpandedFlightDetail'

// Stable Unsplash images keyed by IATA code
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
  FLL: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
  GRU: 'https://images.unsplash.com/photo-1587282045344-4f6e222ad81f?w=800',
  HNL: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  ICN: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  KEF: 'https://images.unsplash.com/photo-1490077476659-095159692ab5?w=800',
  LAX: 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800',
  LIM: 'https://images.unsplash.com/photo-1531968455001-5c04c3ef0b84?w=800',
  LIS: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  MBJ: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
  MEX: 'https://images.unsplash.com/photo-1585208798174-6cedd4ada00c?w=800',
  MIA: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800',
  NAS: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800',
  NRT: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  PHX: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
  PUJ: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800',
  SAN: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  SEA: 'https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800',
  SJU: 'https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800',
}

interface Props {
  suggestion: Suggestion
  conversationId: string | null
}

export function DestinationCard({ suggestion, conversationId }: Props) {
  const [expanded, setExpanded] = useState(false)

  const durationHours = Math.floor(suggestion.flightDurationMinutes / 60)
  const durationMins = suggestion.flightDurationMinutes % 60

  const outDate = new Date(suggestion.outboundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const retDate = new Date(suggestion.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className={`bg-white rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.10)] border ${suggestion.isAlternative ? 'border-slate-200' : 'border-slate-100'}`}>

      {/* Hero image */}
      <div className="relative h-44 bg-gradient-to-br from-[#003087] to-[#0056B8]">
        <img
          src={DESTINATION_IMAGES[suggestion.destinationId] ?? ''}
          alt={suggestion.city}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        {/* Rich gradient for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Best Value badge */}
        {suggestion.isBestValue && !suggestion.isAlternative && (
          <div className="absolute top-3 left-3 bg-[#C8960C] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Star size={9} fill="white" strokeWidth={0} /> Best Value
          </div>
        )}

        {/* Alternative badge */}
        {suggestion.isAlternative && (
          <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/40">
            Also consider
          </div>
        )}

        {/* City + price overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-2xl leading-tight drop-shadow-sm">{suggestion.city}</p>
            <p className="text-white/75 text-xs mt-0.5">{suggestion.country}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-extrabold text-2xl leading-tight drop-shadow-sm">${suggestion.lowestFareUsd}</p>
            <p className="text-white/70 text-[11px]">round trip</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">

        {/* Why this is the right choice */}
        <p className="text-[15px] text-slate-800 leading-snug">{suggestion.whyThisMatches}</p>

        {/* Flight meta row */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-medium">
          <Plane size={11} className="text-slate-400" />
          <span>{suggestion.stops === 0 ? 'Nonstop' : `${suggestion.stops} stop`}</span>
          <span className="mx-1 text-slate-300">·</span>
          <Clock size={11} className="text-slate-400" />
          <span>{durationHours}h {durationMins}m</span>
          <span className="ml-auto text-slate-400 font-normal">{outDate} – {retDate}</span>
        </div>

        {/* Trade-off */}
        {suggestion.tradeOff && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <span className="text-amber-500 text-xs mt-px">⚠</span>
            <p className="text-[12px] text-amber-700 leading-relaxed">{suggestion.tradeOff}</p>
          </div>
        )}

        {/* Expand toggle */}
        <div className="border-t border-slate-100 -mx-4 px-4 pt-2.5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 text-[13px] text-[#003087] font-semibold py-1 active:opacity-70 transition-opacity"
          >
            {expanded
              ? <><ChevronUp size={14} strokeWidth={2.5} /> Hide flight details</>
              : <><ChevronDown size={14} strokeWidth={2.5} /> Show flight details</>
            }
          </button>
        </div>

        {expanded && (
          <ExpandedFlightDetail suggestion={suggestion} conversationId={conversationId} />
        )}
      </div>
    </div>
  )
}
