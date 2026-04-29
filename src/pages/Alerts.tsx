import { Bell, BellOff, Plane, ArrowRight, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { useAlertsStore } from '../store/alertsStore'

// Mirrors the map in DestinationCard
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

export default function Alerts() {
  const { alerts, removeAlert } = useAlertsStore()

  function handleRemove(id: string, city: string) {
    removeAlert(id)
    toast(`Alert removed for ${city}`)
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#F0F4FA]">
      <TopBar title="Price Alerts" />

      <main className="flex-1 overflow-y-auto">

        {/* Header strip */}
        <div className="bg-gradient-to-b from-[#001A5C] to-[#002880] px-5 pt-4 pb-10">
          <div className="flex items-center gap-2 mb-1">
            <Bell size={16} className="text-[#FFD700]" />
            <p className="text-[#FFD700] text-[11px] font-bold uppercase tracking-[0.15em]">
              Price Alerts
            </p>
          </div>
          <h1 className="text-white text-2xl font-extrabold leading-tight">
            {alerts.length > 0
              ? `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}`
              : 'No active alerts'}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {alerts.length > 0
              ? "We'll notify you when fares drop"
              : 'Tap "Alert me" on any destination card'}
          </p>
        </div>

        <div className="px-4 -mt-6 flex flex-col gap-3 pb-8">

          {alerts.length === 0 ? (
            /* Empty state */
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,48,135,0.08)] flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#003087]/10 text-[#003087] flex items-center justify-center">
                <BellOff size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">No active alerts yet</h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Find a trip you like and tap "Alert me" on the destination card. We'll watch the fare for you.
                </p>
              </div>
              <Link
                to="/chat"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003087]"
              >
                Explore trips <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            alerts.map((alert) => {
              const outDate = new Date(alert.outboundDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })
              const retDate = new Date(alert.returnDate).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })
              const addedDate = new Date(alert.addedAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })

              return (
                <div
                  key={alert.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,48,135,0.08)]"
                >
                  {/* Destination image strip */}
                  <div className="relative h-24 bg-gradient-to-br from-[#003087] to-[#0056B8]">
                    <img
                      src={DESTINATION_IMAGES[alert.destinationId] ?? ''}
                      alt={alert.city}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                      <div>
                        <p className="text-white font-extrabold text-lg leading-tight">{alert.city}</p>
                        <p className="text-white/70 text-xs">{alert.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-extrabold text-lg">${alert.fareUsd}</p>
                        <p className="text-white/60 text-[10px]">alert price</p>
                      </div>
                    </div>
                  </div>

                  {/* Alert details */}
                  <div className="px-4 py-3 flex flex-col gap-2.5">
                    {/* Flight meta */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Plane size={10} className="text-slate-400" />
                      <span>{alert.stops === 0 ? 'Nonstop' : `${alert.stops} stop`}</span>
                      <span className="text-slate-300">·</span>
                      <span>{outDate} – {retDate}</span>
                    </div>

                    {/* Watching badge */}
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                      <TrendingDown size={13} className="text-emerald-600 flex-shrink-0" />
                      <p className="text-xs text-emerald-700 font-medium">
                        Watching for drops below <span className="font-bold">${alert.fareUsd}</span>
                      </p>
                    </div>

                    {/* Footer: added date + remove */}
                    <div className="flex items-center justify-between pt-0.5">
                      <p className="text-[11px] text-slate-400">Alert set {addedDate}</p>
                      <button
                        onClick={() => handleRemove(alert.id, alert.city)}
                        className="text-[11px] font-semibold text-red-500 active:opacity-60 transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {/* Explore more CTA when alerts exist */}
          {alerts.length > 0 && (
            <Link
              to="/chat"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#003087] py-3"
            >
              Add more alerts <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
