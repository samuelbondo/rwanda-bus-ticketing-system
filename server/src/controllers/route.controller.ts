import { Request, Response } from 'express'
import { createRouteSchema, updateRouteSchema } from '../validators/route.validator.js'
import * as routeService from '../services/route.service.js'

export async function getRoutes(_req: Request, res: Response) {
  const routes = await routeService.listRoutes()
  res.json({ data: routes })
}

export async function createRoute(req: Request, res: Response) {
  const parsed = createRouteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const route = await routeService.createRoute(parsed.data)
  res.status(201).json({ data: route })
}

export async function updateRoute(req: Request, res: Response) {
  const parsed = updateRouteSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const { stops: _stops, ...routeData } = parsed.data
  const route = await routeService.updateRoute(req.params.id as string, routeData)
  res.json({ data: route })
}

export async function deleteRoute(req: Request, res: Response) {
  await routeService.deactivateRoute(req.params.id as string)
  res.json({ message: 'Route deactivated' })
}
