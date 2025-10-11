-- Create storage buckets for media files

-- Profile photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Clinic logos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-logos',
  'clinic-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Case images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-images',
  'case-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Profile Photos Policies
CREATE POLICY "Users can upload their own profile photo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Clinic Logos Policies
CREATE POLICY "Clinic owners can upload clinic logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-logos' AND
    auth.uid() IN (
      SELECT owner_id FROM public.clinics
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Clinic owners can update clinic logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clinic-logos' AND
    auth.uid() IN (
      SELECT owner_id FROM public.clinics
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Clinic owners can delete clinic logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clinic-logos' AND
    auth.uid() IN (
      SELECT owner_id FROM public.clinics
      WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Anyone can view clinic logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

-- Case Images Policies
CREATE POLICY "Users can upload case images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their case images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'case-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their case images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view case images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-images');
