export type Role = 'GUEST' | 'CUSTOMER' | 'AGENT' | 'ADMIN'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'USED'

export type ScheduleStatus = 'SCHEDULED' | 'DEPARTED' | 'COMPLETED' | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
}

export interface Bus {
  id: string
  name: string
  plateNumber: string
  capacity: number
  imageUrl?: string
  isActive: boolean
}

export interface RouteStop {
  id: string
  name: string
  stopOrder: number
  priceFromOrigin: number
}

export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  distanceKm?: number
  basePrice: number
  isActive: boolean
  stops: RouteStop[]
}

export interface Schedule {
  id: string
  route: Route
  bus: Bus
  departureTime: string
  arrivalTime?: string
  price: number
  status: ScheduleStatus
  availableSeats: number
}

export interface Seat {
  id: string
  seatNumber: string
  isAvailable: boolean
}

export interface Booking {
  id: string
  user: User
  schedule: Schedule
  seat: Seat
  ticketNumber: string
  qrCode: string
  source: string
  destination: string
  status: BookingStatus
  totalPrice: number
  bookedAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  paidAt?: string
}

export interface Cancellation {
  id: string
  bookingId: string
  reason?: string
  cancelledAt: string
}

export interface AuditLog {
  id: string
  user?: User
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  createdAt: string
}

export interface ReportData {
  period: string
  from: string
  to: string
  totalBookings: number
  totalRevenue: number
  cancellationRate: number
  seatOccupancy: number
  bookingsPerDay: { date: string; count: number; revenue: number }[]
  popularRoutes: { route: string; origin: string; destination: string; count: number }[]
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
