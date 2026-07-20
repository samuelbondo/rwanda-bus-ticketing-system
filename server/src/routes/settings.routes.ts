import { Router } from 'express'
import { getPublicSettings, getSettings, updateSettings } from '../controllers/settings.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/public', getPublicSettings)
router.get('/', authenticate, authorize('ADMIN'), getSettings)
router.put('/', authenticate, authorize('ADMIN'), updateSettings)

export default router
