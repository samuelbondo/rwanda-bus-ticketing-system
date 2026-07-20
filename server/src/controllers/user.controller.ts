import { Response } from 'express'
import * as userService from '../services/user.service.js'
import type { AuthRequest } from '../middlewares/auth.middleware.js'

export async function getUsers(_req: AuthRequest, res: Response) {
  const users = await userService.listUsers()
  res.json({ data: users })
}

export async function getUserById(req: AuthRequest, res: Response) {
  const user = await userService.findUserById(req.params.id as string)
  res.json({ data: user })
}

export async function createUser(req: AuthRequest, res: Response) {
  const { name, email, password, phone, role } = req.body
  if (!name || !email || !password) { res.status(400).json({ message: 'name, email and password are required' }); return }
  const user = await userService.createUser({ name, email, password, phone, role })
  res.status(201).json({ data: user })
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { name, email, phone, role, isActive, avatarUrl } = req.body
  const user = await userService.updateUser(req.params.id as string, { name, email, phone, role, isActive, avatarUrl })
  res.json({ data: user })
}

export async function deleteUser(req: AuthRequest, res: Response) {
  await userService.deactivateUser(req.params.id as string)
  res.json({ message: 'User deactivated' })
}

export async function resetPasswordManual(req: AuthRequest, res: Response) {
  const { newPassword } = req.body
  if (!newPassword || (newPassword as string).length < 8) { res.status(400).json({ message: 'newPassword must be at least 8 characters' }); return }
  await userService.adminResetPassword(req.params.id as string, newPassword as string, false)
  res.json({ message: 'Password reset successfully' })
}

export async function sendPasswordReset(req: AuthRequest, res: Response) {
  const { newPassword } = req.body
  if (!newPassword || (newPassword as string).length < 8) { res.status(400).json({ message: 'newPassword must be at least 8 characters' }); return }
  await userService.adminResetPassword(req.params.id as string, newPassword as string, true)
  res.json({ message: 'Password reset and email sent' })
}
