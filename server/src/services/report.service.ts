import { prisma } from '../config/prisma.js'

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export function getDateRange(period: ReportPeriod | string, from?: string, to?: string): { start: Date; end: Date } {
  const now = new Date()
  if (from && to) {
    return { start: new Date(from), end: new Date(to + 'T23:59:59.999Z') }
  }
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let start: Date
  switch (period) {
    case 'daily':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'weekly':
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      break
    case 'yearly':
      start = new Date(now.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return { start, end }
}

export async function buildReportData(start: Date, end: Date, period: string) {
  const where = { bookedAt: { gte: start, lte: end } }

  const [
    totalBookings,
    cancelledBookings,
    revenue,
    allBookings,
    totalSeats,
    bookedSeats,
    routeBookings,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      where: { ...where, status: { not: 'CANCELLED' } },
      select: { bookedAt: true, totalPrice: true },
      orderBy: { bookedAt: 'asc' },
    }),
    prisma.seat.count(),
    prisma.booking.count({ where: { ...where, status: { in: ['CONFIRMED', 'USED'] } } }),
    prisma.booking.groupBy({
      by: ['scheduleId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ])

  const dayMap: Record<string, { count: number; revenue: number }> = {}
  for (const b of allBookings) {
    const day = new Date(b.bookedAt).toISOString().split('T')[0]
    if (!dayMap[day]) dayMap[day] = { count: 0, revenue: 0 }
    dayMap[day].count += 1
    dayMap[day].revenue += Number(b.totalPrice)
  }
  const bookingsPerDay = Object.entries(dayMap)
    .map(([date, v]) => ({ date, count: v.count, revenue: v.revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const scheduleIds = routeBookings.map((r) => r.scheduleId)
  const schedules = await prisma.schedule.findMany({
    where: { id: { in: scheduleIds } },
    select: { id: true, route: { select: { name: true, origin: true, destination: true } } },
  })
  const scheduleMap = Object.fromEntries(schedules.map((s) => [s.id, s.route]))
  const popularRoutes = routeBookings.map((r) => ({
    route: scheduleMap[r.scheduleId]?.name ?? 'Unknown',
    origin: scheduleMap[r.scheduleId]?.origin ?? '',
    destination: scheduleMap[r.scheduleId]?.destination ?? '',
    count: r._count.id,
  }))

  return {
    period,
    from: start,
    to: end,
    totalBookings,
    totalRevenue: Number(revenue._sum.amount ?? 0),
    cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
    seatOccupancy: totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0,
    bookingsPerDay,
    popularRoutes,
  }
}

export async function buildBookingsReport(start: Date, end: Date) {
  const rows = await prisma.booking.findMany({
    where: { bookedAt: { gte: start, lte: end } },
    select: {
      ticketNumber: true,
      bookedAt: true,
      status: true,
      totalPrice: true,
      source: true,
      destination: true,
      user: { select: { name: true, email: true } },
      schedule: { select: { departureTime: true, route: { select: { name: true } } } },
      seat: { select: { seatNumber: true } },
    },
    orderBy: { bookedAt: 'desc' },
  })
  return rows.map((b) => ({
    ticket: b.ticketNumber,
    passenger: b.user.name,
    email: b.user.email,
    route: b.schedule.route.name,
    from: b.source,
    to: b.destination,
    seat: b.seat.seatNumber,
    departure: new Date(b.schedule.departureTime).toLocaleString('en-RW'),
    bookedAt: new Date(b.bookedAt).toLocaleString('en-RW'),
    status: b.status,
    price: Number(b.totalPrice),
  }))
}

export async function buildUsersReport(start: Date, end: Date) {
  const rows = await prisma.user.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: {
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone ?? '—',
    status: u.isActive ? 'Active' : 'Inactive',
    bookings: u._count.bookings,
    joinedAt: new Date(u.createdAt).toLocaleDateString('en-RW'),
  }))
}

export async function buildRevenueReport(start: Date, end: Date) {
  const rows = await prisma.payment.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: {
      amount: true,
      method: true,
      status: true,
      reference: true,
      paidAt: true,
      createdAt: true,
      booking: {
        select: {
          ticketNumber: true,
          user: { select: { name: true } },
          schedule: { select: { route: { select: { name: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((p) => ({
    ticket: p.booking.ticketNumber,
    passenger: p.booking.user.name,
    route: p.booking.schedule.route.name,
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    reference: p.reference ?? '—',
    paidAt: p.paidAt ? new Date(p.paidAt).toLocaleString('en-RW') : '—',
  }))
}
