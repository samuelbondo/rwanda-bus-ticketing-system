import { prisma } from '../config/prisma.js'

export async function log(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  await prisma.auditLog.create({ data: params })
}
