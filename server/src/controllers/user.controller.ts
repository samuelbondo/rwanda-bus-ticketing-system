import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma.js'
import { sendAccountSuspendedEmail, sendPasswordResetByAdminEmail } from '../utils/email.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

const userSelect = {
  id: true, name: true, email: true, role: true, phone: true,
  avatarUrl: true, isActive: true, createdAt: true,
}

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } })
  res.json({ data: users })
}

export async function getUserById(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.params.id as string }, select: userSelect })
  if (!user) { res.status(404).json({ message: 'User not found' }); return }
  res.json({ data: user })
}

export async function createUser(req: AuthRequest, res: Response) {
  const { name, email, password, phone, role } = req.body
  if (!name || !email || !password) {
    res.status(400).json({ message: 'name, email and password are required' }); return
  }
  const existing = await prisma.user.findUnique({ where: { email: email as string } })
  if (existing) { res.status(409).json({ message: 'Email already registered' }); return }
  const hashed = await bcrypt.hash(password as string, 12)
  const user = await prisma.user.create({
    data: { name: name as string, email: email as string, password: hashed, phone: phone as string | undefined, role: role ?? 'CUSTOMER' },
    select: userSelect,
  })
  res.status(201).json({ data: user })
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { name, email, phone, role, isActive, avatarUrl } = req.body
  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { name, email, phone, role, isActive, avatarUrl },
    select: userSelect,
  })
  res.json({ data: user })
}

export async function deleteUser(req: AuthRequest, res: Response) {
  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { isActive: false },
    select: { name: true, email: true },
  })
  sendAccountSuspendedEmail(user.email, user.name).catch(() => {})
  res.json({ message: 'User deactivated' })
}

export async function resetPasswordManual(req: AuthRequest, res: Response) {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ message: 'newPassword must be at least 8 characters' }); return
  }
  const hashed = await bcrypt.hash(newPassword as string, 12)
  await prisma.user.update({ where: { id: req.params.id as string }, data: { password: hashed } })
  res.json({ message: 'Password reset successfully' })
}

export async function sendPasswordReset(req: AuthRequest, res: Response) {
  const { newPassword } = req.body
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ message: 'newPassword must be at least 8 characters' }); return
  }
  const hashed = await bcrypt.hash(newPassword as string, 12)
  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { password: hashed },
    select: { name: true, email: true },
  })
  sendPasswordResetByAdminEmail(user.email, user.name, newPassword).catch(() => {})
  res.json({ message: 'Password reset and email sent' })
}
