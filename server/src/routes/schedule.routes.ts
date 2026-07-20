import { Router } from 'express'
import { getSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule } from '../controllers/schedule.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getSchedules)
router.get('/:id', getScheduleById)
router.post('/', authenticate, authorize('ADMIN', 'AGENT'), createSchedule)
router.put('/:id', authenticate, authorize('ADMIN', 'AGENT'), updateSchedule)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSchedule)

export default router
