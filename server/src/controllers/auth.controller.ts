import { Request, Response } from 'express'
import { env } from '../config/env.js'
import { registerSchema, loginSchema } from '../validators/auth.validator.js'
import * as authService from '../services/auth.service.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }

  const user = await authService.registerUser(parsed.data)
  const token = authService.signToken(user.id, user.role)
  res.status(201).json({ data: { user, token } })
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() }); return }

  const user = await authService.loginUser(parsed.data.email, parsed.data.password)
  const token = authService.signToken(user.id, user.role)
  res.json({ data: { user, token } })
}

export function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out successfully' })
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await authService.getProfile(req.user!.id)
  res.json({ data: user })
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, phone, avatarUrl } = req.body
  const user = await authService.updateProfile(req.user!.id, { name, phone, avatarUrl })
  res.json({ data: user })
}

export async function changePassword(req: AuthRequest, res: Response) {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) { res.status(400).json({ message: 'currentPassword and newPassword are required' }); return }
  if (newPassword.length < 8) { res.status(400).json({ message: 'New password must be at least 8 characters' }); return }
  await authService.changePassword(req.user!.id, currentPassword, newPassword)
  res.json({ message: 'Password changed successfully' })
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body
  if (!email) { res.status(400).json({ message: 'Email is required' }); return }
  await authService.forgotPassword(email as string, env.CLIENT_URL)
  res.json({ message: 'If that email exists, a reset link has been sent.' })
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body
  if (!token || !password) { res.status(400).json({ message: 'Token and password are required' }); return }
  if ((password as string).length < 8) { res.status(400).json({ message: 'Password must be at least 8 characters' }); return }
  await authService.resetPassword(token as string, password as string)
  res.json({ message: 'Password reset successfully. You can now log in.' })
}
