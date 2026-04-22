-- =============================================================================
-- HR Management Platform — Complete Schema (Consolidated Migration)
-- Multi-tenant SaaS: Super Admin → Company Admin → Employee
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;
create extension if not exists pg_trgm; -- for ILIKE search performance

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('super_admin', 'company_admin', 'employee');

create type public.employee_status as enum ('active', 'inactive', 'probation');

create type public.employment_type as enum ('full_time', 'part_time', 'contract');

create type public.work_location as enum ('office', 'remote', 'hybrid');

create type public.leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create type public.attendance_status as enum (
  'present', 'absent', 'late', 'half_day',
  'on_leave', 'holiday', 'weekend', 'wfh'
);

create type public.plan_status as enum ('active', 'expired', 'suspended');

create type public.billing_cycle as enum ('monthly', 'annual');

-- ---------------------------------------------------------------------------
-- UTILITY TRIGGER FUNCTION
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- =============================================================================
-- MEMBERSHIP PLANS (managed by Super Admin only)
-- =============================================================================
create table if not exists public.plans (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null unique,                  -- 'Starter','Growth','Professional','Enterprise'
  description         text,
  price_monthly       numeric(10,2) not null default 0,
  price_annual        numeric(10,2) not null default 0,
  max_employees       int not null default 10,               -- -1 = unlimited
  max_admins          int not null default 1,                -- -1 = unlimited
  max_departments     int not null default 2,                -- -1 = unlimited
  max_leave_types     int not null default 3,                -- -1 = unlimited
  has_api_access      boolean not null default false,
  has_priority_support boolean not null default false,
  billing_cycle       public.billing_cycle not null default 'monthly',
  features            jsonb not null default '[]',
  is_active           boolean not null default true,
  created_at          timestamptz not null default timezone('utc', now()),
  updated_at          timestamptz not null default timezone('utc', now())
);

create trigger trg_plans_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- Seed default plans
insert into public.plans (name, description, price_monthly, price_annual, max_employees, max_admins, max_departments, max_leave_types, has_api_access, has_priority_support, features) values
  ('Starter',      'For small teams up to 10 employees',       999,   9999,   10,  1, 2,  3,  false, false, '["attendance","leaves","policies","basic_reports"]'),
  ('Growth',       'For growing teams up to 50 employees',    2999,  29999,  50,  2, 10, 10, false, false, '["attendance","leaves","policies","standard_reports"]'),
  ('Professional', 'For mid-size teams up to 200 employees',  7999,  79999, 200,  5, 50, 20, true,  true,  '["attendance","leaves","policies","advanced_reports","api"]'),
  ('Enterprise',   'Unlimited scale for large organizations', 19999, 199999, -1, -1, -1, -1, true,  true,  '["attendance","leaves","policies","custom_reports","api","dedicated_support"]')
on conflict (name) do nothing;

-- =============================================================================
-- COMPANIES
-- =============================================================================
create table if not exists public.companies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  email           text unique not null,
  phone           text,
  address         text,
  logo_url        text,
  plan_id         uuid references public.plans(id) on delete set null,
  plan_status     public.plan_status not null default 'active',
  plan_start_date date,
  plan_end_date   date,
  is_active       boolean not null default true,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now())
);

create index idx_companies_plan_id on public.companies(plan_id);
create index idx_companies_plan_status on public.companies(plan_status);
create index idx_companies_is_active on public.companies(is_active);

create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- =============================================================================
-- USER PROFILES (links auth.users → role + company)
-- =============================================================================
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  role        public.user_role not null default 'employee',
  company_id  uuid references public.companies(id) on delete set null,
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now())
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_company_id on public.profiles(company_id);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role, company_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'employee'),
    nullif(new.raw_user_meta_data ->> 'company_id', '')::uuid
  )
  on conflict (user_id) do update
    set full_name  = excluded.full_name,
        role       = excluded.role,
        company_id = excluded.company_id,
        updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================================
-- DEPARTMENTS
-- =============================================================================
create table if not exists public.departments (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  head_id     uuid,              -- references employees(id), set after employee table exists
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now()),
  unique (company_id, name)
);

create index idx_departments_company_id on public.departments(company_id);

create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- DESIGNATIONS
-- =============================================================================
create table if not exists public.designations (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default timezone('utc', now()),
  unique (company_id, name)
);

create index idx_designations_company_id on public.designations(company_id);

-- =============================================================================
-- WORK POLICIES (defined by Company Admin, never Super Admin)
-- =============================================================================
create table if not exists public.work_policies (
  id                          uuid primary key default gen_random_uuid(),
  company_id                  uuid not null references public.companies(id) on delete cascade,
  policy_name                 text not null,
  shift_start                 time,                         -- null for flexible
  shift_end                   time,                         -- null for flexible
  total_hours_required        numeric(4,2) not null default 9,
  break_duration_minutes      int not null default 60,
  net_work_hours_required     numeric(4,2) not null default 8,
  grace_period_minutes        int not null default 15,
  overtime_threshold_minutes  int not null default 480,     -- 8h = 480min net
  half_day_threshold_hours    numeric(4,2) not null default 4,
  applicable_days             jsonb not null default '["Monday","Tuesday","Wednesday","Thursday","Friday"]',
  is_default                  boolean not null default false,
  is_flexible                 boolean not null default false,
  created_by                  uuid references auth.users(id) on delete set null,
  created_at                  timestamptz not null default timezone('utc', now()),
  updated_at                  timestamptz not null default timezone('utc', now()),
  -- Enforce net = total - break/60
  constraint chk_net_hours check (
    abs(net_work_hours_required - (total_hours_required - break_duration_minutes::numeric / 60)) < 0.01
  )
);

create index idx_work_policies_company_id on public.work_policies(company_id);
create index idx_work_policies_is_default on public.work_policies(is_default);

create trigger trg_work_policies_updated_at
  before update on public.work_policies
  for each row execute function public.set_updated_at();

-- =============================================================================
-- EMPLOYEES
-- =============================================================================
create table if not exists public.employees (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid unique references auth.users(id) on delete set null,
  company_id        uuid not null references public.companies(id) on delete cascade,
  department_id     uuid references public.departments(id) on delete set null,
  designation_id    uuid references public.designations(id) on delete set null,
  manager_id        uuid references public.employees(id) on delete set null,
  policy_id         uuid references public.work_policies(id) on delete set null,  -- employee-level override
  employee_code     text not null,
  full_name         text not null,
  email             text not null,
  phone             text,
  date_of_birth     date,
  gender            text,
  emergency_contact text,
  date_of_joining   date not null,
  employment_type   public.employment_type not null default 'full_time',
  work_location     public.work_location not null default 'office',
  status            public.employee_status not null default 'active',
  created_at        timestamptz not null default timezone('utc', now()),
  updated_at        timestamptz not null default timezone('utc', now()),
  unique (company_id, employee_code),
  unique (company_id, email)
);

create index idx_employees_company_id on public.employees(company_id);
create index idx_employees_user_id on public.employees(user_id);
create index idx_employees_department_id on public.employees(department_id);
create index idx_employees_status on public.employees(status);
create index idx_employees_full_name_trgm on public.employees using gin (full_name gin_trgm_ops);

create trigger trg_employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- Now add dept head FK (after employees table created)
alter table public.departments
  add constraint fk_dept_head foreign key (head_id)
  references public.employees(id) on delete set null;

-- =============================================================================
-- LEAVE TYPES (defined by Company Admin)
-- =============================================================================
create table if not exists public.leave_types (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid not null references public.companies(id) on delete cascade,
  name                text not null,
  is_paid             boolean not null default true,
  annual_quota        numeric(5,2) not null default 0,
  carry_forward       boolean not null default false,
  max_carry_forward   numeric(5,2) not null default 0,
  min_notice_days     int not null default 0,
  requires_document   boolean not null default false,
  is_active           boolean not null default true,
  created_at          timestamptz not null default timezone('utc', now()),
  updated_at          timestamptz not null default timezone('utc', now()),
  unique (company_id, name)
);

create index idx_leave_types_company_id on public.leave_types(company_id);

create trigger trg_leave_types_updated_at
  before update on public.leave_types
  for each row execute function public.set_updated_at();

-- =============================================================================
-- LEAVE BALANCES
-- =============================================================================
create table if not exists public.leave_balances (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid not null references public.employees(id) on delete cascade,
  leave_type_id   uuid not null references public.leave_types(id) on delete cascade,
  year            int not null,
  quota           numeric(5,2) not null default 0,
  taken           numeric(5,2) not null default 0,
  carry_forward   numeric(5,2) not null default 0,
  pending         numeric(5,2) not null default 0,
  -- available is computed: quota + carry_forward - taken - pending
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  unique (employee_id, leave_type_id, year)
);

create index idx_leave_balances_employee_id on public.leave_balances(employee_id);
create index idx_leave_balances_year on public.leave_balances(year);

create trigger trg_leave_balances_updated_at
  before update on public.leave_balances
  for each row execute function public.set_updated_at();

-- =============================================================================
-- LEAVE REQUESTS
-- =============================================================================
create table if not exists public.leave_requests (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid not null references public.employees(id) on delete cascade,
  leave_type_id   uuid not null references public.leave_types(id) on delete restrict,
  company_id      uuid not null references public.companies(id) on delete cascade,
  from_date       date not null,
  to_date         date not null,
  total_days      numeric(4,2) not null default 0,
  reason          text,
  document_url    text,
  status          public.leave_status not null default 'pending',
  reviewed_by     uuid references auth.users(id) on delete set null,
  review_note     text,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default timezone('utc', now()),
  updated_at      timestamptz not null default timezone('utc', now()),
  constraint chk_leave_dates check (to_date >= from_date)
);

create index idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index idx_leave_requests_company_id on public.leave_requests(company_id);
create index idx_leave_requests_status on public.leave_requests(status);
create index idx_leave_requests_from_date on public.leave_requests(from_date);

create trigger trg_leave_requests_updated_at
  before update on public.leave_requests
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ATTENDANCE
-- =============================================================================
create table if not exists public.attendance (
  id                  uuid primary key default gen_random_uuid(),
  employee_id         uuid not null references public.employees(id) on delete cascade,
  company_id          uuid not null references public.companies(id) on delete cascade,
  policy_id           uuid references public.work_policies(id) on delete set null,
  date                date not null,
  check_in_time       timetz,
  check_out_time      timetz,
  raw_hours_minutes   int,                     -- check_out - check_in in minutes
  break_minutes       int not null default 60,
  net_work_minutes    int,                     -- raw - break
  overtime_minutes    int not null default 0,
  late_minutes        int not null default 0,
  status              public.attendance_status not null default 'present',
  is_manual_entry     boolean not null default false,
  manual_reason       text,
  notes               text,
  created_at          timestamptz not null default timezone('utc', now()),
  updated_at          timestamptz not null default timezone('utc', now()),
  unique (employee_id, date)
);

create index idx_attendance_company_id on public.attendance(company_id);
create index idx_attendance_employee_id on public.attendance(employee_id);
create index idx_attendance_date on public.attendance(date);
create index idx_attendance_status on public.attendance(status);

create trigger trg_attendance_updated_at
  before update on public.attendance
  for each row execute function public.set_updated_at();

-- Auto-compute net_work_minutes and overtime when check_out is set
create or replace function public.compute_attendance_hours()
returns trigger
language plpgsql
as $$
declare
  v_raw_minutes    int;
  v_net_minutes    int;
  v_overtime       int;
  v_required_net   int;
  v_policy         record;
  v_late_minutes   int;
begin
  if new.check_in_time is not null and new.check_out_time is not null then
    -- raw duration in minutes
    v_raw_minutes := extract(epoch from (new.check_out_time - new.check_in_time)) / 60;
    v_net_minutes := v_raw_minutes - coalesce(new.break_minutes, 60);

    new.raw_hours_minutes := v_raw_minutes;
    new.net_work_minutes  := greatest(0, v_net_minutes);

    -- fetch policy for overtime threshold + grace
    if new.policy_id is not null then
      select net_work_hours_required * 60, grace_period_minutes, shift_start
        into v_required_net, v_late_minutes, v_policy
        from public.work_policies where id = new.policy_id;

      -- overtime = net - required (if positive)
      new.overtime_minutes := greatest(0, new.net_work_minutes - (v_required_net));
    else
      -- default: 8h net required
      new.overtime_minutes := greatest(0, new.net_work_minutes - 480);
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_compute_attendance
  before insert or update on public.attendance
  for each row execute function public.compute_attendance_hours();

-- =============================================================================
-- HOLIDAYS
-- =============================================================================
create table if not exists public.holidays (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  date        date not null,
  created_at  timestamptz not null default timezone('utc', now()),
  unique (company_id, date)
);

create index idx_holidays_company_id on public.holidays(company_id);
create index idx_holidays_date on public.holidays(date);

-- =============================================================================
-- SYSTEM AUDIT LOGS
-- =============================================================================
create table if not exists public.system_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  company_id  uuid references public.companies(id) on delete set null,
  action      text not null,
  resource    text not null,
  target_id   text,
  details     jsonb,
  created_at  timestamptz not null default timezone('utc', now())
);

create index idx_system_logs_actor_id on public.system_logs(actor_id);
create index idx_system_logs_company_id on public.system_logs(company_id);
create index idx_system_logs_created_at on public.system_logs(created_at desc);
create index idx_system_logs_action on public.system_logs(action);

-- =============================================================================
-- AUTH ACTIVITY LOGS
-- =============================================================================
create table if not exists public.auth_activity_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  email         text,
  action        text not null check (action in ('signup', 'login')),
  role          public.user_role,
  status        text not null check (status in ('success', 'failed', 'denied')),
  error_message text,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default timezone('utc', now())
);

create index idx_auth_activity_logs_user_id on public.auth_activity_logs(user_id);
create index idx_auth_activity_logs_action on public.auth_activity_logs(action);
create index idx_auth_activity_logs_status on public.auth_activity_logs(status);
create index idx_auth_activity_logs_created_at on public.auth_activity_logs(created_at desc);

-- =============================================================================
-- COMPANY MEMBERSHIPS (tracks role per user per company)
-- =============================================================================
create table if not exists public.company_memberships (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null check (role in ('company_admin', 'employee')),
  created_at  timestamptz not null default timezone('utc', now()),
  updated_at  timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id)
);

create index idx_company_memberships_company_id on public.company_memberships(company_id);
create index idx_company_memberships_user_id on public.company_memberships(user_id);

create trigger trg_company_memberships_updated_at
  before update on public.company_memberships
  for each row execute function public.set_updated_at();

-- =============================================================================
-- PLAN CHANGE AUDIT (Super Admin plan changes are always logged)
-- =============================================================================
create table if not exists public.plan_change_logs (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  changed_by      uuid references auth.users(id) on delete set null,
  old_plan_id     uuid references public.plans(id) on delete set null,
  new_plan_id     uuid references public.plans(id) on delete set null,
  reason          text,
  created_at      timestamptz not null default timezone('utc', now())
);

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

alter table public.plans enable row level security;
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.designations enable row level security;
alter table public.work_policies enable row level security;
alter table public.employees enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;
alter table public.attendance enable row level security;
alter table public.holidays enable row level security;
alter table public.system_logs enable row level security;
alter table public.auth_activity_logs enable row level security;
alter table public.company_memberships enable row level security;
alter table public.plan_change_logs enable row level security;

-- Helper: is caller a super_admin?
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

-- Helper: is caller a company_admin for a given company?
create or replace function public.is_company_admin_for(p_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role = 'company_admin'
      and company_id = p_company_id
  );
$$;

-- Helper: get caller's company_id
create or replace function public.my_company_id()
returns uuid
language sql
security definer
stable
as $$
  select company_id from public.profiles where user_id = auth.uid();
$$;

-- ── PLANS ────────────────────────────────────────────────────────────────────
create policy "super_admin_all_plans" on public.plans for all
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "everyone_read_active_plans" on public.plans for select
  using (is_active = true);

-- ── COMPANIES ─────────────────────────────────────────────────────────────────
create policy "super_admin_all_companies" on public.companies for all
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "company_admin_read_own" on public.companies for select
  using (id = public.my_company_id());

create policy "company_admin_update_own" on public.companies for update
  using (id = public.my_company_id() and public.is_company_admin_for(id))
  with check (id = public.my_company_id());

-- ── PROFILES ─────────────────────────────────────────────────────────────────
create policy "super_admin_all_profiles" on public.profiles for all
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "own_profile_select" on public.profiles for select
  using (user_id = auth.uid());

create policy "own_profile_update" on public.profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "company_admin_read_company_profiles" on public.profiles for select
  using (company_id = public.my_company_id() and public.is_company_admin_for(public.my_company_id()));

-- ── DEPARTMENTS ──────────────────────────────────────────────────────────────
create policy "super_admin_all_departments" on public.departments for all
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "company_admin_manage_departments" on public.departments for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_company_departments" on public.departments for select
  using (company_id = public.my_company_id());

-- ── DESIGNATIONS ─────────────────────────────────────────────────────────────
create policy "company_admin_manage_designations" on public.designations for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_company_designations" on public.designations for select
  using (company_id = public.my_company_id());

-- ── WORK POLICIES ────────────────────────────────────────────────────────────
create policy "super_admin_read_policies" on public.work_policies for select
  using (public.is_super_admin());

create policy "company_admin_manage_work_policies" on public.work_policies for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_work_policy" on public.work_policies for select
  using (company_id = public.my_company_id());

-- ── EMPLOYEES ────────────────────────────────────────────────────────────────
create policy "super_admin_read_all_employees" on public.employees for select
  using (public.is_super_admin());

create policy "company_admin_manage_employees" on public.employees for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_record" on public.employees for select
  using (user_id = auth.uid());

-- ── LEAVE TYPES ──────────────────────────────────────────────────────────────
create policy "company_admin_manage_leave_types" on public.leave_types for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_active_leave_types" on public.leave_types for select
  using (company_id = public.my_company_id() and is_active = true);

-- ── LEAVE BALANCES ───────────────────────────────────────────────────────────
create policy "company_admin_manage_leave_balances" on public.leave_balances for all
  using (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.company_id = public.my_company_id()
            and public.is_company_admin_for(e.company_id))
  );

create policy "employee_read_own_leave_balance" on public.leave_balances for select
  using (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

-- ── LEAVE REQUESTS ───────────────────────────────────────────────────────────
create policy "company_admin_manage_leave_requests" on public.leave_requests for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_leave_requests" on public.leave_requests for select
  using (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

create policy "employee_insert_own_leave_request" on public.leave_requests for insert
  with check (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

create policy "employee_cancel_own_pending_leave" on public.leave_requests for update
  using (
    status = 'pending'
    and exists (select 1 from public.employees e
                where e.id = employee_id and e.user_id = auth.uid())
  );

-- ── ATTENDANCE ───────────────────────────────────────────────────────────────
create policy "super_admin_read_all_attendance" on public.attendance for select
  using (public.is_super_admin());

create policy "company_admin_manage_attendance" on public.attendance for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_attendance" on public.attendance for select
  using (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

create policy "employee_insert_own_attendance" on public.attendance for insert
  with check (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

create policy "employee_update_own_attendance" on public.attendance for update
  using (
    exists (select 1 from public.employees e
            where e.id = employee_id and e.user_id = auth.uid())
  );

-- ── HOLIDAYS ─────────────────────────────────────────────────────────────────
create policy "company_admin_manage_holidays" on public.holidays for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

create policy "employee_read_own_company_holidays" on public.holidays for select
  using (company_id = public.my_company_id());

-- ── SYSTEM LOGS ──────────────────────────────────────────────────────────────
create policy "super_admin_read_all_logs" on public.system_logs for select
  using (public.is_super_admin());

create policy "company_admin_read_own_logs" on public.system_logs for select
  using (company_id = public.my_company_id() and public.is_company_admin_for(public.my_company_id()));

-- ── AUTH ACTIVITY LOGS ───────────────────────────────────────────────────────
create policy "super_admin_read_auth_logs" on public.auth_activity_logs for select
  using (public.is_super_admin());

-- ── COMPANY MEMBERSHIPS ──────────────────────────────────────────────────────
create policy "super_admin_all_memberships" on public.company_memberships for all
  using (public.is_super_admin()) with check (public.is_super_admin());

create policy "own_membership_read" on public.company_memberships for select
  using (user_id = auth.uid());

create policy "company_admin_manage_own_memberships" on public.company_memberships for all
  using (company_id = public.my_company_id() and public.is_company_admin_for(company_id))
  with check (company_id = public.my_company_id());

-- ── PLAN CHANGE LOGS ─────────────────────────────────────────────────────────
create policy "super_admin_read_plan_change_logs" on public.plan_change_logs for all
  using (public.is_super_admin()) with check (public.is_super_admin());

-- =============================================================================
-- VIEWS (for dashboard queries)
-- =============================================================================

-- Company dashboard stats view
create or replace view public.company_dashboard_stats as
select
  c.id as company_id,
  count(distinct e.id) filter (where e.status = 'active') as total_employees,
  count(distinct a.id) filter (
    where a.date = current_date and a.status in ('present', 'late', 'wfh')
  ) as present_today,
  count(distinct a.id) filter (
    where a.date = current_date and a.status = 'absent'
  ) as absent_today,
  count(distinct a.id) filter (
    where a.date = current_date and a.status = 'on_leave'
  ) as on_leave_today,
  count(distinct lr.id) filter (where lr.status = 'pending') as pending_leave_requests,
  count(distinct a.id) filter (
    where a.date = current_date and a.status = 'late'
  ) as late_arrivals_today
from public.companies c
left join public.employees e on e.company_id = c.id
left join public.attendance a on a.company_id = c.id
left join public.leave_requests lr on lr.company_id = c.id
group by c.id;

-- Employee leave balance computed view
create or replace view public.employee_leave_summary as
select
  lb.employee_id,
  lt.name as leave_type,
  lb.year,
  lb.quota,
  lb.carry_forward,
  lb.taken,
  lb.pending,
  (lb.quota + lb.carry_forward - lb.taken - lb.pending) as available
from public.leave_balances lb
join public.leave_types lt on lt.id = lb.leave_type_id;
