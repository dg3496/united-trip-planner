// TODO (Frontend team): Pre-filled booking confirmation screen
// Requirements: FR-034, FR-035, FR-036, FR-037
//
// Reads URL search params set by ExpandedFlightDetail:
//   destinationId, city, fareUsd, outboundDate, returnDate, stops, conversationId
//
// Must show: origin (EWR), destination city, dates, fare class, total fare
// Must have: "Confirm Booking" button (fake success state — no real payment)
//            "Back to your trip planner" link returning to /chat

import { useSearchParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'

export default function Booking() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const city = params.get('city') ?? 'Unknown Destination'
  const fareUsd = params.get('fareUsd') ?? '—'
  const outboundDate = params.get('outboundDate') ?? '—'
  const returnDate = params.get('returnDate') ?? '—'
  // conversationId available via params.get('conversationId') — Track C wires this up

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Confirm Booking" showBack />
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* TODO: Build full booking UI here */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Trip</p>
          <p className="text-xl font-bold text-[#003087]">EWR to {city}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-4 shadow-sm">
          <Row label="Outbound" value={outboundDate} />
          <Row label="Return" value={returnDate} />
          <Row label="Fare class" value="Economy" />
          <Row label="Passengers" value="1 adult" />
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-[#003087] text-lg">${fareUsd}</span>
          </div>
        </div>

        <button className="w-full bg-[#003087] text-white font-semibold py-4 rounded-2xl active:bg-[#002070] transition-colors">
          Confirm Booking
        </button>

        <button
          onClick={() => navigate('/chat')}
          className="text-center text-sm text-[#003087] underline"
        >
          Back to your trip planner
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
