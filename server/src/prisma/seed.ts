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

  // Seed 30 days of past bookings across both routes
  const bookingPlan = [
    // [daysAgo, seatIdx, routeId, busId, seats, price, origin, dest, status, suffix]
    [1,  0, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '001'],
    [1,  1, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '002'],
    [1,  2, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '003'],
    [2,  3, route.id,  bus.id,  seats1, 2000, 'Ruhango', 'Kigali',  'USED',      '004'],
    [2,  4, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'CANCELLED', '005'],
    [3,  5, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '006'],
    [3,  6, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '007'],
    [4,  7, route.id,  bus.id,  seats1, 2000, 'Muhanga', 'Kigali',  'USED',      '008'],
    [5,  8, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '009'],
    [5,  9, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '010'],
    [6,  0, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'CANCELLED', '011'],
    [7,  1, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '012'],
    [7,  2, route.id,  bus.id,  seats1, 2000, 'Ruhango', 'Kigali',  'USED',      '013'],
    [8,  3, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '014'],
    [9,  4, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '015'],
    [10, 5, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '016'],
    [10, 6, route.id,  bus.id,  seats1, 2000, 'Muhanga', 'Kigali',  'USED',      '017'],
    [11, 7, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'CANCELLED', '018'],
    [12, 8, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '019'],
    [13, 9, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '020'],
    [14, 0, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '021'],
    [15, 1, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '022'],
    [16, 2, route.id,  bus.id,  seats1, 2000, 'Ruhango', 'Kigali',  'USED',      '023'],
    [17, 3, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '024'],
    [18, 4, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'CANCELLED', '025'],
    [20, 5, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '026'],
    [22, 6, route.id,  bus.id,  seats1, 2000, 'Muhanga', 'Kigali',  'USED',      '027'],
    [25, 7, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '028'],
    [28, 8, route.id,  bus.id,  seats1, 2000, 'Nyanza',  'Kigali',  'USED',      '029'],
    [30, 9, route2.id, bus2.id, seats2, 2500, 'Kigali',  'Musanze', 'USED',      '030'],
  ] as const

  // Skip if seed bookings already exist
  const existing = await prisma.booking.findFirst({ where: { ticketNumber: { startsWith: 'TKT-SEED-' } } })
  if (!existing) {
    for (const [daysAgo, seatIdx, routeId, busId, seats, price, origin, dest, status, suffix] of bookingPlan) {
      await seedBooking(daysAgo, seatIdx, routeId, busId, seats as {id:string}[], price, origin, dest, status, suffix)
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
