-- Add scheduled publishing column to blog_posts
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying of scheduled posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled ON public.blog_posts (scheduled_publish_at) 
WHERE scheduled_publish_at IS NOT NULL AND published = false;