-- Add SEO fields to blog_posts table if they don't exist
ALTER TABLE IF EXISTS public.blog_posts
ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE IF EXISTS public.blog_posts
ADD COLUMN IF NOT EXISTS meta_title text;

ALTER TABLE IF EXISTS public.blog_posts
ADD COLUMN IF NOT EXISTS meta_description text;

ALTER TABLE IF EXISTS public.blog_posts
ADD COLUMN IF NOT EXISTS meta_keywords text;

-- Optional: unique index on slug if you plan to use it as public URL (keep commented for safety)
-- CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts (slug);
