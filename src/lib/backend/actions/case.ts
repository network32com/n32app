'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Case } from '@/lib/shared/types/database.types';

export async function createCase(
  userId: string,
  caseData: Omit<Case, 'id' | 'user_id' | 'views_count' | 'saves_count' | 'created_at' | 'updated_at'>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      user_id: userId,
      ...caseData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cases');
  revalidatePath('/dashboard');
  return data as Case;
}

export async function getCase(caseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      users:user_id (
        id,
        full_name,
        profile_photo_url,
        specialty,
        degree
      )
    `)
    .eq('id', caseId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserCases(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Case[];
}

export async function getAllCases(limit: number = 20, offset: number = 0) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(`
      *,
      users:user_id (
        id,
        full_name,
        profile_photo_url,
        specialty,
        degree
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCase(caseId: string, updates: Partial<Case>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', caseId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cases/[id]', 'page');
  revalidatePath('/cases');

  return data as Case;
}

export async function deleteCase(caseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('cases').delete().eq('id', caseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cases');
  revalidatePath('/dashboard');
}

export async function uploadCaseImage(userId: string, file: File, type: 'before' | 'after') {
  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}-${type}.${fileExt}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('case-images')
    .upload(fileName, file, {
      contentType: file.type,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('case-images').getPublicUrl(fileName);

  return publicUrl;
}

export async function incrementCaseViews(caseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_case_views', {
    case_id: caseId,
  });

  if (error) {
    console.error('Failed to increment views:', error);
  }
}

export async function saveCase(userId: string, caseId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('case_saves').insert({
    user_id: userId,
    case_id: caseId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cases/[id]', 'page');
}

export async function unsaveCase(userId: string, caseId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('case_saves')
    .delete()
    .eq('user_id', userId)
    .eq('case_id', caseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/cases/[id]', 'page');
}

export async function hasSavedCase(userId: string, caseId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('case_saves')
    .select('id')
    .eq('user_id', userId)
    .eq('case_id', caseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

export async function getSavedCases(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('case_saves')
    .select(`
      case_id,
      cases:case_id (
        *,
        users:user_id (
          id,
          full_name,
          profile_photo_url,
          specialty,
          degree
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((item: any) => item.cases);
}
