'use server';

import { createClient } from '@/lib/shared/supabase/server';

export interface FeedItem {
  id: string;
  type: 'case' | 'thread' | 'clinic' | 'professional';
  data: any;
  created_at: string;
  activity_score?: number;
}

export async function getFeedItems(
  userId: string,
  filter: 'all' | 'cases' | 'threads' | 'clinics' | 'professionals' = 'all',
  sort: 'latest' | 'trending' | 'my_network' = 'latest',
  limit: number = 20,
  offset: number = 0
): Promise<FeedItem[]> {
  const supabase = await createClient();
  const feedItems: FeedItem[] = [];

  // Get user's network (following)
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map((f) => f.following_id) || [];

  // Fetch cases
  if (filter === 'all' || filter === 'cases') {
    let casesQuery = supabase
      .from('cases')
      .select('*, users(id, full_name, profile_photo_url, degree, specialty, location)')
      .order('created_at', { ascending: false });

    if (sort === 'my_network' && followingIds.length > 0) {
      casesQuery = casesQuery.in('user_id', followingIds);
    }

    const { data: cases } = await casesQuery.limit(limit);

    cases?.forEach((caseItem) => {
      feedItems.push({
        id: `case-${caseItem.id}`,
        type: 'case',
        data: caseItem,
        created_at: caseItem.created_at,
        activity_score: caseItem.views_count + caseItem.saves_count * 2,
      });
    });
  }

  // Fetch forum threads
  if (filter === 'all' || filter === 'threads') {
    let threadsQuery = supabase
      .from('forum_threads')
      .select('*, users(id, full_name, profile_photo_url, degree, specialty)')
      .order('created_at', { ascending: false });

    if (sort === 'my_network' && followingIds.length > 0) {
      threadsQuery = threadsQuery.in('author_id', followingIds);
    }

    const { data: threads } = await threadsQuery.limit(limit);

    threads?.forEach((thread) => {
      feedItems.push({
        id: `thread-${thread.id}`,
        type: 'thread',
        data: thread,
        created_at: thread.created_at,
        activity_score: thread.views_count + thread.replies_count * 3,
      });
    });
  }

  // Fetch clinics
  if (filter === 'all' || filter === 'clinics') {
    const { data: clinics } = await supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    clinics?.forEach((clinic) => {
      feedItems.push({
        id: `clinic-${clinic.id}`,
        type: 'clinic',
        data: clinic,
        created_at: clinic.created_at,
        activity_score: 0,
      });
    });
  }

  // Fetch professionals
  if (filter === 'all' || filter === 'professionals') {
    const { data: professionals } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    professionals?.forEach((professional) => {
      feedItems.push({
        id: `professional-${professional.id}`,
        type: 'professional',
        data: professional,
        created_at: professional.created_at,
        activity_score: 0,
      });
    });
  }

  // Sort feed items
  if (sort === 'latest') {
    feedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === 'trending') {
    feedItems.sort((a, b) => (b.activity_score || 0) - (a.activity_score || 0));
  }

  return feedItems.slice(offset, offset + limit);
}

export async function getSuggestedProfessionals(userId: string, limit: number = 5) {
  const supabase = await createClient();

  // Get users the current user is not following
  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  const followingIds = following?.map((f) => f.following_id) || [];

  const { data: professionals } = await supabase
    .from('users')
    .select('id, full_name, profile_photo_url, degree, specialty, location, headline')
    .neq('id', userId)
    .not('id', 'in', `(${followingIds.join(',')})`)
    .limit(limit);

  return professionals || [];
}

export async function getTrendingProcedures(limit: number = 5) {
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from('cases')
    .select('procedure_type')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const procedureCounts: Record<string, number> = {};
  cases?.forEach((c) => {
    procedureCounts[c.procedure_type] = (procedureCounts[c.procedure_type] || 0) + 1;
  });

  return Object.entries(procedureCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([procedure, count]) => ({ procedure, count }));
}

export async function getActiveDiscussions(limit: number = 5) {
  const supabase = await createClient();

  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, category, replies_count, last_activity_at')
    .order('last_activity_at', { ascending: false })
    .limit(limit);

  return threads || [];
}

export async function getRecentClinicActivity(limit: number = 5) {
  const supabase = await createClient();

  const { data: clinics } = await supabase
    .from('clinics')
    .select('id, name, logo_url, location, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  return clinics || [];
}
