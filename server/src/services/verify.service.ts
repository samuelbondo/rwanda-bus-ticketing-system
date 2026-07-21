import { prisma } from '../config/prisma.js'

export async function verifyTicket(ticketNumber: string, checkIn: boolean) {
  const booking = await prisma.booking.findUnique({
    where: { ticketNumber },
    include: {
      user: { select: { name: true, email: true } },
      schedule: { include: { route: true, bus: true } },
      seat: true,
    },
  })

  if (!booking) throw Object.assign(new Error('Ticket not found'), { status: 404, valid: false })
  if (booking.status === 'USED') throw Object.assign(new Error('Ticket already used'), { status: 400, valid: false })
  if (booking.status !== 'CONFIRMED') {
    throw Object.assign(new Error(`Ticket status: ${booking.status}`), { status: 400, valid: false })
  }

  // Only mark as USED when explicitly checking in, not on lookup
  if (checkIn) {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'USED' } })
  }

  return booking
}
