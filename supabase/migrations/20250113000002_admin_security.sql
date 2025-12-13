-- Migration: Admin Security Enhancement
-- Created: 2025-01-13
-- Purpose: Enforce admin-only access to reports and admin features
-- PREREQUISITE: Run 20250113000000_add_admin_role.sql FIRST!

-- ============================================
-- STEP 1: Ensure at least one admin exists
-- ============================================
-- NOTE: Replace 'your-admin-email@example.com' with your actual admin email
-- IMPORTANT: Run this BEFORE deploying code changes!

-- Update your user to admin role (uncomment and modify)
-- UPDATE users 
-- SET role = 'admin' 
-- WHERE email = 'your-admin-email@example.com';

-- To verify admin user exists:
-- SELECT id, email, role FROM users WHERE role = 'admin';

-- ============================================
-- STEP 2: Update RLS Policies for Reports
-- ============================================

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Public can view reports" ON reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON reports;
DROP POLICY IF EXISTS "Only admins can view reports" ON reports;
DROP POLICY IF EXISTS "Only admins can update reports" ON reports;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can view reports" 
ON reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create admin-only UPDATE policy
CREATE POLICY "Only admins can update reports" 
ON reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create admin-only INSERT policy (for creating reports via admin)
CREATE POLICY "Only admins can insert reports" 
ON reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow authenticated users to create reports (report violations)
-- This will be handled by a separate policy for public reporting
CREATE POLICY "Authenticated users can report content"
ON reports
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- STEP 3: Create helper function (optional)
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check admin users
-- SELECT id, email, full_name, role FROM users WHERE role = 'admin';

-- Check RLS policies on reports table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'reports';

-- Test admin check function
-- SELECT is_admin();

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- If you need to rollback this migration:
--
-- 1. Drop new policies:
--    DROP POLICY "Only admins can view reports" ON reports;
--    DROP POLICY "Only admins can update reports" ON reports;
--    DROP POLICY "Only admins can insert reports" ON reports;
--    DROP POLICY "Authenticated users can report content" ON reports;
--
-- 2. Drop helper function:
--    DROP FUNCTION IF EXISTS is_admin();
--
-- 3. Restore old policies (if needed)
