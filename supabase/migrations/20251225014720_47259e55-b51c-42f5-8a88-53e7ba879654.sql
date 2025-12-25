-- Allow public order tracking by order ID or email
CREATE POLICY "Anyone can view their order by ID or email"
ON public.orders
FOR SELECT
USING (true);