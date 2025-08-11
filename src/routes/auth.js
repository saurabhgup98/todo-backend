import express from 'express'
import { register, login, getProfile } from '../controllers/authController.js'
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)

// Protected routes
router.get('/profile', authenticateToken, getProfile)

export default router
