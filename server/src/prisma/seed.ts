import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword    = await bcrypt.hash('Admin123!', 12)
  const customerPassword = await bcrypt.hash('Customer@1234', 12)
  const agentPassword    = await bcrypt.hash('Agent@1234', 12)

  await prisma.user.upsert({
    where: { email: 'admin@rwandabus.rw' },
    update: { password: adminPassword },
    create: { name: 'Samuel Bondo', email: 'admin@rwandabus.rw', password: adminPassword, role: 'ADMIN' },
  })
  await prisma.user.upsert({
    where: { email: 'agent@rwandabus.rw' },
    update: {},
    create: { name: 'Prince Karn', email: 'agent@rwandabus.rw', password: agentPassword, role: 'AGENT' },
  })
  await prisma.user.upsert({
    where: { email: 'customer@rwandabus.rw' },
    update: {},
    create: { name: 'Timothy Keita', email: 'customer@rwandabus.rw', password: customerPassword, role: 'CUSTOMER' },
  })

  // Bus
  const bus = await prisma.bus.upsert({
    where: { plateNumber: 'RAB 001 A' },
    update: {},
    create: { name: 'Volcano Express 1', plateNumber: 'RAB 001 A', capacity: 30 },
  })

  // Seats
  for (let i = 1; i <= 30; i++) {
    await prisma.seat.upsert({
      where: { busId_seatNumber: { busId: bus.id, seatNumber: `S${i}` } },
      update: {},
      create: { busId: bus.id, seatNumber: `S${i}` },
    })
  }

  // Route
  const route = await prisma.route.upsert({
    where: { id: 'route-nyanza-kigali' },
    update: {},
    create: {
      id: 'route-nyanza-kigali',
      name: 'Nyanza – Kigali',
      origin: 'Nyanza',
      destination: 'Kigali',
      distanceKm: 112,
      basePrice: 2000,
      stops: {
        create: [
          { name: 'Nyanza',  stopOrder: 1, priceFromOrigin: 0 },
          { name: 'Ruhango', stopOrder: 2, priceFromOrigin: 500 },
          { name: 'Muhanga', stopOrder: 3, priceFromOrigin: 1000 },
          { name: 'Kigali',  stopOrder: 4, priceFromOrigin: 2000 },
        ],
      },
    },
  })

  // Delete old schedules with no bookings to avoid duplicates
  await prisma.schedule.deleteMany({
    where: { routeId: route.id, bookings: { none: {} } },
  })

  // Create 14 future days of schedules — 3 departures per day
  const departureTimes = [
    { hour: 6,  minute: 0,  price: 2000 },
    { hour: 10, minute: 30, price: 2000 },
    { hour: 15, minute: 0,  price: 2000 },
  ]

  for (let day = 0; day < 14; day++) {
    for (const { hour, minute, price } of departureTimes) {
      const dep = new Date()
      dep.setDate(dep.getDate() + day)
      dep.setHours(hour, minute, 0, 0)
      await prisma.schedule.create({
        data: { routeId: route.id, busId: bus.id, departureTime: dep, price, availableSeats: bus.capacity },
      })
    }
  }

  // ── Sample data for reports ──────────────────────────────────────────────
  // Create a second bus for variety
  const bus2 = await prisma.bus.upsert({
    where: { plateNumber: 'RAB 002 B' },
    update: {},
    create: { name: 'Horizon Coach 2', plateNumber: 'RAB 002 B', capacity: 30 },
  })
  for (let i = 1; i <= 30; i++) {
    await prisma.seat.upsert({
      where: { busId_seatNumber: { busId: bus2.id, seatNumber: `S${i}` } },
      update: {},
      create: { busId: bus2.id, seatNumber: `S${i}` },
    })
  }

  // Second route
  const route2 = await prisma.route.upsert({
    where: { id: 'route-kigali-musanze' },
    update: {},
    create: {
      id: 'route-kigali-musanze',
      name: 'Kigali – Musanze',
      origin: 'Kigali',
      destination: 'Musanze',
      distanceKm: 110,
      basePrice: 2500,
      stops: {
        create: [
          { name: 'Kigali',   stopOrder: 1, priceFromOrigin: 0 },
          { name: 'Rulindo',  stopOrder: 2, priceFromOrigin: 800 },
          { name: 'Musanze',  stopOrder: 3, priceFromOrigin: 2500 },
        ],
      },
    },
  })

  const customer = await prisma.user.findUnique({ where: { email: 'customer@rwandabus.rw' } })
  if (!customer) throw new Error('Customer user not found')

  const seats1 = await prisma.seat.findMany({ where: { busId: bus.id } })
  const seats2 = await prisma.seat.findMany({ where: { busId: bus2.id } })

  // Helper: past schedule + booking + payment
  async function seedBooking(
    daysAgo: number,
    seatIndex: number,
    routeId: string,
    busId: string,
    seats: { id: string }[],
    price: number,
    origin: string,
    destination: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'USED',
    ticketSuffix: string,
  ) {
    const dep = new Date()
    dep.setDate(dep.getDate() - daysAgo)
    dep.setHours(8, 0, 0, 0)

    const schedule = await prisma.schedule.create({
      data: {
        routeId,
        busId,
        departureTime: dep,
        price,
        availableSeats: 0,
        status: 'COMPLETED',
      },
    })

    const bookedAt = new Date(dep)
    bookedAt.setHours(dep.getHours() - 2)

    const booking = await prisma.booking.create({
      data: {
        userId: customer.id,
        scheduleId: schedule.id,
        seatId: seats[seatIndex % seats.length].id,
        ticketNumber: `TKT-SEED-${ticketSuffix}`,
        qrCode: `QR-SEED-${ticketSuffix}`,
        source: origin,
        destination,
        status,
        totalPrice: price,
        bookedAt,
      },
    })

    if (status !== 'CANCELLED') {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: price,
          method: ['MOMO', 'CARD', 'CASH'][seatIndex % 3] as 'MOMO' | 'CARD' | 'CASH',
          status: 'COMPLETED',
          paidAt: bookedAt,
          createdAt: bookedAt,
        },
      })
    }
  }

  type BookingPlan = {
    daysAgo: number; seatIdx: number; routeId: string; busId: string
    seats: { id: string }[]; price: number; origin: string; destination: string
    status: 'CONFIRMED' | 'CANCELLED' | 'USED'; suffix: string
  }

  const bookingPlan: BookingPlan[] = [
    { daysAgo: 1,  seatIdx: 0, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '001' },
    { daysAgo: 1,  seatIdx: 1, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '002' },
    { daysAgo: 1,  seatIdx: 2, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '003' },
    { daysAgo: 2,  seatIdx: 3, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Ruhango', destination: 'Kigali',  status: 'USED',      suffix: '004' },
    { daysAgo: 2,  seatIdx: 4, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'CANCELLED', suffix: '005' },
    { daysAgo: 3,  seatIdx: 5, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '006' },
    { daysAgo: 3,  seatIdx: 6, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '007' },
    { daysAgo: 4,  seatIdx: 7, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Muhanga', destination: 'Kigali',  status: 'USED',      suffix: '008' },
    { daysAgo: 5,  seatIdx: 8, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '009' },
    { daysAgo: 5,  seatIdx: 9, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '010' },
    { daysAgo: 6,  seatIdx: 0, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'CANCELLED', suffix: '011' },
    { daysAgo: 7,  seatIdx: 1, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '012' },
    { daysAgo: 7,  seatIdx: 2, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Ruhango', destination: 'Kigali',  status: 'USED',      suffix: '013' },
    { daysAgo: 8,  seatIdx: 3, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '014' },
    { daysAgo: 9,  seatIdx: 4, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '015' },
    { daysAgo: 10, seatIdx: 5, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '016' },
    { daysAgo: 10, seatIdx: 6, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Muhanga', destination: 'Kigali',  status: 'USED',      suffix: '017' },
    { daysAgo: 11, seatIdx: 7, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'CANCELLED', suffix: '018' },
    { daysAgo: 12, seatIdx: 8, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '019' },
    { daysAgo: 13, seatIdx: 9, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '020' },
    { daysAgo: 14, seatIdx: 0, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '021' },
    { daysAgo: 15, seatIdx: 1, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '022' },
    { daysAgo: 16, seatIdx: 2, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Ruhango', destination: 'Kigali',  status: 'USED',      suffix: '023' },
    { daysAgo: 17, seatIdx: 3, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '024' },
    { daysAgo: 18, seatIdx: 4, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'CANCELLED', suffix: '025' },
    { daysAgo: 20, seatIdx: 5, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '026' },
    { daysAgo: 22, seatIdx: 6, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Muhanga', destination: 'Kigali',  status: 'USED',      suffix: '027' },
    { daysAgo: 25, seatIdx: 7, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '028' },
    { daysAgo: 28, seatIdx: 8, routeId: route.id,  busId: bus.id,  seats: seats1, price: 2000, origin: 'Nyanza',  destination: 'Kigali',  status: 'USED',      suffix: '029' },
    { daysAgo: 30, seatIdx: 9, routeId: route2.id, busId: bus2.id, seats: seats2, price: 2500, origin: 'Kigali',  destination: 'Musanze', status: 'USED',      suffix: '030' },
  ]

  const existing = await prisma.booking.findFirst({ where: { ticketNumber: { startsWith: 'TKT-SEED-' } } })
  if (!existing) {
    for (const p of bookingPlan) {
      await seedBooking(p.daysAgo, p.seatIdx, p.routeId, p.busId, p.seats, p.price, p.origin, p.destination, p.status, p.suffix)
    }
    console.log('✅ Seeded 30 sample bookings & payments for reports')
  } else {
    console.log('ℹ️  Sample bookings already exist — skipping')
  }

  console.log('✅ Seed complete — 14 days × 3 departures = 42 schedules')
  console.log('Admin:    admin@rwandabus.rw    / Admin123!')
  console.log('Agent:    agent@rwandabus.rw    / Agent@1234')
  console.log('Customer: customer@rwandabus.rw / Customer@1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
