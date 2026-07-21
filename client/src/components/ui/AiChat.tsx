import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot } from 'lucide-react'
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

  const greeting = welcomeMessage ?? aiWelcomeMessage ?? "Hi! I'm your Rwanda Bus assistant. How can I help you today?"

  // Show greeting as soon as chat opens, regardless of settings load timing
  useEffect(() => {
    if (open && messages.length === 0 && greeting) {
      setMessages([{ role: 'model', text: greeting }])
    }
  }, [open, greeting])

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
          <div className="flex items-center justify-between rounded-t-2xl bg-gray-900 px-4 py-3 dark:bg-gray-950">
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-semibold">Rwanda Bus Assistant</span>
                <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
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
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open AI chat"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 hover:scale-110"
        >
          {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          {!open && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-400 ring-2 ring-white">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          )}
        </button>
      </div>
    </>
  )
}
