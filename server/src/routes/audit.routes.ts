import { Router } from 'express'
import { getAuditLogs } from '../controllers/audit.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), getAuditLogs)

export default router
