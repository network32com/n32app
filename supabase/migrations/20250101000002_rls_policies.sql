-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_saves ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view all public profiles
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- CLINICS TABLE POLICIES
-- =============================================

-- Anyone can view clinics
CREATE POLICY "Anyone can view clinics"
  ON public.clinics FOR SELECT
  USING (true);

-- Only clinic owners can create clinics
CREATE POLICY "Clinic owners can create clinics"
  ON public.clinics FOR INSERT
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'clinic_owner'
    )
  );

-- Clinic owners can update their own clinics
CREATE POLICY "Clinic owners can update own clinics"
  ON public.clinics FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Clinic owners can delete their own clinics
CREATE POLICY "Clinic owners can delete own clinics"
  ON public.clinics FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================
-- CASES TABLE POLICIES
-- =============================================

-- Anyone can view cases
CREATE POLICY "Anyone can view cases"
  ON public.cases FOR SELECT
  USING (true);

-- Authenticated users can create cases
CREATE POLICY "Authenticated users can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    patient_consent_given = TRUE
  );

-- Users can update their own cases
CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cases
CREATE POLICY "Users can delete own cases"
  ON public.cases FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FOLLOWS TABLE POLICIES
-- =============================================

-- Users can view all follows
CREATE POLICY "Users can view all follows"
  ON public.follows FOR SELECT
  USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- CLINIC AFFILIATIONS TABLE POLICIES
-- =============================================

-- Users can view affiliations they're part of
CREATE POLICY "Users can view their affiliations"
  ON public.clinic_affiliations FOR SELECT
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT owner_id FROM public.clinics WHERE id = clinic_id
    )
  );

-- Clinic owners can create affiliations (invites)
CREATE POLICY "Clinic owners can create affiliations"
  ON public.clinic_affiliations FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.clinics WHERE id = clinic_id
    )
  );

-- Users can update their own affiliation status
CREATE POLICY "Users can update own affiliation status"
  ON public.clinic_affiliations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Clinic owners can delete affiliations
CREATE POLICY "Clinic owners can delete affiliations"
  ON public.clinic_affiliations FOR DELETE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.clinics WHERE id = clinic_id
    )
  );

-- =============================================
-- REPORTS TABLE POLICIES
-- =============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Note: Only admins should update/delete reports (handled via service role)

-- =============================================
-- CASE SAVES TABLE POLICIES
-- =============================================

-- Users can view their own saves
CREATE POLICY "Users can view own saves"
  ON public.case_saves FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save cases
CREATE POLICY "Users can save cases"
  ON public.case_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unsave cases
CREATE POLICY "Users can unsave cases"
  ON public.case_saves FOR DELETE
  USING (auth.uid() = user_id);
