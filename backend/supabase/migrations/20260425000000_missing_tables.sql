-- Migration: Add missing tables referenced by edge functions but absent from schema

-- 1. AUTH ACTIVITY LOGS (referenced in auth/index.ts)
CREATE TABLE IF NOT EXISTS public.auth_activity_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email           text,
    action          text NOT NULL,   -- login, signup, logout, password_reset
    role            text,
    status          text NOT NULL DEFAULT 'success', -- success, denied, failed
    error_message   text,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.auth_activity_logs ENABLE ROW LEVEL SECURITY;

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_user_id ON public.auth_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_created_at ON public.auth_activity_logs(created_at DESC);

-- 2. PLAN CHANGE LOGS (referenced in admin/index.ts audit trail)
CREATE TABLE IF NOT EXISTS public.plan_change_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    changed_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    old_plan_id     uuid REFERENCES public.plans(id) ON DELETE SET NULL,
    new_plan_id     uuid REFERENCES public.plans(id) ON DELETE SET NULL,
    reason          text,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.plan_change_logs ENABLE ROW LEVEL SECURITY;

-- 3. Ensure profiles.is_first_login column exists (may be missing on some deploys)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_first_login boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_reset boolean NOT NULL DEFAULT false;

-- 4. Ensure companies.email and phone columns exist
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_company_status ON public.employees(company_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_status ON public.leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status ON public.leave_requests(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_year ON public.leave_balances(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_work_policies_company ON public.work_policies(company_id, is_default);
CREATE INDEX IF NOT EXISTS idx_leave_types_company ON public.leave_types(company_id, is_active);
CREATE INDEX IF NOT EXISTS idx_departments_company ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_holidays_company ON public.holidays(company_id, date);
CREATE INDEX IF NOT EXISTS idx_company_policies_company ON public.company_policies(company_id, is_active);
