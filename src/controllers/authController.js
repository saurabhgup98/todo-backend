import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'
import { generateToken } from '../middleware/auth.js'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://todo-backend-cff6.onrender.com/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google Strategy - Profile:', {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0]?.value
    })
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value }
    })

    if (!user) {
      console.log('Creating new user for Google OAuth')
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: profile.emails[0].value,
          name: profile.displayName,
          // Google OAuth users don't need password
          password: '', // You might want to handle this differently
          // You can add more fields from profile if needed
          // avatar: profile.photos[0]?.value,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      })
      console.log('New user created:', user)
    } else {
      console.log('Existing user found:', user)
    }

    return done(null, user)
  } catch (err) {
    console.error('Google Strategy error:', err)
    return done(err, null)
  }
}))

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

// Google OAuth login/register handler
export const handleGoogleAuth = async (req, res) => {
  try {
    // Generate JWT token for the authenticated user
    const token = generateToken(req.user.id)
    
    // Return user data and token
    res.json({
      message: 'Google authentication successful',
      user: req.user,
      token
    })
  } catch (error) {
    console.error('Google auth error:', error)
    res.status(500).json({
      message: 'Authentication failed'
    })
  }
}

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate token
    const token = generateToken(user.id)

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user.id)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}
