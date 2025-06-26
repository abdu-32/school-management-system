# School Management System - MEAN Stack

A comprehensive school management system built with MongoDB, Express.js, Angular, and Node.js, featuring role-based access control (RBAC) for Admin, Teacher, and Student roles.

## Features

### Admin Features
- ✅ Add & manage teachers
- ✅ Add & manage students  
- ✅ Add & manage subjects
- ✅ Add & manage grades/classes
- ✅ Assign grades to teachers & students

### Teacher Features
- ✅ Assign marks to students for various subjects
- ✅ View assigned students & their grades
- ✅ Manage marks for assigned subjects

### Student Features
- ✅ View their own grades & marks
- ✅ Only see marks related to enrolled subjects

### Technical Features
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ RESTful API design
- ✅ Input validation and error handling
- ✅ MongoDB with Mongoose ODM
- ✅ Secure password hashing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd school-management-system
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Environment Configuration
Create a `.env` file in the root directory:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
\`\`\`

4. Start MongoDB
Make sure MongoDB is running on your system.

5. Run the application
\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users Management
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/role/teachers` - Get all teachers (Admin only)
- `GET /api/users/role/students` - Get all students (Admin/Teacher)

### Subjects Management
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Grades Management
- `GET /api/grades` - Get all grades
- `GET /api/grades/:id` - Get grade by ID
- `POST /api/grades` - Create grade (Admin only)
- `PUT /api/grades/:id` - Update grade (Admin only)
- `DELETE /api/grades/:id` - Delete grade (Admin only)
- `POST /api/grades/:id/students` - Add student to grade (Admin only)

### Marks Management
- `GET /api/marks` - Get marks (role-based access)
- `GET /api/marks/student/:studentId` - Get marks by student
- `POST /api/marks` - Create mark (Teacher/Admin)
- `PUT /api/marks/:id` - Update mark (Teacher/Admin)
- `DELETE /api/marks/:id` - Delete mark (Teacher/Admin)

## Database Schema

### Users Collection
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/teacher/student),
  studentId: String (optional, unique),
  teacherId: String (optional, unique),
  assignedSubjects: [ObjectId],
  assignedGrades: [ObjectId],
  enrolledGrade: ObjectId
}
\`\`\`

### Subjects Collection
\`\`\`javascript
{
  name: String,
  code: String (unique),
  description: String,
  teacher: ObjectId,
  grades: [ObjectId]
}
\`\`\`

### Grades Collection
\`\`\`javascript
{
  name: String,
  level: Number,
  section: String,
  students: [ObjectId],
  subjects: [ObjectId],
  classTeacher: ObjectId
}
\`\`\`

### Marks Collection
\`\`\`javascript
{
  student: ObjectId,
  subject: ObjectId,
  grade: ObjectId,
  teacher: ObjectId,
  marks: Number (0-100),
  examType: String (quiz/midterm/final/assignment),
  examDate: Date,
  remarks: String
}
\`\`\`

## Role-Based Access Control

### Admin
- Full access to all endpoints
- Can manage users, subjects, grades, and marks
- Can view all data across the system

### Teacher
- Can assign and manage marks for their subjects
- Can view students assigned to their grades
- Cannot manage users or system configuration

### Student
- Can only view their own marks and grades
- Cannot modify any data
- Limited to personal academic information

## Testing

### Sample API Requests

1. **Register Admin**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "admin"
  }'
\`\`\`

2. **Login**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
\`\`\`

3. **Create Subject (with token)**
\`\`\`bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Mathematics",
    "code": "MATH101",
    "description": "Basic Mathematics"
  }'
\`\`\`

## Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
JWT_SECRET=your_very_secure_jwt_secret_key
\`\`\`

### Deployment Platforms
- **Render**: Easy deployment with automatic builds
- **Heroku**: Classic platform with good MongoDB integration
- **Railway**: Modern deployment platform
- **DigitalOcean App Platform**: Scalable deployment option

## Security Features

1. **Password Hashing**: Using bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Input Validation**: Express-validator for request validation
4. **Role-based Authorization**: Middleware-based access control
5. **CORS Protection**: Configured for cross-origin requests
6. **Environment Variables**: Sensitive data protection

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database operation errors
- Proper HTTP status codes
- Consistent error response format

## Future Enhancements

- [ ] Email notifications for grade updates
- [ ] File upload for assignments
- [ ] Attendance tracking
- [ ] Report generation (PDF)
- [ ] Real-time notifications
- [ ] Mobile app support
- [ ] Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
