import { Router } from 'express'
import { getBuses, createBus, updateBus, deleteBus } from '../controllers/bus.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getBuses)
router.post('/', authenticate, authorize('ADMIN'), createBus)
router.put('/:id', authenticate, authorize('ADMIN'), updateBus)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteBus)

export default router
