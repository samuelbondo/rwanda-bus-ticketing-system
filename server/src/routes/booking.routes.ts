import { Router } from 'express'
import { createBooking, getBookings, getBookingById, cancelBooking, downloadTicket } from '../controllers/booking.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.post('/', authorize('CUSTOMER'), createBooking)
router.get('/', getBookings)
router.get('/:id', getBookingById)
router.delete('/:id', authorize('CUSTOMER', 'ADMIN'), cancelBooking)
router.get('/:id/ticket', downloadTicket)

export default router
