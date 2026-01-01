-- Add image_urls column to forum_threads table for attachments
ALTER TABLE public.forum_threads ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.forum_threads.image_urls IS 'Array of image URLs attached to the thread';

-- Create storage bucket for forum images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Anyone can view forum images
CREATE POLICY "Public forum images are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'forum-images');

-- Storage policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload forum images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');

-- Storage policy: Users can delete their own images
CREATE POLICY "Users can delete their own forum images" ON storage.objects
  FOR DELETE USING (bucket_id = 'forum-images' AND auth.uid()::text = (storage.foldername(name))[1]);
