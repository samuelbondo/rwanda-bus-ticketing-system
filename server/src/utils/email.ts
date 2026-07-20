import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

export async function sendBookingConfirmation(
  to: string,
  name: string,
  ticketNumber: string,
  pdfBuffer: Buffer
) {
  await transporter.sendMail({
    from: `"Rwanda Bus Ticketing" <${env.SMTP_USER}>`,
    to,
    subject: `Booking Confirmed — ${ticketNumber}`,
    html: `<p>Hi ${name},</p><p>Your booking <strong>${ticketNumber}</strong> is confirmed. Your ticket is attached.</p>`,
    attachments: [{ filename: `ticket-${ticketNumber}.pdf`, content: pdfBuffer }],
  })
}

export async function sendCancellationConfirmation(
  to: string,
  name: string,
  ticketNumber: string
) {
  await transporter.sendMail({
    from: `"Rwanda Bus Ticketing" <${env.SMTP_USER}>`,
    to,
    subject: `Booking Cancelled — ${ticketNumber}`,
    html: `<p>Hi ${name},</p><p>Your booking <strong>${ticketNumber}</strong> has been cancelled.</p>`,
  })
}
