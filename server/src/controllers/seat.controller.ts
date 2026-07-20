import { Request, Response } from 'express'
import * as seatService from '../services/seat.service.js'

export async function getSeatsBySchedule(req: Request, res: Response) {
  const seats = await seatService.getSeatsBySchedule(req.params.scheduleId as string)
  res.json({ data: seats })
}
