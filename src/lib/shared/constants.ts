export const PROCEDURE_TYPES = [
  { value: 'crown', label: 'Crown' },
  { value: 'veneer', label: 'Veneer' },
  { value: 'implant', label: 'Implant' },
  { value: 'root_canal', label: 'Root Canal' },
  { value: 'extraction', label: 'Extraction' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'whitening', label: 'Whitening' },
  { value: 'filling', label: 'Filling' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'denture', label: 'Denture' },
  { value: 'other', label: 'Other' },
] as const;

export const SPECIALTIES = [
  { value: 'general_dentistry', label: 'General Dentistry' },
  { value: 'orthodontics', label: 'Orthodontics' },
  { value: 'endodontics', label: 'Endodontics' },
  { value: 'periodontics', label: 'Periodontics' },
  { value: 'prosthodontics', label: 'Prosthodontics' },
  { value: 'oral_surgery', label: 'Oral Surgery' },
  { value: 'pediatric_dentistry', label: 'Pediatric Dentistry' },
  { value: 'cosmetic_dentistry', label: 'Cosmetic Dentistry' },
] as const;

export const USER_ROLES = [
  { value: 'dentist', label: 'Dentist' },
  { value: 'clinic_owner', label: 'Clinic Owner' },
] as const;

export const ROUTES = {
  HOME: '/',
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  PROFILE: {
    VIEW: (userId: string) => `/profile/${userId}`,
    EDIT: '/profile/edit',
  },
  CASES: {
    FEED: '/cases',
    DETAIL: (caseId: string) => `/cases/${caseId}`,
    CREATE: '/cases/create',
    EDIT: (caseId: string) => `/cases/${caseId}/edit`,
  },
  CLINICS: {
    LIST: '/clinics',
    DETAIL: (clinicId: string) => `/clinics/${clinicId}`,
    CREATE: '/clinics/create',
    EDIT: (clinicId: string) => `/clinics/${clinicId}/edit`,
  },
  SEARCH: '/search',
} as const;
