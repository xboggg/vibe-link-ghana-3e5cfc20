-- Create table to track sent payment reminders
CREATE TABLE public.payment_reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.payment_reminder_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view reminder logs
CREATE POLICY "Admins can view reminder logs"
  ON public.payment_reminder_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert (for edge functions)
CREATE POLICY "Service role can insert reminder logs"
  ON public.payment_reminder_logs
  FOR INSERT
  WITH CHECK (true);

-- Create index for efficient lookups
CREATE INDEX idx_reminder_logs_order_type ON public.payment_reminder_logs(order_id, reminder_type);