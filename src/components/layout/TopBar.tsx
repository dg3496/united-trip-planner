import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title?: string
  showBack?: boolean
}

export function TopBar({ title, showBack = false }: Props) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-r from-[#002B7F] to-[#003FA3] text-white flex items-center h-14 px-4 flex-shrink-0 pt-safe border-b border-white/10 shadow-[0_6px_24px_rgba(0,48,135,0.22)]">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="mr-3 p-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
      )}

      {/* United wordmark — inline SVG for no external dependency */}
      {!title && !showBack && (
        <span className="text-xl font-bold tracking-wide">United</span>
      )}

      {title && (
        <span className="text-base font-semibold">{title}</span>
      )}
    </div>
  )
}
