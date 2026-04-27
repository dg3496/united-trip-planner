// FR-019 — expanded flight detail inside the destination card

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Suggestion, DbFlight } from '../../lib/types'
import { getCheapestFlightForDestination } from '../../lib/api'

interface Props {
  suggestion: Suggestion
  conversationId: string | null
}

function formatDurationMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}h ${m}m`
}

/** Demo-friendly clock times (inventory rows are date-only). Stable per flight id. */
function demoLegTime(isoDate: string, leg: 'out' | 'in', flightKey: string): string {
  let sum = 0
  const salt = flightKey + leg
  for (let i = 0; i < salt.length; i++) sum += salt.charCodeAt(i) * (i + 3)
  const hourStart = leg === 'out' ? 6 : 15
  const hour = hourStart + (Math.abs(sum) % 7)
  const minute = [0, 5, 10, 20, 25, 35, 40, 50][Math.abs(sum) % 8]
  const d = new Date(`${isoDate}T12:00:00`)
  d.setHours(hour, minute, 0, 0)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function fareClassLabel(fc: DbFlight['fare_class']): string {
  if (fc === 'economy_plus') return 'Economy Plus'
  return fc.charAt(0).toUpperCase() + fc.slice(1)
}

export function ExpandedFlightDetail({ suggestion, conversationId }: Props) {
  const navigate = useNavigate()
  const [flight, setFlight] = useState<DbFlight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getCheapestFlightForDestination(suggestion.destinationId).then((f) => {
      if (!cancelled) {
        setFlight(f)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [suggestion.destinationId])

  function handleBook() {
    if (!flight) return
    const params = new URLSearchParams({ city: suggestion.city })
    if (conversationId) params.set('conversationId', conversationId)
    navigate(`/booking/${flight.id}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="border-t border-gray-100 pt-3 space-y-2 animate-pulse">
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-9 bg-gray-100 rounded-xl w-full" />
      </div>
    )
  }

  if (!flight) {
    return (
      <div className="border-t border-gray-100 pt-3 text-xs text-gray-500">
        Flight details are unavailable. Check your connection or try again later.
      </div>
    )
  }

  const flightKey = flight.id
  const outboundDepart = demoLegTime(flight.outbound_date, 'out', flightKey)
  const returnDepart = demoLegTime(flight.return_date, 'in', flightKey)

  return (
    <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Outbound</p>
          <p className="font-medium">
            {new Date(flight.outbound_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-[#003087] font-medium">{outboundDepart}</p>
          <p className="text-gray-500">
            {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`} ·{' '}
            {formatDurationMinutes(flight.outbound_duration_minutes)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Return</p>
          <p className="font-medium">
            {new Date(flight.return_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-[#003087] font-medium">{returnDepart}</p>
          <p className="text-gray-500">
            {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop`} ·{' '}
            {formatDurationMinutes(flight.return_duration_minutes)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Aircraft</p>
          <p className="font-medium">{flight.aircraft_type}</p>
        </div>
        <div>
          <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Fare class</p>
          <p className="font-medium">{fareClassLabel(flight.fare_class)}</p>
        </div>
      </div>

      <div className="text-xs">
        <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Total fare (from)</p>
        <p className="font-bold text-[#003087] text-sm">${flight.fare_usd} USD round trip</p>
      </div>

      <button
        type="button"
        onClick={handleBook}
        className="w-full bg-[#003087] text-white font-semibold text-sm py-3 rounded-xl active:bg-[#002070] transition-colors"
      >
        Book This Trip
      </button>
    </div>
  )
}
