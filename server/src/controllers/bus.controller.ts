import { Request, Response } from 'express'
import { createBusSchema, updateBusSchema } from '../validators/bus.validator.js'
import * as busService from '../services/bus.service.js'

export async function getBuses(_req: Request, res: Response) {
  const buses = await busService.listBuses()
  res.json({ data: buses })
}

export async function createBus(req: Request, res: Response) {
  const parsed = createBusSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const bus = await busService.createBus(parsed.data)
  res.status(201).json({ data: bus })
}

export async function updateBus(req: Request, res: Response) {
  const parsed = updateBusSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const bus = await busService.updateBus(req.params.id as string, parsed.data)
  res.json({ data: bus })
}

export async function deleteBus(req: Request, res: Response) {
  await busService.deactivateBus(req.params.id as string)
  res.json({ message: 'Bus deactivated' })
}
