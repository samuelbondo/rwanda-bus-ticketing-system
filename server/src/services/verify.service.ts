import { prisma } from '../config/prisma.js'

export async function verifyTicket(ticketNumber: string, checkIn: boolean, agentId?: string) {
  const booking = await prisma.booking.findUnique({
    where: { ticketNumber },
    include: {
      user: { select: { name: true, email: true } },
      schedule: { include: { route: true, bus: true } },
      seat: true,
    },
  })

  if (!booking) throw Object.assign(new Error('Ticket not found'), { status: 404 })
  if (booking.status === 'USED') throw Object.assign(new Error('Ticket already used — passenger already boarded'), { status: 400 })
  if (booking.status === 'CANCELLED') throw Object.assign(new Error('This ticket has been cancelled'), { status: 400 })
  if (booking.status !== 'CONFIRMED') throw Object.assign(new Error(`Ticket is not confirmed (status: ${booking.status})`), { status: 400 })

  // Validate the ticket belongs to today's or a future schedule
  const departure = new Date(booking.schedule.departureTime)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (departure < todayStart) {
    throw Object.assign(new Error('This ticket is for a past trip and cannot be used for boarding'), { status: 400 })
  }

  if (checkIn) {
    await prisma.$transaction([
      prisma.booking.update({ where: { id: booking.id }, data: { status: 'USED' } }),
      prisma.auditLog.create({
        data: {
          action: 'PASSENGER_CHECKED_IN',
          entity: 'booking',
          entityId: booking.id,
          details: { ticketNumber, agentId, passengerName: booking.user.name },
          ...(agentId ? { user: { connect: { id: agentId } } } : {}),
        },
      }),
    ])
  }

  return booking
}
