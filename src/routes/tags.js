import express from 'express'
import { 
  getTags, 
  getTag, 
  createTag, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController.js'
import { validateTag } from '../middleware/validation.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Tag routes
router.get('/', getTags)
router.get('/:id', getTag)
router.post('/', validateTag, createTag)
router.put('/:id', validateTag, updateTag)
router.delete('/:id', deleteTag)

export default router
