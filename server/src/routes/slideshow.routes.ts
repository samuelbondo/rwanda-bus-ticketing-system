import { Router } from 'express'
import {
  getPublicSlideshow,
  getConfig, updateConfig,
  getSlides, createSlide, updateSlide, deleteSlide,
} from '../controllers/slideshow.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.get('/', getPublicSlideshow)
router.get('/config', authenticate, authorize('ADMIN'), getConfig)
router.put('/config', authenticate, authorize('ADMIN'), updateConfig)
router.get('/slides', authenticate, authorize('ADMIN'), getSlides)
router.post('/slides', authenticate, authorize('ADMIN'), createSlide)
router.put('/slides/:id', authenticate, authorize('ADMIN'), updateSlide)
router.delete('/slides/:id', authenticate, authorize('ADMIN'), deleteSlide)

export default router
