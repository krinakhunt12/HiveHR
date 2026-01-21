# 🎯 Quick Reference - HiveHR Backend API

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd Backend
npm install

# 2. Configure .env (add your Supabase service role key)
# Edit Backend/.env and add SUPABASE_SERVICE_ROLE_KEY

# 3. Start server
npm run dev

# 4. Test
curl http://localhost:5000/health
```

## 📋 Common Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Check if port is in use (Windows)
netstat -ano | findstr :5000

# Kill process on port (Windows)
taskkill /PID <PID> /F
```

## 🔑 Authentication Flow

1. **Login** → Get access token
2. **Store token** in localStorage/sessionStorage
3. **Include token** in all API requests: `Authorization: Bearer <token>`

## 📡 API Endpoints Cheat Sheet

### Authentication
```bash
# Login
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer <token>

# Register (Admin only)
POST /api/auth/register
Headers: Authorization: Bearer <admin_token>
Body: { "email": "...", "password": "...", "full_name": "...", "employee_id": "...", "role": "..." }
```

### Employees
```bash
# Get all employees
GET /api/employees?page=1&limit=10
Headers: Authorization: Bearer <token>

# Get employee by ID
GET /api/employees/:id
Headers: Authorization: Bearer <token>

# Create employee (Admin only)
POST /api/employees
Headers: Authorization: Bearer <admin_token>
Body: { employee data }

# Update employee (HR/Admin)
PUT /api/employees/:id
Headers: Authorization: Bearer <hr_or_admin_token>
Body: { updates }
```

### Attendance
```bash
# Check in
POST /api/attendance/check-in
Headers: Authorization: Bearer <token>
Body: { "check_in_location": { "lat": 19.0760, "lng": 72.8777 } }

# Check out
POST /api/attendance/check-out
Headers: Authorization: Bearer <token>
Body: { "check_out_location": { "lat": 19.0760, "lng": 72.8777 } }

# Get my attendance
GET /api/attendance/my-attendance?start_date=2024-01-01&end_date=2024-01-31
Headers: Authorization: Bearer <token>

# Get today's status
GET /api/attendance/today
Headers: Authorization: Bearer <token>
```

### Leaves
```bash
# Create leave request
POST /api/leaves
Headers: Authorization: Bearer <token>
Body: {
  "leave_type": "casual",
  "start_date": "2024-02-01",
  "end_date": "2024-02-03",
  "reason": "Family function"
}

# Get my leaves
GET /api/leaves/my-leaves?status=pending
Headers: Authorization: Bearer <token>

# Get leave balance
GET /api/leaves/balance?year=2024
Headers: Authorization: Bearer <token>

# Approve leave (HR/Admin)
PUT /api/leaves/:id/approve
Headers: Authorization: Bearer <hr_or_admin_token>

# Reject leave (HR/Admin)
PUT /api/leaves/:id/reject
Headers: Authorization: Bearer <hr_or_admin_token>
Body: { "status": "rejected", "rejection_reason": "..." }
```

## 🎭 User Roles & Permissions

| Role | Can Do |
|------|--------|
| **Admin** | Everything (create users, delete, full access) |
| **HR** | View all employees, manage attendance, approve/reject leaves |
| **Employee** | View own data, check-in/out, request leaves |

## 🔒 Common Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 📦 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env or kill process |
| Unauthorized error | Check if token is valid and included in headers |
| CORS error | Add frontend URL to ALLOWED_ORIGINS in .env |
| Supabase connection error | Verify SUPABASE_URL and keys in .env |
| Validation error | Check request body matches schema |

## 🧪 Testing with curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hivehr.com","password":"admin123"}'

# Get current user (replace TOKEN)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# Check in
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"check_in_location":{"lat":19.0760,"lng":72.8777}}'
```

## 📊 Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=active&department_id=uuid&role=employee
```

### Search
```
?search=john
```

### Date Range
```
?start_date=2024-01-01&end_date=2024-01-31
```

### Sorting
```
?sort_by=created_at&sort_order=desc
```

## 🔐 Environment Variables

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # ⚠️ KEEP SECRET!
JWT_SECRET=your_secret
ALLOWED_ORIGINS=http://localhost:5173
```

## 📝 Leave Types

- `sick` - Sick leave
- `casual` - Casual leave
- `earned` - Earned leave
- `maternity` - Maternity leave
- `paternity` - Paternity leave
- `unpaid` - Unpaid leave

## 📅 Attendance Status

- `present` - On time
- `late` - Late arrival
- `absent` - Absent
- `half-day` - Half day
- `work-from-home` - WFH

## 🎯 Next Steps

1. ✅ Backend is running
2. 📝 Test with Postman/curl
3. 🔗 Integrate with frontend
4. 🧪 Test all flows
5. 🚀 Deploy to production

---

**Need detailed docs?** Check [README.md](./README.md) or [SETUP_GUIDE.md](./SETUP_GUIDE.md)
