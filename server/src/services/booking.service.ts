import type { PrismaClient } from '@prisma/client'
import type { DefaultArgs } from '@prisma/client/runtime/library'
import { prisma } from '../config/prisma.js'
import { generateTicketNumber } from '../utils/ticket.js'
import { generateQrCode } from '../utils/qrcode.js'
import { generateTicketPdf } from '../utils/pdf.js'
import { sendBookingConfirmation, sendCancellationConfirmation } from '../utils/email.js'

const CANCEL_HOURS_BEFORE = 3
const PAYMENT_HOURS_BEFORE = 1

type Tx = Omit<PrismaClient<object, never, DefaultArgs>, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export async function createBooking(data: {
  userId: string
  scheduleId: string
  seatId: string
  source: string
  destination: string
  ipAddress?: string
}) {
  const schedule = await prisma.schedule.findUnique({ where: { id: data.scheduleId } })
  if (!schedule || schedule.status !== 'SCHEDULED') {
    throw Object.assign(new Error('Schedule not available'), { status: 400 })
  }

  const hoursUntilDeparture = (new Date(schedule.departureTime).getTime() - Date.now()) / 36e5
  if (hoursUntilDeparture < PAYMENT_HOURS_BEFORE) {
    throw Object.assign(new Error('Booking closed: less than 1 hour before departure'), { status: 400 })
  }

  const conflict = await prisma.booking.findFirst({
    where: { scheduleId: data.scheduleId, seatId: data.seatId, status: { in: ['PENDING', 'CONFIRMED'] } },
  })
  if (conflict) throw Object.assign(new Error('Seat already booked'), { status: 409 })

  const ticketNumber = generateTicketNumber()
  const qrCode = await generateQrCode(ticketNumber)

  return prisma.$transaction(async (tx: Tx) => {
    const booking = await tx.booking.create({
      data: {
        userId: data.userId,
        scheduleId: data.scheduleId,
        seatId: data.seatId,
        ticketNumber,
        qrCode,
        source: data.source,
        destination: data.destination,
        totalPrice: schedule.price,
        status: 'PENDING',
      },
      include: { schedule: { include: { route: true, bus: true } }, seat: true },
    })
    await tx.schedule.update({
      where: { id: data.scheduleId },
      data: { availableSeats: { decrement: 1 } },
    })
    await tx.payment.create({
      data: { bookingId: booking.id, amount: schedule.price, method: 'MOMO', status: 'PENDING' },
    })
    await tx.auditLog.create({
      data: { userId: data.userId, action: 'BOOKING_CREATED', entity: 'booking', entityId: booking.id, ipAddress: data.ipAddress },
    })
    return booking
  })
}

export async function confirmPayment(data: {
  bookingId: string
  userId: string
  method: 'MOMO' | 'CARD' | 'CASH'
  reference?: string
  ipAddress?: string
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      schedule: { include: { route: true, bus: true } },
      seat: true,
      user: { select: { id: true, name: true, email: true } },
      payment: true,
    },
  })
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 })
  if (booking.userId !== data.userId) throw Object.assign(new Error('Forbidden'), { status: 403 })
  if (booking.status !== 'PENDING') throw Object.assign(new Error('Booking is not awaiting payment'), { status: 400 })

  const hoursUntilDeparture = (new Date(booking.schedule.departureTime).getTime() - Date.now()) / 36e5
  if (hoursUntilDeparture < PAYMENT_HOURS_BEFORE) {
    throw Object.assign(new Error('Payment window closed: less than 1 hour before departure'), { status: 400 })
  }

  await prisma.$transaction([
    prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED' } }),
    prisma.payment.update({
      where: { bookingId: booking.id },
      data: { method: data.method, status: 'COMPLETED', paidAt: new Date(), ...(data.reference ? { reference: data.reference } : {}) },
    }),
    prisma.auditLog.create({
      data: { userId: data.userId, action: 'PAYMENT_CONFIRMED', entity: 'booking', entityId: booking.id, details: { method: data.method, reference: data.reference }, ipAddress: data.ipAddress },
    }),
  ])

  const confirmedBooking = { ...booking, status: 'CONFIRMED' as const }
  generateTicketPdf(confirmedBooking)
    .then((pdf) =>
      sendBookingConfirmation(booking.user.email, booking.user.name, booking.ticketNumber, {
        route: `${booking.source} → ${booking.destination}`,
        departure: new Date(booking.schedule.departureTime).toLocaleString('en-RW'),
        bus: `${booking.schedule.bus.name} (${booking.schedule.bus.plateNumber})`,
        seat: booking.seat.seatNumber,
        price: `RWF ${Number(booking.totalPrice).toLocaleString()}`,
      }, pdf)
    )
    .catch(() => {})

  return { bookingId: booking.id, ticketNumber: booking.ticketNumber }
}

export async function listBookings(userId: string, role: string) {
  const where = role === 'ADMIN' ? {} : { userId }
  return prisma.booking.findMany({
    where,
    include: { schedule: { include: { route: true, bus: true } }, seat: true },
    orderBy: { bookedAt: 'desc' },
  })
}

export async function findBookingById(id: string, userId: string, role: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      schedule: { include: { route: true, bus: true } },
      seat: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 })
  if (role === 'CUSTOMER' && booking.userId !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  return booking
}

export async function cancelBooking(data: {
  bookingId: string
  userId: string
  role: string
  reason?: string
  ipAddress?: string
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      schedule: true,
      user: { select: { name: true, email: true } },
      payment: true,
    },
  })
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 })
  if (data.role === 'CUSTOMER' && booking.userId !== data.userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  if (booking.status === 'CANCELLED') {
    throw Object.assign(new Error('Booking already cancelled'), { status: 400 })
  }

  const hoursUntilDeparture = (new Date(booking.schedule.departureTime).getTime() - Date.now()) / 36e5
  if (hoursUntilDeparture < CANCEL_HOURS_BEFORE) {
    throw Object.assign(new Error('Cancellation window has passed (3 hours before departure)'), { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ops: any[] = [
    prisma.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } }),
    prisma.cancellation.create({
      data: { bookingId: booking.id, cancelledBy: data.userId, reason: data.reason },
    }),
    prisma.schedule.update({
      where: { id: booking.scheduleId },
      data: { availableSeats: { increment: 1 } },
    }),
    prisma.auditLog.create({
      data: { userId: data.userId, action: 'BOOKING_CANCELLED', entity: 'booking', entityId: booking.id, details: { reason: data.reason }, ipAddress: data.ipAddress },
    }),
  ]

  if (booking.payment?.status === 'COMPLETED') {
    ops.push(prisma.payment.update({ where: { bookingId: booking.id }, data: { status: 'REFUNDED' } }))
  }

  await prisma.$transaction(ops)

  sendCancellationConfirmation(booking.user.email, booking.user.name, booking.ticketNumber, {
    route: `${booking.source} → ${booking.destination}`,
    departure: new Date(booking.schedule.departureTime).toLocaleString('en-RW'),
    price: `RWF ${Number(booking.totalPrice).toLocaleString()}`,
    refunded: !!(booking.payment?.status === 'COMPLETED'),
  }).catch(() => {})
}

export async function getTicketPdf(bookingId: string, userId: string, role: string): Promise<Buffer> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      schedule: { include: { route: true, bus: true } },
      seat: true,
      user: { select: { name: true, email: true } },
    },
  })
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 })
  if (role === 'CUSTOMER' && booking.userId !== userId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
  return generateTicketPdf(booking)
}
