-- Add updated_at column to blog_posts table if it doesn't exist
ALTER TABLE IF EXISTS public.blog_posts
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- Create or replace the handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS handle_blog_posts_updated_at ON public.blog_posts;

-- Create trigger for blog_posts table
CREATE TRIGGER handle_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Update existing records to have updated_at = created_at if updated_at is NULL
UPDATE public.blog_posts
SET updated_at = created_at
WHERE updated_at IS NULL AND created_at IS NOT NULL;

-- Set updated_at to current time for any remaining NULL values
UPDATE public.blog_posts
SET updated_at = timezone('utc'::text, now())
WHERE updated_at IS NULL;

