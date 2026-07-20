import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { createBusSchema, updateBusSchema } from '../validators/bus.validator.js'

export async function getBuses(_req: Request, res: Response) {
  const buses = await prisma.bus.findMany({ orderBy: { name: 'asc' } })
  res.json({ data: buses })
}

export async function createBus(req: Request, res: Response) {
  const parsed = createBusSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const bus = await prisma.bus.create({ data: parsed.data })
  res.status(201).json({ data: bus })
}

export async function updateBus(req: Request, res: Response) {
  const parsed = updateBusSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const bus = await prisma.bus.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json({ data: bus })
}

export async function deleteBus(req: Request, res: Response) {
  await prisma.bus.update({ where: { id: req.params.id as string }, data: { isActive: false } })
  res.json({ message: 'Bus deactivated' })
}
