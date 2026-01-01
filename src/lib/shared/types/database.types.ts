// Database types for Network32
// These types match the Supabase schema defined in /supabase/migrations
// To regenerate from Supabase: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/shared/types/database.types.ts

export type UserRole = 'student' | 'professional' | 'clinic_owner';

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
  | 'rct'
  | 'restorations'
  | 'cosmetics'
  | 'prosthesis'
  | 'periodontic_surgeries'
  | 'implants'
  | 'extractions'
  | 'surgeries'
  | 'fmr'
  | 'other';

export type Specialty =
  | 'general_dentistry'
  | 'orthodontics'
  | 'endodontics'
  | 'periodontics'
  | 'prosthodontics'
  | 'oral_surgery'
  | 'oral_medicine_radiology'
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
  contact_number?: string;
  linkedin_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  id: string;
  user_id: string;
  institution: string;
  degree?: string;
  field?: string;
  year?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCertification {
  id: string;
  user_id: string;
  name: string;
  issuer?: string;
  year?: string;
  credential?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  year?: string;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  services?: string[];
  operating_hours?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedCase {
  id: string;
  user_id: string;
  case_id: string;
  created_at: string;
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
  accessory_photos?: string[];
  location?: string;
  patient_consent_given: boolean;
  consent_timestamp: string;
  views_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
}

// Alias for convenience
export type Case = ClinicalCase;

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

export type ForumCategory =
  | 'general'
  | 'clinical_cases'
  | 'techniques'
  | 'equipment'
  | 'practice_management'
  | 'education'
  | 'research'
  | 'off_topic';

export interface ForumThread {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: ForumCategory;
  tags: string[];
  image_urls: string[];
  views_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  users?: User;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  parent_reply_id?: string;
  body: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
  users?: User;
  replies?: ForumReply[];
}

export type NotificationType =
  | 'follower'
  | 'case_save'
  | 'case_view'
  | 'forum_reply'
  | 'thread_like'
  | 'reply_like'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: NotificationType;
  title: string;
  content?: string;
  link?: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  actor?: User;
}
