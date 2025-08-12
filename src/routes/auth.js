import express from 'express'
import { body } from 'express-validator'
import { register, login, getProfile, handleGoogleAuth } from '../controllers/authController.js'
import { validateUserRegistration, validateUserLogin } from '../middleware/validation.js'
import { authenticateToken, generateToken } from '../middleware/auth.js'
import passport from 'passport'

const router = express.Router()

// Regular auth routes
router.post('/register', validateUserRegistration, register)
router.post('/login', validateUserLogin, login)

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'https://todo-frontend-beta-three-78.vercel.app/login?error=auth_failed' 
  }),
  (req, res) => {
    try {
      console.log('Google OAuth callback - User:', req.user)
      console.log('Google OAuth callback - Session:', req.session)
      
      if (!req.user || !req.user.id) {
        console.error('No user data available in callback')
        return res.redirect('https://todo-frontend-beta-three-78.vercel.app/login?error=no_user_data')
      }
      
      // Generate JWT token
      const token = generateToken(req.user.id)
      console.log('Generated token for user:', req.user.id)
      
      // Redirect to frontend with token as query parameter
      const redirectUrl = `https://todo-frontend-beta-three-78.vercel.app?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`
      console.log('Redirecting to:', redirectUrl)
      res.redirect(redirectUrl)
    } catch (error) {
      console.error('Google auth callback error:', error)
      res.redirect('https://todo-frontend-beta-three-78.vercel.app/login?error=auth_failed')
    }
  }
)

// Protected routes
router.get('/profile', authenticateToken, getProfile)

export default router
