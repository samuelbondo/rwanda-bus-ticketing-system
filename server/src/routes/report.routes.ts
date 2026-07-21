import { Router } from 'express'
import { getReports, exportReport, getBookingsReport, getUsersReport, getRevenueReport } from '../controllers/report.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/', getReports)
router.get('/export', exportReport)
router.get('/bookings', getBookingsReport)
router.get('/users', getUsersReport)
router.get('/revenue', getRevenueReport)

export default router
