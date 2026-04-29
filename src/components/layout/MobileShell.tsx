import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

// Full-viewport mobile shell. #root is locked to the viewport via
// position:fixed in index.css, so h-full here = the entire visible viewport.
// The TopBar and BottomNav stay pinned because only <main> scrolls.
export function MobileShell({ children }: Props) {
  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-200 to-slate-300 flex items-start justify-center overflow-hidden sm:items-center sm:py-8">
      <div className="w-full max-w-[430px] h-full sm:h-[844px] sm:max-h-full bg-gradient-to-b from-slate-50 to-white sm:rounded-[2.5rem] sm:shadow-[0_24px_60px_rgba(15,23,42,0.25)] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  )
}
