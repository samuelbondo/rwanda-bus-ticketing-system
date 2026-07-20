import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'

export async function verifyQrCode(req: Request, res: Response) {
  const { ticketNumber } = req.body
  if (!ticketNumber) {
    res.status(400).json({ message: 'ticketNumber is required' })
    return
  }

  const booking = await prisma.booking.findUnique({
    where: { ticketNumber },
    include: {
      user: { select: { name: true, email: true } },
      schedule: { include: { route: true, bus: true } },
      seat: true,
    },
  })

  if (!booking) {
    res.status(404).json({ message: 'Ticket not found', valid: false })
    return
  }

  if (booking.status === 'USED') {
    res.status(400).json({ message: 'Ticket already used', valid: false })
    return
  }

  if (booking.status !== 'CONFIRMED') {
    res.status(400).json({ message: `Ticket status: ${booking.status}`, valid: false })
    return
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: 'USED' } })

  res.json({ valid: true, message: 'Ticket verified', data: booking })
}
