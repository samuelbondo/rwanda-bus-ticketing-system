import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'

export async function getReports(req: Request, res: Response) {
  const { period = 'monthly' } = req.query
  const now = new Date()
  let from: Date

  if (period === 'daily') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'weekly') {
    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === 'yearly') {
    from = new Date(now.getFullYear(), 0, 1)
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const [totalBookings, cancelledBookings, revenue, allBookings, totalSeats, bookedSeats] =
    await Promise.all([
      prisma.booking.count({ where: { bookedAt: { gte: from } } }),
      prisma.booking.count({ where: { bookedAt: { gte: from }, status: 'CANCELLED' } }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: from } },
        _sum: { amount: true },
      }),
      prisma.booking.findMany({
        where: { bookedAt: { gte: from }, status: { not: 'CANCELLED' } },
        select: { bookedAt: true },
        orderBy: { bookedAt: 'asc' },
      }),
      prisma.seat.count(),
      prisma.booking.count({ where: { bookedAt: { gte: from }, status: { in: ['CONFIRMED', 'USED'] } } }),
    ])

  // Group bookings by day
  const dayMap: Record<string, number> = {}
  for (const b of allBookings) {
    const day = new Date(b.bookedAt).toISOString().split('T')[0]
    dayMap[day] = (dayMap[day] ?? 0) + 1
  }
  const bookingsPerDay = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))

  res.json({
    data: {
      period,
      from,
      totalBookings,
      totalRevenue: revenue._sum.amount ?? 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      seatOccupancy: totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0,
      bookingsPerDay,
    },
  })
}

export async function exportReport(_req: Request, res: Response) {
  res.status(501).json({ message: 'Export not yet implemented' })
}
