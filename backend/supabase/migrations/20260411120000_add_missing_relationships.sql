-- Add explicit relationship between employees and profiles to help PostgREST joins
-- Both user_id columns reference auth.users.id, but PostgREST needs a direct link
-- between the public tables to perform sibling joins easily.

alter table public.employees 
add constraint employees_profiles_user_id_fkey 
foreign key (user_id) 
references public.profiles(user_id) 
on delete set null;

-- Also add relationship for reviewed_by in leave_requests if we want to join there
alter table public.leave_requests
add constraint leave_requests_reviewed_by_profiles_fkey
foreign key (reviewed_by)
references public.profiles(user_id)
on delete set null;
