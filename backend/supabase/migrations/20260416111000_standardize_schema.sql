-- Standardize Core Tables according to requirements
-- 1. Ensure system_logs exists for auditing
create table if not exists public.system_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  company_id uuid references public.companies(id),
  action text not null,
  resource text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

-- 2. Rename or Create attendance table
-- If attendance_logs exists, rename it (preserving existing data)
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'attendance_logs') then
    alter table public.attendance_logs rename to attendance;
    alter table public.attendance rename column attendance_date to date;
    -- Ensure company_id and status columns exist as per requirement
    if not exists (select from information_schema.columns where table_name = 'attendance' and column_name = 'status') then
      alter table public.attendance add column status text;
    end if;
  else
    create table if not exists public.attendance (
      id uuid primary key default gen_random_uuid(),
      employee_id uuid not null references public.employees(id) on delete cascade,
      company_id uuid not null references public.companies(id) on delete cascade,
      date date not null default (timezone('utc', now())::date),
      status text, -- e.g., 'present', 'absent', 'late'
      created_at timestamptz not null default timezone('utc', now())
    );
  end if;
end $$;

-- 3. Rename or Create leaves table
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'leave_requests') then
    alter table public.leave_requests rename to leaves;
    -- Ensure company_id and dates columns exist
    if not exists (select from information_schema.columns where table_name = 'leaves' and column_name = 'company_id') then
      alter table public.leaves add column company_id uuid references public.companies(id);
    end if;
    if not exists (select from information_schema.columns where table_name = 'leaves' and column_name = 'dates') then
      alter table public.leaves add column dates jsonb; -- For multiple dates or range
    end if;
  else
    create table if not exists public.leaves (
      id uuid primary key default gen_random_uuid(),
      employee_id uuid not null references public.employees(id) on delete cascade,
      company_id uuid not null references public.companies(id) on delete cascade,
      status text not null default 'pending',
      dates jsonb, -- e.g., {start: '...', end: '...'} or ['...']
      created_at timestamptz not null default timezone('utc', now())
    );
  end if;
end $$;

-- 4. Rename or Create policies table
do $$
begin
  if exists (select from pg_tables where schemaname = 'public' and tablename = 'company_policies') then
    alter table public.company_policies rename to policies;
    if not exists (select from information_schema.columns where table_name = 'policies' and column_name = 'type') then
      alter table public.policies rename column policy_type to type;
    end if;
    if not exists (select from information_schema.columns where table_name = 'policies' and column_name = 'rules') then
      alter table public.policies rename column content to rules;
    end if;
  else
    create table if not exists public.policies (
      id uuid primary key default gen_random_uuid(),
      company_id uuid not null references public.companies(id) on delete cascade,
      type text not null,
      rules text not null,
      created_at timestamptz not null default timezone('utc', now())
    );
  end if;
end $$;

-- Enable RLS and add basic policies (though Edge Functions use service_role)
alter table public.system_logs enable row level security;
alter table public.attendance enable row level security;
alter table public.leaves enable row level security;
alter table public.policies enable row level security;

-- Only admins should see logs
create policy "Admins can view all logs" on public.system_logs for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
);

-- Company Admins see their own company logs
create policy "Company admins can view company logs" on public.system_logs for select using (
  exists (select 1 from public.profiles where user_id = auth.uid() and role = 'company_admin' and company_id = system_logs.company_id)
);
