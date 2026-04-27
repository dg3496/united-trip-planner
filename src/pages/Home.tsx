// TODO (Frontend team): United-branded home screen
// Requirements: FR-001, FR-002, FR-003
//
// Must include:
//   - TopBar with United logo/wordmark
//   - "Not sure where to go?" banner with a CTA button that navigates to /chat
//   - BottomNav
//   - Any promotional content / hero image
//
// Navigating to /chat should call useChatStore().resetConversation() first
// if the user wants to start fresh, or just navigate if resuming.

import { useNavigate } from 'react-router-dom'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      <TopBar />
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 gap-6">
        {/* TODO: Build the full home screen here */}
        <div className="w-full bg-[#003087] text-white rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-xl font-bold">Not sure where to go?</p>
          <p className="text-sm opacity-90">
            Tell us your travel style and budget. Our AI trip planner will find the perfect destination for you.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="mt-2 bg-white text-[#003087] font-semibold text-sm px-5 py-3 rounded-xl w-fit active:opacity-80 transition-opacity"
          >
            Plan a Trip
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
