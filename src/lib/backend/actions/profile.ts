'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { revalidatePath } from 'next/cache';
import type { User, UserEducation, UserCertification, UserAchievement } from '@/lib/shared/types/database.types';

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

// ================================
// Education, Certifications & Achievements
// ================================

export async function getUserEducations(userId: string): Promise<UserEducation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_educations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as UserEducation[];
}

export async function getUserCertifications(userId: string): Promise<UserCertification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_certifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as UserCertification[];
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as UserAchievement[];
}

export async function replaceUserEducations(
  userId: string,
  educations: Array<{ institution: string; degree?: string; field?: string; year?: string }>
) {
  const supabase = await createClient();

  // Delete existing
  const { error: delError } = await supabase
    .from('user_educations')
    .delete()
    .eq('user_id', userId);

  if (delError) throw new Error(delError.message);

  const rows = educations
    .map((e) => ({
      user_id: userId,
      institution: (e.institution || '').trim(),
      degree: e.degree?.trim() || null,
      field: e.field?.trim() || null,
      year: e.year?.trim() || null,
    }))
    .filter((e) => e.institution.length > 0);

  if (rows.length > 0) {
    const { error: insError } = await supabase.from('user_educations').insert(rows);
    if (insError) throw new Error(insError.message);
  }

  revalidatePath('/profile/[id]', 'page');
}

export async function replaceUserCertifications(
  userId: string,
  certs: Array<{ name: string; issuer?: string; year?: string; credential?: string }>
) {
  const supabase = await createClient();

  // Delete existing
  const { error: delError } = await supabase
    .from('user_certifications')
    .delete()
    .eq('user_id', userId);

  if (delError) throw new Error(delError.message);

  const rows = certs
    .map((c) => ({
      user_id: userId,
      name: (c.name || '').trim(),
      issuer: c.issuer?.trim() || null,
      year: c.year?.trim() || null,
      credential: c.credential?.trim() || null,
    }))
    .filter((c) => c.name.length > 0);

  if (rows.length > 0) {
    const { error: insError } = await supabase.from('user_certifications').insert(rows);
    if (insError) throw new Error(insError.message);
  }

  revalidatePath('/profile/[id]', 'page');
}

export async function replaceUserAchievements(
  userId: string,
  achs: Array<{ title: string; description?: string; year?: string }>
) {
  const supabase = await createClient();

  // Delete existing
  const { error: delError } = await supabase
    .from('user_achievements')
    .delete()
    .eq('user_id', userId);

  if (delError) throw new Error(delError.message);

  const rows = achs
    .map((a) => ({
      user_id: userId,
      title: (a.title || '').trim(),
      description: a.description?.trim() || null,
      year: a.year?.trim() || null,
    }))
    .filter((a) => a.title.length > 0);

  if (rows.length > 0) {
    const { error: insError } = await supabase.from('user_achievements').insert(rows);
    if (insError) throw new Error(insError.message);
  }

  revalidatePath('/profile/[id]', 'page');
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
