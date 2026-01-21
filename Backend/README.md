# 🐝 HiveHR Backend API

Complete Node.js/Express backend for HiveHR with Supabase integration.

## 🚀 Features

- ✅ **Authentication**: JWT-based auth with Supabase
- ✅ **Role-Based Access Control**: Admin, HR, Employee roles
- ✅ **Employee Management**: CRUD operations for employees
- ✅ **Attendance Tracking**: Check-in/out with location tracking
- ✅ **Leave Management**: Request, approve, reject leaves with balance tracking
- ✅ **Input Validation**: Joi schema validation
- ✅ **Error Handling**: Centralized error handling
- ✅ **Security**: Helmet, CORS, rate limiting
- ✅ **Logging**: Morgan HTTP request logging

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase project created
- npm or yarn package manager

## 🔧 Installation

1. **Navigate to Backend directory**:
```bash
cd Backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create `.env` file**:
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`:
```env
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

## 🏃 Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Documentation

Visit `http://localhost:5000/api` for complete API documentation.

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/register` | Admin | Register new user |
| POST | `/api/auth/logout` | Private | Logout user |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/refresh` | Public | Refresh token |
| POST | `/api/auth/change-password` | Private | Change password |

### Employee Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/employees` | HR/Admin | Get all employees |
| GET | `/api/employees/:id` | Private | Get employee by ID |
| POST | `/api/employees` | Admin | Create employee |
| PUT | `/api/employees/:id` | HR/Admin | Update employee |
| DELETE | `/api/employees/:id` | Admin | Delete employee |
| GET | `/api/employees/:id/stats` | Private | Get employee stats |

### Attendance Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/attendance/check-in` | Private | Check in |
| POST | `/api/attendance/check-out` | Private | Check out |
| GET | `/api/attendance/my-attendance` | Private | Get my attendance |
| GET | `/api/attendance/today` | Private | Get today's attendance |
| GET | `/api/attendance/all` | HR/Admin | Get all attendance |
| GET | `/api/attendance/employee/:userId` | HR/Admin | Get employee attendance |
| POST | `/api/attendance/manual` | HR/Admin | Create manual attendance |
| GET | `/api/attendance/stats` | HR/Admin | Get attendance stats |

### Leave Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/leaves` | Private | Create leave request |
| GET | `/api/leaves/my-leaves` | Private | Get my leaves |
| GET | `/api/leaves/balance` | Private | Get leave balance |
| GET | `/api/leaves/all` | HR/Admin | Get all leaves |
| PUT | `/api/leaves/:id/approve` | HR/Admin | Approve leave |
| PUT | `/api/leaves/:id/reject` | HR/Admin | Reject leave |
| DELETE | `/api/leaves/:id` | Private | Cancel leave |

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "profile": {...},
    "session": {
      "access_token": "...",
      "refresh_token": "..."
    }
  }
}
```

### Check In
```bash
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "check_in_location": {
    "lat": 19.0760,
    "lng": 72.8777,
    "address": "Mumbai, India"
  }
}
```

### Create Leave Request
```bash
POST /api/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "leave_type": "casual",
  "start_date": "2024-02-01",
  "end_date": "2024-02-03",
  "reason": "Family function",
  "emergency_contact": "+91 9876543210"
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: Admin, HR, Employee roles

## 📁 Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── supabase.js       # Supabase client configuration
│   │   └── constants.js      # App constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   └── leaveController.js
│   ├── middleware/
│   │   ├── auth.js           # Authentication middleware
│   │   ├── errorHandler.js   # Error handling
│   │   └── validator.js      # Input validation
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── leaveRoutes.js
│   └── server.js             # Main server file
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "errors": [...] // Optional validation errors
}
```

## 🔄 Connecting Frontend

Update your frontend to use the backend API:

```javascript
// In your frontend .env
VITE_API_URL=http://localhost:5000/api

// Example API call
const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ email, password })
});
```

## 📊 Health Check

```bash
GET /health
```

Response:
```json
{
  "success": true,
  "message": "HiveHR Backend API is running",
  "timestamp": "2024-01-21T09:00:00.000Z",
  "environment": "development"
}
```

## 🚨 Troubleshooting

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

### Supabase connection error
- Verify `SUPABASE_URL` and keys in `.env`
- Check Supabase project is active
- Ensure RLS policies are set up

## 📄 License

MIT

---

**Need help?** Check the main [HiveHR README](../README.md) or Supabase documentation.
