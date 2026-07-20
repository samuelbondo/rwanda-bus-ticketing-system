import { prisma } from '../config/prisma.js'

export async function listRoutes() {
  return prisma.route.findMany({
    include: { stops: { orderBy: { stopOrder: 'asc' } } },
    orderBy: { name: 'asc' },
  })
}

export async function createRoute(data: {
  name: string
  origin: string
  destination: string
  distanceKm?: number
  basePrice: number
  stops?: { name: string; stopOrder: number; priceFromOrigin: number }[]
}) {
  const { stops, ...routeData } = data
  return prisma.route.create({
    data: { ...routeData, stops: stops ? { create: stops } : undefined },
    include: { stops: { orderBy: { stopOrder: 'asc' } } },
  })
}

export async function updateRoute(
  id: string,
  data: { name?: string; origin?: string; destination?: string; distanceKm?: number; basePrice?: number; isActive?: boolean }
) {
  return prisma.route.update({ where: { id }, data })
}

export async function deactivateRoute(id: string) {
  return prisma.route.update({ where: { id }, data: { isActive: false } })
}
