# HiveHR — Supabase Backend

Multi-tenant SaaS HR Platform backend built on Supabase Edge Functions + PostgreSQL.

## Architecture

**3 Roles:** `super_admin` → `company_admin` → `employee`

**Edge Functions (10):**
- `auth` — signup, login, logout, update-password
- `admin` — super_admin: companies, plans, dashboard, logs
- `company` — company info, departments, designations, holidays
- `employee` — full employee CRUD with plan limit enforcement
- `attendance` — check-in/out, manual entry, summaries
- `leave` — apply, approve, reject, types, balances
- `policies` — work policy CRUD (company_admin only; super_admin read-only)
- `departments` — standalone department CRUD
- `profile` — own profile + work policy (all roles)
- `dashboard` — role-scoped dashboard stats
- `documents` — company HR policy documents (company_policies table)

## Migrations

| File | Purpose |
|------|---------|
| `20260423000000_baseline.sql` | Core schema: plans, companies, profiles, employees, attendance, leave, work_policies |
| `20260424000000_company_policies.sql` | holidays, company_policies, policy_acknowledgements, leave_policies |
| `20260425000000_missing_tables.sql` | auth_activity_logs, plan_change_logs, indexes, extra columns |

## Local Development

```bash
supabase start
supabase db push
supabase functions serve
```

## Production Deploy

```bash
supabase link --project-ref <your-project-ref>
supabase db push --linked
supabase functions deploy --no-verify-jwt

# Set secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## API Response Format

All endpoints return:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": null,
  "timestamp": "2026-04-24T..."
}
```

## Bugs Fixed (vs original)

1. `holidays` table — was missing from schema, referenced in leave working-day calculation
2. `config.toml` — `documents` function not registered for deployment
3. `auth/index.ts` — login response missing `employee_id` and `is_first_login` fields
4. `auth/index.ts` — `super_admin` redirect URL was `/dashboard/super-admin` (route doesn't exist), fixed to `/dashboard/admin`
5. `employee/index.ts` — `.on("conflict")` invalid Supabase JS syntax caused leave balance seeding to silently fail on every new employee
6. `leave/index.ts` — multi-tenancy security: `company_id` was read from request body instead of JWT context
7. `documents/index.ts` — `employee_id` used `ctx.userId` (auth UUID) instead of resolving `employees.id`
8. `admin/index.ts` — dashboard missing `active_companies` count; `plan_distribution` was raw rows instead of aggregated map
9. `_shared/auth.ts` — `employeeId` only resolved for `employee` role, not `company_admin` who may also have an employee record
10. Migration 2 — duplicate trigger error on re-run; `auth_activity_logs` and `plan_change_logs` tables missing
