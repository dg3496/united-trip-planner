import { Home, MessageSquare, Bell } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAlertsStore } from '../../store/alertsStore'

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const alertCount = useAlertsStore((s) => s.alerts.length)

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageSquare, label: 'Plan a Trip', path: '/chat' },
    { icon: Bell, label: 'Alerts', path: '/alerts', badge: alertCount },
  ]

  return (
    <div
      className="border-t border-slate-200/80 bg-white/95 backdrop-blur-sm flex-shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {tabs.map(({ icon: Icon, label, path, badge }) => {
          const active = pathname === path || (path === '/chat' && pathname.startsWith('/chat'))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-[#003087]' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {/* Alert badge dot */}
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
