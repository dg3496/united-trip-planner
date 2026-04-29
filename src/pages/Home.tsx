import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { useChatStore } from '../store/chatStore'

const FEATURED = [
  {
    city: 'Cancun',
    country: 'Mexico',
    tag: 'Beach',
    tagColor: '#0ea5e9',
    image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=400',
  },
  {
    city: 'Lisbon',
    country: 'Portugal',
    tag: 'Culture',
    tagColor: '#8b5cf6',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400',
  },
  {
    city: 'Honolulu',
    country: 'Hawaii',
    tag: 'Tropical',
    tagColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  },
  {
    city: 'Tokyo',
    country: 'Japan',
    tag: 'Adventure',
    tagColor: '#f59e0b',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
  },
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
    <div className="flex flex-col h-full bg-slate-50">
      <TopBar />

      <main className="flex-1 overflow-y-auto">
        {/* Navy hero */}
        <div className="bg-gradient-to-b from-[#001F6B] to-[#003087] px-5 pt-3 pb-10">
          <p className="text-[#FFD700] text-xs font-semibold uppercase tracking-widest mb-1">
            Premier Gold
          </p>
          <p className="text-white text-3xl font-extrabold leading-tight">
            Where to next?
          </p>
          <p className="text-white/50 text-sm mt-1">
            Flights from New York (EWR)
          </p>
        </div>

        <div className="px-4 -mt-5 flex flex-col gap-4 pb-10">

          {/* Resume card */}
          {hasActiveChat && (
            <div className="bg-white rounded-2xl px-4 py-3.5 shadow-[0_8px_24px_rgba(0,48,135,0.10)] border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">In progress</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Continue your search</p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-0.5 text-[#003087] text-sm font-bold active:opacity-70 transition-opacity"
              >
                Resume <ChevronRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* AI planner CTA */}
          <div className="bg-gradient-to-br from-[#003087] to-[#0044B8] rounded-3xl p-5 flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,48,135,0.25)]">
            <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-white text-xl font-bold leading-snug">Not sure where to go?</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Tell us your travel style and budget. Our AI planner finds the perfect trip for you.
              </p>
            </div>
            <button
              onClick={startNewTrip}
              className="bg-white text-[#003087] font-bold text-sm px-5 py-3 rounded-xl w-fit active:opacity-80 transition-opacity shadow-sm"
            >
              Plan a Trip
            </button>
          </div>

          {/* Featured destinations */}
          <div className="flex flex-col gap-2.5">
            <p className="text-base font-bold text-slate-900 px-0.5">Popular from New York</p>
            {FEATURED.map((dest) => (
              <button
                key={dest.city}
                onClick={startNewTrip}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex items-center gap-0 text-left active:scale-[0.98] transition-transform w-full"
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 flex-shrink-0 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <div className="flex-1 min-w-0 px-3.5 py-2">
                  <p className="text-sm font-bold text-slate-900">{dest.city}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{dest.country}</p>
                </div>
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 mr-3"
                  style={{ backgroundColor: dest.tagColor + '18', color: dest.tagColor }}
                >
                  {dest.tag}
                </span>
              </button>
            ))}
          </div>

          {/* Explore CTA */}
          <button
            onClick={startNewTrip}
            className="w-full py-3.5 rounded-2xl border-2 border-[#003087]/20 text-[#003087] text-sm font-bold active:bg-[#003087]/5 transition-colors"
          >
            Explore all destinations with AI →
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
