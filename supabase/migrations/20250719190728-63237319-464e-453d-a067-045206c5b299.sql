-- Add badge_photo_url column to entrepreneurs table
ALTER TABLE entrepreneurs ADD COLUMN badge_photo_url TEXT;

-- Add company_name and website columns for company info
ALTER TABLE entrepreneurs ADD COLUMN company_name TEXT;
ALTER TABLE entrepreneurs ADD COLUMN website TEXT;

-- Add pinned column for pinning entrepreneurs at the top
ALTER TABLE entrepreneurs ADD COLUMN pinned BOOLEAN DEFAULT FALSE;

-- Add industry to nominations table for search functionality
ALTER TABLE entrepreneurs ADD COLUMN email TEXT;