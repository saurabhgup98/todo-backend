import bcrypt from 'bcryptjs'
import prisma from '../config/database.js'

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword
      }
    })

    console.log('✅ User created:', user.email)

    // Create some tags
    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { 
          name_userId: { 
            name: 'Work', 
            userId: user.id 
          } 
        },
        update: {},
        create: {
          name: 'Work',
          color: '#3B82F6',
          userId: user.id
        }
      }),
      prisma.tag.upsert({
        where: { 
          name_userId: { 
            name: 'Personal', 
            userId: user.id 
          } 
        },
        update: {},
        create: {
          name: 'Personal',
          color: '#10B981',
          userId: user.id
        }
      }),
      prisma.tag.upsert({
        where: { 
          name_userId: { 
            name: 'Urgent', 
            userId: user.id 
          } 
        },
        update: {},
        create: {
          name: 'Urgent',
          color: '#EF4444',
          userId: user.id
        }
      })
    ])

    console.log('✅ Tags created:', tags.map(t => t.name))

    // Create some tasks
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          title: 'Complete project proposal',
          description: 'Finish the client project proposal document with all requirements',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dueDate: new Date('2024-02-15'),
          userId: user.id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Review code changes',
          description: 'Review pull requests for the main branch and provide feedback',
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: new Date('2024-02-20'),
          userId: user.id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Update documentation',
          description: 'Update API documentation with new endpoints and examples',
          priority: 'LOW',
          status: 'COMPLETED',
          dueDate: new Date('2024-02-08'),
          userId: user.id
        }
      }),
      prisma.task.create({
        data: {
          title: 'Plan team meeting',
          description: 'Schedule and prepare agenda for weekly team meeting',
          priority: 'MEDIUM',
          status: 'PENDING',
          dueDate: new Date('2024-02-12'),
          userId: user.id
        }
      })
    ])

    console.log('✅ Tasks created:', tasks.map(t => t.title))

    // Add tags to tasks
    await Promise.all([
      // Task 1: Work + Urgent
      prisma.taskTag.createMany({
        data: [
          { taskId: tasks[0].id, tagId: tags[0].id }, // Work
          { taskId: tasks[0].id, tagId: tags[2].id }  // Urgent
        ]
      }),
      // Task 2: Work
      prisma.taskTag.createMany({
        data: [
          { taskId: tasks[1].id, tagId: tags[0].id } // Work
        ]
      }),
      // Task 3: Personal
      prisma.taskTag.createMany({
        data: [
          { taskId: tasks[2].id, tagId: tags[1].id } // Personal
        ]
      }),
      // Task 4: Work
      prisma.taskTag.createMany({
        data: [
          { taskId: tasks[3].id, tagId: tags[0].id } // Work
        ]
      })
    ])

    console.log('✅ Task tags created')

    console.log('🎉 Database seeded successfully!')
    console.log('\n📋 Test Credentials:')
    console.log('Email: test@example.com')
    console.log('Password: password123')
    console.log('\n🔗 API Endpoints:')
    console.log('POST http://localhost:5000/api/auth/login')
    console.log('GET  http://localhost:5000/api/tasks')
    console.log('GET  http://localhost:5000/api/tags')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
