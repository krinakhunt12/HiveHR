-- Add break_minutes to attendance table for complex duration logic
alter table public.attendance add column if not exists break_minutes integer default 60;

-- Optional: Add a comment to explain the 9-hour shift policy (8h work + 1h break)
comment on column public.attendance.break_minutes is 'Duration of breaks in minutes. Default is 60 (1 hour).';
