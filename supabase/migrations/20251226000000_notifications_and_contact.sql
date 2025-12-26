-- =====================================================
-- Migration: Create Notifications System & Add Contact Number
-- =====================================================

-- 1. Add contact_number to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS contact_number TEXT;

-- 2. Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'follower',
  'case_save',
  'case_view',
  'forum_reply',
  'thread_like',
  'reply_like',
  'system'
);

-- 3. Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- 5. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- Trigger Functions for Automatic Notifications
-- =====================================================

-- 7. Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_content TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  -- Don't notify if user is notifying themselves
  IF p_user_id = p_actor_id THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, type, title, content, link, metadata)
  VALUES (p_user_id, p_actor_id, p_type, p_title, p_content, p_link, p_metadata)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger function for new followers
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
BEGIN
  SELECT full_name INTO actor_name FROM public.users WHERE id = NEW.follower_id;
  
  PERFORM create_notification(
    NEW.following_id,
    NEW.follower_id,
    'follower',
    actor_name || ' started following you',
    NULL,
    '/profile/' || NEW.follower_id,
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

-- 9. Trigger function for case saves
CREATE OR REPLACE FUNCTION notify_on_case_save()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  case_owner_id UUID;
  case_title TEXT;
BEGIN
  SELECT full_name INTO actor_name FROM public.users WHERE id = NEW.user_id;
  SELECT user_id, title INTO case_owner_id, case_title FROM public.cases WHERE id = NEW.case_id;
  
  PERFORM create_notification(
    case_owner_id,
    NEW.user_id,
    'case_save',
    actor_name || ' saved your case',
    case_title,
    '/cases/' || NEW.case_id,
    jsonb_build_object('case_id', NEW.case_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_case_save
AFTER INSERT ON public.case_saves
FOR EACH ROW EXECUTE FUNCTION notify_on_case_save();

-- 10. Trigger function for forum replies
CREATE OR REPLACE FUNCTION notify_on_forum_reply()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  thread_author_id UUID;
  thread_title TEXT;
BEGIN
  SELECT full_name INTO actor_name FROM public.users WHERE id = NEW.author_id;
  SELECT author_id, title INTO thread_author_id, thread_title FROM public.forum_threads WHERE id = NEW.thread_id;
  
  PERFORM create_notification(
    thread_author_id,
    NEW.author_id,
    'forum_reply',
    actor_name || ' replied to your thread',
    thread_title,
    '/forum/' || NEW.thread_id,
    jsonb_build_object('thread_id', NEW.thread_id, 'reply_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_forum_reply
AFTER INSERT ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION notify_on_forum_reply();

-- 11. Trigger function for thread likes
CREATE OR REPLACE FUNCTION notify_on_thread_like()
RETURNS TRIGGER AS $$
DECLARE
  actor_name TEXT;
  thread_author_id UUID;
  thread_title TEXT;
BEGIN
  SELECT full_name INTO actor_name FROM public.users WHERE id = NEW.user_id;
  SELECT author_id, title INTO thread_author_id, thread_title FROM public.forum_threads WHERE id = NEW.thread_id;
  
  PERFORM create_notification(
    thread_author_id,
    NEW.user_id,
    'thread_like',
    actor_name || ' liked your thread',
    thread_title,
    '/forum/' || NEW.thread_id,
    jsonb_build_object('thread_id', NEW.thread_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_thread_like
AFTER INSERT ON public.forum_thread_likes
FOR EACH ROW EXECUTE FUNCTION notify_on_thread_like();

-- 12. Create or replace increment_case_views to also notify owner (with throttling)
-- We'll store last view notification time in metadata to throttle
CREATE OR REPLACE FUNCTION increment_case_views(case_id UUID)
RETURNS VOID AS $$
DECLARE
  case_owner_id UUID;
  viewer_id UUID;
  viewer_name TEXT;
  case_title TEXT;
  last_view_notification TIMESTAMPTZ;
BEGIN
  -- Increment the view count
  UPDATE public.cases 
  SET views_count = views_count + 1 
  WHERE id = case_id;
  
  -- Get case owner and current user
  SELECT user_id, title INTO case_owner_id, case_title FROM public.cases WHERE id = case_id;
  viewer_id := auth.uid();
  
  -- Skip if viewer is the owner or not authenticated
  IF viewer_id IS NULL OR viewer_id = case_owner_id THEN
    RETURN;
  END IF;
  
  -- Check for recent view notification (throttle to 1 per hour per case per viewer)
  SELECT created_at INTO last_view_notification 
  FROM public.notifications 
  WHERE user_id = case_owner_id 
    AND actor_id = viewer_id 
    AND type = 'case_view' 
    AND (metadata->>'case_id')::UUID = case_id
    AND created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF last_view_notification IS NOT NULL THEN
    RETURN; -- Already notified recently
  END IF;
  
  -- Get viewer name and create notification
  SELECT full_name INTO viewer_name FROM public.users WHERE id = viewer_id;
  
  PERFORM create_notification(
    case_owner_id,
    viewer_id,
    'case_view',
    viewer_name || ' viewed your case',
    case_title,
    '/cases/' || case_id,
    jsonb_build_object('case_id', case_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
