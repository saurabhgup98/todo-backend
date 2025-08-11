# Todo Backend API

A robust Node.js backend API for the Todo application built with Express, MySQL, and Prisma ORM.

## 🛠 Technology Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/todo_app"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with test data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📊 Database Schema

### Users
- `id` - Unique identifier
- `email` - User email (unique)
- `name` - User display name
- `password` - Hashed password
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Tasks
- `id` - Unique identifier
- `title` - Task title
- `description` - Task description (optional)
- `priority` - HIGH, MEDIUM, LOW
- `status` - PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `dueDate` - Task due date (optional)
- `userId` - Foreign key to user
- `createdAt` - Task creation timestamp
- `updatedAt` - Last update timestamp

### Tags
- `id` - Unique identifier
- `name` - Tag name
- `color` - Tag color (hex)
- `userId` - Foreign key to user
- `createdAt` - Tag creation timestamp

### TaskTags (Junction Table)
- `taskId` - Foreign key to task
- `tagId` - Foreign key to tag

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Routes
Include the JWT token in the Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get specific task (protected)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Tags
- `GET /api/tags` - Get all tags (protected)
- `GET /api/tags/:id` - Get specific tag (protected)
- `POST /api/tags` - Create new tag (protected)
- `PUT /api/tags/:id` - Update tag (protected)
- `DELETE /api/tags/:id` - Delete tag (protected)

## 🔍 Query Parameters

### Tasks Endpoint
- `priority` - Filter by priority (HIGH, MEDIUM, LOW, all)
- `status` - Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED, all)
- `search` - Search in title and description
- `page` - Page number for pagination
- `limit` - Number of items per page

Example:
```http
GET /api/tasks?priority=HIGH&status=PENDING&search=project&page=1&limit=10
```

## 📝 Request/Response Examples

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish the client project proposal document",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "dueDate": "2024-02-15T00:00:00.000Z",
  "tagIds": ["tag1", "tag2"]
}
```

Response:
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "task_id",
    "title": "Complete project proposal",
    "description": "Finish the client project proposal document",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "userId": "user_id",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "tags": [
      {
        "id": "tag1",
        "name": "Work",
        "color": "#3B82F6"
      }
    ]
  }
}
```

### Get Tasks with Pagination
```http
GET /api/tasks?page=1&limit=5
Authorization: Bearer <token>
```

Response:
```json
{
  "tasks": [...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express-validator for all inputs
- **Rate Limiting**: Prevents abuse
- **CORS**: Configured for frontend
- **Helmet**: Security headers
- **SQL Injection Protection**: Prisma ORM

## 🧪 Testing

### Test Credentials
After running the seed script:
- **Email**: test@example.com
- **Password**: password123

### Health Check
```http
GET /health
```

## 📦 Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/todo_app"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

1. Set production environment variables
2. Run `npm run build` (if needed)
3. Start with `npm start`
4. Use PM2 or similar for process management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
