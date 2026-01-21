# 🚀 Backend Setup & Integration Guide

## Step 1: Get Supabase Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com
2. Select your HiveHR project
3. Click **Settings** (gear icon) → **API**
4. Copy the **`service_role`** key (⚠️ Keep this SECRET!)
5. Open `Backend/.env` file
6. Replace `your_service_role_key_here` with your actual service role key

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Install Dependencies

```bash
cd Backend
npm install
```

## Step 3: Start the Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║     🐝 HiveHR Backend Server          ║
╠════════════════════════════════════════╣
║  Status: Running                       ║
║  Port: 5000                            ║
║  Environment: development              ║
║  API Docs: http://localhost:5000/api   ║
╚════════════════════════════════════════╝
```

## Step 4: Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:5000/health

# API documentation
curl http://localhost:5000/api
```

## Step 5: Update Frontend to Use Backend

### Option A: Update Frontend .env

Add this to `Frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Option B: Create API Service File

Create `Frontend/src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const session = JSON.parse(localStorage.getItem('supabase.auth.token'));
  return session?.access_token;
};

// API call wrapper
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// Auth API
export const authAPI = {
  login: (email, password) => 
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  logout: () =>
    apiCall('/auth/logout', { method: 'POST' }),

  getCurrentUser: () =>
    apiCall('/auth/me'),

  changePassword: (current_password, new_password) =>
    apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password })
    })
};

// Employee API
export const employeeAPI = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/employees?${query}`);
  },

  getById: (id) =>
    apiCall(`/employees/${id}`),

  create: (employeeData) =>
    apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    }),

  update: (id, updates) =>
    apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  delete: (id) =>
    apiCall(`/employees/${id}`, { method: 'DELETE' }),

  getStats: (id) =>
    apiCall(`/employees/${id}/stats`)
};

// Attendance API
export const attendanceAPI = {
  checkIn: (location) =>
    apiCall('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ check_in_location: location })
    }),

  checkOut: (location) =>
    apiCall('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ check_out_location: location })
    }),

  getMyAttendance: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/attendance/my-attendance?${query}`);
  },

  getTodayAttendance: () =>
    apiCall('/attendance/today'),

  getEmployeeAttendance: (userId, params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/attendance/employee/${userId}?${query}`);
  },

  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/attendance/all?${query}`);
  },

  getStats: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/attendance/stats?${query}`);
  }
};

// Leave API
export const leaveAPI = {
  create: (leaveData) =>
    apiCall('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    }),

  getMyLeaves: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/leaves/my-leaves?${query}`);
  },

  getBalance: (year) => {
    const query = year ? `?year=${year}` : '';
    return apiCall(`/leaves/balance${query}`);
  },

  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/leaves/all?${query}`);
  },

  approve: (id) =>
    apiCall(`/leaves/${id}/approve`, { method: 'PUT' }),

  reject: (id, reason) =>
    apiCall(`/leaves/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejection_reason: reason })
    }),

  cancel: (id) =>
    apiCall(`/leaves/${id}`, { method: 'DELETE' })
};
```

### Option C: Update Existing Hooks

Example: Update `useSupabaseAuth.js` to use backend:

```javascript
import { authAPI } from '../services/api';

export const useSupabaseAuth = () => {
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store session
      localStorage.setItem('supabase.auth.token', JSON.stringify(response.data.session));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // ... rest of the hook
};
```

## Step 6: Test Integration

1. Start backend: `npm run dev` (in Backend folder)
2. Start frontend: `npm run dev` (in Frontend folder)
3. Try logging in through the frontend
4. Check browser console and backend logs

## 🔄 Migration Strategy

You have two options:

### Option 1: Gradual Migration (Recommended)
- Keep existing direct Supabase calls
- Gradually migrate to backend API
- Start with authentication, then employees, etc.

### Option 2: Complete Migration
- Replace all Supabase calls with backend API calls
- Update all hooks to use the new API service
- Test thoroughly

## 🎯 Benefits of Using Backend

1. **Better Security**: Service role key stays on server
2. **Custom Business Logic**: Add complex operations
3. **Third-party Integration**: Easy to add email, SMS, etc.
4. **Rate Limiting**: Prevent abuse
5. **Centralized Validation**: Consistent data validation
6. **Better Error Handling**: Standardized error responses
7. **Logging & Monitoring**: Track all API calls

## 🔐 Important Security Notes

⚠️ **NEVER** commit `.env` file to Git!
⚠️ **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend!
✅ **ALWAYS** validate input on backend
✅ **ALWAYS** use HTTPS in production

## 🚀 Deployment

### Backend Deployment Options:
1. **Heroku**: Easy deployment with Git
2. **Railway**: Modern platform with auto-scaling
3. **Render**: Free tier available
4. **AWS/GCP/Azure**: Enterprise solutions
5. **DigitalOcean**: VPS hosting

### Environment Variables in Production:
Make sure to set all `.env` variables in your hosting platform!

## 📊 Monitoring

Add logging service:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Datadog**: Full monitoring

## ✅ Checklist

- [ ] Added Supabase service role key to `.env`
- [ ] Installed backend dependencies (`npm install`)
- [ ] Started backend server (`npm run dev`)
- [ ] Tested health endpoint
- [ ] Created API service file in frontend
- [ ] Updated at least one hook to use backend
- [ ] Tested login flow
- [ ] Ready for development! 🎉

---

**Need help?** Check the [Backend README](./README.md) or [Main README](../README.md)
