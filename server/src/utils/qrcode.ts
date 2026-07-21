import QRCode from 'qrcode'
import { env } from '../config/env.js'

export async function generateQrCode(ticketNumber: string): Promise<string> {
  const url = `${env.CLIENT_URL}/agent/verify?ticket=${encodeURIComponent(ticketNumber)}`
  return QRCode.toDataURL(url)
}
