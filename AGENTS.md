# Project Architecture

- Store job openings in Supabase's `job_opportunities` table; visitors browse published openings at `/jobs`, while job management stays in `/admin` and is enforced with protected `user_roles` records and row-level policies, so public discovery does not grant administrative access.