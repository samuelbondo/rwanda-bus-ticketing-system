import { Response } from 'express'
import { prisma } from '../config/prisma.js'
import { generateTicketNumber } from '../utils/ticket.js'
import { generateQrCode } from '../utils/qrcode.js'
import { generateTicketPdf } from '../utils/pdf.js'
import { createBookingSchema } from '../validators/booking.validator.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

const CANCEL_HOURS_BEFORE = 3
const PAYMENT_HOURS_BEFORE = 1

export async function createBooking(req: AuthRequest, res: Response) {
  const parsed = createBookingSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { scheduleId, seatId, source, destination } = parsed.data

  const schedule = await prisma.schedule.findUnique({ where: { id: scheduleId } })
  if (!schedule || schedule.status !== 'SCHEDULED') {
    res.status(400).json({ message: 'Schedule not available' })
    return
  }

  const hoursUntilDeparture =
    (new Date(schedule.departureTime).getTime() - Date.now()) / 36e5
  if (hoursUntilDeparture < PAYMENT_HOURS_BEFORE) {
    res.status(400).json({ message: 'Booking closed: less than 1 hour before departure' })
    return
  }

  const conflict = await prisma.booking.findFirst({
    where: { scheduleId, seatId, status: { in: ['PENDING', 'CONFIRMED'] } },
  })
  if (conflict) {
    res.status(409).json({ message: 'Seat already booked' })
    return
  }

  const ticketNumber = generateTicketNumber()
  const qrCode = await generateQrCode(ticketNumber)

  const booking = await prisma.$transaction(async (tx: typeof prisma) => {
    const b = await tx.booking.create({
      data: {
        userId: req.user!.id,
        scheduleId,
        seatId,
        ticketNumber,
        qrCode,
        source,
        destination,
        totalPrice: schedule.price,
        status: 'CONFIRMED',
      },
      include: { schedule: { include: { route: true, bus: true } }, seat: true },
    })
    await tx.schedule.update({
      where: { id: scheduleId },
      data: { availableSeats: { decrement: 1 } },
    })
    await tx.payment.create({
      data: { bookingId: b.id, amount: schedule.price, method: 'MOMO', status: 'COMPLETED', paidAt: new Date() },
    })
    return b
  })

  res.status(201).json({ data: booking })
}

export async function getBookings(req: AuthRequest, res: Response) {
  const where =
    req.user!.role === 'ADMIN' ? {} : { userId: req.user!.id }

  const bookings = await prisma.booking.findMany({
    where,
    include: { schedule: { include: { route: true, bus: true } }, seat: true },
    orderBy: { bookedAt: 'desc' },
  })
  res.json({ data: bookings })
}

export async function getBookingById(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id as string },
    include: { schedule: { include: { route: true, bus: true } }, seat: true, user: { select: { id: true, name: true, email: true } } },
  })
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return }
  if (req.user!.role === 'CUSTOMER' && booking.userId !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' }); return
  }
  res.json({ data: booking })
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id as string },
    include: { schedule: true },
  })
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return }
  if (req.user!.role === 'CUSTOMER' && booking.userId !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' }); return
  }
  if (booking.status === 'CANCELLED') {
    res.status(400).json({ message: 'Booking already cancelled' }); return
  }

  const hoursUntilDeparture =
    (new Date(booking.schedule.departureTime).getTime() - Date.now()) / 36e5
  if (hoursUntilDeparture < CANCEL_HOURS_BEFORE) {
    res.status(400).json({ message: 'Cancellation window has passed (3 hours before departure)' })
    return
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } }),
    prisma.cancellation.create({
      data: { bookingId: booking.id, cancelledBy: req.user!.id, reason: req.body.reason },
    }),
    prisma.schedule.update({
      where: { id: booking.scheduleId },
      data: { availableSeats: { increment: 1 } },
    }),
  ])

  res.json({ message: 'Booking cancelled successfully' })
}

export async function downloadTicket(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id as string },
    include: {
      schedule: { include: { route: true, bus: true } },
      seat: true,
      user: { select: { name: true, email: true } },
    },
  })
  if (!booking) { res.status(404).json({ message: 'Booking not found' }); return }
  if (req.user!.role === 'CUSTOMER' && booking.userId !== req.user!.id) {
    res.status(403).json({ message: 'Forbidden' }); return
  }

  const pdfBuffer = await generateTicketPdf(booking)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.ticketNumber}.pdf"`)
  res.send(pdfBuffer)
}
