import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'

export async function getSeatsBySchedule(req: Request, res: Response) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: req.params.scheduleId as string },
    include: { bus: { include: { seats: true } } },
  })
  if (!schedule) { res.status(404).json({ message: 'Schedule not found' }); return }

  const bookedSeatIds = await prisma.booking.findMany({
    where: { scheduleId: req.params.scheduleId as string, status: { in: ['PENDING', 'CONFIRMED'] } },
    select: { seatId: true },
  })
  const bookedIds = new Set(bookedSeatIds.map((b: { seatId: string }) => b.seatId))

  const seats = schedule.bus.seats.map((seat: { id: string }) => ({
    ...seat,
    isAvailable: !bookedIds.has(seat.id),
  }))

  res.json({ data: seats })
}
