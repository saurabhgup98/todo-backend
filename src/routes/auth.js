import express from 'express'
import { body } from 'express-validator'
import { register, login, getProfile, handleGoogleAuth } from '../controllers/authController.js'
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js'
import { authenticateToken } from '../middleware/auth.js'
import passport from 'passport'

const router = express.Router()

// Regular auth routes
router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  handleGoogleAuth
)

// Protected routes
router.get('/profile', authenticateToken, getProfile)

export default router
