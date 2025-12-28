-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active team members" 
ON public.team_members 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all team members" 
ON public.team_members 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team members" 
ON public.team_members 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team members" 
ON public.team_members 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for team photos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true);

-- Storage policies for team photos
CREATE POLICY "Team photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-photos');

CREATE POLICY "Admins can upload team photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'team-photos' AND has_role(auth.uid(), 'admin'::app_role));