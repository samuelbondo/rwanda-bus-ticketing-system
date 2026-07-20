import { Router } from 'express'
import { register, login, logout, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/profile', authenticate, getProfile)
router.put('/profile', authenticate, updateProfile)
router.put('/change-password', authenticate, changePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router
