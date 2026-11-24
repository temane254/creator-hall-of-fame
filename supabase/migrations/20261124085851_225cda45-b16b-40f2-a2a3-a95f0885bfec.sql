DROP POLICY IF EXISTS "Admins can view all nominations" ON public.nominations;
CREATE POLICY "Admins can view all nominations" ON public.nominations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can update nominations" ON public.nominations;
CREATE POLICY "Admins can update nominations" ON public.nominations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can manage entrepreneurs" ON public.entrepreneurs;
CREATE POLICY "Admins can manage entrepreneurs" ON public.entrepreneurs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can manage industry categories" ON public.industry_categories;
CREATE POLICY "Admins can manage industry categories" ON public.industry_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can view active job opportunities" ON public.job_opportunities;
DROP POLICY IF EXISTS "Admins can manage job opportunities" ON public.job_opportunities;
CREATE POLICY "Public can view active opportunities and admins can view all" ON public.job_opportunities FOR SELECT TO anon, authenticated USING (is_active = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can add job opportunities" ON public.job_opportunities FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can edit job opportunities" ON public.job_opportunities FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can remove job opportunities" ON public.job_opportunities FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

DROP FUNCTION public.has_role(uuid, public.app_role);