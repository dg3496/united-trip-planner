import { BellRing, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'

export default function Alerts() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white">
      <TopBar title="Price Alerts" />
      <main className="flex-1 overflow-y-auto p-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <div className="w-11 h-11 rounded-xl bg-[#003087]/10 text-[#003087] flex items-center justify-center mb-4">
            <BellRing size={20} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No active alerts yet</h2>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Price alerts appear here after you tap "Notify me if price drops" on a destination card.
          </p>

          <Link
            to="/chat"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#003087]"
          >
            Explore trips
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
