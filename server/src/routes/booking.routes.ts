import { Router } from 'express'
import { createBooking, confirmPayment, getBookings, getBookingById, cancelBooking, downloadTicket, getManifest, markDeparted } from '../controllers/booking.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)

// Manifest routes MUST come before /:id to avoid Express swallowing them
router.get('/manifest/:scheduleId', authorize('AGENT', 'ADMIN'), getManifest)
router.post('/manifest/:scheduleId/depart', authorize('AGENT', 'ADMIN'), markDeparted)

router.post('/', authorize('CUSTOMER'), createBooking)
router.post('/:id/pay', authorize('CUSTOMER'), confirmPayment)
router.get('/', getBookings)
router.get('/:id', getBookingById)
router.delete('/:id', authorize('CUSTOMER', 'ADMIN'), cancelBooking)
router.get('/:id/ticket', downloadTicket)

export default router
