import { Router } from 'express'
import { getReports, exportReport } from '../controllers/report.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/', getReports)
router.get('/export', exportReport)

export default router
