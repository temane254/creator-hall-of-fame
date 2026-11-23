# Entrepreneur discovery and job opportunities

## Plan
- Reorder entrepreneur profile content so Company Information appears before Services.
- Redesign the featured entrepreneurs directory to make each business's real services, company identity, and contact options prominent; keep dynamic industry filtering and ten-per-page pagination.
- Add a public Job Opportunities page backed by vacancies admins can create, update, and remove from the dashboard; add a clear way to reach the page.

## Technical details
- Keep the existing React Router and Supabase-driven entrepreneur records.
- Use actual entrepreneur fields (bio, company name/logo, job count, and contact details); do not invent location or job totals.
- Store vacancies in Supabase; make published listings readable publicly and management restricted to admins.