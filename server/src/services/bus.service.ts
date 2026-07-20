import { prisma } from '../config/prisma.js'

export async function listBuses() {
  return prisma.bus.findMany({ orderBy: { name: 'asc' } })
}

export async function createBus(data: {
  name: string
  plateNumber: string
  capacity: number
  imageUrl?: string
}) {
  const bus = await prisma.bus.create({ data })

  // Auto-create seats for the bus
  const seats = Array.from({ length: bus.capacity }, (_, i) => ({
    busId: bus.id,
    seatNumber: `S${i + 1}`,
  }))
  await prisma.seat.createMany({ data: seats, skipDuplicates: true })

  return bus
}

export async function updateBus(
  id: string,
  data: { name?: string; plateNumber?: string; capacity?: number; imageUrl?: string; isActive?: boolean }
) {
  return prisma.bus.update({ where: { id }, data })
}

export async function deactivateBus(id: string) {
  return prisma.bus.update({ where: { id }, data: { isActive: false } })
}
