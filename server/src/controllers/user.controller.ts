import { Response } from 'express'
import { prisma } from '../config/prisma.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ data: users })
}

export async function getUserById(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
  })
  if (!user) { res.status(404).json({ message: 'User not found' }); return }
  res.json({ data: user })
}

export async function updateUser(req: AuthRequest, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body,
    select: { id: true, name: true, email: true, role: true, phone: true, isActive: true },
  })
  res.json({ data: user })
}

export async function deleteUser(req: AuthRequest, res: Response) {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } })
  res.json({ message: 'User deactivated' })
}
