import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js'
import { env } from '../config/env.js'
import { sendAccountSuspendedEmail, sendPasswordResetByAdminEmail, sendPasswordResetEmail } from '../utils/email.js'
import type { Role } from '@prisma/client'

const userSelect = {
  id: true, name: true, email: true, role: true, phone: true,
  avatarUrl: true, isActive: true, createdAt: true,
}

export async function listUsers() {
  return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } })
}

export async function findUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
  return user
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  phone?: string
  role?: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw Object.assign(new Error('Email already registered'), { status: 409 })

  const hashed = await bcrypt.hash(data.password, 12)
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      phone: data.phone,
      role: (data.role as 'CUSTOMER' | 'AGENT' | 'ADMIN') ?? 'CUSTOMER',
    },
    select: userSelect,
  })
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; phone?: string; role?: Role; isActive?: boolean; avatarUrl?: string }
) {
  return prisma.user.update({ where: { id }, data, select: userSelect })
}

export async function deactivateUser(id: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: { name: true, email: true },
  })
  sendAccountSuspendedEmail(user.email, user.name).catch(() => {})
}

export async function adminSendResetLink(id: string, clientUrl: string) {
  const user = await prisma.user.findUnique({ where: { id }, select: { name: true, email: true, isActive: true } })
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
  const token = jwt.sign(
    { id, purpose: 'password-reset' },
    env.JWT_SECRET,
    { expiresIn: '15m' } as jwt.SignOptions
  )
  const resetUrl = `${clientUrl}/reset-password?token=${token}`
  await sendPasswordResetEmail(user.email, user.name, resetUrl)
}

export async function adminResetPassword(id: string, newPassword: string, notify: boolean) {
  const hashed = await bcrypt.hash(newPassword, 12)
  const user = await prisma.user.update({
    where: { id },
    data: { password: hashed },
    select: { name: true, email: true },
  })
  if (notify) sendPasswordResetByAdminEmail(user.email, user.name, newPassword).catch(() => {})
}
