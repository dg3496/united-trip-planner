import { useEffect, useState } from 'react'

// FR-021 - contextual loading text while Edge Function is in flight

const MESSAGES = [
  'Searching destinations for you...',
  'Checking what fits your budget...',
  'Finding the best options...',
  'Personalizing your results...',
]

export function LoadingIndicator() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-[#003087] flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-white text-xs font-bold">U</span>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
        <span className="text-sm text-gray-500">{MESSAGES[idx]}</span>
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
