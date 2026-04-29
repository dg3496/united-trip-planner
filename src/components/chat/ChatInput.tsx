// Fixed-bottom text input for the chat.
// - Send button disabled when input is empty or whitespace (prevent empty sends)
// - Send button disabled while isLoading
// - Enter key sends (Shift+Enter for newline)
// - NO auto-focus on mount: triggering focus programmatically on mobile pops the
//   keyboard immediately, which causes the entire viewport to scroll up before the
//   user has a chance to read the conversation. Users tap the input when ready.
// - font-size MUST stay at 16px (text-base) or larger. iOS Safari auto-zooms the
//   entire viewport when a focused input has font-size < 16px. Using text-sm (14px)
//   here will cause the keyboard-open zoom bug on every iPhone.
// Keyboard/mobile note: on iOS, a fixed bottom bar shifts up with the software keyboard.
// Handled via visualViewport resize listener below.

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: Props) {
  const [value, setValue] = useState('')
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setKeyboardOffset(offset)
    }

    updateOffset()
    viewport.addEventListener('resize', updateOffset)
    viewport.addEventListener('scroll', updateOffset)

    return () => {
      viewport.removeEventListener('resize', updateOffset)
      viewport.removeEventListener('scroll', updateOffset)
    }
  }, [])

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setValue('')
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const canSend = value.trim().length > 0 && !isLoading

  return (
    <div
      className="border-t border-gray-100 bg-white px-4 py-3 flex items-end gap-3 flex-shrink-0 pb-safe"
      style={{ marginBottom: keyboardOffset }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Where do you want to go?"
        rows={1}
        className="flex-1 resize-none bg-gray-100 rounded-2xl px-4 py-2.5 text-base leading-snug text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003087]/30 max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          canSend
            ? 'bg-[#003087] text-white active:bg-[#002070]'
            : 'bg-gray-200 text-gray-400'
        }`}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  )
}
