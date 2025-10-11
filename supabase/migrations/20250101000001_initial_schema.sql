-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('dentist', 'clinic_owner');
CREATE TYPE specialty_type AS ENUM (
  'general_dentistry',
  'orthodontics',
  'endodontics',
  'periodontics',
  'prosthodontics',
  'oral_surgery',
  'pediatric_dentistry',
  'cosmetic_dentistry'
);
CREATE TYPE procedure_type AS ENUM (
  'crown',
  'veneer',
  'implant',
  'root_canal',
  'extraction',
  'orthodontics',
  'whitening',
  'filling',
  'bridge',
  'denture',
  'other'
);
CREATE TYPE affiliation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  headline TEXT,
  degree TEXT,
  specialty specialty_type,
  location TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinics table
CREATE TABLE public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinical cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  procedure_type procedure_type NOT NULL,
  case_notes TEXT,
  tags TEXT[] DEFAULT '{}',
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  patient_consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT patient_consent_required CHECK (patient_consent_given = TRUE)
);

-- Follows table (user following system)
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Clinic affiliations table
CREATE TABLE public.clinic_affiliations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status affiliation_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, user_id)
);

-- Reports table (content moderation)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case saves table (bookmarking)
CREATE TABLE public.case_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, case_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_specialty ON public.users(specialty);
CREATE INDEX idx_users_location ON public.users(location);
CREATE INDEX idx_clinics_owner_id ON public.clinics(owner_id);
CREATE INDEX idx_cases_user_id ON public.cases(user_id);
CREATE INDEX idx_cases_procedure_type ON public.cases(procedure_type);
CREATE INDEX idx_cases_tags ON public.cases USING GIN(tags);
CREATE INDEX idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX idx_follows_following_id ON public.follows(following_id);
CREATE INDEX idx_clinic_affiliations_clinic_id ON public.clinic_affiliations(clinic_id);
CREATE INDEX idx_clinic_affiliations_user_id ON public.clinic_affiliations(user_id);
CREATE INDEX idx_reports_case_id ON public.reports(case_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_case_saves_user_id ON public.case_saves(user_id);
CREATE INDEX idx_case_saves_case_id ON public.case_saves(case_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_affiliations_updated_at BEFORE UPDATE ON public.clinic_affiliations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
