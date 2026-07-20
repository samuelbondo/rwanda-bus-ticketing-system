export type Role = 'GUEST' | 'CUSTOMER' | 'AGENT' | 'ADMIN'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED'
export type ScheduleStatus = 'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'

export interface ServiceError extends Error {
  status?: number
  valid?: boolean
}

export interface JwtPayload {
  id: string
  role: string
  purpose?: string
}

export interface ReportData {
  period: string
  from: Date
  to: Date
  totalBookings: number
  totalRevenue: number
  cancellationRate: number
  seatOccupancy: number
  bookingsPerDay: { date: string; count: number; revenue: number }[]
  popularRoutes: { route: string; origin: string; destination: string; count: number }[]
}
