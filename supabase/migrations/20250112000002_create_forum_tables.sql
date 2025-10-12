-- Forum categories enum
CREATE TYPE forum_category AS ENUM (
  'general',
  'clinical_cases',
  'techniques',
  'equipment',
  'practice_management',
  'education',
  'research',
  'off_topic'
);

-- Forum threads table
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category forum_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum replies table
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thread likes table
CREATE TABLE public.forum_thread_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- Reply likes table
CREATE TABLE public.forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reply_id UUID NOT NULL REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_forum_threads_author ON public.forum_threads(author_id);
CREATE INDEX idx_forum_threads_category ON public.forum_threads(category);
CREATE INDEX idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX idx_forum_threads_last_activity ON public.forum_threads(last_activity_at DESC);
CREATE INDEX idx_forum_replies_thread ON public.forum_replies(thread_id);
CREATE INDEX idx_forum_replies_author ON public.forum_replies(author_id);
CREATE INDEX idx_forum_replies_parent ON public.forum_replies(parent_reply_id);

-- Enable RLS
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_threads
CREATE POLICY "Anyone can view threads" ON public.forum_threads
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON public.forum_threads
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their threads" ON public.forum_threads
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their threads" ON public.forum_threads
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for forum_replies
CREATE POLICY "Anyone can view replies" ON public.forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their replies" ON public.forum_replies
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their replies" ON public.forum_replies
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for likes
CREATE POLICY "Anyone can view thread likes" ON public.forum_thread_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their thread likes" ON public.forum_thread_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reply likes" ON public.forum_reply_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their reply likes" ON public.forum_reply_likes
  FOR ALL USING (auth.uid() = user_id);

-- Function to update thread reply count
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_threads
    SET replies_count = replies_count + 1,
        last_activity_at = NOW()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_threads
    SET replies_count = GREATEST(replies_count - 1, 0)
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count
CREATE TRIGGER trigger_update_thread_reply_count
AFTER INSERT OR DELETE ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Function to update thread updated_at
CREATE OR REPLACE FUNCTION update_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for thread timestamp
CREATE TRIGGER trigger_update_thread_timestamp
BEFORE UPDATE ON public.forum_threads
FOR EACH ROW EXECUTE FUNCTION update_thread_timestamp();

-- Trigger for reply timestamp
CREATE TRIGGER trigger_update_reply_timestamp
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION update_thread_timestamp();
