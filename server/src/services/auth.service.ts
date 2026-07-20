import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js'

export function signToken(id: string, role: string): string {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions)
}

export async function registerUser(data: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 })

  const hashed = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed, phone: data.phone },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  })

  sendWelcomeEmail(user.email, user.name).catch((err) => {
    console.error('[email] Failed to send welcome email to', user.email, ':', err?.message ?? err)
  })
  return user
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) throw Object.assign(new Error('Invalid credentials'), { status: 401 })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 })

  const { password: _, ...safeUser } = user
  return safeUser
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
  })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
  return user
}

export async function updateProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
  })
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw Object.assign(new Error('Current password is incorrect'), { status: 401 })

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
}

export async function forgotPassword(email: string, clientUrl: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isActive) return // silent — prevent enumeration

  const token = jwt.sign(
    { id: user.id, purpose: 'password-reset' },
    env.JWT_SECRET,
    { expiresIn: '15m' } as jwt.SignOptions
  )
  const resetUrl = `${clientUrl}/reset-password?token=${token}`
  sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) => {
    console.error('[email] Failed to send password reset to', user.email, ':', err?.message ?? err)
  })
}

export async function resetPassword(token: string, password: string) {
  let payload: { id: string; purpose: string }
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as { id: string; purpose: string }
  } catch {
    throw Object.assign(new Error('Reset link is invalid or has expired'), { status: 400 })
  }

  if (payload.purpose !== 'password-reset') {
    throw Object.assign(new Error('Invalid reset token'), { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)
  await prisma.user.update({ where: { id: payload.id }, data: { password: hashed } })
}
