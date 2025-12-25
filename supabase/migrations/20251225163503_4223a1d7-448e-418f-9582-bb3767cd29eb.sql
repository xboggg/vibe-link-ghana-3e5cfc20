-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload reference images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view reference images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their uploaded reference images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete reference images" ON storage.objects;

-- Make reference-images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'reference-images';

-- Create new policies with unique names
CREATE POLICY "Auth users upload to reference-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reference-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins view reference-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reference-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users view own reference-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reference-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins delete reference-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'reference-images' AND public.has_role(auth.uid(), 'admin'));