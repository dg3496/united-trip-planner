import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

// Full-viewport mobile shell. The chat screen manages its own scroll;
// this just enforces the 390px max-width phone frame.
export function MobileShell({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-200 flex items-start justify-center sm:py-8">
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-0 sm:h-[844px] bg-white sm:rounded-[2.5rem] sm:shadow-2xl overflow-hidden flex flex-col relative">
        {children}
      </div>
    </div>
  )
}
