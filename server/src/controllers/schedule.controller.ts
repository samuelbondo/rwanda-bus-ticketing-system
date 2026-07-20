import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { createScheduleSchema, updateScheduleSchema } from '../validators/schedule.validator.js'

export async function getSchedules(req: Request, res: Response) {
  const { origin, date } = req.query

  const where: Record<string, unknown> = { status: 'SCHEDULED' }

  if (origin) where.route = { origin: { contains: origin as string, mode: 'insensitive' } }
  if (date) {
    const day = new Date(date as string)
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    where.departureTime = { gte: day, lt: next }
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      route: { include: { stops: { orderBy: { stopOrder: 'asc' } } } },
      bus: true,
    },
    orderBy: { departureTime: 'asc' },
  })
  res.json({ data: schedules })
}

export async function getScheduleById(req: Request, res: Response) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: req.params.id },
    include: { route: { include: { stops: true } }, bus: true },
  })
  if (!schedule) { res.status(404).json({ message: 'Schedule not found' }); return }
  res.json({ data: schedule })
}

export async function createSchedule(req: Request, res: Response) {
  const parsed = createScheduleSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const bus = await prisma.bus.findUnique({ where: { id: parsed.data.busId } })
  if (!bus) { res.status(404).json({ message: 'Bus not found' }); return }
  const schedule = await prisma.schedule.create({
    data: { ...parsed.data, availableSeats: bus.capacity },
  })
  res.status(201).json({ data: schedule })
}

export async function updateSchedule(req: Request, res: Response) {
  const parsed = updateScheduleSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const schedule = await prisma.schedule.update({
    where: { id: req.params.id },
    data: parsed.data,
  })
  res.json({ data: schedule })
}

export async function deleteSchedule(req: Request, res: Response) {
  await prisma.schedule.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  })
  res.json({ message: 'Schedule cancelled' })
}
