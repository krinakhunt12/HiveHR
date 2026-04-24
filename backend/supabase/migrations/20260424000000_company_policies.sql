-- Migration: Company Policies, Holidays, and Dynamic Leave Refactor

-- 1. HOLIDAYS TABLE (referenced by leave function but missing from schema)
CREATE TABLE IF NOT EXISTS public.holidays (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name            text NOT NULL,
    date            date NOT NULL,
    is_recurring    boolean NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(company_id, date)
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_set_updated_at_holidays BEFORE UPDATE ON public.holidays FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. INFORMATIONAL POLICIES (HR Docs, Guidelines, etc.)
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

-- Track acknowledgements
CREATE TABLE IF NOT EXISTS public.policy_acknowledgements (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id       uuid NOT NULL REFERENCES public.company_policies(id) ON DELETE CASCADE,
    employee_id     uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    acknowledged_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(policy_id, employee_id)
);

ALTER TABLE public.policy_acknowledgements ENABLE ROW LEVEL SECURITY;

-- 3. DYNAMIC LEAVE SYSTEM REFACTOR
-- Leave Policies (Containers for leave rules)
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

-- Add leave_policy_id to leave_types (optional grouping)
ALTER TABLE public.leave_types ADD COLUMN IF NOT EXISTS leave_policy_id uuid REFERENCES public.leave_policies(id) ON DELETE SET NULL;

-- Add leave_policy_id to employees (optional override)
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS leave_policy_id uuid REFERENCES public.leave_policies(id) ON DELETE SET NULL;

-- 4. Triggers for updated_at (using IF NOT EXISTS guard to avoid duplicates)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_company_policies') THEN
        CREATE TRIGGER trg_set_updated_at_company_policies BEFORE UPDATE ON public.company_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_set_updated_at_leave_policies') THEN
        CREATE TRIGGER trg_set_updated_at_leave_policies BEFORE UPDATE ON public.leave_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;
