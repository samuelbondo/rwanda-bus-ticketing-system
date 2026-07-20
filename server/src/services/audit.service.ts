import { prisma } from '../config/prisma.js'

export async function getAuditLogs(page: number, limit: number) {
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ])
  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) }
}
