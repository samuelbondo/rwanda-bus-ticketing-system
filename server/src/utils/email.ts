import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
}

async function send(options: nodemailer.SendMailOptions) {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping email:', options.subject)
    return
  }
  await transporter.sendMail({ from: `"Rwanda Bus Ticketing" <${env.SMTP_USER}>`, ...options })
}

function baseTemplate(title: string, body: string) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #1d4ed8; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 20px; }
    .header p { color: #bfdbfe; margin: 4px 0 0; font-size: 13px; }
    .body { padding: 32px; color: #374151; }
    .body h2 { margin: 0 0 16px; font-size: 18px; color: #111827; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6b7280; }
    .detail-value { font-weight: 600; color: #111827; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .footer { background: #f9fafb; padding: 16px 32px; font-size: 12px; color: #9ca3af; text-align: center; }
  </style></head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>Rwanda Bus Ticketing</h1>
        <p>Nyanza → Ruhango → Muhanga → Kigali</p>
      </div>
      <div class="body">
        <h2>${title}</h2>
        ${body}
      </div>
      <div class="footer">This is an automated message. Please do not reply to this email.</div>
    </div>
  </body>
  </html>`
}

function detailRow(label: string, value: string) {
  return `<div class="detail-row"><span class="detail-label">${label}</span><span class="detail-value">${value}</span></div>`
}

export async function sendWelcomeEmail(to: string, name: string) {
  const body = `
    <p>Hi <strong>${name}</strong>, welcome to Rwanda Bus Ticketing!</p>
    <p>Your account is ready. You can now search schedules, book seats, and download digital tickets — no office visit required.</p>
    <p style="margin-top:24px;">Safe travels!</p>`
  await send({ to, subject: 'Welcome to Rwanda Bus Ticketing', html: baseTemplate('Welcome aboard 🎉', body) })
}

export async function sendBookingConfirmation(
  to: string,
  name: string,
  ticketNumber: string,
  details: { route: string; departure: string; bus: string; seat: string; price: string },
  pdfBuffer: Buffer
) {
  const body = `
    <p>Hi <strong>${name}</strong>, your booking is confirmed.</p>
    ${detailRow('Ticket No', ticketNumber)}
    ${detailRow('Route', details.route)}
    ${detailRow('Departure', details.departure)}
    ${detailRow('Bus', details.bus)}
    ${detailRow('Seat', details.seat)}
    ${detailRow('Amount Paid', details.price)}
    ${detailRow('Status', '<span class="badge badge-green">CONFIRMED</span>')}
    <p style="margin-top:24px;">Your PDF ticket is attached. Present it (or the QR code) at boarding.</p>`
  await send({
    to,
    subject: `Booking Confirmed \u2014 ${ticketNumber}`,
    html: baseTemplate('Your ticket is confirmed ✅', body),
    attachments: [{ filename: `ticket-${ticketNumber}.pdf`, content: pdfBuffer }],
  })
}

export async function sendCancellationConfirmation(
  to: string,
  name: string,
  ticketNumber: string,
  details: { route: string; departure: string; price: string; refunded: boolean }
) {
  const body = `
    <p>Hi <strong>${name}</strong>, your booking has been cancelled.</p>
    ${detailRow('Ticket No', ticketNumber)}
    ${detailRow('Route', details.route)}
    ${detailRow('Departure', details.departure)}
    ${detailRow('Amount', details.price)}
    ${detailRow('Refund', details.refunded
      ? '<span class="badge badge-green">REFUNDED</span>'
      : '<span class="badge badge-yellow">N/A</span>')}
    <p style="margin-top:24px;">${details.refunded
      ? 'Your refund will be processed within 3–5 business days.'
      : 'No payment was made, so no refund is due.'}</p>`
  await send({ to, subject: `Booking Cancelled \u2014 ${ticketNumber}`, html: baseTemplate('Booking Cancelled', body) })
}

export async function sendScheduleCancellationNotice(
  to: string,
  name: string,
  ticketNumber: string,
  details: { route: string; departure: string; price: string }
) {
  const body = `
    <p>Hi <strong>${name}</strong>, we regret to inform you that your scheduled trip has been cancelled by the operator.</p>
    ${detailRow('Ticket No', ticketNumber)}
    ${detailRow('Route', details.route)}
    ${detailRow('Departure', details.departure)}
    ${detailRow('Amount', details.price)}
    ${detailRow('Refund', '<span class="badge badge-green">REFUNDED</span>')}
    <p style="margin-top:24px;">We apologise for the inconvenience. Your refund will be processed within 3\u20135 business days. Please rebook on an alternative schedule.</p>`
  await send({ to, subject: `Trip Cancelled \u2014 ${details.route} on ${details.departure}`, html: baseTemplate('Your trip has been cancelled ⚠️', body) })
}

export async function sendAccountSuspendedEmail(to: string, name: string) {
  const body = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your Rwanda Bus Ticketing account has been suspended by an administrator.</p>
    <p>If you believe this is a mistake, please contact our support team.</p>`
  await send({ to, subject: 'Account Suspended', html: baseTemplate('Account Suspended', body) })
}

export async function sendPasswordResetByAdminEmail(to: string, name: string, newPassword: string) {
  const body = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>An administrator has reset your password. Your new temporary password is:</p>
    <p style="font-size:20px;font-weight:700;letter-spacing:2px;color:#1d4ed8;margin:16px 0;">${newPassword}</p>
    <p>Please log in and change your password immediately.</p>`
  await send({ to, subject: 'Your Password Has Been Reset', html: baseTemplate('Password Reset by Admin', body) })
}
