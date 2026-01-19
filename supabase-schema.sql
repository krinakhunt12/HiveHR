-- ============================================
-- HiveHR Database Schema for Supabase
-- ============================================
-- This file creates all necessary tables for the HiveHR system
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DEPARTMENTS TABLE (Created first to avoid dependency issues)
-- ============================================
CREATE TABLE departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  head_id UUID, -- Reference added after profiles table creation
  budget DECIMAL(15, 2),
  employee_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PROFILES TABLE (Extended User Info)
-- ============================================
-- Links to auth.users table in Supabase
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  
  -- Employment Info
  employee_id TEXT UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  role TEXT NOT NULL,
  job_title TEXT,
  manager_id UUID REFERENCES profiles(id),
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_type TEXT CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')) DEFAULT 'full-time',
  status TEXT CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated')) DEFAULT 'active',
  
  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add head_id reference to departments after profiles table exists
ALTER TABLE departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_id) REFERENCES profiles(id);

-- ============================================
-- 3. ATTENDANCE TABLE
-- ============================================
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Check in/out times
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  
  -- Location data
  check_in_location JSONB, -- {lat, lng, address}
  check_out_location JSONB,
  
  -- Status
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'half-day', 'work-from-home')) DEFAULT 'present',
  total_hours DECIMAL(5, 2), -- Calculated field
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per day
  UNIQUE(user_id, date)
);

-- ============================================
-- 4. LEAVES TABLE
-- ============================================
CREATE TABLE leaves (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Leave details
  leave_type TEXT CHECK (leave_type IN ('sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  
  -- Approval workflow
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Details
  reason TEXT NOT NULL,
  emergency_contact TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. LEAVE BALANCE TABLE
-- ============================================
CREATE TABLE leave_balance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Balance by type
  sick_leave_total INTEGER DEFAULT 10,
  sick_leave_used INTEGER DEFAULT 0,
  
  casual_leave_total INTEGER DEFAULT 12,
  casual_leave_used INTEGER DEFAULT 0,
  
  earned_leave_total INTEGER DEFAULT 15,
  earned_leave_used INTEGER DEFAULT 0,
  
  maternity_leave_total INTEGER DEFAULT 180,
  maternity_leave_used INTEGER DEFAULT 0,
  
  paternity_leave_total INTEGER DEFAULT 15,
  paternity_leave_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One record per user per year
  UNIQUE(user_id, year)
);

-- ============================================
-- 6. PERFORMANCE REVIEWS TABLE
-- ============================================
CREATE TABLE performance_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  
  -- Review period
  review_period TEXT NOT NULL, -- e.g., "Q1 2024", "Annual 2024"
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Ratings (1-5 scale)
  technical_skills INTEGER CHECK (technical_skills BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  teamwork INTEGER CHECK (teamwork BETWEEN 1 AND 5),
  problem_solving INTEGER CHECK (problem_solving BETWEEN 1 AND 5),
  leadership INTEGER CHECK (leadership BETWEEN 1 AND 5),
  initiative INTEGER CHECK (initiative BETWEEN 1 AND 5),
  overall_rating DECIMAL(3, 2), -- Calculated average
  
  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'submitted', 'acknowledged')) DEFAULT 'draft',
  acknowledged_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. KPIs TABLE
-- ============================================
CREATE TABLE kpis (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  
  -- KPI Details
  name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT CHECK (metric_type IN ('number', 'percentage', 'currency', 'boolean')) DEFAULT 'number',
  
  -- Targets
  target_value DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) DEFAULT 0,
  
  -- Period
  period TEXT NOT NULL, -- e.g., "Monthly", "Quarterly", "Annual"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('on-track', 'at-risk', 'behind', 'achieved')) DEFAULT 'on-track',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. FILES/DOCUMENTS TABLE
-- ============================================
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size BIGINT NOT NULL, -- in bytes
  file_url TEXT NOT NULL, -- Supabase Storage URL
  
  -- Categorization
  category TEXT CHECK (category IN ('resume', 'contract', 'certificate', 'policy', 'report', 'other')) DEFAULT 'other',
  tags TEXT[], -- Array of tags
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  shared_with UUID[], -- Array of user IDs
  
  -- Metadata
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification content
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'leave', 'attendance', 'performance', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_entity TEXT, -- e.g., 'leave', 'attendance'
  related_id UUID, -- ID of related record
  
  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_manager ON profiles(manager_id);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_employee_id ON profiles(employee_id);

-- Attendance indexes
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date DESC);
CREATE INDEX idx_attendance_date ON attendance(date DESC);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Leaves indexes
CREATE INDEX idx_leaves_user ON leaves(user_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);

-- Performance reviews indexes
CREATE INDEX idx_performance_employee ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviewer ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_date ON performance_reviews(review_date DESC);

-- KPIs indexes
CREATE INDEX idx_kpis_user ON kpis(user_id);
CREATE INDEX idx_kpis_department ON kpis(department_id);
CREATE INDEX idx_kpis_period ON kpis(start_date, end_date);

-- Files indexes
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balance_updated_at BEFORE UPDATE ON leave_balance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_reviews_updated_at BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON kpis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate attendance total hours
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.total_hours = EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_attendance_hours_trigger 
BEFORE INSERT OR UPDATE ON attendance 
FOR EACH ROW EXECUTE FUNCTION calculate_attendance_hours();

-- Function to calculate performance overall rating
CREATE OR REPLACE FUNCTION calculate_overall_rating()
RETURNS TRIGGER AS $$
BEGIN
  NEW.overall_rating = (
    COALESCE(NEW.technical_skills, 0) + 
    COALESCE(NEW.communication, 0) + 
    COALESCE(NEW.teamwork, 0) + 
    COALESCE(NEW.problem_solving, 0) + 
    COALESCE(NEW.leadership, 0) + 
    COALESCE(NEW.initiative, 0)
  )::DECIMAL / 6;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_overall_rating_trigger 
BEFORE INSERT OR UPDATE ON performance_reviews 
FOR EACH ROW EXECUTE FUNCTION calculate_overall_rating();

-- Function to update department employee count
CREATE OR REPLACE FUNCTION update_department_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increase count for new department
  IF TG_OP = 'INSERT' THEN
    UPDATE departments SET employee_count = employee_count + 1 WHERE id = NEW.department_id;
  -- Decrease count for old department, increase for new
  ELSIF TG_OP = 'UPDATE' AND OLD.department_id != NEW.department_id THEN
    UPDATE departments SET employee_count = employee_count - 1 WHERE id = OLD.department_id;
    UPDATE departments SET employee_count = employee_count + 1 WHERE id = NEW.department_id;
  -- Decrease count when employee removed
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE departments SET employee_count = employee_count - 1 WHERE id = OLD.department_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_department_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_department_count();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Engineering', 'Software development and technical teams'),
  ('Human Resources', 'People management and recruitment'),
  ('Marketing', 'Brand and customer engagement'),
  ('Sales', 'Revenue generation and client relations'),
  ('Finance', 'Financial planning and accounting'),
  ('Operations', 'Business operations and logistics'),
  ('Product', 'Product management and strategy'),
  ('Design', 'UI/UX and creative design')
ON CONFLICT (name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('company_name', '"HiveHR Inc."', 'Company name'),
  ('working_hours_start', '"09:00"', 'Standard work start time'),
  ('working_hours_end', '"18:00"', 'Standard work end time'),
  ('late_arrival_threshold', '15', 'Minutes after start time considered late'),
  ('leave_approval_required', 'true', 'Whether leaves require approval'),
  ('max_file_size_mb', '50', 'Maximum file upload size in MB')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ HiveHR database schema created successfully!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Enable Row Level Security (run supabase-rls-policies.sql)';
  RAISE NOTICE '2. Set up Storage bucket for files';
  RAISE NOTICE '3. Configure authentication in Supabase dashboard';
END $$;
