import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { z } from 'zod'

const configSchema = z.object({
  source: z.enum(['CUSTOM', 'BUSES', 'ROUTES']).optional(),
  interval: z.coerce.number().int().min(1000).max(30000).optional(),
})

const slideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  imageUrl: z.string().url(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/slideshow  — public, returns resolved slides based on config
export async function getPublicSlideshow(_req: Request, res: Response) {
  const config = await prisma.slideshowConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', source: 'CUSTOM', interval: 5000 },
    update: {},
  })

  let slides: { id: string; title: string; subtitle?: string | null; imageUrl: string }[] = []

  if (config.source === 'BUSES') {
    const buses = await prisma.bus.findMany({
      where: { isActive: true, imageUrl: { not: null } },
      orderBy: { createdAt: 'asc' },
      take: 5,
    })
    slides = buses.map((b) => ({ id: b.id, title: b.name, subtitle: `${b.capacity} seats`, imageUrl: b.imageUrl! }))
  } else if (config.source === 'ROUTES') {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      take: 5,
    })
    slides = routes.map((r) => ({
      id: r.id,
      title: `${r.origin} → ${r.destination}`,
      subtitle: `From RWF ${Number(r.basePrice).toLocaleString()}`,
      imageUrl: '',
    }))
  } else {
    const custom = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    })
    slides = custom
  }

  res.json({ data: { config, slides } })
}

// GET /api/slideshow/config  — admin
export async function getConfig(_req: Request, res: Response) {
  const config = await prisma.slideshowConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', source: 'CUSTOM', interval: 5000 },
    update: {},
  })
  res.json({ data: config })
}

// PUT /api/slideshow/config  — admin
export async function updateConfig(req: Request, res: Response) {
  const parsed = configSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const config = await prisma.slideshowConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...parsed.data },
    update: parsed.data,
  })
  res.json({ data: config })
}

// GET /api/slideshow/slides  — admin
export async function getSlides(_req: Request, res: Response) {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: 'asc' } })
  res.json({ data: slides })
}

// POST /api/slideshow/slides  — admin
export async function createSlide(req: Request, res: Response) {
  const parsed = slideSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const slide = await prisma.heroSlide.create({ data: parsed.data })
  res.status(201).json({ data: slide })
}

// PUT /api/slideshow/slides/:id  — admin
export async function updateSlide(req: Request, res: Response) {
  const parsed = slideSchema.partial().safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }
  const slide = await prisma.heroSlide.update({ where: { id: req.params.id as string }, data: parsed.data })
  res.json({ data: slide })
}

// DELETE /api/slideshow/slides/:id  — admin
export async function deleteSlide(req: Request, res: Response) {
  await prisma.heroSlide.delete({ where: { id: req.params.id as string } })
  res.json({ message: 'Slide deleted' })
}
