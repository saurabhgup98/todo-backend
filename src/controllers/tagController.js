import prisma from '../config/database.js'

export const getTags = async (req, res) => {
  try {
    const userId = req.user.id

    const tags = await prisma.tag.findMany({
      where: { userId },
      orderBy: {
        name: 'asc'
      }
    })

    res.json({
      tags
    })
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const getTag = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const tag = await prisma.tag.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!tag) {
      return res.status(404).json({
        message: 'Tag not found'
      })
    }

    res.json({
      tag
    })
  } catch (error) {
    console.error('Get tag error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body
    const userId = req.user.id

    // Check if tag with same name already exists for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        name,
        userId
      }
    })

    if (existingTag) {
      return res.status(400).json({
        message: 'Tag with this name already exists'
      })
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId
      }
    })

    res.status(201).json({
      message: 'Tag created successfully',
      tag
    })
  } catch (error) {
    console.error('Create tag error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params
    const { name, color } = req.body
    const userId = req.user.id

    // Check if tag exists and belongs to user
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingTag) {
      return res.status(404).json({
        message: 'Tag not found'
      })
    }

    // Check if new name conflicts with existing tag
    if (name && name !== existingTag.name) {
      const conflictingTag = await prisma.tag.findFirst({
        where: {
          name,
          userId,
          id: { not: id }
        }
      })

      if (conflictingTag) {
        return res.status(400).json({
          message: 'Tag with this name already exists'
        })
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        color
      }
    })

    res.json({
      message: 'Tag updated successfully',
      tag
    })
  } catch (error) {
    console.error('Update tag error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if tag exists and belongs to user
    const tag = await prisma.tag.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!tag) {
      return res.status(404).json({
        message: 'Tag not found'
      })
    }

    // Delete tag (cascade will handle taskTags)
    await prisma.tag.delete({
      where: { id }
    })

    res.json({
      message: 'Tag deleted successfully'
    })
  } catch (error) {
    console.error('Delete tag error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}
