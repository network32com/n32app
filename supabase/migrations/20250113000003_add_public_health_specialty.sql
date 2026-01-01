-- Migration: Add New Specialties to Specialty Type
-- Created: 2025-01-13
-- Purpose: Add 'public_health' and 'oral_pathology' to the specialty_type enum

-- Add 'public_health' specialty to the specialty_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'specialty_type' AND e.enumlabel = 'public_health'
  ) THEN
    ALTER TYPE specialty_type ADD VALUE 'public_health';
  END IF;
END $$;

-- Add 'oral_pathology' specialty to the specialty_type enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'specialty_type' AND e.enumlabel = 'oral_pathology'
  ) THEN
    ALTER TYPE specialty_type ADD VALUE 'oral_pathology';
  END IF;
END $$;
