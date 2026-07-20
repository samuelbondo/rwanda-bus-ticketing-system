/**
 * Format a number as RWF currency string.
 * e.g. 2000 → "RWF 2,000"
 */
export function formatRwf(amount: number | string): string {
  return `RWF ${Number(amount).toLocaleString()}`
}

/**
 * Format a date string or Date to a readable locale string.
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('en-RW', options ?? {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}

/**
 * Format a date string or Date to a time string.
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format a date string or Date to full datetime.
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-RW')
}

/**
 * Returns hours remaining until a given departure time.
 */
export function hoursUntil(departureTime: string | Date): number {
  return (new Date(departureTime).getTime() - Date.now()) / 36e5
}

/**
 * Returns true if cancellation is still allowed (>3 hours before departure).
 */
export function canCancel(departureTime: string | Date): boolean {
  return hoursUntil(departureTime) >= 3
}

/**
 * Returns true if payment is still allowed (>1 hour before departure).
 */
export function canPay(departureTime: string | Date): boolean {
  return hoursUntil(departureTime) >= 1
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

/**
 * Download a Blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
