import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight, ArrowRight } from 'lucide-react'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { useChatStore } from '../store/chatStore'

const FEATURED = [
  {
    id: 'CUN',
    city: 'Cancun',
    country: 'Mexico',
    tag: 'Beach',
    tagColor: '#0ea5e9',
    from: 349,
    image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=800',
  },
  {
    id: 'LIS',
    city: 'Lisbon',
    country: 'Portugal',
    tag: 'Culture',
    tagColor: '#8b5cf6',
    from: 640,
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
  },
  {
    id: 'HNL',
    city: 'Honolulu',
    country: 'Hawaii',
    tag: 'Tropical',
    tagColor: '#10b981',
    from: 757,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    id: 'NRT',
    city: 'Tokyo',
    country: 'Japan',
    tag: 'Adventure',
    tagColor: '#f59e0b',
    from: 875,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
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

  function openDestination(id: string) {
    resetConversation()
    navigate(`/chat?dest=${id}`)
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F0F4FA]">
      <TopBar />

      <main className="flex-1 overflow-y-auto">

        {/* Hero */}
        <div className="bg-gradient-to-b from-[#001A5C] via-[#002880] to-[#003FAD] px-5 pt-4 pb-14">
          <p className="text-[#FFD700] text-[11px] font-bold uppercase tracking-[0.15em] mb-2">
            Premier Gold
          </p>
          <h1 className="text-white text-[32px] font-extrabold leading-[1.1] tracking-tight">
            Where to<br />next?
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium">
            Flights from New York (EWR)
          </p>
        </div>

        <div className="px-4 -mt-10 flex flex-col gap-4 pb-10">

          {/* Resume card */}
          {hasActiveChat && (
            <div className="bg-white rounded-2xl px-4 py-4 shadow-[0_4px_24px_rgba(0,48,135,0.12)] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">In progress</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">Continue your search</p>
              </div>
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center gap-1 text-[#003087] text-sm font-bold active:opacity-70 transition-opacity bg-[#003087]/8 px-3 py-1.5 rounded-full"
              >
                Resume <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* AI planner CTA */}
          <div
            className="rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,48,135,0.22)] relative"
            style={{ background: 'linear-gradient(135deg, #0038A8 0%, #0052CC 60%, #1A6FE0 100%)' }}
          >
            {/* Subtle decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

            <div className="relative p-5 flex flex-col gap-4">
              <div className="w-11 h-11 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white text-xl font-extrabold leading-snug">Not sure where<br />to go?</p>
                <p className="text-white/65 text-[13px] mt-1.5 leading-relaxed">
                  Tell us your travel style and budget. Our AI planner finds the perfect trip for you.
                </p>
              </div>
              <button
                onClick={startNewTrip}
                className="bg-white text-[#003087] font-bold text-sm px-5 py-3 rounded-xl w-fit flex items-center gap-2 active:scale-[0.97] transition-transform shadow-md"
              >
                Plan a Trip <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Popular destinations — full-width image cards */}
          <div className="flex flex-col gap-3">
            <p className="text-[17px] font-extrabold text-slate-900 px-0.5 tracking-tight">Popular from New York</p>

            {FEATURED.map((dest) => (
              <button
                key={dest.id}
                onClick={() => openDestination(dest.id)}
                className="relative h-40 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.10)] active:scale-[0.98] transition-transform text-left w-full"
              >
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

                {/* Tag pill */}
                <div
                  className="absolute top-3 right-3 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
                  style={{ backgroundColor: dest.tagColor + 'CC' }}
                >
                  {dest.tag}
                </div>

                {/* City info */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
                  <div>
                    <p className="text-white font-extrabold text-xl leading-tight drop-shadow">{dest.city}</p>
                    <p className="text-white/70 text-xs mt-0.5">{dest.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-[10px] font-medium">from</p>
                    <p className="text-white font-extrabold text-xl leading-tight drop-shadow">${dest.from}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
