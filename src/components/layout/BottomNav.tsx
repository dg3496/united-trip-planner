import { Home, MessageSquare, Bell } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: MessageSquare, label: 'Plan a Trip', path: '/chat' },
  { icon: Bell, label: 'Alerts', path: '/alerts' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="border-t border-gray-100 bg-white flex-shrink-0 pb-safe">
      <div className="flex">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = pathname === path || (path === '/chat' && pathname.startsWith('/chat'))
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-[#003087]' : 'text-gray-400'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
