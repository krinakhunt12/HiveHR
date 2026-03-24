create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'company_admin', 'employee');
create type public.employee_status as enum ('active', 'inactive', 'on_leave', 'terminated');
create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'intern');
create type public.leave_status as enum ('pending', 'approved', 'rejected', 'cancelled');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'employee',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, name)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  user_id uuid unique references auth.users(id) on delete set null,
  employee_code text not null,
  full_name text not null,
  designation text not null,
  employment_type public.employment_type not null default 'full_time',
  joined_on date not null,
  salary numeric(12,2),
  status public.employee_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, employee_code)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null,
  reason text,
  start_date date not null,
  end_date date not null,
  status public.leave_status not null default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (end_date >= start_date)
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_companies_created_by on public.companies(created_by);
create index if not exists idx_departments_company_id on public.departments(company_id);
create index if not exists idx_employees_company_id on public.employees(company_id);
create index if not exists idx_employees_user_id on public.employees(user_id);
create index if not exists idx_leave_requests_employee_id on public.leave_requests(employee_id);
create index if not exists idx_leave_requests_status on public.leave_requests(status);

create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger trg_departments_set_updated_at
before update on public.departments
for each row execute function public.set_updated_at();

create trigger trg_employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

create trigger trg_leave_requests_set_updated_at
before update on public.leave_requests
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.departments enable row level security;
alter table public.employees enable row level security;
alter table public.leave_requests enable row level security;

create policy "profiles can view own row"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "profiles can update own row"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "admin full access profiles"
on public.profiles
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

create policy "company admins and admins manage companies"
on public.companies
for all
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
)
with check (
  created_by = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
);

create policy "company admins and admins manage departments"
on public.departments
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
);

create policy "company admins and admins manage employees"
on public.employees
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
);

create policy "employees can read their own employee row"
on public.employees
for select
using (user_id = auth.uid());

create policy "company admins and admins manage leave requests"
on public.leave_requests
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
);

create policy "employees can create and view own leave requests"
on public.leave_requests
for select
using (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
);

create policy "employees can create own leave requests"
on public.leave_requests
for insert
with check (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
);
