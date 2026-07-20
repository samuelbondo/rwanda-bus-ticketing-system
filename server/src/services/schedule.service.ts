import { prisma } from '../config/prisma.js'
import { sendScheduleCancellationNotice } from '../utils/email.js'
import type { ScheduleStatus } from '@prisma/client'

export async function listSchedules(filters: { origin?: string; date?: string }) {
  const where: Record<string, unknown> = { status: 'SCHEDULED' }

  if (filters.origin) {
    where.route = { origin: { contains: filters.origin, mode: 'insensitive' } }
  }
  if (filters.date) {
    const day = new Date(filters.date)
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    where.departureTime = { gte: day, lt: next }
  }

  return prisma.schedule.findMany({
    where,
    include: {
      route: { include: { stops: { orderBy: { stopOrder: 'asc' } } } },
      bus: true,
    },
    orderBy: { departureTime: 'asc' },
  })
}

export async function findScheduleById(id: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: { route: { include: { stops: true } }, bus: true },
  })
  if (!schedule) throw Object.assign(new Error('Schedule not found'), { status: 404 })
  return schedule
}

export async function createSchedule(data: {
  routeId: string
  busId: string
  departureTime: Date
  arrivalTime?: Date
  price: number
}) {
  const bus = await prisma.bus.findUnique({ where: { id: data.busId } })
  if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 })

  return prisma.schedule.create({
    data: { ...data, availableSeats: bus.capacity },
  })
}

export async function updateSchedule(
  id: string,
  data: { departureTime?: Date; arrivalTime?: Date; price?: number; status?: ScheduleStatus }
) {
  return prisma.schedule.update({ where: { id }, data })
}

export async function cancelSchedule(id: string, cancelledBy: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    include: {
      route: true,
      bookings: {
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        include: {
          user: { select: { name: true, email: true } },
          seat: true,
          payment: true,
        },
      },
    },
  })
  if (!schedule) throw Object.assign(new Error('Schedule not found'), { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    prisma.schedule.update({ where: { id: schedule.id }, data: { status: 'CANCELLED', availableSeats: 0 } }),
    ...schedule.bookings.map((b) =>
      prisma.booking.update({ where: { id: b.id }, data: { status: 'CANCELLED' } })
    ),
    ...schedule.bookings
      .filter((b) => b.payment?.status === 'COMPLETED')
      .map((b) => prisma.payment.update({ where: { bookingId: b.id }, data: { status: 'REFUNDED' } })),
    ...schedule.bookings.map((b) =>
      prisma.cancellation.create({
        data: { bookingId: b.id, cancelledBy, reason: 'Schedule cancelled by operator' },
      })
    ),
  ]

  await prisma.$transaction(ops)

  const routeLabel = `${schedule.route.origin} → ${schedule.route.destination}`
  const departureLabel = new Date(schedule.departureTime).toLocaleString('en-RW')
  for (const b of schedule.bookings) {
    sendScheduleCancellationNotice(b.user.email, b.user.name, b.ticketNumber, {
      route: routeLabel,
      departure: departureLabel,
      price: `RWF ${Number(b.totalPrice).toLocaleString()}`,
    }).catch(() => {})
  }
}
