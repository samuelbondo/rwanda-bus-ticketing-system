import { prisma } from '../config/prisma.js'

export async function getSeatsBySchedule(scheduleId: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { bus: { include: { seats: true } } },
  })
  if (!schedule) throw Object.assign(new Error('Schedule not found'), { status: 404 })

  const booked = await prisma.booking.findMany({
    where: { scheduleId, status: { in: ['PENDING', 'CONFIRMED'] } },
    select: { seatId: true },
  })
  const bookedIds = new Set(booked.map((b) => b.seatId))

  return schedule.bus.seats.map((seat) => ({
    ...seat,
    isAvailable: !bookedIds.has(seat.id),
  }))
}
