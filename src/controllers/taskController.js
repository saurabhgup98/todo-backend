import prisma from '../config/database.js'

export const getTasks = async (req, res) => {
  try {
    const { 
      priority, 
      status, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query

    const userId = req.user.id
    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      userId,
      ...(priority && priority !== 'all' && { priority }),
      ...(status && status !== 'all' && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    }

    // Get tasks with tags
    const tasks = await prisma.task.findMany({
      where,
      include: {
        taskTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    })

    // Get total count
    const total = await prisma.task.count({ where })

    // Transform tasks to include tags array
    const transformedTasks = tasks.map(task => ({
      ...task,
      tags: task.taskTags.map(tt => tt.tag),
      taskTags: undefined
    }))

    res.json({
      tasks: transformedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const getTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId
      },
      include: {
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    })

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    // Transform task to include tags array
    const transformedTask = {
      ...task,
      tags: task.taskTags.map(tt => tt.tag),
      taskTags: undefined
    }

    res.json({
      task: transformedTask
    })
  } catch (error) {
    console.error('Get task error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, tagIds } = req.body
    const userId = req.user.id

    // Create task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId
      }
    })

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const taskTags = tagIds.map(tagId => ({
        taskId: task.id,
        tagId
      }))

      await prisma.taskTag.createMany({
        data: taskTags
      })
    }

    // Get task with tags
    const taskWithTags = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform task to include tags array
    const transformedTask = {
      ...taskWithTags,
      tags: taskWithTags.taskTags.map(tt => tt.tag),
      taskTags: undefined
    }

    res.status(201).json({
      message: 'Task created successfully',
      task: transformedTask
    })
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, priority, status, dueDate, tagIds } = req.body
    const userId = req.user.id

    console.log('Update task request:', {
      taskId: id,
      userId,
      body: req.body,
      filteredData: { title, description, priority, status, dueDate, tagIds }
    })

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!existingTask) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await prisma.taskTag.deleteMany({
        where: { taskId: id }
      })

      // Add new tags
      if (tagIds.length > 0) {
        const taskTags = tagIds.map(tagId => ({
          taskId: id,
          tagId
        }))

        await prisma.taskTag.createMany({
          data: taskTags
        })
      }
    }

    // Get updated task with tags
    const taskWithTags = await prisma.task.findUnique({
      where: { id },
      include: {
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    })

    // Transform task to include tags array
    const transformedTask = {
      ...taskWithTags,
      tags: taskWithTags.taskTags.map(tt => tt.tag),
      taskTags: undefined
    }

    console.log('Task updated successfully:', transformedTask.id)
    res.json({
      message: 'Task updated successfully',
      task: transformedTask
    })
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    // Delete task (cascade will handle taskTags)
    await prisma.task.delete({
      where: { id }
    })

    res.json({
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({
      message: 'Internal server error'
    })
  }
}
