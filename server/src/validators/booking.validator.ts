import { z } from 'zod'

export const createBookingSchema = z.object({
  scheduleId: z.string().uuid(),
  seatId: z.string().uuid(),
  source: z.string().min(1),
  destination: z.string().min(1),
})
