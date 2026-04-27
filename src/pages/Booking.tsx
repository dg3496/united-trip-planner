// FR-034 through FR-037 — booking handoff (fake confirmation, no payment)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { TopBar } from '../components/layout/TopBar'
import { getDestinationById, getFlightById } from '../lib/api'
import type { DbFlight } from '../lib/types'

type FareChoice = DbFlight['fare_class']

const FARE_MULTIPLIER: Record<FareChoice, number> = {
  economy: 1,
  economy_plus: 1.28,
  business: 2.15,
}

export default function Booking() {
  const { flightId } = useParams<{ flightId: string }>()
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const cityParam = params.get('city') ?? 'Destination'

  const [flight, setFlight] = useState<DbFlight | null>(null)
  const [cityLabel, setCityLabel] = useState(cityParam)
  const [loading, setLoading] = useState(true)
  const [fareClass, setFareClass] = useState<FareChoice>('economy')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!flightId) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      const f = await getFlightById(flightId)
      if (cancelled) return
      setFlight(f)
      if (f) {
        setFareClass(f.fare_class)
        const dest = await getDestinationById(f.destination_id)
        if (!cancelled && dest) setCityLabel(dest.city)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [flightId])

  const baseFare = flight?.fare_usd ?? 0

  const totalUsd = useMemo(() => {
    const mult = FARE_MULTIPLIER[fareClass]
    return Math.round(baseFare * mult)
  }, [baseFare, fareClass])

  const handleConfirm = useCallback(() => {
    setConfirmed(true)
    toast.success('Your trip is confirmed.')
  }, [])

  if (!flightId) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Confirm Booking" showBack />
        <div className="p-6 text-sm text-gray-600">Missing flight. Return to the trip planner and pick a trip.</div>
      </div>
    )
  }

  if (!loading && !flight) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Confirm Booking" showBack />
        <div className="p-6 text-sm text-gray-600">
          We could not load this flight. Check your connection or try another option.
        </div>
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="mx-6 text-sm text-[#003087] underline text-left"
        >
          Back to your trip planner
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      <TopBar title="Confirm Booking" showBack />
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-gray-100 rounded w-3/4" />
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Trip</p>
              <p className="text-xl font-bold text-[#003087]">EWR to {cityLabel}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col gap-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
              <Row
                label="Outbound"
                value={new Date(flight!.outbound_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Row
                label="Return"
                value={new Date(flight!.return_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              />
              <Row label="Stops" value={flight!.stops === 0 ? 'Nonstop' : `${flight!.stops} stop`} />
              <Row label="Aircraft" value={flight!.aircraft_type} />

              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-gray-500">Fare class</span>
                <select
                  value={fareClass}
                  onChange={(e) => setFareClass(e.target.value as FareChoice)}
                  disabled={confirmed}
                  className="text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003087]/20"
                >
                  <option value="economy">Economy</option>
                  <option value="economy_plus">Economy Plus</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <Row label="Passengers" value="1 adult" />

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-[#003087] text-lg">${totalUsd}</span>
              </div>
            </div>

            {confirmed ? (
              <p className="text-sm text-gray-600 text-center">
                You are all set. This is a demo booking only (no payment processed).
              </p>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full bg-gradient-to-b from-[#003FA3] to-[#003087] text-white font-semibold py-4 rounded-2xl active:from-[#003087] active:to-[#00276E] transition-colors shadow-[0_10px_24px_rgba(0,48,135,0.28)]"
              >
                Confirm Booking
              </button>
            )}

            <Link to="/chat" className="text-center text-sm text-[#003087] underline py-2">
              Back to your trip planner
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
