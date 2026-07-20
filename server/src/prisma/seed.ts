import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('Admin@1234', 12)
  const customerPassword = await bcrypt.hash('Customer@1234', 12)
  const agentPassword = await bcrypt.hash('Agent@1234', 12)

  await prisma.user.upsert({
    where: { email: 'admin@rwandabus.rw' },
    update: { password: await bcrypt.hash('Admin123!', 12) },
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

  const bus = await prisma.bus.upsert({
    where: { plateNumber: 'RAB 001 A' },
    update: {},
    create: { name: 'Volcano Express 1', plateNumber: 'RAB 001 A', capacity: 30 },
  })

  const seatLabels = Array.from({ length: 30 }, (_, i) => `S${i + 1}`)
  for (const label of seatLabels) {
    await prisma.seat.upsert({
      where: { busId_seatNumber: { busId: bus.id, seatNumber: label } },
      update: {},
      create: { busId: bus.id, seatNumber: label },
    })
  }

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

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(7, 0, 0, 0)

  await prisma.schedule.create({
    data: {
      routeId: route.id,
      busId: bus.id,
      departureTime: tomorrow,
      price: 2000,
      availableSeats: bus.capacity,
    },
  })

  console.log('Seed complete')
  console.log('Admin:    admin@rwandabus.rw    / Admin@1234')
  console.log('Agent:    agent@rwandabus.rw    / Agent@1234')
  console.log('Customer: customer@rwandabus.rw / Customer@1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
