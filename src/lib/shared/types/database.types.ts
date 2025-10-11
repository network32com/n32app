// Database types will be generated from Supabase
// For now, we'll define the core types manually

export type UserRole = 'dentist' | 'clinic_owner';

export type ProcedureType =
  | 'crown'
  | 'veneer'
  | 'implant'
  | 'root_canal'
  | 'extraction'
  | 'orthodontics'
  | 'whitening'
  | 'filling'
  | 'bridge'
  | 'denture'
  | 'other';

export type Specialty =
  | 'general_dentistry'
  | 'orthodontics'
  | 'endodontics'
  | 'periodontics'
  | 'prosthodontics'
  | 'oral_surgery'
  | 'pediatric_dentistry'
  | 'cosmetic_dentistry';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  headline?: string;
  degree?: string;
  specialty?: Specialty;
  location?: string;
  bio?: string;
  profile_photo_url?: string;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalCase {
  id: string;
  user_id: string;
  title: string;
  procedure_type: ProcedureType;
  case_notes?: string;
  tags: string[];
  before_image_url: string;
  after_image_url: string;
  patient_consent_given: boolean;
  consent_timestamp: string;
  views_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ClinicAffiliation {
  id: string;
  clinic_id: string;
  user_id: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  case_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
  updated_at: string;
}
