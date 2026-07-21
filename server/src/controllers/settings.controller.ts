import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { z } from 'zod'

const updateSchema = z.object({
  siteName:           z.string().min(1).optional(),
  supportPhone:       z.string().optional(),
  supportEmail:       z.string().email().optional(),
  supportAddress:     z.string().optional(),
  whatsappNumber:     z.string().optional(),
  whatsappMessage:    z.string().optional(),
  whatsappEnabled:    z.boolean().optional(),
  maintenanceMode:    z.boolean().optional(),
  maintenanceMessage: z.string().optional(),
  geminiApiKey:       z.string().optional(),
  aiModel:            z.string().optional(),
  aiEnabled:          z.boolean().optional(),
  aiWelcomeMessage:   z.string().optional(),
  facebookUrl:        z.string().optional(),
  twitterUrl:         z.string().optional(),
  instagramUrl:       z.string().optional(),
})

async function getOrCreate() {
  return prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  })
}

// GET /api/settings/public — no auth, safe fields only
export async function getPublicSettings(_req: Request, res: Response) {
  const s = await getOrCreate()
  res.json({
    data: {
      siteName:           s.siteName,
      supportPhone:       s.supportPhone,
      supportEmail:       s.supportEmail,
      supportAddress:     s.supportAddress,
      whatsappNumber:     s.whatsappNumber,
      whatsappMessage:    s.whatsappMessage,
      whatsappEnabled:    s.whatsappEnabled,
      maintenanceMode:    s.maintenanceMode,
      maintenanceMessage: s.maintenanceMessage,
      aiEnabled:          s.aiEnabled,
      aiWelcomeMessage:   s.aiWelcomeMessage,
      facebookUrl:        s.facebookUrl,
      twitterUrl:         s.twitterUrl,
      instagramUrl:       s.instagramUrl,
    },
  })
}

// GET /api/settings — admin only, full settings including API key
export async function getSettings(_req: Request, res: Response) {
  const s = await getOrCreate()
  res.json({ data: s })
}

// PUT /api/settings — admin only
export async function updateSettings(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })
    return
  }
  const s = await prisma.platformSettings.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...parsed.data },
    update: parsed.data,
  })
  res.json({ data: s })
}
