import { z } from 'zod'

const stopSchema = z.object({
  name: z.string().min(1),
  stopOrder: z.number().int().min(1),
  priceFromOrigin: z.number().min(0),
})

export const createRouteSchema = z.object({
  name: z.string().min(2).max(100),
  origin: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
  distanceKm: z.number().positive().optional(),
  basePrice: z.number().min(0),
  stops: z.array(stopSchema).min(2).optional(),
})

export const updateRouteSchema = createRouteSchema.partial()
