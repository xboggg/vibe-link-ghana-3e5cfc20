-- Add final_link column to orders table
-- This stores the final invitation link (subdomain or custom domain) when order is completed

ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_link TEXT;

-- Add comment for documentation
COMMENT ON COLUMN orders.final_link IS 'The final invitation URL (e.g., amawedding.vibelinkgh.com or custom domain)';
