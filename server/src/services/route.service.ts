import { prisma } from '../config/prisma.js'

export async function listRoutes() {
  const routes = await prisma.route.findMany({
    include: { stops: { orderBy: { stopOrder: 'asc' } } },
    orderBy: { name: 'asc' },
  })

  // Attach coverImage from the next scheduled bus on each route
  const enriched = await Promise.all(
    routes.map(async (route) => {
      const next = await prisma.schedule.findFirst({
        where: { routeId: route.id, status: 'SCHEDULED', bus: { imageUrl: { not: null } } },
        orderBy: { departureTime: 'asc' },
        select: { bus: { select: { imageUrl: true, name: true } } },
      })
      return { ...route, coverImage: next?.bus.imageUrl ?? null, coverBusName: next?.bus.name ?? null }
    })
  )

  return enriched
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
