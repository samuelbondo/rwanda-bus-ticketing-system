import PDFDocument from 'pdfkit'

export async function generateTicketPdf(booking: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc.fontSize(18).font('Helvetica-Bold').text('Rwanda Bus Ticketing', { align: 'center' })
    doc.moveDown(0.5)
    doc.fontSize(12).font('Helvetica').text('Official Travel Ticket', { align: 'center' })
    doc.moveDown(1)

    // Divider
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.5)

    // Ticket details
    const details = [
      ['Ticket No', booking.ticketNumber],
      ['Passenger', booking.user.name],
      ['From', booking.source],
      ['To', booking.destination],
      ['Route', booking.schedule.route.name],
      ['Bus', `${booking.schedule.bus.name} (${booking.schedule.bus.plateNumber})`],
      ['Seat', booking.seat.seatNumber],
      ['Departure', new Date(booking.schedule.departureTime).toLocaleString()],
      ['Price', `RWF ${Number(booking.totalPrice).toLocaleString()}`],
    ]

    details.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true })
      doc.font('Helvetica').text(value)
    })

    doc.moveDown(1)
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke()
    doc.moveDown(0.5)

    // QR code
    if (booking.qrCode?.startsWith('data:image')) {
      const base64 = booking.qrCode.split(',')[1]
      const imgBuffer = Buffer.from(base64, 'base64')
      doc.image(imgBuffer, { fit: [120, 120], align: 'center' })
    }

    doc.moveDown(0.5)
    doc.fontSize(9).fillColor('gray').text('Present this ticket at boarding for QR verification.', { align: 'center' })

    doc.end()
  })
}
