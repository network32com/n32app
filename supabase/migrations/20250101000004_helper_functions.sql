-- Helper functions for common operations

-- Function to increment case views
CREATE OR REPLACE FUNCTION increment_case_views(case_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.cases
  SET views_count = views_count + 1
  WHERE id = case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE following_id = user_id;
$$ LANGUAGE sql STABLE;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.follows
  WHERE follower_id = user_id;
$$ LANGUAGE sql STABLE;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following(follower_id UUID, following_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.follows
    WHERE follows.follower_id = is_following.follower_id
    AND follows.following_id = is_following.following_id
  );
$$ LANGUAGE sql STABLE;

-- Function to get case count for a user
CREATE OR REPLACE FUNCTION get_user_case_count(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.cases
  WHERE cases.user_id = get_user_case_count.user_id;
$$ LANGUAGE sql STABLE;

-- Function to check if user has saved a case
CREATE OR REPLACE FUNCTION has_saved_case(user_id UUID, case_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.case_saves
    WHERE case_saves.user_id = has_saved_case.user_id
    AND case_saves.case_id = has_saved_case.case_id
  );
$$ LANGUAGE sql STABLE;

-- Function to update case saves count when a save is added/removed
CREATE OR REPLACE FUNCTION update_case_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.cases
    SET saves_count = saves_count + 1
    WHERE id = NEW.case_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.cases
    SET saves_count = saves_count - 1
    WHERE id = OLD.case_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for case saves count
CREATE TRIGGER update_case_saves_count_trigger
  AFTER INSERT OR DELETE ON public.case_saves
  FOR EACH ROW
  EXECUTE FUNCTION update_case_saves_count();

-- Function to search users by name, specialty, or location
CREATE OR REPLACE FUNCTION search_users(search_query TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  headline TEXT,
  specialty specialty_type,
  location TEXT,
  profile_photo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.full_name,
    u.headline,
    u.specialty,
    u.location,
    u.profile_photo_url
  FROM public.users u
  WHERE
    u.full_name ILIKE '%' || search_query || '%' OR
    u.headline ILIKE '%' || search_query || '%' OR
    u.location ILIKE '%' || search_query || '%' OR
    u.specialty::TEXT ILIKE '%' || search_query || '%'
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to search cases by title, tags, or procedure type
CREATE OR REPLACE FUNCTION search_cases(search_query TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  procedure_type procedure_type,
  tags TEXT[],
  before_image_url TEXT,
  after_image_url TEXT,
  views_count INTEGER,
  saves_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    c.title,
    c.procedure_type,
    c.tags,
    c.before_image_url,
    c.after_image_url,
    c.views_count,
    c.saves_count,
    c.created_at
  FROM public.cases c
  WHERE
    c.title ILIKE '%' || search_query || '%' OR
    c.case_notes ILIKE '%' || search_query || '%' OR
    c.procedure_type::TEXT ILIKE '%' || search_query || '%' OR
    EXISTS (
      SELECT 1 FROM unnest(c.tags) tag
      WHERE tag ILIKE '%' || search_query || '%'
    )
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get feed for a user (cases from followed users + specialty matches)
CREATE OR REPLACE FUNCTION get_user_feed(
  user_id UUID,
  page_limit INTEGER DEFAULT 20,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  procedure_type procedure_type,
  tags TEXT[],
  before_image_url TEXT,
  after_image_url TEXT,
  views_count INTEGER,
  saves_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    c.title,
    c.procedure_type,
    c.tags,
    c.before_image_url,
    c.after_image_url,
    c.views_count,
    c.saves_count,
    c.created_at
  FROM public.cases c
  WHERE
    -- Cases from followed users
    c.user_id IN (
      SELECT following_id FROM public.follows
      WHERE follower_id = get_user_feed.user_id
    )
    OR
    -- Cases from users with same specialty
    c.user_id IN (
      SELECT u.id FROM public.users u
      WHERE u.specialty = (
        SELECT specialty FROM public.users WHERE id = get_user_feed.user_id
      )
      AND u.id != get_user_feed.user_id
    )
  ORDER BY c.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;
