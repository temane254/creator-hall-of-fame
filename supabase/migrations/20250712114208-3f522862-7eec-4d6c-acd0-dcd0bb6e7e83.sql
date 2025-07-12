-- Add jobs_created field to entrepreneurs table
ALTER TABLE public.entrepreneurs ADD COLUMN jobs_created INTEGER DEFAULT 0;

-- Create storage bucket for entrepreneur photos
INSERT INTO storage.buckets (id, name, public) VALUES ('entrepreneur-photos', 'entrepreneur-photos', true);

-- Create storage policies for entrepreneur photos
CREATE POLICY "Anyone can view entrepreneur photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'entrepreneur-photos');

CREATE POLICY "Admins can upload entrepreneur photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'entrepreneur-photos' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update entrepreneur photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'entrepreneur-photos' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete entrepreneur photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'entrepreneur-photos' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));