'use server';

import { createClient } from '@/lib/shared/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Clinic } from '@/lib/shared/types/database.types';

export async function getClinic(clinicId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Clinic;
}

export async function getUserClinics(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Clinic[];
}

export async function createClinic(ownerId: string, clinicData: Omit<Clinic, 'id' | 'owner_id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .insert({
      owner_id: ownerId,
      ...clinicData,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/clinics');
  return data as Clinic;
}

export async function updateClinic(clinicId: string, updates: Partial<Clinic>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .update(updates)
    .eq('id', clinicId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/clinics/[id]', 'page');
  revalidatePath('/clinics');

  return data as Clinic;
}

export async function deleteClinic(clinicId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('clinics').delete().eq('id', clinicId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/clinics');
}

export async function uploadClinicLogo(clinicId: string, file: File) {
  const supabase = await createClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${clinicId}/logo.${fileExt}`;

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('clinic-logos')
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
  } = supabase.storage.from('clinic-logos').getPublicUrl(fileName);

  // Update clinic with logo URL
  await updateClinic(clinicId, { logo_url: publicUrl });

  return publicUrl;
}

export async function getAllClinics() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Clinic[];
}
