-- Update Profiles table to include company_id as expected by Edge Functions
alter table public.profiles 
add column if not exists company_id uuid references public.companies(id) on delete set null;

-- Update Leave Requests table to include admin_comment as expected by Edge Functions
alter table public.leave_requests
add column if not exists admin_comment text;

-- Create index for performance
create index if not exists idx_profiles_company_id on public.profiles(company_id);

-- Enhance handle_new_user trigger to sync role and company_id from auth.users metadata
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
  set
    full_name = excluded.full_name,
    role = excluded.role,
    company_id = excluded.company_id,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

-- Ensure RLS policies on profiles take company_id into account if needed
-- (Though Edge Functions mostly use service_role, this helps for direct web access)
drop policy if exists "profiles can view own row" on public.profiles;
create policy "profiles can view own row"
on public.profiles
for select
using (
  auth.uid() = user_id 
  or exists (
    select 1 from public.profiles admin_p
    where admin_p.user_id = auth.uid() 
    and (admin_p.role = 'admin' or (admin_p.role = 'company_admin' and admin_p.company_id = public.profiles.company_id))
  )
);
