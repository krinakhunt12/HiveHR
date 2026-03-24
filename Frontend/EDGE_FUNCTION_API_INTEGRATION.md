# Edge Function API Integration

This frontend is integrated with multiple Supabase Edge Function base URLs:

- `/functions/v1/profile-api`
- `/functions/v1/employees-api`
- `/functions/v1/attendance-api`
- `/functions/v1/policies-api`
- `/functions/v1/auth-api`

## Environment setup

Create `.env` in `Frontend` and set:

- `VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<your-anon-key>`
- `VITE_HR_COMPANY_ID=<company-uuid>`
- `VITE_HR_EMPLOYEE_ID=<employee-uuid>`

## Integrated API client

- File: `src/shared/api/hrApi.ts`
- Auth file: `src/shared/api/authApi.ts`

### Profile API

- `GET /health`
- `GET /me`
- Used in:
  - `src/features/admin-dashboard/pages/AdminDashboard.tsx`

### Employees API

- `GET /employees?company_id=<uuid>`
- `GET /employees/<employee_id>`
- `POST /employees`
- `PUT /employees/<employee_id>`
- `DELETE /employees/<employee_id>`
- Used in:
  - `src/features/company-dashboard/pages/CompanyDashboard.tsx` (list members)
  - CRUD methods are available in client for forms/management screens

### Attendance API

- `GET /attendance?company_id=<uuid>&employee_id=<uuid>&attendance_date=YYYY-MM-DD`
- `POST /attendance/check-in`
- `POST /attendance/check-out`
- Used in:
  - `src/features/employee-dashboard/pages/EmployeeDashboard.tsx` (today status + punch in/out)

### Policies API

- `GET /policies?company_id=<uuid>`
- `POST /policies`
- `PUT /policies/<policy_id>`
- `DELETE /policies/<policy_id>`
- Used in:
  - `src/features/company-dashboard/pages/CompanyDashboard.tsx` (policy panel)
  - `src/features/employee-dashboard/pages/EmployeeDashboard.tsx` (policy highlights)
  - Create/update/delete methods are available in client for admin policy management screens

## Notes

- All requests use JSON and include `apikey` from `VITE_SUPABASE_ANON_KEY`.
- The `Authorization` header is automatically read from `localStorage.hivehr_access_token` after login.
- API base URLs are derived automatically from `VITE_SUPABASE_URL` and routed by domain.
