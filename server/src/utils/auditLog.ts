import { prisma } from '../config/prisma.js'

export async function log(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  const { userId, ...rest } = params
  await prisma.auditLog.create({
    data: {
      ...rest,
      ...(userId ? { user: { connect: { id: userId } } } : {}),
    },
  })
}
