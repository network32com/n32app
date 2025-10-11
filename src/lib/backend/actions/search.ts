'use server';

import { createClient } from '@/lib/shared/supabase/server';

export async function searchUsers(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, headline, specialty, location, profile_photo_url, degree')
    .or(
      `full_name.ilike.%${query}%,headline.ilike.%${query}%,location.ilike.%${query}%,degree.ilike.%${query}%`
    )
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchCases(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      users:user_id (
        id,
        full_name,
        profile_photo_url,
        specialty,
        degree
      )
    `
    )
    .or(`title.ilike.%${query}%,case_notes.ilike.%${query}%,tags.cs.{${query}}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function searchClinics(query: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function globalSearch(query: string) {
  const [users, cases, clinics] = await Promise.all([
    searchUsers(query),
    searchCases(query),
    searchClinics(query),
  ]);

  return {
    users,
    cases,
    clinics,
  };
}

export async function filterCasesByProcedure(procedureType: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      users:user_id (
        id,
        full_name,
        profile_photo_url,
        specialty,
        degree
      )
    `
    )
    .eq('procedure_type', procedureType)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function filterCasesByTag(tag: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cases')
    .select(
      `
      *,
      users:user_id (
        id,
        full_name,
        profile_photo_url,
        specialty,
        degree
      )
    `
    )
    .contains('tags', [tag])
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function filterUsersBySpecialty(specialty: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, headline, specialty, location, profile_photo_url, degree')
    .eq('specialty', specialty)
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPopularTags() {
  const supabase = await createClient();

  // Get all tags from cases
  const { data: cases, error } = await supabase.from('cases').select('tags');

  if (error) {
    throw new Error(error.message);
  }

  // Count tag occurrences
  const tagCounts: Record<string, number> = {};
  cases.forEach((caseItem) => {
    if (caseItem.tags) {
      caseItem.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Sort by count and return top 20
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([tag, count]) => ({ tag, count }));
}
