# HR Management Platform — Supabase Backend

> Multi-tenant SaaS HR platform with 3-tier role hierarchy:
> **Super Admin** → **Company Admin** → **Employee**

---

## 📁 Project Structure

```
supabase/
├── config.toml
├── migrations/
│   └── 20260001000000_complete_hr_schema.sql   ← single consolidated migration
└── functions/
    ├── _shared/
    │   ├── auth.ts          ← getUserContext(), logAction(), adminClient()
    │   ├── cors.ts          ← CORS headers
    │   └── responses.ts     ← jsonRes(), successRes(), errorRes(), normalizePath()
    ├── auth/                ← signup, login, update-password
    ├── admin/               ← super_admin: companies, plans, users, logs
    ├── company/             ← company_admin: info, dashboard, departments, holidays
    ├── employee/            ← company_admin: CRUD employees
    ├── attendance/          ← all roles: check-in/out, records, summary
    ├── leave/               ← all roles: apply, approve, reject, types, balance
    ├── policies/            ← company_admin: work policy CRUD + assignment
    ├── departments/         ← company_admin: department CRUD
    ├── profile/             ← all roles: own profile, own work policy
    └── dashboard/           ← all roles: role-scoped dashboard stats
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Docker running (for local dev)

### 2. Local Development
```bash
# Start local Supabase stack
supabase start

# Apply the migration
supabase db push

# Deploy all edge functions
supabase functions deploy --no-verify-jwt
```

### 3. Production Deployment
```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Push migration to remote DB
supabase db push --linked

# Deploy all functions
supabase functions deploy auth       --no-verify-jwt
supabase functions deploy admin      --no-verify-jwt
supabase functions deploy company    --no-verify-jwt
supabase functions deploy employee   --no-verify-jwt
supabase functions deploy attendance --no-verify-jwt
supabase functions deploy leave      --no-verify-jwt
supabase functions deploy policies   --no-verify-jwt
supabase functions deploy departments --no-verify-jwt
supabase functions deploy profile    --no-verify-jwt
supabase functions deploy dashboard  --no-verify-jwt
```

### 4. Set Environment Secrets (Production)
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 🔐 Authentication & RBAC

Every function resolves the caller's context via `getUserContext()`:

```
Bearer Token → supabase.auth.getUser() → profiles table → role + company_id
```

| Role | Access Level |
|------|-------------|
| `super_admin` | Platform-wide. Cannot modify work policies. |
| `company_admin` | Own company only. Full HR control. |
| `employee` | Own records only. Read + self-service. |

---

## 📡 API Endpoints

All base URLs: `https://<project>.supabase.co/functions/v1/<function>`

### Auth — `/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Register company_admin or employee |
| POST | `/login` | Authenticate → session + JWT |
| POST | `/update-password` | Change own password |

### Super Admin — `/admin`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Platform stats |
| GET | `/companies` | List all companies |
| POST | `/companies` | Create company |
| GET | `/companies/:id` | Company detail |
| PATCH | `/companies/:id` | Update company |
| PATCH | `/companies/:id/plan` | Change subscription plan |
| PATCH | `/companies/:id/suspend` | Suspend company |
| PATCH | `/companies/:id/activate` | Activate company |
| DELETE | `/companies/:id` | Delete company |
| GET | `/plans` | List plans |
| POST | `/plans` | Create plan |
| PUT | `/plans/:id` | Update plan |
| PATCH | `/plans/:id/deactivate` | Deactivate plan |
| GET | `/users` | All platform users |
| PATCH | `/users/:id` | Update user role/company |
| GET | `/logs` | System audit logs |

### Company — `/company`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/info` | Company details |
| PATCH | `/info` | Update company info |
| GET | `/dashboard` | Company dashboard stats |
| GET | `/departments` | List departments | 
| POST | `/departments` | Create department |
| PUT | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |
| GET | `/designations` | List designations |
| POST | `/designations` | Create designation |
| DELETE | `/designations/:id` | Delete designation |
| GET | `/holidays` | List holidays |
| POST | `/holidays` | Add holiday |
| DELETE | `/holidays/:id` | Remove holiday |

### Employee — `/employee`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List employees (paginated) |
| POST | `/` | Create employee + auth user |
| GET | `/:id` | Employee detail |
| PATCH | `/:id` | Update employee |
| PATCH | `/:id/status` | Change status (active/inactive/probation) |
| DELETE | `/:id` | Deactivate employee |

### Attendance — `/attendance`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List records (role-scoped) |
| GET | `/summary?month=YYYY-MM` | Employee monthly summary |
| POST | `/` | Check-in (punch in) |
| POST | `/manual` | Manual entry (admin only) |
| PATCH | `/:id` | Check-out or admin correction |

### Leave — `/leave`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List requests (role-scoped) |
| POST | `/` | Apply for leave |
| DELETE | `/:id` | Cancel pending leave |
| PATCH | `/:id/approve` | Approve leave |
| PATCH | `/:id/reject` | Reject leave |
| GET | `/balance` | Leave balances |
| GET | `/types` | List leave types |
| POST | `/types` | Create leave type |
| PUT | `/types/:id` | Update leave type |
| DELETE | `/types/:id` | Deactivate leave type |

### Work Policies — `/policies`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List policies |
| GET | `/:id` | Policy detail |
| POST | `/` | Create policy (company_admin only) |
| PUT | `/:id` | Update policy |
| DELETE | `/:id` | Delete policy |
| PATCH | `/:id/default` | Set as default |
| POST | `/:id/assign` | Assign to employee or department |

### Profile — `/profile`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Own profile |
| PATCH | `/` | Update own profile |
| GET | `/policy` | Own assigned work policy |

### Dashboard — `/dashboard`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Role-appropriate stats |

---

## 🗄️ Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `plans` | Membership tiers (Starter/Growth/Professional/Enterprise) |
| `companies` | Tenant companies, plan subscription |
| `profiles` | User → role + company mapping |
| `employees` | Employee records per company |
| `departments` | Departments per company |
| `designations` | Job titles per company |
| `work_policies` | Shift rules per company |
| `leave_types` | Custom leave types per company |
| `leave_balances` | Per-employee per-year leave quota tracking |
| `leave_requests` | Leave applications with approval workflow |
| `attendance` | Daily check-in/out records |
| `holidays` | Company holidays |
| `system_logs` | Audit trail for all mutations |
| `auth_activity_logs` | Login/signup activity |
| `company_memberships` | User ↔ company role mapping |
| `plan_change_logs` | Super Admin plan change audit |

### Key Business Rules Enforced
- `net_work_hours = total_hours - break_minutes/60` — enforced by DB constraint
- `available_leave = quota + carry_forward - taken - pending` — computed in app layer
- One attendance record per employee per day — unique constraint
- Default policy must exist per company — enforced in edge functions
- Employee limit checked against plan before creating new employees
- Work policies can only be created/edited by `company_admin` — enforced in `/policies` function

---

## 🔒 Security Notes

- All edge functions use `SUPABASE_SERVICE_ROLE_KEY` internally (bypasses RLS) but apply manual RBAC checks
- RLS is still enabled on all tables for direct PostgREST access safety
- `super_admin` cannot modify work policies — business rule enforced at function level
- Multi-tenancy: every write scopes `company_id` from the JWT context, never from the request body
- Sensitive fields (`user_id`, `company_id`, `id`) are stripped from update payloads

---

## 📋 Response Format

All endpoints return a consistent shape:

```json
// Success
{
  "success": true,
  "message": "...",
  "data": { ... } | [ ... ] | null,
  "meta": { "page": 1, "limit": 10, "total": 48, "totalPages": 5 } | null,
  "timestamp": "2026-04-22T10:00:00.000Z"
}

// Error
{
  "success": false,
  "code": "VALIDATION_ERROR | FORBIDDEN | NOT_FOUND | PLAN_LIMIT_EXCEEDED | ...",
  "message": "Human-readable message",
  "errors": [ { "field": "email", "message": "..." } ] | null,
  "timestamp": "2026-04-22T10:00:00.000Z"
}
```

### Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Field-level validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Valid token, insufficient permission |
| `PLAN_LIMIT_EXCEEDED` | 403 | Company hit plan limit |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate record |
| `INSUFFICIENT_BALANCE` | 400 | Not enough leave balance |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

*Version 2.0.0 | Rebuilt from analysis of original codebase | April 2026*
