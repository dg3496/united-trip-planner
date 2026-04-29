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

  // Read ?dest= to show destination-specific suggestion chips (no auto-send)
  const destCode = searchParams.get('dest')

  // Clean up the ?dest= param once we have it stored, but keep it while no messages
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !autoSentRef.current && messages.length === 0) {
      autoSentRef.current = true
      setSearchParams({}, { replace: true })
      sendMessage(q)
    }
  }, [])

  useEffect(() => {
    if (error) {
      toast.error("I'm having trouble right now. Please try again.")
      clearError()
    }
  }, [error, clearError])

  // Once user sends a message, clean the dest param from URL
  useEffect(() => {
    if (messages.length > 0 && destCode) {
      setSearchParams({}, { replace: true })
    }
  }, [messages.length])

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-slate-50 to-white">
      <TopBar title="Trip Planner" showBack={false} />
      <MessageList
        messages={messages}
        isLoading={isLoading}
        conversationId={conversationId}
        onExampleSelect={sendMessage}
        destCode={destCode}
      />
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
      <BottomNav />
    </div>
  )
}
