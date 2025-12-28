-- Create table for chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER NOT NULL DEFAULT 0,
  user_agent TEXT,
  page_url TEXT
);

-- Create table for individual chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  suggestions TEXT[]
);

-- Create table for tracking common topics/questions
CREATE TABLE public.chat_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  question_pattern TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  last_asked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_chat_conversations_started_at ON public.chat_conversations(started_at DESC);
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_analytics_topic ON public.chat_analytics(topic);
CREATE INDEX idx_chat_analytics_count ON public.chat_analytics(count DESC);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public insert for conversations (chatbot needs to log without auth)
CREATE POLICY "Allow public insert for chat_conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for chat_conversations"
ON public.chat_conversations
FOR UPDATE
USING (true);

-- Allow public insert for messages
CREATE POLICY "Allow public insert for chat_messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (true);

-- Allow public insert/update for analytics
CREATE POLICY "Allow public insert for chat_analytics"
ON public.chat_analytics
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update for chat_analytics"
ON public.chat_analytics
FOR UPDATE
USING (true);

-- Allow admins to read all chat data (fixed parameter order)
CREATE POLICY "Admins can read chat_conversations"
ON public.chat_conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read chat_messages"
ON public.chat_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read chat_analytics"
ON public.chat_analytics
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));