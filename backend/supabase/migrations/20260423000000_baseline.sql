-- HiveHR Golden Baseline Migration
-- Regenerated to align with Edge Function expectations and existing remote schema.

-- ---------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- ---------------------------------------------------------------------------
-- 2. ENUMS (with guards)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('super_admin', 'company_admin', 'employee');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
        CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'probation', 'terminated');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
        CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_status') THEN
        CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_status') THEN
        CREATE TYPE public.plan_status AS ENUM ('active', 'expired', 'suspended');
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. CORE TABLES
-- ---------------------------------------------------------------------------

-- PLANS
CREATE TABLE IF NOT EXISTS public.plans (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL UNIQUE,
  description           text,
  price_monthly         numeric(10,2) NOT NULL DEFAULT 0,
  price_annual          numeric(10,2) NOT NULL DEFAULT 0,
  max_employees         int NOT NULL DEFAULT 10,
  max_admins            int NOT NULL DEFAULT 1,
  max_departments       int NOT NULL DEFAULT 2,
  max_leave_types       int NOT NULL DEFAULT 3,
  has_api_access        boolean NOT NULL DEFAULT false,
  features              jsonb NOT NULL DEFAULT '[]',
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Seed Plans if missing
INSERT INTO public.plans (name, description, price_monthly, price_annual, max_employees, max_admins, max_departments, max_leave_types, features)
VALUES
  ('Starter',      'For small teams',         999,   9999,   10,  1, 2,  3,  '["attendance","leaves"]'),
  ('Growth',       'For growing teams',       2999,  29999,  50,  2, 10, 10, '["attendance","leaves","policies"]'),
  ('Professional', 'For mid-size teams',      7999,  79999,  200, 5, 50, 20, '["attendance","leaves","policies","api"]'),
  ('Enterprise',   'Unlimited everything',    19999, 199999, -1,  -1, -1, -1, '["attendance","leaves","policies","api","white_label"]')
ON CONFLICT (name) DO NOTHING;

-- COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  email           text,
  plan_id         uuid REFERENCES public.plans(id) ON DELETE SET NULL,
  plan_status     public.plan_status DEFAULT 'active',
  plan_start_date date,
  plan_end_date   date,
  is_active       boolean DEFAULT true,
  created_by      uuid REFERENCES auth.users(id),
  created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure companies columns exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'plan_id') THEN
        ALTER TABLE public.companies ADD COLUMN plan_id uuid REFERENCES public.plans(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'email') THEN
        ALTER TABLE public.companies ADD COLUMN email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'plan_status') THEN
        ALTER TABLE public.companies ADD COLUMN plan_status public.plan_status DEFAULT 'active';
    END IF;
END $$;

-- Link existing companies to Starter plan by default
UPDATE public.companies SET plan_id = (SELECT id FROM public.plans WHERE name = 'Starter' LIMIT 1) WHERE plan_id IS NULL;

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  role            public.user_role NOT NULL DEFAULT 'employee',
  company_id      uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  is_first_login  boolean DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure profiles columns exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_id') THEN
        ALTER TABLE public.profiles ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_first_login') THEN
        ALTER TABLE public.profiles ADD COLUMN is_first_login boolean DEFAULT true;
    END IF;
END $$;

-- DESIGNATIONS
CREATE TABLE IF NOT EXISTS public.designations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (company_id, name)
);

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name        text NOT NULL,
  head_id     uuid, -- resolved later to employees
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (company_id, name)
);

-- Ensure departments columns exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'head_id') THEN
        ALTER TABLE public.departments ADD COLUMN head_id uuid;
    END IF;
END $$;

-- WORK POLICIES
CREATE TABLE IF NOT EXISTS public.work_policies (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_name                 text NOT NULL,
  shift_start                 time,
  shift_end                   time,
  total_hours_required        numeric(4,2) DEFAULT 9,
  break_duration_minutes      int DEFAULT 60,
  net_work_hours_required     numeric(4,2) DEFAULT 8,
  grace_period_minutes        int DEFAULT 15,
  overtime_threshold_minutes  int DEFAULT 480,
  half_day_threshold_hours    numeric(4,2) DEFAULT 4,
  applicable_days             jsonb DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
  is_default                  boolean DEFAULT false,
  is_flexible                 boolean DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at                  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id        uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id     uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  designation_id    uuid REFERENCES public.designations(id) ON DELETE SET NULL,
  policy_id         uuid REFERENCES public.work_policies(id) ON DELETE SET NULL,
  manager_id        uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_code     text NOT NULL,
  full_name         text NOT NULL,
  email             text NOT NULL,
  phone             text,
  date_of_joining   date NOT NULL,
  date_of_birth     date,
  gender            text,
  emergency_contact text,
  work_location     text DEFAULT 'office',
  employment_type   public.employment_type DEFAULT 'full_time',
  status            public.employee_status DEFAULT 'active',
  created_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (company_id, employee_code)
);

-- Ensure employees columns exist (for migration from old schema)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'date_of_joining') THEN
        ALTER TABLE public.employees ADD COLUMN date_of_joining date;
        -- Assuming 'joined_on' was a previous column name if date_of_joining missing
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'joined_on') THEN
            EXECUTE 'UPDATE public.employees SET date_of_joining = joined_on WHERE joined_on IS NOT NULL';
        END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'designation_id') THEN
        ALTER TABLE public.employees ADD COLUMN designation_id uuid REFERENCES public.designations(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'policy_id') THEN
        ALTER TABLE public.employees ADD COLUMN policy_id uuid REFERENCES public.work_policies(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'manager_id') THEN
        ALTER TABLE public.employees ADD COLUMN manager_id uuid REFERENCES public.employees(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'work_location') THEN
        ALTER TABLE public.employees ADD COLUMN work_location text DEFAULT 'office';
    END IF;
END $$;

-- Resolve circular FK: departments -> employees
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_head_id_fkey;
ALTER TABLE public.departments ADD CONSTRAINT departments_head_id_fkey FOREIGN KEY (head_id) REFERENCES public.employees(id) ON DELETE SET NULL;

-- LEAVE TYPES
CREATE TABLE IF NOT EXISTS public.leave_types (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name              text NOT NULL,
  is_paid           boolean DEFAULT true,
  annual_quota      numeric(5,2) DEFAULT 0,
  carry_forward     boolean DEFAULT false,
  max_carry_forward numeric(5,2) DEFAULT 0,
  min_notice_days   int DEFAULT 0,
  requires_document boolean DEFAULT false,
  is_active         boolean DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (company_id, name)
);

-- LEAVE BALANCES
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id   uuid NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year            int NOT NULL DEFAULT extract(year from now())::int,
  quota           numeric(5,2) DEFAULT 0,
  taken           numeric(5,2) DEFAULT 0,
  carry_forward   numeric(5,2) DEFAULT 0,
  pending         numeric(5,2) DEFAULT 0,
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (employee_id, leave_type_id, year)
);

-- LEAVE REQUESTS
-- Handle rename if 'leaves' table exists from previous migrations
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leaves') THEN
        ALTER TABLE public.leaves RENAME TO leave_requests;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_type_id   uuid REFERENCES public.leave_types(id) ON DELETE SET NULL,
  from_date       date NOT NULL,
  to_date         date NOT NULL,
  total_days      numeric(4,2) NOT NULL,
  status          public.leave_status DEFAULT 'pending',
  reason          text,
  document_url    text,
  reviewed_by     uuid REFERENCES auth.users(id),
  review_note     text,
  reviewed_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Ensure leave_requests columns exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'leave_type_id') THEN
        ALTER TABLE public.leave_requests ADD COLUMN leave_type_id uuid REFERENCES public.leave_types(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'from_date') THEN
        ALTER TABLE public.leave_requests ADD COLUMN from_date date;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'start_date') THEN
            EXECUTE 'UPDATE public.leave_requests SET from_date = start_date WHERE start_date IS NOT NULL';
        END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'to_date') THEN
        ALTER TABLE public.leave_requests ADD COLUMN to_date date;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'end_date') THEN
            EXECUTE 'UPDATE public.leave_requests SET to_date = end_date WHERE end_date IS NOT NULL';
        END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'total_days') THEN
        ALTER TABLE public.leave_requests ADD COLUMN total_days numeric(4,2);
    END IF;
END $$;

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS public.attendance (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id          uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_id           uuid REFERENCES public.work_policies(id) ON DELETE SET NULL,
  date                date NOT NULL DEFAULT (timezone('utc', now())::date),
  check_in_time       time,
  check_out_time      time,
  status              text DEFAULT 'present',
  late_minutes        int DEFAULT 0,
  break_minutes       int DEFAULT 60,
  net_work_minutes    int DEFAULT 0,
  overtime_minutes    int DEFAULT 0,
  raw_hours_minutes   int DEFAULT 0,
  is_manual_entry     boolean DEFAULT false,
  manual_reason       text,
  created_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at          timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (employee_id, date)
);

-- Ensure attendance columns exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'check_in_time') THEN
        ALTER TABLE public.attendance ADD COLUMN check_in_time time;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'check_in_at') THEN
            EXECUTE 'UPDATE public.attendance SET check_in_time = check_in_at::time WHERE check_in_at IS NOT NULL';
        END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'check_out_time') THEN
        ALTER TABLE public.attendance ADD COLUMN check_out_time time;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'check_out_at') THEN
            EXECUTE 'UPDATE public.attendance SET check_out_time = check_out_at::time WHERE check_out_at IS NOT NULL';
        END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'policy_id') THEN
        ALTER TABLE public.attendance ADD COLUMN policy_id uuid REFERENCES public.work_policies(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'net_work_minutes') THEN
        ALTER TABLE public.attendance ADD COLUMN net_work_minutes int DEFAULT 0;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'work_minutes') THEN
            EXECUTE 'UPDATE public.attendance SET net_work_minutes = work_minutes WHERE work_minutes IS NOT NULL';
        END IF;
    END IF;
END $$;

-- SYSTEM LOGS
CREATE TABLE IF NOT EXISTS public.system_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES auth.users(id),
  company_id  uuid REFERENCES public.companies(id),
  action      text NOT NULL,
  resource    text NOT NULL,
  target_id   text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- COMPANY MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.company_memberships (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.user_role NOT NULL DEFAULT 'employee',
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (company_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 4. POLICIES & RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;

-- Basic "Service Role" bypass logic is handled by Edge Functions using service_role_key.
-- For standard user access, we'd add detailed policies here, but since the Edge Functions
-- are the primary API, we'll keep it simple for the baseline.

-- ---------------------------------------------------------------------------
-- 5. TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t);
    END LOOP;
END $$;
