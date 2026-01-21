# 🏗️ HiveHR Backend Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:5173                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS Requests
                             │ (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                      │
│                     http://localhost:5000                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE LAYER                       │  │
│  │  • CORS           • Helmet (Security)                     │  │
│  │  • Rate Limiting  • Body Parser                           │  │
│  │  • Authentication • Validation (Joi)                      │  │
│  │  • Error Handler  • Logging (Morgan)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     ROUTES LAYER                          │  │
│  │  • /api/auth       • /api/employees                       │  │
│  │  • /api/attendance • /api/leaves                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  CONTROLLERS LAYER                        │  │
│  │  • authController.js                                      │  │
│  │  • employeeController.js                                  │  │
│  │  • attendanceController.js                                │  │
│  │  • leaveController.js                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  SUPABASE CLIENT                          │  │
│  │  • Anon Client (RLS-protected)                            │  │
│  │  • Admin Client (Bypass RLS)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Supabase SDK
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE (Backend)                          │
│                  https://xxx.supabase.co                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL Database                      │  │
│  │  • profiles         • departments                         │  │
│  │  • attendance       • leaves                              │  │
│  │  • leave_balance    • notifications                       │  │
│  │  • performance_reviews • kpis • files                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                     │  │
│  │  • User can only see their own data                       │  │
│  │  • HR/Admin can see all data                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Authentication                           │  │
│  │  • JWT Token Generation                                   │  │
│  │  • Session Management                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Storage                               │  │
│  │  • employee-files bucket                                  │  │
│  │  • Profile pictures, documents                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### Example: Employee Check-In

```
1. Employee clicks "Check In" button
   ↓
2. Frontend calls: POST /api/attendance/check-in
   Headers: { Authorization: Bearer <token> }
   Body: { check_in_location: { lat, lng } }
   ↓
3. Backend receives request
   ↓
4. Middleware processes:
   • CORS check ✓
   • Rate limit check ✓
   • Authentication (verify JWT) ✓
   • Validation (check body schema) ✓
   ↓
5. Route matches: POST /attendance/check-in
   ↓
6. Controller: attendanceController.checkIn()
   • Extract user ID from req.profile
   • Check if already checked in today
   • Calculate if late
   • Insert attendance record via Supabase
   ↓
7. Supabase:
   • Validate RLS policies
   • Insert into attendance table
   • Auto-calculate total_hours (trigger)
   • Return inserted record
   ↓
8. Controller sends response
   ↓
9. Frontend receives:
   {
     "success": true,
     "message": "Checked in successfully",
     "data": { attendance record }
   }
   ↓
10. UI updates: Show "Checked In" status
```

## 🔐 Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │
     │ POST /api/auth/login
     │ { email, password }
     ▼
┌──────────────────┐
│  Auth Controller │
│                  │
│ 1. Verify with   │
│    Supabase Auth │
│ 2. Get user      │
│    profile       │
│ 3. Check status  │
└────┬─────────────┘
     │
     │ Return JWT token
     │ + user data
     ▼
┌──────────────────┐
│   Frontend       │
│                  │
│ Store token in:  │
│ • localStorage   │
│ • sessionStorage │
└────┬─────────────┘
     │
     │ All subsequent requests
     │ include token in header
     ▼
┌──────────────────┐
│  Auth Middleware │
│                  │
│ 1. Extract token │
│ 2. Verify with   │
│    Supabase      │
│ 3. Get profile   │
│ 4. Attach to req │
└──────────────────┘
```

## 📁 File Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Supabase client setup
│   │   └── constants.js         # App constants
│   │
│   ├── controllers/
│   │   ├── authController.js    # Auth operations
│   │   ├── employeeController.js # Employee CRUD
│   │   ├── attendanceController.js # Attendance tracking
│   │   └── leaveController.js   # Leave management
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & RBAC
│   │   ├── errorHandler.js      # Global error handling
│   │   └── validator.js         # Joi validation schemas
│   │
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── employeeRoutes.js    # Employee endpoints
│   │   ├── attendanceRoutes.js  # Attendance endpoints
│   │   └── leaveRoutes.js       # Leave endpoints
│   │
│   └── server.js                # Main Express app
│
├── .env                         # Environment variables
├── .env.example                 # Env template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # Setup instructions
├── QUICK_REFERENCE.md          # Quick API reference
└── HiveHR_API.postman_collection.json # Postman tests
```

## 🎯 Key Features

### 1. **Role-Based Access Control (RBAC)**
```javascript
// Admin only
router.post('/employees', authenticate, isAdmin, createEmployee);

// HR or Admin
router.get('/employees', authenticate, isHROrAdmin, getAllEmployees);

// Self or Admin
router.get('/employees/:id', authenticate, isSelfOrAdmin, getEmployeeById);
```

### 2. **Input Validation**
```javascript
// Joi schema validation
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

router.post('/login', validate(schema), login);
```

### 3. **Error Handling**
```javascript
// Centralized error handling
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage
throw new ApiError(404, 'Employee not found');
```

### 4. **Security**
- Helmet for security headers
- CORS for cross-origin requests
- Rate limiting to prevent abuse
- JWT authentication
- Input validation
- SQL injection prevention (Supabase)

## 🔄 Data Flow Patterns

### Create Operation
```
Frontend → Backend → Validate → Supabase → Response
```

### Read Operation
```
Frontend → Backend → Auth Check → Supabase (RLS) → Response
```

### Update Operation
```
Frontend → Backend → Auth + Permission → Validate → Supabase → Response
```

### Delete Operation
```
Frontend → Backend → Admin Check → Supabase → Cascade Delete → Response
```

## 📊 Database Schema (Key Tables)

### profiles
- User information
- Role (admin/hr/employee)
- Department, job title
- Employment status

### attendance
- Daily check-in/out
- Location tracking
- Status (present/late/absent)
- Auto-calculated hours

### leaves
- Leave requests
- Approval workflow
- Leave types
- Balance tracking

### leave_balance
- Annual leave quotas
- Used vs available
- Per leave type

## 🚀 Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Configure rate limits
- [ ] Set up logging service
- [ ] Enable monitoring
- [ ] Database backups
- [ ] Environment variables secured
- [ ] API documentation updated

---

**This architecture provides:**
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Testability
- ✅ Clear separation of concerns
