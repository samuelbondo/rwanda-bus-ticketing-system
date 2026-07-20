import { Router } from 'express'
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../controllers/route.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getRoutes)
router.post('/', authenticate, authorize('ADMIN'), createRoute)
router.put('/:id', authenticate, authorize('ADMIN'), updateRoute)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoute)

export default router
