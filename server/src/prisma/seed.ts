import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword    = await bcrypt.hash('Admin@1234', 12)
  const customerPassword = await bcrypt.hash('Customer@1234', 12)
  const agentPassword    = await bcrypt.hash('Agent@1234', 12)

  await prisma.user.upsert({
    where: { email: 'admin@rwandabus.rw' },
    update: {},
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

  // Delete old past/future schedules so we don't duplicate
  await prisma.schedule.deleteMany({
    where: { routeId: route.id, bookings: { none: {} } },
  })

  // Create 14 days of schedules — 3 departures per day
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
        data: {
          routeId: route.id,
          busId: bus.id,
          departureTime: dep,
          price,
          availableSeats: bus.capacity,
        },
      })
    }
  }

  console.log('✅ Seed complete — 14 days × 3 departures = 42 schedules')
  console.log('Admin:    admin@rwandabus.rw    / Admin@1234')
  console.log('Agent:    agent@rwandabus.rw    / Agent@1234')
  console.log('Customer: customer@rwandabus.rw / Customer@1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
