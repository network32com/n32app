'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { revalidatePath } from 'next/cache';
import type { User } from '@/lib/shared/types/database.types';

export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as User;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/profile/[id]', 'page');
  revalidatePath('/dashboard');

  return data as User;
}

export async function uploadProfilePhoto(userId: string, file: File) {
  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile.${fileExt}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

  // Update user profile with photo URL
  await updateUserProfile(userId, { profile_photo_url: publicUrl });

  return publicUrl;
}

export async function getFollowerCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function getCaseCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

export async function followUser(followerId: string, followingId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('follows').insert({
    follower_id: followerId,
    following_id: followingId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/profile/[id]', 'page');
}

export async function unfollowUser(followerId: string, followingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/profile/[id]', 'page');
}
