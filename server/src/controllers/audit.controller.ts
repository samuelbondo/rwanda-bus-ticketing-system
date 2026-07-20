import { Request, Response } from 'express'
import { prisma } from '../config/prisma.js'

export async function getAuditLogs(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1)
  const limit = Number(req.query.limit ?? 20)

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ])

  res.json({ data: logs, total, page, limit, totalPages: Math.ceil(total / limit) })
}
