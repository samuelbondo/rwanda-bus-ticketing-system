import { z } from 'zod'

export const createBusSchema = z.object({
  name: z.string().min(2).max(100),
  plateNumber: z.string().min(3).max(20),
  capacity: z.number().int().min(1).max(100),
})

export const updateBusSchema = createBusSchema.partial()
