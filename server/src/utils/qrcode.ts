import QRCode from 'qrcode'

export async function generateQrCode(ticketNumber: string): Promise<string> {
  return QRCode.toDataURL(ticketNumber)
}
