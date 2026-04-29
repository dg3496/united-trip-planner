// TODO (Frontend team): Chat UI container
// Requirements: FR-005 through FR-021
//
// Wire together: TopBar + MessageList + ChatInput
// Pull state from useChatStore()
// Handle error toasts when store.error is set

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { MessageList } from '../components/chat/MessageList'
import { ChatInput } from '../components/chat/ChatInput'
import { useChatStore } from '../store/chatStore'

export default function Chat() {
  const { messages, isLoading, error, conversationId, sendMessage, clearError } = useChatStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const autoSentRef = useRef(false)

  // Auto-send a pre-written query passed via ?q= (e.g. from Home featured tiles)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      setSearchParams({}, { replace: true }) // clean the URL
      sendMessage(q)
    }
  }, [])

  useEffect(() => {
    if (error) {
      toast.error("I'm having trouble right now. Please try again.")
      clearError()
    }
  }, [error, clearError])

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-slate-50 to-white">
      <TopBar title="Trip Planner" showBack={false} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        conversationId={conversationId}
        onExampleSelect={sendMessage}
      />
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
      <BottomNav />
    </div>
  )
}
