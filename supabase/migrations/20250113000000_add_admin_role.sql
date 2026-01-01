-- Migration: Add Admin Role to Enum
-- Created: 2025-01-13
-- Purpose: Add 'admin' to user_role enum (must be run BEFORE admin_security migration)

-- Add 'admin' role to the user_role enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;
