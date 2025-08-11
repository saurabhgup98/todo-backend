import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'
import tagRoutes from './routes/tags.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    message: 'Too many requests from this IP, please try again later.'
  }
})

// More lenient rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per 15 minutes
  message: {
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true // Don't count successful requests
})

// Middleware
app.use(helmet()) // Security headers
app.use(compression()) // Compress responses
app.use(morgan('combined')) // Logging
app.use(limiter) // Rate limiting
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/tags', tagRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  })
})

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error)
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON'
    })
  }
  
  res.status(500).json({
    message: 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})
