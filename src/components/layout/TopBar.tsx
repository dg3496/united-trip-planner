import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title?: string
  showBack?: boolean
}

export function TopBar({ title, showBack = false }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="bg-gradient-to-r from-[#002B7F] to-[#003FA3] text-white flex items-center min-h-14 px-4 flex-shrink-0 border-b border-white/10 shadow-[0_6px_24px_rgba(0,48,135,0.22)]"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)' }}
    >

      {/* Left: optional back + United wordmark always visible */}
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Globe icon */}
        <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[13px] font-black leading-none">U</span>
        </div>

        {/* Wordmark */}
        <span className="text-[15px] font-black tracking-[0.1em] uppercase leading-none">
          United
        </span>
      </div>

      {/* Right: page-level context label */}
      {title && (
        <div className="ml-auto flex items-center">
          <div className="h-4 w-px bg-white/25 mr-3" />
          <span className="text-[13px] font-medium text-white/75 tracking-wide">{title}</span>
        </div>
      )}
    </div>
  )
}
