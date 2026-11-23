CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role
FROM public.profiles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (email, full_name, updated_at) ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Admins can view all nominations" ON public.nominations;
CREATE POLICY "Admins can view all nominations" ON public.nominations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update nominations" ON public.nominations;
CREATE POLICY "Admins can update nominations" ON public.nominations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage entrepreneurs" ON public.entrepreneurs;
CREATE POLICY "Admins can manage entrepreneurs" ON public.entrepreneurs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage industry categories" ON public.industry_categories;
CREATE POLICY "Admins can manage industry categories" ON public.industry_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.job_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company_name text NOT NULL,
  industry text,
  location text,
  employment_type text NOT NULL DEFAULT 'Full-time',
  description text NOT NULL,
  requirements text,
  application_email text,
  application_url text,
  whatsapp_number text,
  application_deadline date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_opportunities TO authenticated;
GRANT ALL ON public.job_opportunities TO service_role;
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active job opportunities" ON public.job_opportunities FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage job opportunities" ON public.job_opportunities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_job_opportunities_updated_at
BEFORE UPDATE ON public.job_opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();