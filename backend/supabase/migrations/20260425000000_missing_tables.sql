-- Migration: Add missing tables and fix role enum
-- This ensures that tables like 'holidays' exist before indexes are created.

-- 0. ROLE ENUM FIX
-- Add 'admin' to user_role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'admin') THEN
        ALTER TYPE public.user_role ADD VALUE 'admin';
    END IF;
END $$;

-- 1. AUTH ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.auth_activity_logs (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    email           text,
    action          text NOT NULL,
    role            text,
    status          text NOT NULL DEFAULT 'success',
    error_message   text,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.auth_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_user_id ON public.auth_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_activity_logs_created_at ON public.auth_activity_logs(created_at DESC);

-- 2. PLAN CHANGE LOGS
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

-- 3. HOLIDAYS TABLE (Ensuring it exists for indexes)
CREATE TABLE IF NOT EXISTS public.holidays (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name            text NOT NULL,
    date            date NOT NULL,
    is_recurring    boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(company_id, date)
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- 4. COMPANY POLICIES
CREATE TABLE IF NOT EXISTS public.company_policies (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title           text NOT NULL,
    content         text NOT NULL,
    category        text NOT NULL DEFAULT 'General',
    is_mandatory    boolean NOT NULL DEFAULT false,
    is_active       boolean NOT NULL DEFAULT true,
    version         int NOT NULL DEFAULT 1,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;

-- 5. LEAVE POLICIES
CREATE TABLE IF NOT EXISTS public.leave_policies (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name            text NOT NULL,
    description     text,
    is_default      boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(company_id, name)
);

ALTER TABLE public.leave_policies ENABLE ROW LEVEL SECURITY;

-- 6. Ensure profiles columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_first_login boolean NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_reset boolean NOT NULL DEFAULT false;

-- 7. Ensure companies columns exist
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;

-- 8. Indexes for performance
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

