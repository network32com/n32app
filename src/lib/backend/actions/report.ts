'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createReport(
  reporterId: string,
  caseId: string,
  reason: string,
  description?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      case_id: caseId,
      reason,
      description,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getReportsByCase(caseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      reporter:reporter_id (
        id,
        full_name,
        profile_photo_url
      ),
      case:case_id (
        id,
        title
      )
    `
    )
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getAllReports(status?: 'pending' | 'reviewed' | 'resolved') {
  const supabase = await createClient();

  let query = supabase.from('reports').select(
    `
      *,
      reporter:reporter_id (
        id,
        full_name,
        profile_photo_url
      ),
      case:case_id (
        id,
        title,
        user_id,
        before_image_url,
        after_image_url
      )
    `
  );

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateReportStatus(
  reportId: string,
  status: 'pending' | 'reviewed' | 'resolved'
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/reports');
  return data;
}

export async function getReportStats() {
  const supabase = await createClient();

  const [pendingResult, reviewedResult, resolvedResult] = await Promise.all([
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'reviewed'),
    supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved'),
  ]);

  return {
    pending: pendingResult.count || 0,
    reviewed: reviewedResult.count || 0,
    resolved: resolvedResult.count || 0,
    total: (pendingResult.count || 0) + (reviewedResult.count || 0) + (resolvedResult.count || 0),
  };
}

export async function hasUserReportedCase(userId: string, caseId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', userId)
    .eq('case_id', caseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}
