import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { createRouteSchema, updateRouteSchema } from '../validators/route.validator.js'

export async function getRoutes(_req: Request, res: Response) {
  const routes = await prisma.route.findMany({
    include: { stops: { orderBy: { stopOrder: 'asc' } } },
    orderBy: { name: 'asc' },
  })
  res.json({ data: routes })
}

export async function createRoute(req: Request, res: Response) {
  const parsed = createRouteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { stops, ...routeData } = parsed.data
  const route = await prisma.route.create({
    data: { ...routeData, stops: stops ? { create: stops } : undefined },
    include: { stops: { orderBy: { stopOrder: 'asc' } } },
  })
  res.status(201).json({ data: route })
}

export async function updateRoute(req: Request, res: Response) {
  const parsed = updateRouteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { stops: _stops, ...routeData } = parsed.data
  const route = await prisma.route.update({ where: { id: req.params.id }, data: routeData })
  res.json({ data: route })
}

export async function deleteRoute(req: Request, res: Response) {
  await prisma.route.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ message: 'Route deactivated' })
}
