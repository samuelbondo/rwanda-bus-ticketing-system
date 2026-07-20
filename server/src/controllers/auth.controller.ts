import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { registerSchema, loginSchema } from '../validators/auth.validator.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

function signToken(id: string, role: string) {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })
    return
  }

  const { name, email, password, phone } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ message: 'Email already registered' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, phone },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  })

  const token = signToken(user.id, user.role)
  sendWelcomeEmail(user.email, user.name).catch(() => {})
  res.status(201).json({ data: { user, token } })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() })
    return
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) {
    res.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ message: 'Invalid credentials' })
    return
  }

  const token = signToken(user.id, user.role)
  const { password: _, ...safeUser } = user
  res.json({ data: { user: safeUser, token } })
}

export function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out successfully' })
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
  })
  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  res.json({ data: user })
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, phone, avatarUrl } = req.body
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, phone, avatarUrl },
    select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
  })
  res.json({ data: user })
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    res.status(400).json({ message: 'currentPassword and newPassword are required' })
    return
  }
  if (newPassword.length < 8) {
    res.status(400).json({ message: 'New password must be at least 8 characters' })
    return
  }
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
  if (!user) { res.status(404).json({ message: 'User not found' }); return }
  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) { res.status(401).json({ message: 'Current password is incorrect' }); return }
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } })
  res.json({ message: 'Password changed successfully' })
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body
  if (!email) { res.status(400).json({ message: 'Email is required' }); return }

  const user = await prisma.user.findUnique({ where: { email } })
  // Always respond 200 to prevent email enumeration
  if (!user || !user.isActive) {
    res.json({ message: 'If that email exists, a reset link has been sent.' })
    return
  }

  const token = jwt.sign({ id: user.id, purpose: 'password-reset' }, env.JWT_SECRET, { expiresIn: '15m' } as jwt.SignOptions)
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`
  sendPasswordResetEmail(user.email, user.name, resetUrl).catch(() => {})
  res.json({ message: 'If that email exists, a reset link has been sent.' })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body
  if (!token || !password) { res.status(400).json({ message: 'Token and password are required' }); return }
  if (password.length < 8) { res.status(400).json({ message: 'Password must be at least 8 characters' }); return }

  let payload: { id: string; purpose: string }
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { id: string; purpose: string }
  } catch {
    res.status(400).json({ message: 'Reset link is invalid or has expired' })
    return
  }

  if (payload.purpose !== 'password-reset') {
    res.status(400).json({ message: 'Invalid reset token' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: payload.id }, data: { password: hashed } })
  res.json({ message: 'Password reset successfully. You can now log in.' })
}
