-- Migration: Add missing columns to leave_requests
-- This fixes the PGRST204 error where document_url was missing.

ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS document_url text;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS review_note text;
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Ensure total_days is numeric as expected by the code
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leave_requests' AND column_name = 'total_days') THEN
        ALTER TABLE public.leave_requests ALTER COLUMN total_days TYPE numeric(4,2);
    END IF;
END $$;
