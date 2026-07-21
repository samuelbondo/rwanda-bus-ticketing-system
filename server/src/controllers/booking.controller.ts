import { Response } from 'express'
import { createBookingSchema, confirmPaymentSchema } from '../validators/booking.validator.js'
import * as bookingService from '../services/booking.service.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

export async function createBooking(req: AuthRequest, res: Response) {
  const parsed = createBookingSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }

  const booking = await bookingService.createBooking({
    userId: req.user!.id,
    ...parsed.data,
    ipAddress: req.ip,
  })
  res.status(201).json({ data: booking })
}

export async function confirmPayment(req: AuthRequest, res: Response) {
  const parsed = confirmPaymentSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }

  const result = await bookingService.confirmPayment({
    bookingId: req.params.id as string,
    userId: req.user!.id,
    method: parsed.data.method,
    reference: parsed.data.reference,
    proofUrl: parsed.data.proofUrl,
    ipAddress: req.ip,
  })
  res.json({ message: 'Payment submitted. Awaiting admin approval.', data: result })
}

export async function approvePayment(req: AuthRequest, res: Response) {
  await bookingService.approvePayment(req.params.id as string, req.user!.id, req.ip)
  res.json({ message: 'Payment approved. Booking confirmed.' })
}

export async function rejectPayment(req: AuthRequest, res: Response) {
  await bookingService.rejectPayment(req.params.id as string, req.user!.id, req.body.reason as string | undefined, req.ip)
  res.json({ message: 'Payment rejected. Booking reset to pending.' })
}

export async function getBookings(req: AuthRequest, res: Response) {
  const bookings = await bookingService.listBookings(req.user!.id, req.user!.role)
  res.json({ data: bookings })
}

export async function getBookingById(req: AuthRequest, res: Response) {
  const booking = await bookingService.findBookingById(req.params.id as string, req.user!.id, req.user!.role)
  res.json({ data: booking })
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  await bookingService.cancelBooking({
    bookingId: req.params.id as string,
    userId: req.user!.id,
    role: req.user!.role,
    reason: req.body.reason as string | undefined,
    ipAddress: req.ip,
  })
  res.json({ message: 'Booking cancelled successfully' })
}

export async function getManifest(req: AuthRequest, res: Response) {
  const manifest = await bookingService.getScheduleManifest(req.params.scheduleId as string)
  res.json({ data: manifest })
}

export async function markDeparted(req: AuthRequest, res: Response) {
  await bookingService.markScheduleDeparted(req.params.scheduleId as string, req.user!.id)
  res.json({ message: 'Schedule marked as departed' })
}

export async function downloadTicket(req: AuthRequest, res: Response) {
  const pdfBuffer = await bookingService.getTicketPdf(req.params.id as string, req.user!.id, req.user!.role)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${req.params.id}.pdf"`)
  res.send(pdfBuffer)
}
