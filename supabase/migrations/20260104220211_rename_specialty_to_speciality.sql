-- Rename the enum type
ALTER TYPE specialty_type RENAME TO speciality_type;

-- Rename the column in the users table
ALTER TABLE public.users RENAME COLUMN specialty TO speciality;

-- Update indexes
ALTER INDEX idx_users_specialty RENAME TO idx_users_speciality;
