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

  const [totalBookings, cancelledBookings, revenue] = await Promise.all([
    prisma.booking.count({ where: { bookedAt: { gte: from } } }),
    prisma.booking.count({ where: { bookedAt: { gte: from }, status: 'CANCELLED' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: from } },
      _sum: { amount: true },
    }),
  ])

  res.json({
    data: {
      period,
      from,
      totalBookings,
      totalRevenue: revenue._sum.amount ?? 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
    },
  })
}

export async function exportReport(req: Request, res: Response) {
  // Placeholder — Timothy Keita implements full export (PDF/Excel/CSV)
  res.status(501).json({ message: 'Export not yet implemented' })
}
