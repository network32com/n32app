'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { ForumThread, ForumReply, ForumCategory } from '@/lib/shared/types/database.types';

export async function getForumThreads(
  category?: ForumCategory,
  sortBy: 'latest' | 'trending' = 'latest',
  searchQuery?: string
): Promise<ForumThread[]> {
  const supabase = await createClient();

  let query = supabase
    .from('forum_threads')
    .select('*, users(id, full_name, profile_photo_url, degree, specialty)')
    .order(sortBy === 'latest' ? 'created_at' : 'last_activity_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query.limit(50);

  if (error) throw error;
  return data || [];
}

export async function getForumThread(id: string): Promise<ForumThread> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('forum_threads')
    .select('*, users(id, full_name, profile_photo_url, degree, specialty, headline, location)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getThreadReplies(threadId: string): Promise<ForumReply[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('forum_replies')
    .select('*, users(id, full_name, profile_photo_url, degree)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Organize replies into nested structure
  const repliesMap = new Map<string, ForumReply>();
  const rootReplies: ForumReply[] = [];

  data?.forEach((reply) => {
    repliesMap.set(reply.id, { ...reply, replies: [] });
  });

  data?.forEach((reply) => {
    const replyWithChildren = repliesMap.get(reply.id)!;
    if (reply.parent_reply_id) {
      const parent = repliesMap.get(reply.parent_reply_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(replyWithChildren);
      }
    } else {
      rootReplies.push(replyWithChildren);
    }
  });

  return rootReplies;
}

export async function createForumThread(data: {
  title: string;
  body: string;
  category: ForumCategory;
  tags: string[];
  author_id: string;
}): Promise<ForumThread> {
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert(data)
    .select('*, users(id, full_name, profile_photo_url, degree, specialty)')
    .single();

  if (error) throw error;
  return thread;
}

export async function createForumReply(data: {
  thread_id: string;
  author_id: string;
  body: string;
  parent_reply_id?: string;
}): Promise<ForumReply> {
  const supabase = await createClient();

  const { data: reply, error } = await supabase
    .from('forum_replies')
    .insert(data)
    .select('*, users(id, full_name, profile_photo_url, degree)')
    .single();

  if (error) throw error;
  return reply;
}

export async function incrementThreadViews(threadId: string): Promise<void> {
  const supabase = await createClient();

  await supabase.rpc('increment', {
    table_name: 'forum_threads',
    row_id: threadId,
    column_name: 'views_count',
  });
}

export async function deleteForumThread(threadId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId)
    .eq('author_id', userId);

  if (error) throw error;
}

export async function deleteForumReply(replyId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('forum_replies')
    .delete()
    .eq('id', replyId)
    .eq('author_id', userId);

  if (error) throw error;
}
