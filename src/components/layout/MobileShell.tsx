import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

// Full-viewport mobile shell. The chat screen manages its own scroll;
// this just enforces the 390px max-width phone frame.
export function MobileShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-start justify-center sm:py-8">
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[844px] bg-gradient-to-b from-slate-50 to-white sm:rounded-[2.5rem] sm:shadow-[0_24px_60px_rgba(15,23,42,0.25)] overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
