import { prisma } from '../config/prisma.js'

export async function log(params: {
  userId?: string
  action: string
  entity: string
  entityId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
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
