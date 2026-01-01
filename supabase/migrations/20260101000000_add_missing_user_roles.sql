-- Add missing roles to user_role enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed in a transaction block (like a DO block) in some Postgres versions.
-- We will run these individually.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'professional';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'student';
