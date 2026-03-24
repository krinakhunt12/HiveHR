# HiveHR Backend (Supabase)

This folder contains the Supabase backend setup for HiveHR:

- `supabase/config.toml`: local Supabase project config
- `supabase/migrations/`: SQL schema migrations
- `supabase/functions/`: Edge Functions

## Prerequisites

- Supabase CLI installed
- Docker Desktop running (for local Supabase stack)

## Quick start

1. From this folder, start local Supabase:
   - `supabase start`
2. Apply migrations:
   - `supabase db reset`
3. Serve Edge Functions locally:
   - `supabase functions serve hr-api --no-verify-jwt`

## Deploy

- Push migrations:
  - `supabase db push`
- Deploy function:
   - `supabase functions deploy auth-api`
   - `supabase functions deploy profile-api`
   - `supabase functions deploy employees-api`
   - `supabase functions deploy attendance-api`
   - `supabase functions deploy policies-api`

## Function-Wise API Table

| Edge Function | Base Path | Tables Used | Purpose |
|---|---|---|---|
| `auth-api` | `/functions/v1/auth-api` | `profiles`, `companies`, `company_memberships`, `employees`, `auth_activity_logs` | Signup/login and auth activity logging |
| `profile-api` | `/functions/v1/profile-api` | `profiles`, `employees`, `company_memberships` | Current user profile + company context |
| `employees-api` | `/functions/v1/employees-api` | `employees` | Employee CRUD |
| `attendance-api` | `/functions/v1/attendance-api` | `attendance_logs` | Attendance queries and check-in/check-out |
| `policies-api` | `/functions/v1/policies-api` | `company_policies` | Company policy CRUD |

## API Endpoints By Function

- `auth-api`
   - `GET /health`
   - `POST /signup`
   - `POST /login`

- `profile-api`
   - `GET /health`
   - `GET /me`

- `employees-api`
   - `GET /health`
   - `GET /employees?company_id=<uuid>`
   - `GET /employees/<employee_id>`
   - `POST /employees`
   - `PUT /employees/<employee_id>`
   - `DELETE /employees/<employee_id>`

- `attendance-api`
   - `GET /health`
   - `GET /attendance?company_id=<uuid>&employee_id=<uuid>&attendance_date=YYYY-MM-DD`
   - `POST /attendance/check-in`
   - `POST /attendance/check-out`

- `policies-api`
   - `GET /health`
   - `GET /policies?company_id=<uuid>`
   - `POST /policies`
   - `PUT /policies/<policy_id>`
   - `DELETE /policies/<policy_id>`

## Legacy Function

- `hr-api` remains in the repo for backward compatibility.
- New development should use the split functions above.
