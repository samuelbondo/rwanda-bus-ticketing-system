import { Router } from 'express'
import { getSeatsBySchedule } from '../controllers/seat.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/:scheduleId', authenticate, getSeatsBySchedule)

export default router
