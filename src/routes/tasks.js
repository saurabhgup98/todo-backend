import express from 'express'
import { 
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask 
} from '../controllers/taskController.js'
import { validateTask, validateTaskUpdate } from '../middleware/validation.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Task routes
router.get('/', getTasks)
router.get('/:id', getTask)
router.post('/', validateTask, createTask)
router.put('/:id', validateTaskUpdate, updateTask)
router.delete('/:id', deleteTask)

export default router
