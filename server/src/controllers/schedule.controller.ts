import { Request, Response } from 'express'
import { createScheduleSchema, updateScheduleSchema } from '../validators/schedule.validator.js'
import * as scheduleService from '../services/schedule.service.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

export async function getSchedules(req: Request, res: Response) {
  const { origin, date } = req.query
  const schedules = await scheduleService.listSchedules({
    origin: origin as string | undefined,
    date: date as string | undefined,
  })
  res.json({ data: schedules })
}

export async function getScheduleById(req: Request, res: Response) {
  const schedule = await scheduleService.findScheduleById(req.params.id as string)
  res.json({ data: schedule })
}

export async function createSchedule(req: Request, res: Response) {
  const parsed = createScheduleSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { departureTime, arrivalTime, ...rest } = parsed.data
  const schedule = await scheduleService.createSchedule({
    ...rest,
    departureTime: new Date(departureTime),
    ...(arrivalTime ? { arrivalTime: new Date(arrivalTime) } : {}),
  })
  res.status(201).json({ data: schedule })
}

export async function updateSchedule(req: Request, res: Response) {
  const parsed = updateScheduleSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { departureTime, arrivalTime, ...rest } = parsed.data
  const schedule = await scheduleService.updateSchedule(req.params.id as string, {
    ...rest,
    ...(departureTime ? { departureTime: new Date(departureTime) } : {}),
    ...(arrivalTime ? { arrivalTime: new Date(arrivalTime) } : {}),
  })
  res.json({ data: schedule })
}

export async function deleteSchedule(req: AuthRequest, res: Response) {
  await scheduleService.cancelSchedule(req.params.id as string, req.user!.id)
  res.json({ message: 'Schedule cancelled and passengers notified' })
}
