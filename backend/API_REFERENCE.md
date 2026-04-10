# HiveHR — Supabase Edge Functions API Reference

Base URL (local): `http://127.0.0.1:55421/functions/v1`  
Base URL (prod):  `https://<project-ref>.supabase.co/functions/v1`

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Auth `/auth`
> `verify_jwt = false` — public endpoint

### POST /auth/signup
Register a new user. If `role = company_admin` and no `company_id` is given, a new company is created automatically.

**Body**
```json
{
  "email": "admin@acme.com",
  "password": "SecurePass123",
  "full_name": "Jane Doe",
  "role": "company_admin",
  "company_name": "Acme Corp"
}
```
For adding an employee (via company admin flow, use the `/employee` endpoint instead).

**Response 201**
```json
{
  "message": "Signup successful",
  "user_id": "uuid",
  "company_id": "uuid",
  "redirect_to": "/login"
}
```

---

### POST /auth/login
Authenticate and receive a session.

**Body**
```json
{ "email": "admin@acme.com", "password": "SecurePass123" }
```

**Response 200**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@acme.com",
    "full_name": "Jane Doe",
    "role": "company_admin",
    "company_id": "uuid",
    "company_name": "Acme Corp"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_at": 1234567890
  },
  "redirect_to": "/dashboard/company"
}
```

---

## 2. Profile `/profile`
> `verify_jwt = true`

### GET /profile
Get own profile.

**Response 200**
```json
{
  "user_id": "uuid",
  "full_name": "Jane Doe",
  "role": "company_admin",
  "company_id": "uuid",
  "companies": { "id": "uuid", "name": "Acme Corp" },
  "created_at": "...",
  "updated_at": "..."
}
```

### GET /profile/:id
Admin: get any user's profile.

### PATCH /profile
Update own profile. Employees can only update `full_name`.

**Body**
```json
{ "full_name": "Jane Smith" }
```

### PATCH /profile/:id
Admin: update any field including `role`, `company_id`.

---

## 3. Employee `/employee`
> `verify_jwt = true` — company_admin or admin only (except GET /:id for own record)

### GET /employee
List all employees for the caller's company.

**Query params**
| Param | Type | Description |
|---|---|---|
| `department_id` | uuid | Filter by department |
| `status` | string | `active` \| `inactive` \| `terminated` |
| `search` | string | Search name, code, or designation |
| `page` | int | Default 1 |
| `limit` | int | Default 20 |

**Response 200**
```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 42 }
}
```

### GET /employee/:id
Get single employee (own record visible to employee).

### POST /employee
Add a new employee. Creates auth user + profile + employee record + membership.

**Body**
```json
{
  "email": "john@acme.com",
  "password": "TempPass123",
  "full_name": "John Smith",
  "employee_code": "EMP-001",
  "designation": "Software Engineer",
  "department_id": "uuid",
  "employment_type": "full_time",
  "joined_on": "2026-01-15",
  "salary": 75000
}
```

**Response 201**
```json
{ "message": "Employee added successfully", "data": { ... } }
```

### PATCH /employee/:id
Update employee details.

**Updatable fields:** `full_name`, `designation`, `department_id`, `employment_type`, `joined_on`, `salary`, `status`, `employee_code`

### DELETE /employee/:id
Soft-deactivate employee (sets status → `terminated`, bans auth login).

### POST /employee/:id/reactivate
Reactivate a deactivated employee.

---

## 4. Leave `/leave`
> `verify_jwt = true`

### GET /leave
List leave requests.
- **Employee**: sees only their own requests
- **Admin/Company Admin**: sees all requests for their company

**Query params**
| Param | Type | Description |
|---|---|---|
| `status` | string | `pending` \| `approved` \| `rejected` \| `cancelled` |
| `employee_id` | uuid | Filter by employee (admin only) |
| `leave_type` | string | e.g. `Annual Leave` |
| `from` | date | Start date filter `YYYY-MM-DD` |
| `to` | date | End date filter |
| `page` | int | Default 1 |
| `limit` | int | Default 20 |

### GET /leave/summary
Leave usage summary aggregated by type for a year.

**Query params:** `year` (default: current year), `employee_id` (admin only)

**Response 200**
```json
{
  "year": 2026,
  "summary": {
    "Annual Leave": 5,
    "Sick Leave": 2
  }
}
```

### GET /leave/calendar
Calendar view of approved leaves (admin only).

**Query params:** `from` (date), `to` (date)

### POST /leave
Submit a leave request (employee) or on behalf of employee (admin).

**Body**
```json
{
  "start_date": "2026-05-01",
  "end_date": "2026-05-03",
  "leave_type": "Annual Leave",
  "reason": "Family vacation"
}
```

**Response 201**
```json
{
  "message": "Leave request submitted",
  "data": { ... },
  "days_requested": 3
}
```
Returns `409` if overlapping requests exist.

### PATCH /leave/:id
Approve / Reject (admin) or Cancel (employee/admin).

**Body**
```json
{
  "status": "approved",
  "admin_comment": "Approved. Have a good break!"
}
```

Valid statuses: `approved`, `rejected`, `cancelled`

### DELETE /leave/:id
Cancel a pending leave request (employee can cancel own; admin can cancel any).

---

## 5. Attendance `/attendance`
> `verify_jwt = true`

### GET /attendance/today
Get today's check-in status for the current employee.

**Response 200**
```json
{
  "date": "2026-04-09",
  "log": { "check_in_at": "2026-04-09T09:00:00Z", "check_out_at": null, ... },
  "can_checkin": false,
  "can_checkout": true
}
```

### POST /attendance/checkin
Employee checks in. Returns `409` if already checked in today.

**Response 201**
```json
{
  "message": "Checked in successfully",
  "check_in_at": "2026-04-09T09:01:32Z",
  "data": { ... }
}
```

### PATCH /attendance/checkout
Employee checks out. Auto-computes `work_minutes`.

**Response 200**
```json
{
  "message": "Checked out successfully",
  "check_out_at": "2026-04-09T18:02:10Z",
  "work_minutes": 540,
  "work_hours": "9.00",
  "data": { ... }
}
```

### GET /attendance
List attendance logs.
- **Employee**: own logs only
- **Admin**: all logs for company

**Query params:** `from`, `to` (dates), `employee_id`, `page`, `limit`

### GET /attendance/report
Monthly attendance report for admin.

**Query params:** `from`, `to` (dates), `employee_id`, `department_id`

**Response 200**
```json
{
  "from": "2026-04-01",
  "to": "2026-04-09",
  "report": [
    {
      "employee": { "id": "...", "full_name": "John Smith", ... },
      "present_days": 7,
      "total_hours": "63.00",
      "avg_hours_per_day": "9.00",
      "logs": [...]
    }
  ]
}
```

### PATCH /attendance/:id
Admin manually edits an attendance log (fix wrong times, add missed check-out).

**Body**
```json
{
  "check_in_at": "2026-04-09T09:00:00Z",
  "check_out_at": "2026-04-09T17:30:00Z"
}
```
`work_minutes` is auto-calculated if both timestamps provided.

---

## 6. Policies `/policies`
> `verify_jwt = true`

### GET /policies
List company policies.
- **Employee**: active policies only
- **Admin**: all policies (add `?include_inactive=true` for archived)

**Query params:** `type` (policy_type filter), `include_inactive`, `page`, `limit`

### GET /policies/:id
Get a single policy.

### POST /policies
Create a new policy (admin only).

**Body**
```json
{
  "title": "Work From Home Policy",
  "policy_type": "hr",
  "content": "Full policy text goes here...",
  "effective_from": "2026-05-01"
}
```

### PATCH /policies/:id
Update a policy.

**Updatable fields:** `title`, `policy_type`, `content`, `effective_from`, `is_active`

### DELETE /policies/:id
Soft-deactivate a policy (sets `is_active = false`).

---

## Error Responses

All errors follow:
```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — insufficient role |
| 404 | Resource not found |
| 405 | Method not allowed |
| 409 | Conflict (duplicate check-in, overlapping leave, etc.) |

---

## Function File Map

```
supabase/functions/
├── _shared/
│   ├── cors.ts          — CORS headers
│   └── auth.ts          — getUserContext(), jsonResponse(), unauthorized(), forbidden()
├── auth/index.ts        — POST /signup, POST /login
├── profile/index.ts     — GET|PATCH /profile, GET|PATCH /profile/:id
├── employee/index.ts    — Full employee CRUD + reactivate
├── leave/index.ts       — Leave requests + summary + calendar
├── attendance/index.ts  — Check-in/out + logs + report
└── policies/index.ts    — Company policy CRUD
```
