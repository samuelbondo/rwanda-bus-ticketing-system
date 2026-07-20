import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { z } from 'zod'

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({ role: z.enum(['user', 'model']), text: z.string() })).optional(),
})

const SYSTEM_PROMPT = `You are a helpful assistant for Rwanda Bus Ticketing System.
You help passengers with:
- Routes: Nyanza → Ruhango → Muhanga → Kigali, and Kigali → Rulindo → Musanze
- Ticket prices: Nyanza–Kigali from RWF 2,000, Kigali–Musanze from RWF 2,500
- Schedules: Departures at 06:00, 10:30, and 15:00 daily
- Booking: Visit the website, search schedules, select a seat, pay online
- Cancellation: Allowed up to 3 hours before departure
- Payment: Must be completed at least 1 hour before departure
- Support: Phone +250794047261, Email rwandabus@gmail.com
Keep answers short, friendly, and helpful. If unsure, direct them to contact support.`

const FAQ_FALLBACK: Record<string, string> = {
  route: 'We operate Nyanza → Ruhango → Muhanga → Kigali and Kigali → Rulindo → Musanze.',
  price: 'Prices start from RWF 2,000 for Nyanza–Kigali and RWF 2,500 for Kigali–Musanze.',
  schedule: 'Buses depart daily at 06:00, 10:30, and 15:00.',
  book: 'Search schedules on our website, pick a seat, and pay online. No office visit needed.',
  cancel: 'You can cancel your booking up to 3 hours before departure from your dashboard.',
  ticket: 'Download your PDF ticket from your booking history after payment.',
  payment: 'We accept MoMo, card, and cash. Payment must be done at least 1 hour before departure.',
  contact: 'Call or WhatsApp +250794047261 or email rwandabus@gmail.com.',
  default: 'I\'m here to help! You can ask about routes, prices, schedules, booking, or cancellation. For urgent help, contact +250794047261.',
}

function staticFallback(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, answer] of Object.entries(FAQ_FALLBACK)) {
    if (key !== 'default' && lower.includes(key)) return answer
  }
  return FAQ_FALLBACK.default
}

export async function chat(req: Request, res: Response) {
  const parsed = chatSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })
    return
  }

  const { message, history = [] } = parsed.data

  const settings = await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  })

  if (!settings.aiEnabled) {
    res.status(503).json({ message: 'AI assistant is currently disabled.' })
    return
  }

  if (!settings.geminiApiKey) {
    res.json({ data: { reply: staticFallback(message) } })
    return
  }

  try {
    const contents = [
      ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ]

    // Try v1beta first (works with all AI Studio key formats)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${settings.aiModel}:generateContent?key=${settings.geminiApiKey}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    )

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error('[AI] Gemini error', response.status, JSON.stringify(errBody))
      res.json({ data: { reply: staticFallback(message) } })
      return
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? staticFallback(message)
    res.json({ data: { reply } })
  } catch (err) {
    console.error('[AI] fetch error', err)
    res.json({ data: { reply: staticFallback(message) } })
  }
}
