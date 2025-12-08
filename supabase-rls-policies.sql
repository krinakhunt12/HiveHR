-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Run this AFTER creating the schema (supabase-schema.sql)
-- This ensures users can only access their own data

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view all profiles (for employee directory)
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Only admins can insert new profiles (done via signup)
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- DEPARTMENTS TABLE POLICIES
-- ============================================

-- Everyone can view departments
CREATE POLICY "Users can view departments"
  ON departments FOR SELECT
  USING (true);

-- Only admins/HR can modify departments
CREATE POLICY "Admins can modify departments"
  ON departments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================
-- ATTENDANCE TABLE POLICIES
-- ============================================

-- Users can view their own attendance
CREATE POLICY "Users can view own attendance"
  ON attendance FOR SELECT
  USING (auth.uid() = user_id);

-- Managers can view their team's attendance
CREATE POLICY "Managers can view team attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.manager_id = auth.uid()
      AND profiles.id = attendance.user_id
    )
  );

-- HR/Admins can view all attendance
CREATE POLICY "HR can view all attendance"
  ON attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Users can insert their own attendance
CREATE POLICY "Users can create own attendance"
  ON attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own attendance (within same day)
CREATE POLICY "Users can update own attendance"
  ON attendance FOR UPDATE
  USING (
    auth.uid() = user_id
    AND date = CURRENT_DATE
  );

-- ============================================
-- LEAVES TABLE POLICIES
-- ============================================

-- Users can view their own leaves
CREATE POLICY "Users can view own leaves"
  ON leaves FOR SELECT
  USING (auth.uid() = user_id);

-- Managers can view their team's leaves
CREATE POLICY "Managers can view team leaves"
  ON leaves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.manager_id = auth.uid()
      AND profiles.id = leaves.user_id
    )
  );

-- HR/Admins can view all leaves
CREATE POLICY "HR can view all leaves"
  ON leaves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Users can create their own leave requests
CREATE POLICY "Users can create leave requests"
  ON leaves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending leaves
CREATE POLICY "Users can update own pending leaves"
  ON leaves FOR UPDATE
  USING (
    auth.uid() = user_id
    AND status = 'pending'
  );

-- Managers/HR can approve/reject leaves
CREATE POLICY "Managers can approve leaves"
  ON leaves FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (
        role IN ('admin', 'hr')
        OR id = (SELECT manager_id FROM profiles WHERE id = leaves.user_id)
      )
    )
  );

-- ============================================
-- LEAVE BALANCE TABLE POLICIES
-- ============================================

-- Users can view their own leave balance
CREATE POLICY "Users can view own leave balance"
  ON leave_balance FOR SELECT
  USING (auth.uid() = user_id);

-- HR can view all balances
CREATE POLICY "HR can view all leave balances"
  ON leave_balance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Only system can insert/update leave balance
CREATE POLICY "System can manage leave balance"
  ON leave_balance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- ============================================
-- PERFORMANCE REVIEWS TABLE POLICIES
-- ============================================

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
  ON performance_reviews FOR SELECT
  USING (auth.uid() = employee_id);

-- Reviewers can view reviews they created
CREATE POLICY "Reviewers can view their reviews"
  ON performance_reviews FOR SELECT
  USING (auth.uid() = reviewer_id);

-- HR/Admins can view all reviews
CREATE POLICY "HR can view all reviews"
  ON performance_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Managers can create reviews for their team
CREATE POLICY "Managers can create team reviews"
  ON performance_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = employee_id
      AND manager_id = auth.uid()
    )
  );

-- Reviewers can update their own draft reviews
CREATE POLICY "Reviewers can update draft reviews"
  ON performance_reviews FOR UPDATE
  USING (
    auth.uid() = reviewer_id
    AND status = 'draft'
  );

-- ============================================
-- KPIs TABLE POLICIES
-- ============================================

-- Users can view their own KPIs
CREATE POLICY "Users can view own KPIs"
  ON kpis FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view department KPIs
CREATE POLICY "Users can view department KPIs"
  ON kpis FOR SELECT
  USING (
    department_id IN (
      SELECT department_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Managers/HR can create and manage KPIs
CREATE POLICY "Managers can manage KPIs"
  ON kpis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr', 'manager')
    )
  );

-- ============================================
-- FILES TABLE POLICIES
-- ============================================

-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public files
CREATE POLICY "Users can view public files"
  ON files FOR SELECT
  USING (is_public = true);

-- Users can view files shared with them
CREATE POLICY "Users can view shared files"
  ON files FOR SELECT
  USING (auth.uid() = ANY(shared_with));

-- HR/Admins can view all files
CREATE POLICY "HR can view all files"
  ON files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'hr')
    )
  );

-- Users can upload files
CREATE POLICY "Users can upload files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own files
CREATE POLICY "Users can update own files"
  ON files FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = uploaded_by);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = uploaded_by);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SYSTEM SETTINGS TABLE POLICIES
-- ============================================

-- Everyone can read system settings
CREATE POLICY "Users can view system settings"
  ON system_settings FOR SELECT
  USING (true);

-- Only admins can modify system settings
CREATE POLICY "Admins can modify system settings"
  ON system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- HELPER FUNCTIONS FOR POLICIES
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is HR
CREATE OR REPLACE FUNCTION is_hr()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is manager of another user
CREATE OR REPLACE FUNCTION is_manager_of(employee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = employee_id
    AND manager_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Row Level Security policies created successfully!';
  RAISE NOTICE '🔒 Your data is now protected with RLS';
  RAISE NOTICE '📋 Next step: Set up Storage policies (supabase-storage-policies.sql)';
END $$;
