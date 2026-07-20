import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import api from '@/services/api'

interface Message {
  role: 'user' | 'model'
  text: string
}

interface AiChatProps {
  welcomeMessage?: string
}

export default function AiChat({ welcomeMessage }: AiChatProps) {
  const { aiEnabled, aiWelcomeMessage } = useSettings()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const greeting = welcomeMessage ?? aiWelcomeMessage

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'model', text: greeting }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!aiEnabled) return null

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', text }]
    setMessages(next)
    setLoading(true)
    try {
      const history = next.slice(0, -1).map((m) => ({ role: m.role, text: m.text }))
      const res = await api.post<{ data: { reply: string } }>('/ai/chat', { message: text, history })
      setMessages([...next, { role: 'model', text: res.data.data.reply }])
    } catch {
      setMessages([...next, { role: 'model', text: 'Sorry, I could not process that. Please try again or contact support.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-primary-600 px-4 py-3">
            <div className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" />
              <span className="text-sm font-semibold">Rwanda Bus Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 dark:bg-gray-800">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bubble toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI chat"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  )
}
