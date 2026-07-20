import { Router } from 'express'
import {
  getUsers, getUserById, createUser, updateUser, deleteUser,
  resetPasswordManual, sendPasswordReset,
} from '../controllers/user.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)
router.post('/:id/reset-password', resetPasswordManual)
router.post('/:id/send-password-reset', sendPasswordReset)

export default router
