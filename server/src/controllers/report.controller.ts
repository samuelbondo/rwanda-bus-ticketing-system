import { Request, Response } from 'express'
import PDFDocument from 'pdfkit'
import { getDateRange, buildReportData } from '../services/report.service.js'

export async function getReports(req: Request, res: Response) {
  const { period = 'monthly', from, to } = req.query as Record<string, string>
  const { start, end } = getDateRange(period, from, to)
  const data = await buildReportData(start, end, period)
  res.json({ data })
}

export async function exportReport(req: Request, res: Response) {
  const { period = 'monthly', from, to, format = 'pdf' } = req.query as Record<string, string>
  const { start, end } = getDateRange(period, from, to)
  const data = await buildReportData(start, end, period)

  if (format === 'csv') {
    const rows = [
      ['Date', 'Bookings', 'Revenue (RWF)'],
      ...data.bookingsPerDay.map((d) => [d.date, String(d.count), String(d.revenue)]),
      [],
      ['Metric', 'Value'],
      ['Total Bookings', String(data.totalBookings)],
      ['Total Revenue', String(data.totalRevenue)],
      ['Cancellation Rate', `${data.cancellationRate.toFixed(1)}%`],
      ['Seat Occupancy', `${data.seatOccupancy.toFixed(1)}%`],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="report-${period}.csv"`)
    return res.send(csv)
  }

  // PDF export
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="report-${period}.pdf"`)
  doc.pipe(res)

  const blue = '#1d4ed8'
  const gray = '#6b7280'
  const light = '#f3f4f6'

  doc.rect(0, 0, doc.page.width, 80).fill(blue)
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text('Rwanda Bus Ticketing System', 50, 22)
  doc.fontSize(11).font('Helvetica')
    .text(`Report Period: ${period.charAt(0).toUpperCase() + period.slice(1)}  |  ${new Date(start).toLocaleDateString()} – ${new Date(end).toLocaleDateString()}`, 50, 50)

  doc.fillColor('#111827').moveDown(3)

  const kpis = [
    { label: 'Total Bookings', value: String(data.totalBookings) },
    { label: 'Total Revenue', value: `RWF ${Number(data.totalRevenue).toLocaleString()}` },
    { label: 'Cancellation Rate', value: `${data.cancellationRate.toFixed(1)}%` },
    { label: 'Seat Occupancy', value: `${data.seatOccupancy.toFixed(1)}%` },
  ]

  const boxW = 110, boxH = 55, boxGap = 12
  let bx = 50
  const by = 100

  kpis.forEach(({ label, value }) => {
    doc.rect(bx, by, boxW, boxH).fill(light)
    doc.fillColor(blue).fontSize(16).font('Helvetica-Bold').text(value, bx + 8, by + 10, { width: boxW - 16, align: 'center' })
    doc.fillColor(gray).fontSize(8).font('Helvetica').text(label, bx + 4, by + 34, { width: boxW - 8, align: 'center' })
    bx += boxW + boxGap
  })

  doc.y = by + boxH + 20

  if (data.bookingsPerDay.length > 0) {
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Bookings & Revenue Per Day', 50)
    doc.moveDown(0.4)

    const tableTop = doc.y
    const cols = [200, 100, 150]
    const headers = ['Date', 'Bookings', 'Revenue (RWF)']
    let tx = 50

    doc.rect(50, tableTop, cols[0] + cols[1] + cols[2], 22).fill(blue)
    headers.forEach((h, i) => {
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(h, tx + 6, tableTop + 6, { width: cols[i] - 12 })
      tx += cols[i]
    })

    let rowY = tableTop + 22
    data.bookingsPerDay.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? 'white' : light
      doc.rect(50, rowY, cols[0] + cols[1] + cols[2], 18).fill(bg)
      const cells = [row.date, String(row.count), `RWF ${Number(row.revenue).toLocaleString()}`]
      let cx = 50
      cells.forEach((cell, i) => {
        doc.fillColor('#111827').fontSize(9).font('Helvetica').text(cell, cx + 6, rowY + 4, { width: cols[i] - 12 })
        cx += cols[i]
      })
      rowY += 18
      if (rowY > doc.page.height - 80) { doc.addPage(); rowY = 50 }
    })
    doc.y = rowY + 10
  }

  if (data.popularRoutes.length > 0) {
    if (doc.y > doc.page.height - 150) doc.addPage()
    doc.fillColor('#111827').fontSize(13).font('Helvetica-Bold').text('Top Routes', 50)
    doc.moveDown(0.4)

    const tableTop = doc.y
    const cols = [220, 100, 130]
    const headers = ['Route', 'Bookings', 'Status']
    let tx = 50

    doc.rect(50, tableTop, cols[0] + cols[1] + cols[2], 22).fill(blue)
    headers.forEach((h, i) => {
      doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(h, tx + 6, tableTop + 6, { width: cols[i] - 12 })
      tx += cols[i]
    })

    let rowY = tableTop + 22
    data.popularRoutes.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? 'white' : light
      doc.rect(50, rowY, cols[0] + cols[1] + cols[2], 18).fill(bg)
      const cells = [row.route, String(row.count), 'Active']
      let cx = 50
      cells.forEach((cell, i) => {
        doc.fillColor('#111827').fontSize(9).font('Helvetica').text(cell, cx + 6, rowY + 4, { width: cols[i] - 12 })
        cx += cols[i]
      })
      rowY += 18
    })
    doc.y = rowY + 10
  }

  doc.fontSize(8).fillColor(gray)
    .text(`Generated on ${new Date().toLocaleString()} — Rwanda Bus Ticketing System`, 50, doc.page.height - 40, { align: 'center', width: doc.page.width - 100 })

  doc.end()
}
