create table if not exists public.leave_configurations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  leave_type text not null,
  annual_allowance integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, leave_type)
);

-- Row Level Security
alter table public.leave_configurations enable row level security;

create policy "Admins and Company Admins manage leave configurations"
on public.leave_configurations
for all
using (
  exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'company_admin')
  )
);

create policy "Employees can view their company leave configurations"
on public.leave_configurations
for select
using (
  exists (
    select 1
    from public.employees e
    where e.company_id = leave_configurations.company_id and e.user_id = auth.uid()
  )
);

-- Trigger for updated_at
create trigger trg_leave_configurations_set_updated_at
before update on public.leave_configurations
for each row execute function public.set_updated_at();

-- Insert some defaults for existing companies (optional but helpful)
insert into public.leave_configurations (company_id, leave_type, annual_allowance)
select id, 'paid', 12 from public.companies
on conflict do nothing;

insert into public.leave_configurations (company_id, leave_type, annual_allowance)
select id, 'sick', 6 from public.companies
on conflict do nothing;
