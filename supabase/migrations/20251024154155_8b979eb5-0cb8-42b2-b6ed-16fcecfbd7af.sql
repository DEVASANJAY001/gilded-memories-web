-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Create photos table to track uploaded photos
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on photos table
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Create policies for photos table (public read, anyone can upload)
CREATE POLICY "Anyone can view photos"
ON public.photos
FOR SELECT
USING (true);

CREATE POLICY "Anyone can upload photos"
ON public.photos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete photos"
ON public.photos
FOR DELETE
USING (true);

-- Create storage policies for photos bucket
CREATE POLICY "Anyone can view photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can delete photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'photos');