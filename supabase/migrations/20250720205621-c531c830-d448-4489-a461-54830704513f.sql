-- Create industry categories table
CREATE TABLE public.industry_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view industry categories" 
ON public.industry_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage industry categories" 
ON public.industry_categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Insert some default industries
INSERT INTO public.industry_categories (name) VALUES
('Technology'),
('Agriculture'),
('Manufacturing'),
('Retail'),
('Healthcare'),
('Education'),
('Finance'),
('Tourism'),
('Construction'),
('Transportation');

-- Add trigger for timestamps
CREATE TRIGGER update_industry_categories_updated_at
BEFORE UPDATE ON public.industry_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();