import { Router } from 'express'
import { verifyQrCode } from '../controllers/verify.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.post('/', authenticate, authorize('AGENT', 'ADMIN'), verifyQrCode)

export default router
