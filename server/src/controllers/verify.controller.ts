import { Request, Response } from 'express'
import * as verifyService from '../services/verify.service.js'

export async function verifyQrCode(req: Request, res: Response) {
  const { ticketNumber, checkIn = false } = req.body
  if (!ticketNumber) { res.status(400).json({ message: 'ticketNumber is required' }); return }

  const booking = await verifyService.verifyTicket(ticketNumber as string, checkIn as boolean)
  const message = checkIn ? 'Passenger checked in successfully' : 'Ticket verified'
  res.json({ valid: true, message, data: booking })
}
