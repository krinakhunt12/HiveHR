create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  attendance_date date not null default (timezone('utc', now())::date),
  check_in_at timestamptz,
  check_out_at timestamptz,
  work_minutes integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (employee_id, attendance_date),
  check (check_out_at is null or check_in_at is not null)
);

create table if not exists public.company_policies (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  policy_type text not null default 'general',
  content text not null,
  effective_from date,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_attendance_logs_company_id on public.attendance_logs(company_id);
create index if not exists idx_attendance_logs_employee_id on public.attendance_logs(employee_id);
create index if not exists idx_attendance_logs_attendance_date on public.attendance_logs(attendance_date);
create index if not exists idx_company_policies_company_id on public.company_policies(company_id);
create index if not exists idx_company_policies_is_active on public.company_policies(is_active);

create trigger trg_attendance_logs_set_updated_at
before update on public.attendance_logs
for each row execute function public.set_updated_at();

create trigger trg_company_policies_set_updated_at
before update on public.company_policies
for each row execute function public.set_updated_at();

alter table public.attendance_logs enable row level security;
alter table public.company_policies enable row level security;

create policy "company admins and admins manage attendance"
on public.attendance_logs
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

create policy "employees can view own attendance"
on public.attendance_logs
for select
using (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
);

create policy "employees can insert own attendance"
on public.attendance_logs
for insert
with check (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
);

create policy "employees can update own attendance"
on public.attendance_logs
for update
using (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.employees e
    where e.id = employee_id and e.user_id = auth.uid()
  )
);

create policy "employees can read active company policies"
on public.company_policies
for select
using (
  is_active = true
  and exists (
    select 1
    from public.employees e
    where e.company_id = company_policies.company_id and e.user_id = auth.uid()
  )
);

create policy "company admins and admins manage policies"
on public.company_policies
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
