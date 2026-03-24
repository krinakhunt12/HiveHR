create type public.company_member_role as enum ('company_admin', 'employee');

create table if not exists public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_member_role not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id)
);

create table if not exists public.auth_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  action text not null,
  role public.user_role,
  status text not null,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  check (action in ('signup', 'login')),
  check (status in ('success', 'failed'))
);

create index if not exists idx_company_memberships_company_id on public.company_memberships(company_id);
create index if not exists idx_company_memberships_user_id on public.company_memberships(user_id);
create index if not exists idx_company_memberships_role on public.company_memberships(role);
create index if not exists idx_auth_activity_logs_action on public.auth_activity_logs(action);
create index if not exists idx_auth_activity_logs_status on public.auth_activity_logs(status);
create index if not exists idx_auth_activity_logs_created_at on public.auth_activity_logs(created_at desc);

create trigger trg_company_memberships_set_updated_at
before update on public.company_memberships
for each row execute function public.set_updated_at();

alter table public.company_memberships enable row level security;
alter table public.auth_activity_logs enable row level security;

create policy "users can read own memberships"
on public.company_memberships
for select
using (user_id = auth.uid());

create policy "admins manage all memberships"
on public.company_memberships
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

create policy "company admins manage own company memberships"
on public.company_memberships
for all
using (
  exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = company_memberships.company_id
      and cm.user_id = auth.uid()
      and cm.role = 'company_admin'
  )
)
with check (
  exists (
    select 1
    from public.company_memberships cm
    where cm.company_id = company_memberships.company_id
      and cm.user_id = auth.uid()
      and cm.role = 'company_admin'
  )
);

create policy "admins can read auth activity logs"
on public.auth_activity_logs
for select
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);
