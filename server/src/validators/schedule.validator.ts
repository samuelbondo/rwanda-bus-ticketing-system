import { z } from 'zod'

export const createScheduleSchema = z.object({
  routeId: z.string().uuid(),
  busId: z.string().uuid(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime().optional(),
  price: z.number().min(0),
})

export const updateScheduleSchema = createScheduleSchema.partial()
