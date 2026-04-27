import { useNavigate } from 'react-router-dom'
import { Sparkles, MapPin, ChevronRight } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { useChatStore } from '../store/chatStore'

const FEATURED: { city: string; country: string; tag: string; color: string }[] = [
  { city: 'Cancun',   country: 'Mexico',  tag: 'Beach',     color: '#0ea5e9' },
  { city: 'Paris',    country: 'France',  tag: 'Culture',   color: '#8b5cf6' },
  { city: 'Honolulu', country: 'Hawaii',  tag: 'Tropical',  color: '#10b981' },
  { city: 'Tokyo',    country: 'Japan',   tag: 'Adventure', color: '#f59e0b' },
]

export default function Home() {
  const navigate = useNavigate()
  const { messages, resetConversation } = useChatStore()
  const hasActiveChat = messages.length > 0

  function startNewTrip() {
    resetConversation()
    navigate('/chat')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TopBar />

      <main className="flex-1 overflow-y-auto">
        {/* Navy hero header */}
        <div className="bg-[#003087] px-5 pt-3 pb-8">
          <p className="text-[#FFD700] text-xs font-semibold uppercase tracking-widest mb-1">
            Premier Gold
          </p>
          <p className="text-white text-2xl font-bold leading-tight">
            Where to next?
          </p>
          <p className="text-white/60 text-sm mt-1">
            Flights from New York (EWR)
          </p>
        </div>

        {/* Cards float over the navy header */}
        <div className="px-4 -mt-4 flex flex-col gap-4 pb-8">

          {/* Resume card — only shown when a chat is in progress */}
          {hasActiveChat && (
            <div className="bg-white rounded-2xl px-4 py-3.5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">In progress</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">Continue your search</p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-1 text-[#003087] text-sm font-semibold active:opacity-70 transition-opacity"
              >
                Resume <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* AI planner CTA — FR-003 */}
          <div className="bg-[#003087] rounded-2xl p-5 flex flex-col gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-white text-lg font-bold">Not sure where to go?</p>
              <p className="text-white/75 text-sm leading-relaxed">
                Tell us your travel style and budget. Our AI planner finds the perfect trip for you.
              </p>
            </div>
            <button
              onClick={startNewTrip}
              className="bg-white text-[#003087] font-semibold text-sm px-5 py-3 rounded-xl w-fit active:opacity-80 transition-opacity"
            >
              Plan a Trip
            </button>
          </div>

          {/* Featured destinations */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-gray-800 px-0.5">Popular from New York</p>
            {FEATURED.map((dest) => (
              <button
                key={dest.city}
                onClick={startNewTrip}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 text-left active:bg-gray-50 transition-colors w-full"
              >
                {/* Color dot avatar */}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: dest.color + '20' }}
                >
                  <MapPin size={18} style={{ color: dest.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {dest.city}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{dest.country}</p>
                </div>
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dest.color + '15', color: dest.color }}
                >
                  {dest.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Explore with AI nudge */}
          <button
            onClick={startNewTrip}
            className="w-full py-3.5 rounded-2xl border border-[#003087] text-[#003087] text-sm font-semibold active:bg-[#003087]/5 transition-colors"
          >
            Explore all destinations with AI
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
