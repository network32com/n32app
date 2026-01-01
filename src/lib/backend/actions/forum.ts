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
  image_urls?: string[];
  author_id: string;
}): Promise<ForumThread> {
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from('forum_threads')
    .insert({
      ...data,
      image_urls: data.image_urls || [],
    })
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

export async function updateForumThread(
  threadId: string,
  userId: string,
  updates: { title?: string; body?: string; tags?: string[] }
): Promise<ForumThread> {
  const supabase = await createClient();

  // First verify the user owns this thread
  const { data: threadData, error: fetchError } = await supabase
    .from('forum_threads')
    .select('author_id')
    .eq('id', threadId)
    .single();

  if (fetchError || !threadData) {
    throw new Error('Thread not found');
  }

  if (threadData.author_id !== userId) {
    throw new Error('Unauthorized: You can only edit your own threads');
  }

  const { data, error } = await supabase
    .from('forum_threads')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId)
    .eq('author_id', userId)
    .select('*, users(id, full_name, profile_photo_url, degree, specialty)')
    .single();

  if (error) throw error;
  return data;
}

export async function uploadForumImage(userId: string, file: File): Promise<string> {
  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${userId}/forum-${timestamp}.${fileExt}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('forum-images')
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('forum-images').getPublicUrl(fileName);

  return publicUrl;
}

export async function likeThread(threadId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('forum_thread_likes')
    .insert({ thread_id: threadId, user_id: userId });

  if (error && !error.message.includes('duplicate')) {
    throw new Error(error.message);
  }
}

export async function unlikeThread(threadId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('forum_thread_likes')
    .delete()
    .eq('thread_id', threadId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function hasLikedThread(threadId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('forum_thread_likes')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

export async function getThreadLikesCount(threadId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('forum_thread_likes')
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function trackThreadView(threadId: string): Promise<void> {
  const supabase = await createClient();

  // Simple increment using update
  const { data: thread } = await supabase
    .from('forum_threads')
    .select('views_count')
    .eq('id', threadId)
    .single();

  if (thread) {
    await supabase
      .from('forum_threads')
      .update({ views_count: (thread.views_count || 0) + 1 })
      .eq('id', threadId);
  }
}
